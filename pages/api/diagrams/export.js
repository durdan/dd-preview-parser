import { createCanvas } from 'canvas';
import jsPDF from 'jspdf';

const SUPPORTED_FORMATS = ['svg', 'png', 'pdf'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { diagramId, format, svgContent, title = 'diagram' } = req.body;

    if (!diagramId || !format || !svgContent) {
      return res.status(400).json({ 
        error: 'Missing required fields: diagramId, format, svgContent' 
      });
    }

    if (!SUPPORTED_FORMATS.includes(format.toLowerCase())) {
      return res.status(400).json({ 
        error: `Unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}` 
      });
    }

    const exportData = await generateExport(svgContent, format.toLowerCase(), title);
    
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${title}.${format}"`);
    
    if (format.toLowerCase() === 'svg') {
      res.send(exportData.data);
    } else {
      res.send(Buffer.from(exportData.data, 'base64'));
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
}

async function generateExport(svgContent, format, title) {
  switch (format) {
    case 'svg':
      return {
        data: svgContent,
        contentType: 'image/svg+xml'
      };
    
    case 'png':
      return await convertToPNG(svgContent);
    
    case 'pdf':
      return await convertToPDF(svgContent, title);
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function convertToPNG(svgContent) {
  // For server-side PNG conversion, we'd need a proper SVG to PNG converter
  // This is a simplified version - in production, use libraries like puppeteer or sharp
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Basic fallback - draw a placeholder
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#333';
  ctx.font = '16px Arial';
  ctx.fillText('PNG Export (Server-side conversion needed)', 50, 300);
  
  return {
    data: canvas.toBuffer('image/png').toString('base64'),
    contentType: 'image/png'
  };
}

async function convertToPDF(svgContent, title) {
  const pdf = new jsPDF();
  pdf.text(title, 20, 20);
  pdf.text('PDF Export (SVG content conversion needed)', 20, 40);
  
  return {
    data: pdf.output('datauristring').split(',')[1],
    contentType: 'application/pdf'
  };
}