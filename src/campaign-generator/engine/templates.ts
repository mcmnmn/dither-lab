import type { CauseType, CampaignType, ToneType, GoalType, AudienceType } from '../state/types';

// --- Org Name Parts ---

const ORG_PREFIXES: Record<CauseType, string[]> = {
  environment: ['Green', 'Blue', 'Earth', 'Ocean', 'Terra', 'Eco', 'Wild', 'Solar'],
  education: ['Bright', 'Rising', 'Open', 'Future', 'Scholar', 'Learn', 'Spark', 'Beacon'],
  health: ['Vital', 'Care', 'Whole', 'Life', 'Pulse', 'Heal', 'Thrive', 'Wellness'],
  hunger: ['Harvest', 'Nourish', 'Table', 'Bread', 'Golden', 'Seed', 'Fresh', 'Gather'],
  housing: ['Home', 'Shelter', 'Corner', 'Haven', 'Hearth', 'Build', 'Root', 'Harbor'],
  animals: ['Wild', 'Paw', 'Free', 'Feather', 'Guardian', 'Noble', 'Gentle', 'Swift'],
  arts: ['Canvas', 'Stage', 'Muse', 'Prism', 'Harmony', 'Story', 'Vivid', 'Echo'],
  'disaster-relief': ['Rapid', 'First', 'Strong', 'Restore', 'Relief', 'Bridge', 'Shield', 'Rise'],
};

const ORG_SUFFIXES = [
  'Foundation', 'Initiative', 'Alliance', 'Network', 'Project', 'Collective',
  'Coalition', 'Trust', 'Fund', 'Action', 'Mission', 'Partnership',
];

// --- Mission Templates ---

const MISSIONS: Record<CauseType, string[]> = {
  environment: [
    '{orgName} is dedicated to preserving our planet\'s natural ecosystems through grassroots conservation and sustainable innovation.',
    '{orgName} works to protect endangered habitats and promote environmental stewardship in communities worldwide.',
    '{orgName} empowers communities to take climate action through education, advocacy, and hands-on restoration projects.',
  ],
  education: [
    '{orgName} provides equitable access to quality education for underserved youth, helping them unlock their full potential.',
    '{orgName} bridges the education gap by bringing innovative learning tools and mentorship to communities in need.',
    '{orgName} believes every child deserves the chance to learn, grow, and dream without limits.',
  ],
  health: [
    '{orgName} delivers essential healthcare services to vulnerable populations, ensuring no one is left behind.',
    '{orgName} advances public health through community-based programs, preventive care, and medical research.',
    '{orgName} works tirelessly to improve health outcomes for families who lack access to quality medical care.',
  ],
  hunger: [
    '{orgName} fights food insecurity by connecting surplus food with families who need it most.',
    '{orgName} builds sustainable food systems that nourish communities and reduce waste.',
    '{orgName} ensures that every family has access to fresh, nutritious meals through local food programs.',
  ],
  housing: [
    '{orgName} creates safe, affordable housing solutions for families experiencing homelessness.',
    '{orgName} transforms neighborhoods by building homes and fostering community resilience.',
    '{orgName} believes that stable housing is the foundation for a better future for every family.',
  ],
  animals: [
    '{orgName} rescues, rehabilitates, and rehomes animals in need while advocating for humane treatment.',
    '{orgName} protects wildlife and their habitats through conservation research and community engagement.',
    '{orgName} gives every animal a second chance through rescue operations and adoption programs.',
  ],
  arts: [
    '{orgName} makes the arts accessible to all by funding creative programs in underserved communities.',
    '{orgName} nurtures the next generation of artists through grants, mentorship, and performance opportunities.',
    '{orgName} believes in the transformative power of art to heal, inspire, and unite communities.',
  ],
  'disaster-relief': [
    '{orgName} provides immediate relief and long-term recovery support to communities devastated by natural disasters.',
    '{orgName} mobilizes volunteers and resources to help communities rebuild stronger after catastrophic events.',
    '{orgName} delivers emergency aid and rebuilds infrastructure in disaster-affected regions worldwide.',
  ],
};

// --- Title Templates ---

