import type { Campaign, CampaignInputs, CampaignSection, CauseType } from '../state/types';
import {
  pickRandom,
  pickRandomN,
  getOrgPrefixes,
  getOrgSuffixes,
  getMissions,
  getTitles,
  getTaglines,
  getStories,
  getCTAs,
  getGoalValue,
  getTierNames,
  getTierImpacts,
} from './templates';

// Curated Picsum image IDs grouped by cause for thematic relevance
const CAUSE_IMAGE_IDS: Record<CauseType, number[]> = {
  'environment': [15, 16, 28, 41, 47, 110, 142, 155, 167, 180, 200, 240, 324, 425, 446, 493, 540, 551, 610, 651],
  'education': [20, 24, 42, 60, 180, 247, 292, 367, 395, 403, 452, 490, 514, 535, 593, 620, 683, 737, 823, 901],
  'health': [22, 40, 63, 96, 117, 177, 197, 225, 277, 305, 342, 370, 399, 433, 458, 510, 552, 626, 688, 740],
  'hunger': [30, 48, 75, 102, 112, 163, 225, 292, 312, 326, 349, 388, 429, 447, 488, 527, 562, 597, 641, 698],
  'housing': [29, 49, 69, 164, 174, 188, 223, 271, 304, 353, 368, 407, 416, 439, 462, 503, 526, 564, 609, 674],
  'animals': [237, 219, 40, 58, 169, 200, 202, 247, 275, 301, 327, 355, 381, 433, 474, 518, 582, 593, 659, 718],
  'arts': [36, 65, 119, 145, 175, 193, 203, 257, 280, 310, 338, 366, 392, 420, 445, 487, 519, 549, 603, 654],
  'disaster-relief': [11, 14, 44, 73, 91, 120, 148, 176, 214, 243, 267, 295, 330, 360, 401, 436, 475, 512, 548, 600],
};

export function generateImageUrl(cause: CauseType): string {
  const imageId = pickRandom(CAUSE_IMAGE_IDS[cause]);
  return `https://picsum.photos/id/${imageId}/800/400`;
}

function generateOrgName(inputs: CampaignInputs): string {
  const prefix = pickRandom(getOrgPrefixes(inputs.cause));
  const suffix = pickRandom(getOrgSuffixes());
  return `${prefix} ${suffix}`;
}

function fillPlaceholders(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

function formatGoal(goal: string): string {
  const map: Record<string, string> = {
    '$1K': '$1,000', '$5K': '$5,000', '$10K': '$10,000',
    '$25K': '$25,000', '$50K': '$50,000', '$100K': '$100,000',
  };
  return map[goal] || goal;
}

function generateDonationTiers(inputs: CampaignInputs): string {
  const goalValue = getGoalValue(inputs.goal);
  const tierNameSets = getTierNames(inputs.cause);
  const tierNames = pickRandom(tierNameSets);
  const impacts = getTierImpacts(inputs.cause);

  // Scale tiers relative to goal
  const multipliers = [0.025, 0.05, 0.1, 0.25, 0.5];
  const impactCounts = [5, 10, 25, 50, 100];

  const lines = multipliers.map((mult, i) => {
    const amount = Math.round(goalValue * mult);
    const name = tierNames[i] || `Tier ${i + 1}`;
    const impact = fillPlaceholders(impacts[i], { count: String(impactCounts[i]) });
    return `$${amount.toLocaleString()} — ${name}: ${impact}`;
  });

  return lines.join('\n');
}

function generateSections(inputs: CampaignInputs): CampaignSection[] {
  const orgName = generateOrgName(inputs);
  const vars = {
    orgName,
    goal: formatGoal(inputs.goal),
    audience: inputs.audience.replace('-', ' '),
    type: inputs.campaignType.replace('-', ' '),
  };

  const mission = fillPlaceholders(pickRandom(getMissions(inputs.cause)), vars);
  const title = pickRandom(getTitles(inputs.campaignType, inputs.cause));
  const tagline = pickRandom(getTaglines(inputs.tone));
  const story = fillPlaceholders(pickRandom(getStories(inputs.cause, inputs.tone)), vars);
  const ctas = pickRandomN(getCTAs(inputs.campaignType, inputs.audience), 3);
  const tiers = generateDonationTiers(inputs);

  return [
    { id: 'org-name', label: 'Nonprofit Name', content: orgName },
    { id: 'org-mission', label: 'Mission Statement', content: mission },
    { id: 'title', label: 'Campaign Title', content: title },
    { id: 'tagline', label: 'Tagline', content: tagline },
    { id: 'story', label: 'Campaign Story', content: story },
    { id: 'ctas', label: 'Calls to Action', content: ctas.join('\n') },
    { id: 'tiers', label: 'Donation Tiers', content: tiers },
  ];
}

export function generateCampaign(inputs: CampaignInputs): Campaign {
  return {
    id: crypto.randomUUID(),
    sections: generateSections(inputs),
    inputs: { ...inputs },
    imageUrl: generateImageUrl(inputs.cause),
  };
}

export function regenerateSection(campaign: Campaign, sectionId: string): Campaign {
  const inputs = campaign.inputs;
  const orgName = campaign.sections.find(s => s.id === 'org-name')?.content || 'The Foundation';
  const vars = {
    orgName,
    goal: formatGoal(inputs.goal),
    audience: inputs.audience.replace('-', ' '),
    type: inputs.campaignType.replace('-', ' '),
  };

  const generators: Record<string, () => string> = {
    'org-name': () => generateOrgName(inputs),
    'org-mission': () => fillPlaceholders(pickRandom(getMissions(inputs.cause)), vars),
    'title': () => pickRandom(getTitles(inputs.campaignType, inputs.cause)),
    'tagline': () => pickRandom(getTaglines(inputs.tone)),
    'story': () => fillPlaceholders(pickRandom(getStories(inputs.cause, inputs.tone)), vars),
    'ctas': () => pickRandomN(getCTAs(inputs.campaignType, inputs.audience), 3).join('\n'),
    'tiers': () => generateDonationTiers(inputs),
  };

  const generator = generators[sectionId];
  if (!generator) return campaign;

  return {
    ...campaign,
    sections: campaign.sections.map(s =>
      s.id === sectionId ? { ...s, content: generator() } : s,
    ),
  };
}

export function generateCampaigns(inputs: CampaignInputs, count: number): Campaign[] {
  return Array.from({ length: count }, () => generateCampaign(inputs));
}
