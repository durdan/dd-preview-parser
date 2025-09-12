class ExportUI {
    constructor(exportManager, statusElementId = 'status') {
        this.exportManager = exportManager;
        this.statusElement = document.getElementById(statusElementId);
    }

    /**
     * Initializes UI event listeners
     */
    init() {
        this._bindEvents();
    }

    /**
     * Shows status message
     * @param {string} message 
     * @param {string} type - 'success', 'error', or 'info'
     */
    showStatus(message, type = 'info') {
        if (!this.statusElement) return;
        
        this.statusElement.textContent = message;
        this.statusElement.className = type;
        
        // Clear status after 3 seconds for success/info messages
        if (type !== 'error') {
            setTimeout(() => {
                this.statusElement.textContent = '';
                this.statusElement.className = '';
            }, 3000);
        }
    }

    /**
     * Handles PNG export
     * @param {string} selector - Element selector to export
     */
    async handlePNGExport(selector = '#content') {
        try {
            this.showStatus('Generating PNG...', 'info');
            await this.exportManager.exportPNG(selector, 'export.png');
            this.showStatus('PNG exported successfully!', 'success');
        } catch (error) {
            this.showStatus(`PNG export failed: ${error.message}`, 'error');
        }
    }

    /**
     * Handles PDF export
     * @param {string} selector - Element selector to export
     */
    async handlePDFExport(selector = '#content') {
        try {
            this.showStatus('Generating PDF...', 'info');
            await this.exportManager.exportPDF(selector, 'export.pdf');
            this.showStatus('PDF exported successfully!', 'success');
        } catch (error) {
            this.showStatus(`PDF export failed: ${error.message}`, 'error');
        }
    }

    /**
     * Binds event listeners to export buttons
     * @private
     */
    _bindEvents() {
        const pngButton = document.getElementById('export-png');
        const pdfButton = document.getElementById('export-pdf');

        if (pngButton) {
            pngButton.addEventListener('click', () => this.handlePNGExport());
        }

        if (pdfButton) {
            pdfButton.addEventListener('click', () => this.handlePDFExport());
        }
    }
}