const TITLES: Record<CampaignType, Record<CauseType, string[]>> = {
  fundraiser: {
    environment: ['Save Our Oceans', 'Reforest the Future', 'Clean Water Now', 'Protect the Wild'],
    education: ['Books for Every Child', 'Scholarship Drive', 'Build a Classroom', 'Teach the Future'],
    health: ['Healthcare for All', 'Fight for Cures', 'Healthy Communities', 'Save Lives Today'],
    hunger: ['End Hunger Now', 'Feed the Future', 'No Empty Plates', 'Harvest of Hope'],
    housing: ['Homes for Families', 'Build Hope', 'Shelter from the Storm', 'A Roof Over Every Head'],
    animals: ['Rescue & Protect', 'Save Our Wildlife', 'Shelter the Strays', 'Guardians of the Wild'],
    arts: ['Art for Everyone', 'Stage the Future', 'Create Without Limits', 'Color the World'],
    'disaster-relief': ['Rebuild Together', 'Emergency Relief Now', 'Rise After the Storm', 'Restore Hope'],
  },
  awareness: {
    environment: ['The Ocean Crisis', 'Climate Truth', 'Our Planet, Our Future', 'Wake Up for Earth'],
    education: ['The Literacy Gap', 'Every Child Counts', 'Education Matters', 'Knowledge is Power'],
    health: ['The Health Divide', 'See the Signs', 'Prevention Saves Lives', 'Health is a Right'],
    hunger: ['Hidden Hunger', 'The Food Crisis', 'Hunger in Our Backyard', 'No One Should Go Hungry'],
    housing: ['The Housing Crisis', 'Invisible Homeless', 'Home is a Human Right', 'Unsheltered Lives'],
    animals: ['Endangered Tomorrow', 'Voiceless Victims', 'Wild at Risk', 'The Extinction Clock'],
    arts: ['Art Under Threat', 'Culture at Risk', 'The Creative Gap', 'Art Heals'],
    'disaster-relief': ['When Disaster Strikes', 'The Recovery Gap', 'Not If, But When', 'Before the Next Storm'],
  },
  event: {
    environment: ['EcoFest', 'Green Gala', 'Earth Day Celebration', 'Ocean Benefit Night'],
    education: ['ReadAThon', 'Scholar\'s Ball', 'Back to School Drive', 'Education Summit'],
    health: ['Wellness Walk', 'Charity Run for Health', 'Heal-a-Thon', 'Health Fair'],
    hunger: ['Harvest Dinner', 'Community Cook-Off', 'Food Drive Festival', 'Taste of Hope'],
    housing: ['Build Day', 'Home Raising Gala', 'Community Build-a-Thon', 'Keys to Hope'],
    animals: ['Paws & Claws Gala', 'Adoption Day', 'Wildlife Walk', 'Bark in the Park'],
    arts: ['Art Auction Night', 'Open Mic Fundraiser', 'Gallery Opening', 'Creative Arts Festival'],
    'disaster-relief': ['Relief Concert', 'Rebuild Rally', 'Hope Rising Gala', 'First Responders Night'],
  },
  'peer-to-peer': {
    environment: ['My Green Challenge', 'Plant a Tree for Me', 'Eco Miles', 'Go Green With Me'],
    education: ['Read With Me', 'My Classroom Fund', 'Study Buddy Challenge', 'Teach Forward'],
    health: ['Steps for Health', 'My Wellness Journey', 'Heal Together', 'Care Forward'],
    hunger: ['My Meal Mission', 'Cook for a Cause', 'Share a Plate', 'Hunger Hero Challenge'],
    housing: ['My Build Fund', 'Home for a Family', 'Raise the Roof', 'House a Neighbor'],
    animals: ['Paws for a Cause', 'My Rescue Fund', 'Walk for Wildlife', 'Foster Challenge'],
    arts: ['Create for Good', 'My Art Fund', 'Perform for a Purpose', 'Sketch-a-Thon'],
    'disaster-relief': ['My Relief Fund', 'Rebuild with Me', 'Aid Forward', 'First Response Challenge'],
  },
  'matching-gift': {
    environment: ['Double Your Impact for Earth', '2x the Green', 'Match for the Planet', 'Twice the Trees'],
    education: ['Double the Books', 'Match a Scholar', '2x Education Impact', 'Twice the Learning'],
    health: ['Double the Care', 'Match for Health', '2x Lives Saved', 'Twice the Healing'],
    hunger: ['Double the Meals', 'Match a Plate', '2x Hunger Relief', 'Twice the Harvest'],
    housing: ['Double the Homes', 'Match a Family', '2x Shelter', 'Twice the Hope'],
    animals: ['Double the Rescues', 'Match a Paw', '2x Animal Care', 'Twice the Protection'],
    arts: ['Double the Art', 'Match a Muse', '2x Creative Impact', 'Twice the Inspiration'],
    'disaster-relief': ['Double the Relief', 'Match the Aid', '2x Recovery', 'Twice the Rebuilding'],
  },
  recurring: {
    environment: ['Monthly Green Guardian', 'Sustain the Earth', 'Planet Protector Circle', 'Eco Monthly'],
    education: ['Monthly Scholar Fund', 'Sustain a Classroom', 'Learning Circle', 'Education Every Month'],
    health: ['Monthly Health Hero', 'Sustain Care', 'Wellness Circle', 'Health Every Month'],
    hunger: ['Monthly Meal Plan', 'Sustain a Family', 'Nourish Circle', 'Feed Forward Monthly'],
    housing: ['Monthly Home Builder', 'Sustain Shelter', 'Housing Circle', 'Build Every Month'],
    animals: ['Monthly Animal Guardian', 'Sustain a Shelter', 'Wildlife Circle', 'Protect Every Month'],
    arts: ['Monthly Arts Patron', 'Sustain Creativity', 'Culture Circle', 'Create Every Month'],
    'disaster-relief': ['Monthly First Responder', 'Sustain Recovery', 'Relief Circle', 'Rebuild Every Month'],
  },
};

// --- Tagline Templates ---

