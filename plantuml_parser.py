import re
from typing import Dict, List, Optional
from diagram_engine import DiagramParser, DiagramType, ValidationError

class PlantUMLParser(DiagramParser):
    def __init__(self):
        self.diagram_patterns = {
            DiagramType.SEQUENCE: r'@startuml.*?participant|actor|boundary|control|entity|database',
            DiagramType.CLASS: r'@startuml.*?class|interface|abstract|enum',
            DiagramType.ACTIVITY: r'@startuml.*?start|stop|:.*?;|\|.*?\|',
            DiagramType.USE_CASE: r'@startuml.*?usecase|actor.*?\(|\(.*?\)',
            DiagramType.COMPONENT: r'@startuml.*?component|package|\[.*?\]',
            DiagramType.STATE: r'@startuml.*?state|-->|\[.*?\].*?:'
        }
    
    def parse(self, content: str) -> Dict:
        if not content.strip():
            raise ValidationError("Empty PlantUML content")
        
        # Extract basic structure
        lines = content.strip().split('\n')
        start_line = None
        end_line = None
        
        for i, line in enumerate(lines):
            if line.strip().startswith('@startuml'):
                start_line = i
            elif line.strip().startswith('@enduml'):
                end_line = i
                break
        
        if start_line is None:
            raise ValidationError("Missing @startuml directive")
        if end_line is None:
            raise ValidationError("Missing @enduml directive")
        
        diagram_content = '\n'.join(lines[start_line:end_line + 1])
        
        return {
            'type': self.get_diagram_type(content),
            'content': diagram_content,
            'title': self._extract_title(content),
            'participants': self._extract_participants(content),
            'relationships': self._extract_relationships(content)
        }
    
    def validate(self, content: str) -> List[str]:
        errors = []
        
        if not content.strip():
            errors.append("Empty content")
            return errors
        
        # Check for required directives
        if '@startuml' not in content:
            errors.append("Missing @startuml directive")
        if '@enduml' not in content:
            errors.append("Missing @enduml directive")
        
        # Check directive order
        start_pos = content.find('@startuml')
        end_pos = content.find('@enduml')
        if start_pos >= 0 and end_pos >= 0 and start_pos >= end_pos:
            errors.append("@startuml must come before @enduml")
        
        # Validate syntax based on diagram type
        diagram_type = self.get_diagram_type(content)
        if diagram_type:
            errors.extend(self._validate_diagram_syntax(content, diagram_type))
        else:
            errors.append("Unable to determine diagram type")
        
        return errors
    
    def get_diagram_type(self, content: str) -> Optional[DiagramType]:
        content_lower = content.lower()
        
        for diagram_type, pattern in self.diagram_patterns.items():
            if re.search(pattern, content_lower, re.DOTALL | re.IGNORECASE):
                return diagram_type
        
        return None
    
    def _extract_title(self, content: str) -> Optional[str]:
        title_match = re.search(r'title\s+(.+)', content, re.IGNORECASE)
        return title_match.group(1).strip() if title_match else None
    
    def _extract_participants(self, content: str) -> List[str]:
        participants = []
        
        # Extract various participant types
        patterns = [
            r'participant\s+"?([^"\n]+)"?',
            r'actor\s+"?([^"\n]+)"?',
            r'boundary\s+"?([^"\n]+)"?',
            r'control\s+"?([^"\n]+)"?',
            r'entity\s+"?([^"\n]+)"?',
            r'database\s+"?([^"\n]+)"?'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            participants.extend([match.strip() for match in matches])
        
        return list(set(participants))  # Remove duplicates
    
    def _extract_relationships(self, content: str) -> List[Dict]:
        relationships = []
        
        # Common PlantUML relationship patterns
        patterns = [
            r'([^->\n]+)\s*-+>\s*([^:\n]+)(?::\s*(.+))?',  # A -> B : message
            r'([^-\n]+)\s*--\s*([^:\n]+)(?::\s*(.+))?',    # A -- B : association
            r'([^|\n]+)\s*\|\|\s*([^:\n]+)(?::\s*(.+))?',  # A || B : composition
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            for match in matches:
                relationships.append({
                    'from': match[0].strip(),
                    'to': match[1].strip(),
                    'label': match[2].strip() if len(match) > 2 and match[2] else None
                })
        
        return relationships
    
    def _validate_diagram_syntax(self, content: str, diagram_type: DiagramType) -> List[str]:
        errors = []
        
        if diagram_type == DiagramType.SEQUENCE:
            errors.extend(self._validate_sequence_diagram(content))
        elif diagram_type == DiagramType.CLASS:
            errors.extend(self._validate_class_diagram(content))
        # Add more specific validations as needed
        
        return errors
    
    def _validate_sequence_diagram(self, content: str) -> List[str]:
        errors = []
        
        # Check for balanced quotes
        quote_count = content.count('"')
        if quote_count % 2 != 0:
            errors.append("Unbalanced quotes in sequence diagram")
        
        # Check for proper arrow syntax
        invalid_arrows = re.findall(r'[^-]>|<[^-]', content)
        if invalid_arrows:
            errors.append("Invalid arrow syntax found")
        
        return errors
    
    def _validate_class_diagram(self, content: str) -> List[str]:
        errors = []
        
        # Check for proper class declaration syntax
        class_declarations = re.findall(r'class\s+(\w+)', content, re.IGNORECASE)
        for class_name in class_declarations:
            if not re.match(r'^[A-Za-z_][A-Za-z0-9_]*$', class_name):
                errors.append(f"Invalid class name: {class_name}")
        
        return errors