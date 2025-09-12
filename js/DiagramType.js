export const DiagramType = {
    MERMAID: 'mermaid',
    PLANTUML: 'plantuml'
};

export const DIAGRAM_EXAMPLES = {
    [DiagramType.MERMAID]: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
    
    [DiagramType.PLANTUML]: `@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi there
@enduml`
};