const TAGLINES: Record<ToneType, string[]> = {
  urgent: [
    'The time to act is now.',
    'Every second counts.',
    'We can\'t afford to wait.',
    'The clock is ticking.',
    'Act before it\'s too late.',
    'This is our moment.',
  ],
  hopeful: [
    'Together, we can make a difference.',
    'A better tomorrow starts today.',
    'Hope grows when we act together.',
    'Small acts, big change.',
    'Believe in what\'s possible.',
    'Change starts with you.',
  ],
  professional: [
    'Measurable impact. Lasting change.',
    'Strategic giving for maximum results.',
    'Investing in outcomes that matter.',
    'Data-driven. Community-focused.',
    'Transparent impact. Real results.',
    'Evidence-based solutions that work.',
  ],
  emotional: [
    'Every life tells a story worth saving.',
    'Because everyone deserves a chance.',
    'Open your heart. Change a life.',
    'Feel the difference you can make.',
    'One act of kindness changes everything.',
    'Your compassion can heal the world.',
  ],
  community: [
    'Neighbors helping neighbors.',
    'Stronger together, one community at a time.',
    'Built by the community, for the community.',
    'When we come together, anything is possible.',
    'Local roots, lasting impact.',
    'Our community. Our responsibility.',
  ],
};

// --- Story Templates ---

