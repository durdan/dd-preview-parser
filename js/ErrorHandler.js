export class ErrorHandler {
    constructor(errorContainer) {
        this.errorContainer = errorContainer;
    }
    
    showError(message) {
        this.errorContainer.textContent = message;
        this.errorContainer.classList.remove('hidden');
    }
    
    showErrors(errors) {
        if (errors.length === 0) {
            this.hideError();
            return;
        }
        
        const errorMessage = errors.length === 1 
            ? errors[0] 
            : `Multiple errors:\n${errors.map(err => `• ${err}`).join('\n')}`;
            
        this.showError(errorMessage);
    }
    
    hideError() {
        this.errorContainer.classList.add('hidden');
    }
    
    static handleAsyncError(error, errorHandler) {
        console.error('Rendering error:', error);
        
        let userMessage = 'Failed to render diagram';
        
        if (error.message) {
            if (error.message.includes('syntax')) {
                userMessage = 'Diagram syntax error. Please check your code.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                userMessage = 'Network error. Please check your connection.';
            } else {
                userMessage = `Rendering error: ${error.message}`;
            }
        }
        
        errorHandler.showError(userMessage);
    }
}