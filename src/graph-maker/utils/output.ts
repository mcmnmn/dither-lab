export function exportSVG(svgElement: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add XML declaration and namespace if missing
  if (!source.match(/^<\?xml/)) {
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  }
  if (!source.match(/xmlns=/)) {
    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}

export function exportPNG(svgElement: SVGSVGElement, width: number, height: number, filename: string) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  if (!source.match(/xmlns=/)) {
    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const dpr = 2; // 2x for retina
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  const img = new Image();
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    canvas.toBlob(blob => {
      if (blob) downloadBlob(blob, filename);
    }, 'image/png');
  };

  img.src = url;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function makeFilename(themeId: string, ext: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const safeTheme = themeId.toLowerCase().replace(/\s+/g, '-');
  return `graph-${safeTheme}-${timestamp}.${ext}`;
}
