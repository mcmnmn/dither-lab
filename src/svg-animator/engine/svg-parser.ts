import type { ParsedSvgInfo, ParsedElement } from '../state/types';

const ANIMATABLE_TAGS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);
const DANGEROUS_TAGS = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed']);
const STRIP_TAGS = new Set(['metadata', 'desc', 'title']);
const MAX_ANIMATABLE = 50;

export function parseSvg(raw: string): { parsed: ParsedSvgInfo; sanitized: string; warning: string | null } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'image/svg+xml');

  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('Invalid SVG markup');
  }

  const svg = doc.documentElement;
  if (svg.tagName.toLowerCase() !== 'svg') {
    throw new Error('Root element is not <svg>');
  }

  // Sanitize: remove dangerous elements and on* attributes
  sanitizeNode(svg);

  // Strip metadata elements
  const toStrip: Element[] = [];
  svg.querySelectorAll('*').forEach(el => {
    if (STRIP_TAGS.has(el.tagName.toLowerCase())) {
      toStrip.push(el);
    }
  });
  toStrip.forEach(el => el.remove());

  // Normalize viewBox if missing
  let viewBox = svg.getAttribute('viewBox');
  const width = svg.getAttribute('width');
  const height = svg.getAttribute('height');
  if (!viewBox) {
    const w = parseFloat(width ?? '24') || 24;
    const h = parseFloat(height ?? '24') || 24;
    viewBox = `0 0 ${w} ${h}`;
    svg.setAttribute('viewBox', viewBox);
  }

  const allElements = svg.querySelectorAll('*');
  let pathCount = 0;
  let animatableCount = 0;
  let hasStrokes = false;
  const elements: ParsedElement[] = [];
  let warning: string | null = null;

  allElements.forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'path') pathCount++;
    if (ANIMATABLE_TAGS.has(tag)) {
      elements.push({
        index: animatableCount,
        tag,
        name: el.getAttribute('id') || `${tag}-${animatableCount}`,
        id: el.getAttribute('id'),
        visible: true,
      });
      animatableCount++;
      if (!hasStrokes) {
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none' && stroke !== '') {
          hasStrokes = true;
        }
      }
    }
  });

  // Also check the root SVG for stroke attribute
  if (!hasStrokes) {
    const rootStroke = svg.getAttribute('stroke');
    if (rootStroke && rootStroke !== 'none' && rootStroke !== '') {
      hasStrokes = true;
    }
  }

  // Guard: cap animatable elements
  if (animatableCount > MAX_ANIMATABLE) {
    warning = `SVG has ${animatableCount} animatable elements (max ${MAX_ANIMATABLE}). Only the first ${MAX_ANIMATABLE} will be animated.`;
  }

  // Guard: large SVG
  if (raw.length > 500_000) {
    const sizeWarning = 'SVG is very large (>500KB). Performance may be affected.';
    warning = warning ? `${warning} ${sizeWarning}` : sizeWarning;
  }

  const serializer = new XMLSerializer();
  const sanitized = serializer.serializeToString(svg);

  return {
    parsed: {
      svgString: sanitized,
      viewBox,
      width,
      height,
      elementCount: allElements.length,
      pathCount,
      hasStrokes,
      animatableCount,
      elements,
    },
    sanitized,
    warning,
  };
}

function sanitizeNode(node: Element) {
  // Remove dangerous child elements
  const toRemove: Element[] = [];
  node.querySelectorAll('*').forEach(el => {
    if (DANGEROUS_TAGS.has(el.tagName.toLowerCase())) {
      toRemove.push(el);
    }
  });
  toRemove.forEach(el => el.remove());

  // Remove on* event handler attributes from all elements
  const allElements = [node, ...Array.from(node.querySelectorAll('*'))];
  for (const el of allElements) {
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }
  }
}