const STORIES: Record<CauseType, Record<ToneType, string[]>> = {
  environment: {
    urgent: [
      'Our forests are disappearing at an alarming rate. Every day, thousands of acres of vital habitat are lost to deforestation, threatening countless species and accelerating climate change. {orgName} is racing against time to protect these irreplaceable ecosystems before it\'s too late. Your donation of {goal} will fund emergency conservation efforts in the most critical regions.',
      'The climate crisis isn\'t coming \u2014 it\'s here. Rising sea levels, extreme weather events, and biodiversity collapse are already devastating communities worldwide. {orgName} is on the front lines, but we need your help now. With {goal}, we can deploy rapid-response teams to protect the ecosystems that sustain us all.',
    ],
    hopeful: [
      'Imagine a world where every river runs clean and every forest thrives. That\'s the future {orgName} is building, one project at a time. Through community-driven conservation, we\'ve already protected over 50,000 acres of critical habitat. With your support of {goal}, we\'ll double our impact and bring sustainable solutions to communities that need them most.',
      'Every tree planted is a promise to the next generation. {orgName} has helped thousands of volunteers transform barren land into thriving ecosystems. Our goal of {goal} will fund the next wave of restoration projects, proving that when people come together, nature rebounds beautifully.',
    ],
    professional: [
      '{orgName} employs evidence-based conservation strategies to maximize environmental impact per dollar invested. Our programs have demonstrated a 3:1 return on ecological investment, restoring degraded ecosystems while creating sustainable livelihoods. A campaign goal of {goal} will fund our next phase of scientifically-guided interventions across priority watersheds.',
      'Through rigorous monitoring and adaptive management, {orgName} has achieved measurable conservation outcomes in over 30 regions. Our data shows that targeted habitat restoration yields exponential biodiversity gains. With {goal} in funding, we will scale our proven model to new ecosystems.',
    ],
    emotional: [
      'Picture a child standing at the edge of a crystal-clear lake, seeing a wild turtle for the very first time. That moment of wonder is what {orgName} fights to protect every day. But these precious places are vanishing. With {goal}, you can ensure that future generations will still have wild places to discover and fall in love with.',
      'There\'s a quiet forest where endangered birds still sing at dawn. {orgName} has been their guardian for years, but development pressures are closing in. Your gift toward our {goal} goal will be the shield these creatures need. Every dollar protects a piece of the world that can never be replaced.',
    ],
    community: [
      'In neighborhoods across the country, {orgName} is helping communities reclaim their local environments. From urban gardens to river cleanups, our volunteers are proving that environmental change starts at home. Our {goal} campaign will fund 50 new community-led conservation projects, because the best environmental solutions come from the people who live there.',
      '{orgName} believes that the people closest to the land know best how to protect it. Our community stewardship programs have engaged over 10,000 local volunteers in hands-on conservation. With {goal}, we\'ll launch new programs in 20 communities, empowering residents to become guardians of their own ecosystems.',
    ],
  },
  education: {
    urgent: [
      'Right now, millions of children are falling behind because they lack basic learning resources. The education gap is widening every day, and without intervention, an entire generation risks being left behind. {orgName} is working urgently to close this gap. Your contribution toward {goal} will put books in hands and teachers in classrooms where they\'re needed most.',
      'The pandemic set education back by years, and recovery is far too slow. {orgName} is racing to reach the most affected students before the window of opportunity closes. With {goal}, we can deploy emergency tutoring and learning programs to the communities hit hardest.',
    ],
    hopeful: [
      'Every child has a spark of brilliance waiting to be ignited. {orgName} has already helped thousands of young learners discover their potential through innovative programs and dedicated mentors. With {goal}, we\'ll reach even more students and prove that with the right support, every child can thrive.',
      '{orgName} envisions a world where your zip code doesn\'t determine your education. Our scholarship and mentorship programs have sent over 2,000 first-generation students to college. With {goal}, we\'ll expand to new regions and open doors that were once closed.',
    ],
    professional: [
      '{orgName} implements data-driven education interventions that deliver measurable improvements in student outcomes. Our programs have increased graduation rates by 35% in partner schools. A {goal} investment will enable us to scale our proven curriculum model to 50 additional school districts.',
      'Through strategic partnerships with school systems and research institutions, {orgName} has developed a replicable education model with demonstrated results. Our {goal} campaign will fund expansion into underserved districts where the need is greatest.',
    ],
    emotional: [
      'Maria was 12 when she told her teacher she\'d given up on school. She couldn\'t read at grade level, and no one at home could help. Then {orgName} stepped in with tutoring and a mentor who believed in her. Today, Maria is preparing for college. With {goal}, we can reach hundreds more students just like her.',
      'There\'s a little boy in a rural classroom who dreams of being a scientist, but his school doesn\'t have a single microscope. {orgName} is changing that story, one classroom at a time. Your support toward {goal} will give children like him the tools to chase their dreams.',
    ],
    community: [
      '{orgName} partners with local families, teachers, and community leaders to build education programs that reflect each community\'s unique needs. Our grassroots approach has transformed learning outcomes in over 100 neighborhoods. With {goal}, we\'ll empower more communities to take ownership of their children\'s futures.',
      'When parents, teachers, and neighbors come together around education, incredible things happen. {orgName} has seen communities build libraries, launch tutoring networks, and create after-school programs from the ground up. Our {goal} campaign will seed 30 new community education initiatives.',
    ],
  },
  health: {
    urgent: [
      'Preventable diseases are claiming lives every day in communities that lack basic healthcare access. {orgName} is deploying mobile clinics and health workers to reach the most vulnerable, but the need far exceeds our current capacity. With {goal}, we can expand our emergency health services and save lives that would otherwise be lost.',
      'Healthcare shouldn\'t be a privilege, but for millions it remains out of reach. {orgName} is fighting to change that before more lives are lost. Your {goal} contribution will fund critical medical supplies, screenings, and treatments for families who have nowhere else to turn.',
    ],
    hopeful: [
      '{orgName} is building a healthier world, one community at a time. Our preventive care programs have reduced hospital visits by 40% in the communities we serve. With {goal}, we\'ll bring wellness programs, health screenings, and nutrition education to thousands more families.',
      'Good health is the foundation for everything \u2014 for learning, for working, for dreaming. {orgName} is making that foundation accessible to all. Our {goal} goal will fund community health centers that serve as beacons of hope and healing.',
    ],
    professional: [
      '{orgName} delivers cost-effective healthcare interventions with rigorously measured outcomes. Our community health model reduces per-patient costs by 28% while improving health indicators across all demographics. A {goal} campaign will fund our expansion into three new regions with the highest need.',
      'Through evidence-based public health programming, {orgName} has achieved statistically significant improvements in maternal and child health outcomes. Our {goal} investment will scale proven interventions to populations currently without access.',
    ],
    emotional: [
      'A mother shouldn\'t have to choose between feeding her children and taking them to the doctor. But for families without healthcare access, that impossible choice is a daily reality. {orgName} exists to ensure no parent has to make that choice. With {goal}, we\'ll provide free health services to thousands of families.',
      'When James collapsed at work, he had no health insurance and no savings. {orgName}\'s community clinic was his lifeline. Today, he\'s healthy and giving back as a volunteer. Your support toward {goal} will create more stories like his.',
    ],
    community: [
      '{orgName} trains community health workers from within the neighborhoods they serve, creating a network of trusted care providers who understand local needs. Our {goal} campaign will train 200 new community health advocates and establish pop-up wellness stations in underserved areas.',
      'Health happens in community. {orgName}\'s peer health programs connect neighbors with trained volunteers who provide screenings, education, and support. With {goal}, we\'ll bring this proven model to 25 new neighborhoods.',
    ],
  },
  hunger: {
    urgent: [
      'Tonight, one in six children in our communities will go to bed hungry. This isn\'t a distant crisis \u2014 it\'s happening in our own neighborhoods. {orgName} is working around the clock to get food to families in need, but demand is outpacing supply. With {goal}, we can keep our pantries stocked and our distribution lines moving.',
      'Food bank shelves are empty, and the need is growing. {orgName} is sounding the alarm: without immediate action, hunger will reach crisis levels this winter. Your {goal} donation will fund emergency food purchases and distribution to the hardest-hit communities.',
    ],
    hopeful: [
      '{orgName} is proving that hunger is a solvable problem. Through our network of community gardens, food rescue programs, and nutrition education, we\'ve provided over 2 million meals this year alone. With {goal}, we\'ll double our reach and move closer to a world where no one goes hungry.',
      'Every meal shared is a moment of dignity restored. {orgName} connects surplus food with families in need, reducing waste while fighting hunger. Our {goal} campaign will expand our food recovery network and feed thousands more.',
    ],
    professional: [
      '{orgName} operates a highly efficient food distribution network with a cost of just $0.18 per meal delivered. Our supply chain optimization has reduced food waste by 60% while increasing distribution capacity. A {goal} investment will fund logistics upgrades that further improve our efficiency and reach.',
      'Through data-driven resource allocation, {orgName} targets food aid to the communities with the highest measured need. Our {goal} campaign will enhance our distribution infrastructure and expand coverage to underserved areas.',
    ],
    emotional: [
      'A grandmother skipping meals so her grandchildren can eat. A single dad choosing between groceries and rent. These are the faces of hunger, and {orgName} sees them every day. With {goal}, you can ensure that no family in our community has to make impossible choices just to survive.',
      'Little Sophia used to come to school too hungry to focus. Since {orgName} started providing weekend meal packs, her teacher says she\'s a different child \u2014 bright, engaged, and smiling. Your {goal} gift will help us reach every child like Sophia.',
    ],
    community: [
      '{orgName} mobilizes neighborhoods to feed their own. Our community kitchen program trains local volunteers to prepare nutritious meals using donated ingredients, turning empty lots into gathering places and strangers into neighbors. With {goal}, we\'ll launch 15 new community kitchens.',
      'Hunger is a community problem that demands a community solution. {orgName}\'s network of volunteer-run food pantries, community gardens, and meal delivery programs is powered by the people it serves. Our {goal} campaign will strengthen and expand this grassroots infrastructure.',
    ],
  },
  housing: {
    urgent: [
      'The affordable housing crisis is displacing families at an unprecedented rate. Every night, thousands of families in our region sleep in shelters, cars, or on the street. {orgName} is urgently building and rehabilitating homes, but the gap between need and supply keeps growing. With {goal}, we can fast-track construction and get more families off the streets.',
      'Eviction notices are piling up, and shelters are at capacity. {orgName} is fighting to keep families housed through emergency assistance and rapid rehousing programs. Your {goal} donation will provide immediate stability for families on the brink of homelessness.',
    ],
    hopeful: [
      '{orgName} has helped over 500 families find safe, permanent homes. Each key we hand over represents a new beginning \u2014 stability, safety, and the foundation for a better life. With {goal}, we\'ll build 20 more homes and change 20 more lives forever.',
      'A home is more than four walls \u2014 it\'s where futures are built. {orgName} creates affordable housing that transforms entire communities. Our {goal} goal will fund our next development, bringing hope to families who\'ve been waiting years for a place to call their own.',
    ],
    professional: [
      '{orgName} develops mixed-income housing using a sustainable financing model that ensures long-term affordability without ongoing subsidies. Our developments have achieved a 95% resident retention rate. A {goal} campaign will fund our next project, providing 40 affordable units in a high-need area.',
      'Through strategic land use and innovative construction methods, {orgName} delivers housing at 30% below market construction costs. Our {goal} investment will scale these methods to new communities, increasing affordable housing stock where it\'s needed most.',
    ],
    emotional: [
      'For three years, the Rodriguez family lived in their car. The children did homework by flashlight. Then {orgName} gave them the keys to a real home. Mrs. Rodriguez cried as she walked through the door. With {goal}, you can give another family the stability and dignity of a place to call their own.',
      'Imagine telling your children they finally have their own bedroom. That\'s the moment {orgName} creates every time we complete a new home. Your contribution toward {goal} will fund the materials, labor, and love that go into every build.',
    ],
    community: [
      '{orgName} doesn\'t just build houses \u2014 we build communities. Our resident-driven approach includes community spaces, shared gardens, and neighborhood programs that foster connection and belonging. With {goal}, we\'ll break ground on a new community development designed by and for the people who will live there.',
      'When a community builds together, the result is more than shelter \u2014 it\'s belonging. {orgName}\'s volunteer build days bring hundreds of neighbors together to raise walls and raise hope. Our {goal} campaign will fund five community builds this year.',
    ],
  },
  animals: {
    urgent: [
      'Shelters are overflowing and animals are running out of time. Every day, healthy, adoptable animals are euthanized simply because there isn\'t enough space or funding to care for them. {orgName} is racing to save as many lives as possible. With {goal}, we can expand our rescue capacity and give these animals the second chance they deserve.',
      'Poaching, habitat loss, and climate change are pushing species toward extinction at an alarming rate. {orgName} is deploying rangers and conservation teams to protect the most vulnerable wildlife populations. Your {goal} donation will fund critical anti-poaching patrols and habitat preservation.',
    ],
    hopeful: [
      '{orgName} has rescued and rehomed over 5,000 animals, proving that every life is worth saving. From scared strays to endangered species, we give animals the care and love they need to thrive. With {goal}, we\'ll expand our shelter, fund more rescues, and find more forever homes.',
      'Every wagging tail at our shelter is a success story in the making. {orgName} combines compassionate care with innovative adoption programs to find every animal a loving home. Our {goal} campaign will help us reach our vision of a no-kill community.',
    ],
    professional: [
      '{orgName} implements science-based conservation programs that have successfully increased endangered population counts by an average of 22% in managed areas. Our monitoring and intervention protocols are recognized as industry best practices. A {goal} investment will fund expansion into three new wildlife corridors.',
      'Through strategic spay/neuter programs and community education, {orgName} has reduced shelter intake by 45% in partner communities. Our {goal} campaign will scale this evidence-based approach to new regions, creating sustainable reductions in animal homelessness.',
    ],
    emotional: [
      'When we found Luna, she was starving and afraid, hiding under a collapsed building. It took weeks of patient care before she would let anyone touch her. Today, she\'s a certified therapy dog who brings joy to nursing home residents. {orgName} gave Luna a second chance. With {goal}, you can help us save more animals like her.',
      'The look in a rescued animal\'s eyes when they realize they\'re safe \u2014 that moment is why {orgName} exists. Behind every rescue is a story of survival, healing, and hope. Your {goal} gift will fund the veterinary care, shelter, and love that make these transformations possible.',
    ],
    community: [
      '{orgName} empowers communities to become advocates for the animals in their neighborhoods. Our volunteer foster network, community spay/neuter clinics, and education programs create a culture of compassion from the ground up. With {goal}, we\'ll train 100 new foster families and host 50 community clinics.',
      'Animal welfare starts in the community. {orgName}\'s neighborhood ambassador program connects pet owners with resources, education, and support, keeping animals in loving homes and out of shelters. Our {goal} campaign will expand this program to 30 new communities.',
    ],
  },
  arts: {
    urgent: [
      'Arts programs are being cut from schools at an alarming rate, leaving millions of children without access to creative education. {orgName} is fighting to fill the gap before an entire generation loses the chance to discover their creative potential. With {goal}, we can fund emergency arts programming in the most underserved schools.',
      'Independent artists and cultural organizations are closing their doors at record rates. {orgName} is deploying emergency grants and resources to keep our creative communities alive. Your {goal} donation will provide lifeline funding to artists and venues on the brink.',
    ],
    hopeful: [
      '{orgName} has brought arts education to over 10,000 students who would otherwise have no access to creative learning. We\'ve seen shy kids become confident performers, struggling students find their voice through painting, and communities transformed by public art. With {goal}, we\'ll expand to 50 new schools.',
      'Art has the power to transform lives, and {orgName} is proof. Our grant programs have launched the careers of hundreds of emerging artists while enriching communities with public installations and performances. Our {goal} goal will fund the next cohort of creative visionaries.',
    ],
    professional: [
      '{orgName} delivers arts education programming with demonstrated outcomes: 89% of participating students show improved academic performance, and 73% report increased confidence and social connection. A {goal} investment will enable rigorous evaluation and expansion of our most effective programs.',
      'Through strategic partnerships with cultural institutions and school systems, {orgName} has built a scalable arts education model that consistently outperforms benchmarks. Our {goal} campaign will fund a multi-site expansion with full impact measurement.',
    ],
    emotional: [
      'At 14, Jayden had never held a paintbrush. Growing up in foster care, art was a luxury his world couldn\'t afford. Then {orgName}\'s after-school program opened a door he didn\'t know existed. Today, Jayden\'s artwork hangs in a real gallery. With {goal}, we can open that door for hundreds more kids.',
      'Music saved Ana\'s life. When everything else was falling apart, the guitar {orgName} put in her hands gave her something to hold onto. Now she teaches other young people to find their own rhythm. Your {goal} gift will put instruments, brushes, and hope into the hands of children who need them.',
    ],
    community: [
      '{orgName} believes that art belongs to everyone. Our community mural projects, pop-up galleries, and neighborhood performances turn public spaces into shared cultural experiences. With {goal}, we\'ll fund 20 community-led art projects that bring neighbors together through creativity.',
      'When a community creates together, bonds form that nothing can break. {orgName}\'s collaborative art programs have transformed vacant lots into vibrant gathering spaces and strangers into collaborators. Our {goal} campaign will bring creative placemaking to 15 new neighborhoods.',
    ],
  },
  'disaster-relief': {
    urgent: [
      'Communities devastated by recent disasters are in desperate need of immediate aid. Families have lost everything \u2014 homes, belongings, and loved ones. {orgName} is on the ground providing emergency shelter, food, and medical care, but the scale of destruction demands more resources. With {goal}, we can reach every family affected.',
      'The disaster response clock is ticking. In the critical first 72 hours, {orgName}\'s rapid-response teams deploy water purification, emergency shelter, and medical supplies to affected communities. Your {goal} donation will pre-position supplies and ensure we\'re ready when the next disaster strikes.',
    ],
    hopeful: [
      'From the rubble, communities rise. {orgName} has helped over 20,000 families rebuild their homes and their lives after natural disasters. We don\'t just provide emergency aid \u2014 we stay to help communities come back stronger. With {goal}, we\'ll fund long-term recovery programs that transform devastation into resilience.',
      'Every disaster tells two stories: one of destruction, and one of human resilience. {orgName} is there for both, providing immediate relief and long-term rebuilding support. Our {goal} campaign will ensure that affected communities don\'t just survive \u2014 they thrive.',
    ],
    professional: [
      '{orgName} maintains a rapid-deployment infrastructure that enables 24-hour disaster response anywhere in the country. Our logistics network delivers aid at 40% below industry cost benchmarks while maintaining the highest quality standards. A {goal} investment will enhance our pre-positioning strategy and reduce response times.',
      'Through advanced disaster modeling and strategic resource pre-positioning, {orgName} has reduced average response times by 60%. Our {goal} campaign will fund predictive analytics capabilities and expand our emergency supply chain to cover additional risk zones.',
    ],
    emotional: [
      'When the floodwaters receded, the Nguyen family found nothing left. Their home, their photos, everything was gone. But {orgName} was there with blankets, hot meals, and a promise that they wouldn\'t face recovery alone. Six months later, they moved into a rebuilt home, stronger than before. With {goal}, you can help the next family start over.',
      'After the hurricane, 8-year-old Marcus asked his mother if they would ever have a home again. She couldn\'t answer. Then {orgName} arrived, and everything changed. Today, Marcus plays in the yard of a new house that\'s built to weather any storm. Your {goal} gift makes these rebuilding miracles possible.',
    ],
    community: [
      'The strongest disaster response comes from within the community itself. {orgName} trains local volunteers as first responders and community resilience leaders, ensuring that when disaster strikes, help is already there. With {goal}, we\'ll train 500 community emergency response team members across 30 neighborhoods.',
      '{orgName} helps communities prepare, respond, and recover together. Our neighbor-helping-neighbor model has proven that local knowledge and mutual aid are the most powerful tools in disaster response. Our {goal} campaign will fund community resilience planning in 40 at-risk areas.',
    ],
  },
};

