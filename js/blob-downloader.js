class BlobDownloader {
    /**
     * Creates and triggers download of a blob
     * @param {Blob} blob - The blob to download
     * @param {string} filename - The filename for download
     */
    static download(blob, filename) {
        if (!blob || !filename) {
            throw new Error('Blob and filename are required');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
    }

    /**
     * Creates a blob from canvas data
     * @param {HTMLCanvasElement} canvas - The canvas element
     * @param {string} type - MIME type (default: image/png)
     * @returns {Promise<Blob>}
     */
    static async createBlobFromCanvas(canvas, type = 'image/png') {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to create blob from canvas'));
                }
            }, type);
        });
    }
}