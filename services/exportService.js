export async function exportDiagram(diagramId, format, title = 'diagram') {
  try {
    // Get SVG content from the current diagram
    const svgContent = await getSVGContent(diagramId);
    
    if (!svgContent) {
      throw new Error('No diagram content found');
    }

    // For client-side formats, handle directly
    if (format === 'svg') {
      return downloadSVG(svgContent, title);
    }
    
    if (format === 'png') {
      return downloadPNG(svgContent, title);
    }

    // For server-side formats, use API
    return await downloadFromServer(diagramId, format, svgContent, title);
    
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(`Failed to export diagram: ${error.message}`);
  }
}

async function getSVGContent(diagramId) {
  // Get SVG from the diagram container
  const diagramContainer = document.querySelector(`[data-diagram-id="${diagramId}"]`);
  if (!diagramContainer) {
    throw new Error('Diagram not found');
  }

  const svgElement = diagramContainer.querySelector('svg');
  if (!svgElement) {
    throw new Error('No SVG content found');
  }

  return new XMLSerializer().serializeToString(svgElement);
}

function downloadSVG(svgContent, title) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  downloadBlob(blob, `${title}.svg`);
}

function downloadPNG(svgContent, title) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${title}.png`);
          resolve();
        } else {
          reject(new Error('Failed to create PNG'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG for PNG conversion'));
    
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    img.src = URL.createObjectURL(svgBlob);
  });
}

async function downloadFromServer(diagramId, format, svgContent, title) {
  const response = await fetch('/api/diagrams/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      diagramId,
      format,
      svgContent,
      title
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Export failed');
  }

  const blob = await response.blob();
  downloadBlob(blob, `${title}.${format}`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { getSVGContent, downloadBlob };