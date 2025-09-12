class CanvasRenderer {
    constructor(options = {}) {
        this.defaultOptions = {
            backgroundColor: '#ffffff',
            scale: 1,
            useCORS: true,
            allowTaint: false,
            ...options
        };
    }

    /**
     * Renders DOM element to canvas using html2canvas
     * @param {HTMLElement|string} element - Element or selector to render
     * @param {Object} options - html2canvas options
     * @returns {Promise<HTMLCanvasElement>}
     */
    async render(element, options = {}) {
        const targetElement = this._getElement(element);
        const renderOptions = { ...this.defaultOptions, ...options };

        try {
            const canvas = await html2canvas(targetElement, renderOptions);
            return canvas;
        } catch (error) {
            throw new Error(`Canvas rendering failed: ${error.message}`);
        }
    }

    /**
     * Gets DOM element from element or selector
     * @param {HTMLElement|string} element 
     * @returns {HTMLElement}
     * @private
     */
    _getElement(element) {
        if (typeof element === 'string') {
            const found = document.querySelector(element);
            if (!found) {
                throw new Error(`Element not found: ${element}`);
            }
            return found;
        }
        
        if (!(element instanceof HTMLElement)) {
            throw new Error('Invalid element provided');
        }
        
        return element;
    }
}