// --- CTA Templates ---

const CTAS: Record<CampaignType, Record<AudienceType, string[]>> = {
  fundraiser: {
    general: ['Donate Now', 'Give Today', 'Make a Difference', 'Support the Cause'],
    millennials: ['Join the Movement', 'Be the Change', 'Tap to Give', 'Make It Happen'],
    corporate: ['Become a Corporate Partner', 'Sponsor This Campaign', 'Invest in Impact', 'Schedule a Briefing'],
    'local-community': ['Support Your Neighbors', 'Give Locally', 'Help Our Community', 'Pitch In'],
    'high-net-worth': ['Make a Leadership Gift', 'Join Our Circle', 'Create Lasting Impact', 'Schedule a Meeting'],
  },
  awareness: {
    general: ['Learn More', 'Spread the Word', 'Share This Story', 'Take the Pledge'],
    millennials: ['Share on Social', 'Tag a Friend', 'Join the Conversation', 'Watch & Share'],
    corporate: ['Request a Presentation', 'Download the Report', 'Partner With Us', 'Get the Facts'],
    'local-community': ['Attend a Local Event', 'Host a Screening', 'Join a Town Hall', 'Volunteer Today'],
    'high-net-worth': ['Request a Private Briefing', 'Join Our Advisory Board', 'Attend an Exclusive Event', 'Connect With Leadership'],
  },
  event: {
    general: ['Register Now', 'Get Tickets', 'RSVP Today', 'Save Your Spot'],
    millennials: ['Grab Your Ticket', 'Sign Me Up', 'I\'m In', 'Get on the List'],
    corporate: ['Reserve a Table', 'Become an Event Sponsor', 'Register Your Team', 'Book VIP Seats'],
    'local-community': ['Bring the Family', 'Sign Up Your Group', 'Volunteer at the Event', 'Register Free'],
    'high-net-worth': ['Reserve VIP Access', 'Host a Private Table', 'Join the Patron Circle', 'RSVP for the Gala'],
  },
  'peer-to-peer': {
    general: ['Start Your Page', 'Create a Fundraiser', 'Rally Your Friends', 'Set Your Goal'],
    millennials: ['Launch Your Campaign', 'Challenge Your Squad', 'Go Viral for Good', 'Start Fundraising'],
    corporate: ['Launch a Team Challenge', 'Set Up Employee Giving', 'Lead a Department Drive', 'Start a Corporate Page'],
    'local-community': ['Rally Your Street', 'Organize a Block Drive', 'Lead Your Group', 'Start a Neighborhood Page'],
    'high-net-worth': ['Champion a Cause', 'Lead by Example', 'Create a Legacy Page', 'Inspire Your Network'],
  },
  'matching-gift': {
    general: ['Double Your Gift', 'Give Now \u2014 It\'s Matched', 'Unlock the Match', '2x Your Impact'],
    millennials: ['Double It', 'Match Activated \u2014 Give Now', 'Your Gift x2', 'Tap to Double'],
    corporate: ['Activate Employee Match', 'Maximize Corporate Impact', 'Submit Your Match', 'Double Through Your Company'],
    'local-community': ['Double for Your Community', 'Match Locally', 'Give Local \u2014 Double Impact', 'Community Match Active'],
    'high-net-worth': ['Unlock the Full Match', 'Maximize Your Giving', 'Lead the Match Challenge', 'Double Your Legacy Gift'],
  },
  recurring: {
    general: ['Give Monthly', 'Join the Circle', 'Start Your Subscription', 'Become a Sustainer'],
    millennials: ['Subscribe to Change', 'Join Monthly', 'Auto-Give', 'Set It & Change It'],
    corporate: ['Enroll in Monthly Giving', 'Set Up Recurring Support', 'Commit to Quarterly Impact', 'Join the Sustainer Program'],
    'local-community': ['Give Monthly to Your Community', 'Become a Local Sustainer', 'Commit to Monthly Support', 'Join Your Neighbors'],
    'high-net-worth': ['Join the Leadership Circle', 'Establish a Recurring Gift', 'Become a Founding Sustainer', 'Commit to Annual Giving'],
  },
};

