class ExportManager {
    constructor() {
        this.canvasRenderer = new CanvasRenderer();
        this.pdfGenerator = new PDFGenerator();
    }

    /**
     * Exports element as PNG
     * @param {HTMLElement|string} element - Element to export
     * @param {string} filename - Output filename
     * @param {Object} options - Export options
     */
    async exportPNG(element, filename = 'export.png', options = {}) {
        this._validateFilename(filename, '.png');
        
        try {
            const canvas = await this.canvasRenderer.render(element, options);
            const blob = await BlobDownloader.createBlobFromCanvas(canvas, 'image/png');
            BlobDownloader.download(blob, filename);
        } catch (error) {
            throw new Error(`PNG export failed: ${error.message}`);
        }
    }

    /**
     * Exports element as PDF
     * @param {HTMLElement|string} element - Element to export
     * @param {string} filename - Output filename
     * @param {Object} canvasOptions - Canvas rendering options
     * @param {Object} pdfOptions - PDF generation options
     */
    async exportPDF(element, filename = 'export.pdf', canvasOptions = {}, pdfOptions = {}) {
        this._validateFilename(filename, '.pdf');
        
        try {
            const canvas = await this.canvasRenderer.render(element, canvasOptions);
            const blob = this.pdfGenerator.createFromCanvas(canvas, pdfOptions);
            BlobDownloader.download(blob, filename);
        } catch (error) {
            throw new Error(`PDF export failed: ${error.message}`);
        }
    }

    /**
     * Validates filename has correct extension
     * @param {string} filename 
     * @param {string} expectedExt 
     * @private
     */
    _validateFilename(filename, expectedExt) {
        if (!filename || typeof filename !== 'string') {
            throw new Error('Filename must be a non-empty string');
        }
        
        if (!filename.toLowerCase().endsWith(expectedExt)) {
            throw new Error(`Filename must end with ${expectedExt}`);
        }
    }
}