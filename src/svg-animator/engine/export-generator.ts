import type { AnimationOutput } from './animation-generator';

/**
 * Generate a self-contained SVG with embedded <style> and animation attributes.
 */
export function generateStandaloneSVG(
  svgString: string,
  animation: AnimationOutput,
  pathLengths: Map<number, number>,
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;

  // Build CSS with element-specific styles
  const lines: string[] = [animation.keyframesCSS, ''];
  let index = 0;
  const animatable = svg.querySelectorAll(
    'path, circle, rect, line, polyline, polygon, ellipse'
  );

  animatable.forEach(el => {
    const cls = `sa-el-${index}`;
    el.setAttribute('class', ((el.getAttribute('class') ?? '') + ' ' + cls).trim());
    const len = pathLengths.get(index);
    lines.push(`.${cls} { ${animation.getElementStyle(index, len)} }`);
    index++;
  });

  // Insert <style> as first child of <svg>
  const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = lines.join('\n');
  svg.insertBefore(style, svg.firstChild);

  const serializer = new XMLSerializer();
  return formatSvgOutput(serializer.serializeToString(svg));
}

/**
 * Generate the inline SVG markup (with class names) and separate CSS.
 */
export function generateSplitExport(
  svgString: string,
  animation: AnimationOutput,
  pathLengths: Map<number, number>,
): { svgMarkup: string; css: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;

  const cssLines: string[] = [animation.keyframesCSS, ''];
  let index = 0;
  const animatable = svg.querySelectorAll(
    'path, circle, rect, line, polyline, polygon, ellipse'
  );

  animatable.forEach(el => {
    const cls = `sa-el-${index}`;
    el.setAttribute('class', ((el.getAttribute('class') ?? '') + ' ' + cls).trim());
    const len = pathLengths.get(index);
    cssLines.push(`.${cls} { ${animation.getElementStyle(index, len)} }`);
    index++;
  });

  const serializer = new XMLSerializer();
  return {
    svgMarkup: formatSvgOutput(serializer.serializeToString(svg)),
    css: cssLines.join('\n'),
  };
}

function formatSvgOutput(raw: string): string {
  // Remove the xmlns:NS prefixes that XMLSerializer adds
  return raw.replace(/ xmlns:NS\d+=""/g, '').replace(/ NS\d+:xmlns:\w+="[^"]*"/g, '');
}

/**
 * Generate a React functional component wrapping the animated SVG.
 */
export function generateReactComponent(
  svgString: string,
  animation: AnimationOutput,
  pathLengths: Map<number, number>,
  componentName = 'AnimatedIcon',
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.documentElement;

  // Build CSS for the style tag
  const cssLines: string[] = [animation.keyframesCSS, ''];
  let index = 0;
  const animatable = svg.querySelectorAll(
    'path, circle, rect, line, polyline, polygon, ellipse'
  );

  animatable.forEach(el => {
    const cls = `sa-el-${index}`;
    el.setAttribute('class', ((el.getAttribute('class') ?? '') + ' ' + cls).trim());
    const len = pathLengths.get(index);
    cssLines.push(`.${cls} { ${animation.getElementStyle(index, len)} }`);
    index++;
  });

  const serializer = new XMLSerializer();
  const svgMarkup = formatSvgOutput(serializer.serializeToString(svg));

  // Convert SVG attrs to JSX: class → className, kebab-case → camelCase for known attrs
  const jsxSvg = svgMarkup
    .replace(/class="/g, 'className="')
    .replace(/stroke-width="/g, 'strokeWidth="')
    .replace(/stroke-linecap="/g, 'strokeLinecap="')
    .replace(/stroke-linejoin="/g, 'strokeLinejoin="')
    .replace(/fill-rule="/g, 'fillRule="')
    .replace(/clip-rule="/g, 'clipRule="')
    .replace(/clip-path="/g, 'clipPath="')
    .replace(/xmlns:xlink="/g, 'xmlnsXlink="');

  const css = cssLines.join('\n');

  return `import { useRef } from 'react';

const styles = \`${css}\`;

export function ${componentName}({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <>
      <style>{styles}</style>
      ${jsxSvg.replace('<svg', '<svg className={className} {...props}')}
    </>
  );
}
`;
}

export function downloadSvgFile(svgContent: string, filename = 'animated.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