// --- Donation Tier Templates ---

const GOAL_VALUES: Record<GoalType, number> = {
  '$1K': 1000,
  '$5K': 5000,
  '$10K': 10000,
  '$25K': 25000,
  '$50K': 50000,
  '$100K': 100000,
};

const TIER_NAMES: Record<CauseType, string[][]> = {
  environment: [
    ['Seed Planter', 'Tree Guardian', 'Forest Protector', 'Earth Champion', 'Planet Steward'],
    ['Raindrop', 'Stream', 'River', 'Ocean', 'Tide Changer'],
  ],
  education: [
    ['Pencil Donor', 'Book Funder', 'Classroom Builder', 'Scholarship Giver', 'Education Champion'],
    ['Reader', 'Scholar', 'Mentor', 'Dean', 'Visionary'],
  ],
  health: [
    ['First Aider', 'Care Provider', 'Health Hero', 'Life Saver', 'Wellness Champion'],
    ['Bandage', 'Heartbeat', 'Lifeline', 'Guardian', 'Healer'],
  ],
  hunger: [
    ['Meal Maker', 'Pantry Filler', 'Harvest Helper', 'Kitchen Builder', 'Hunger Ender'],
    ['Seed', 'Sprout', 'Harvest', 'Feast', 'Abundance'],
  ],
  housing: [
    ['Brick Layer', 'Wall Raiser', 'Roof Builder', 'Home Maker', 'Community Builder'],
    ['Foundation', 'Cornerstone', 'Keystone', 'Pillar', 'Architect'],
  ],
  animals: [
    ['Paw Pal', 'Den Builder', 'Pack Leader', 'Wildlife Guardian', 'Species Protector'],
    ['Whisker', 'Paw Print', 'Tail Wagger', 'Guardian', 'Champion'],
  ],
  arts: [
    ['Sketch Starter', 'Color Sponsor', 'Canvas Funder', 'Gallery Patron', 'Arts Champion'],
    ['Note', 'Melody', 'Harmony', 'Opus', 'Maestro'],
  ],
  'disaster-relief': [
    ['First Responder', 'Relief Worker', 'Shelter Builder', 'Recovery Leader', 'Resilience Champion'],
    ['Beacon', 'Shelter', 'Bridge', 'Stronghold', 'Rebuilder'],
  ],
};

