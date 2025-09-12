class PDFGenerator {
    constructor() {
        this.defaultOptions = {
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        };
    }

    /**
     * Creates PDF from canvas
     * @param {HTMLCanvasElement} canvas - The canvas to convert
     * @param {Object} options - PDF generation options
     * @returns {Blob}
     */
    createFromCanvas(canvas, options = {}) {
        const config = { ...this.defaultOptions, ...options };
        
        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF(config);
            
            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate dimensions to fit canvas in PDF page
            const canvasAspectRatio = canvas.width / canvas.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let imgWidth, imgHeight;
            
            if (canvasAspectRatio > pdfAspectRatio) {
                // Canvas is wider, fit to width
                imgWidth = pdfWidth;
                imgHeight = pdfWidth / canvasAspectRatio;
            } else {
                // Canvas is taller, fit to height
                imgHeight = pdfHeight;
                imgWidth = pdfHeight * canvasAspectRatio;
            }
            
            // Center the image
            const x = (pdfWidth - imgWidth) / 2;
            const y = (pdfHeight - imgHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
            
            return new Blob([pdf.output('blob')], { type: 'application/pdf' });
        } catch (error) {
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }
}