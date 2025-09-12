import { DiagramType } from './DiagramType.js';
import { DiagramValidator } from './DiagramValidator.js';
import { ErrorHandler } from './ErrorHandler.js';

export class DiagramRenderer {
    constructor(outputContainer, errorHandler) {
        this.outputContainer = outputContainer;
        this.errorHandler = errorHandler;
        this._initializeMermaid();
    }
    
    _initializeMermaid() {
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({ 
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose'
            });
        }
    }
    
    async render(diagramCode, diagramType) {
        try {
            // Validate input
            const validationErrors = DiagramValidator.validate(diagramCode, diagramType);
            if (validationErrors.length > 0) {
                this.errorHandler.showErrors(validationErrors);
                return;
            }
            
            this.errorHandler.hideError();
            this._clearOutput();
            this._showLoading();
            
            switch (diagramType) {
                case DiagramType.MERMAID:
                    await this._renderMermaid(diagramCode);
                    break;
                case DiagramType.PLANTUML:
                    await this._renderPlantUML(diagramCode);
                    break;
                default:
                    throw new Error('Unsupported diagram type');
            }
            
        } catch (error) {
            ErrorHandler.handleAsyncError(error, this.errorHandler);
        }
    }
    
    async _renderMermaid(diagramCode) {
        if (typeof mermaid === 'undefined') {
            throw new Error('Mermaid library not loaded');
        }
        
        try {
            const diagramId = `mermaid-${Date.now()}`;
            const { svg } = await mermaid.render(diagramId, diagramCode);
            
            this.outputContainer.innerHTML = svg;
            this.outputContainer.classList.remove('empty');
            
        } catch (error) {
            throw new Error(`Mermaid syntax error: ${error.message}`);
        }
    }
    
    async _renderPlantUML(diagramCode) {
        if (typeof plantumlEncoder === 'undefined') {
            throw new Error('PlantUML encoder library not loaded');
        }
        
        try {
            const encoded = plantumlEncoder.encode(diagramCode);
            const imageUrl = `https://www.plantuml.com/plantuml/svg/${encoded}`;
            
            // Create and load image
            const img = new Image();
            
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    this.outputContainer.innerHTML = '';
                    this.outputContainer.appendChild(img);
                    this.outputContainer.classList.remove('empty');
                    resolve();
                };
                
                img.onerror = () => {
                    reject(new Error('Failed to load PlantUML diagram. Please check your syntax.'));
                };
                
                img.src = imageUrl;
                img.alt = 'PlantUML Diagram';
            });
            
        } catch (error) {
            throw new Error(`PlantUML encoding error: ${error.message}`);
        }
    }
    
    _showLoading() {
        this.outputContainer.innerHTML = '<div style="padding: 40px; color: #7f8c8d;">Rendering diagram...</div>';
        this.outputContainer.classList.remove('empty');
    }
    
    _clearOutput() {
        this.outputContainer.innerHTML = '';
        this.outputContainer.classList.add('empty');
    }
    
    clear() {
        this._clearOutput();
        this.errorHandler.hideError();
    }
}