const TIER_IMPACTS: Record<CauseType, string[]> = {
  environment: [
    'Plants {count} native trees',
    'Restores {count} acres of habitat',
    'Funds {count} days of conservation work',
    'Protects {count} endangered species zones',
    'Sponsors a full restoration project',
  ],
  education: [
    'Provides school supplies for {count} students',
    'Funds {count} months of tutoring',
    'Equips {count} classrooms with materials',
    'Provides {count} scholarships',
    'Builds a learning center',
  ],
  health: [
    'Provides {count} health screenings',
    'Funds {count} medical consultations',
    'Supplies {count} months of medications',
    'Equips {count} mobile clinic visits',
    'Sponsors a community health program',
  ],
  hunger: [
    'Provides {count} meals',
    'Stocks a pantry for {count} weeks',
    'Feeds {count} families for a month',
    'Funds {count} community kitchen sessions',
    'Establishes a permanent food program',
  ],
  housing: [
    'Provides {count} nights of emergency shelter',
    'Funds {count} home repair projects',
    'Supplies materials for {count} builds',
    'Houses {count} families',
    'Funds a complete community development',
  ],
  animals: [
    'Feeds {count} shelter animals for a week',
    'Funds {count} veterinary checkups',
    'Covers {count} spay/neuter procedures',
    'Sponsors {count} animal rescues',
    'Funds a new rescue facility',
  ],
  arts: [
    'Provides art supplies for {count} students',
    'Funds {count} workshops',
    'Sponsors {count} artist grants',
    'Funds {count} community art installations',
    'Establishes a permanent arts program',
  ],
  'disaster-relief': [
    'Provides {count} emergency supply kits',
    'Funds {count} days of relief operations',
    'Shelters {count} displaced families',
    'Rebuilds {count} damaged homes',
    'Funds a comprehensive recovery program',
  ],
};

// --- Output Helpers ---

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickRandomN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function getOrgPrefixes(cause: CauseType): string[] {
  return ORG_PREFIXES[cause];
}

export function getOrgSuffixes(): string[] {
  return ORG_SUFFIXES;
}

export function getMissions(cause: CauseType): string[] {
  return MISSIONS[cause];
}

export function getTitles(campaignType: CampaignType, cause: CauseType): string[] {
  return TITLES[campaignType][cause];
}

export function getTaglines(tone: ToneType): string[] {
  return TAGLINES[tone];
}

export function getStories(cause: CauseType, tone: ToneType): string[] {
  return STORIES[cause][tone];
}

export function getCTAs(campaignType: CampaignType, audience: AudienceType): string[] {
  return CTAS[campaignType][audience];
}

export function getGoalValue(goal: GoalType): number {
  return GOAL_VALUES[goal];
}

export function getTierNames(cause: CauseType): string[][] {
  return TIER_NAMES[cause];
}

export function getTierImpacts(cause: CauseType): string[] {
  return TIER_IMPACTS[cause];
}
