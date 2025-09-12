import { DiagramType } from './DiagramType.js';

export class DiagramValidator {
    static validate(diagramCode, diagramType) {
        const errors = [];
        
        if (!diagramCode || diagramCode.trim().length === 0) {
            errors.push('Diagram code cannot be empty');
            return errors;
        }
        
        const trimmedCode = diagramCode.trim();
        
        switch (diagramType) {
            case DiagramType.MERMAID:
                errors.push(...this._validateMermaid(trimmedCode));
                break;
            case DiagramType.PLANTUML:
                errors.push(...this._validatePlantUML(trimmedCode));
                break;
            default:
                errors.push('Unsupported diagram type');
        }
        
        return errors;
    }
    
    static _validateMermaid(code) {
        const errors = [];
        
        // Check for basic Mermaid syntax patterns
        const mermaidKeywords = ['graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'pie', 'gantt'];
        const hasValidKeyword = mermaidKeywords.some(keyword => 
            code.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (!hasValidKeyword) {
            errors.push('Mermaid diagram must start with a valid diagram type (graph, flowchart, sequenceDiagram, etc.)');
        }
        
        return errors;
    }
    
    static _validatePlantUML(code) {
        const errors = [];
        
        if (!code.includes('@startuml')) {
            errors.push('PlantUML diagram must start with @startuml');
        }
        
        if (!code.includes('@enduml')) {
            errors.push('PlantUML diagram must end with @enduml');
        }
        
        return errors;
    }
}