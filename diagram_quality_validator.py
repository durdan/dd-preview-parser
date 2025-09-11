from typing import Dict, List, Any
from diagram_engine import DiagramType, ValidationError

class DiagramQualityValidator:
    def __init__(self):
        self.quality_rules = {
            'max_participants': 20,
            'max_relationships': 50,
            'min_title_length': 3,
            'max_title_length': 100,
            'max_label_length': 50
        }
    
    def validate_quality(self, parsed_diagram: Dict, diagram_type: DiagramType) -> List[str]:
        warnings = []
        
        # Check participant count
        participants = parsed_diagram.get('participants', [])
        if len(participants) > self.quality_rules['max_participants']:
            warnings.append(f"Too many participants ({len(participants)}). Consider splitting the diagram.")
        
        # Check relationship count
        relationships = parsed_diagram.get('relationships', [])
        if len(relationships) > self.quality_rules['max_relationships']:
            warnings.append(f"Too many relationships ({len(relationships)}). Consider simplifying.")
        
        # Check title quality
        title = parsed_diagram.get('title')
        if title:
            if len(title) < self.quality_rules['min_title_length']:
                warnings.append("Title too short. Consider a more descriptive title.")
            elif len(title) > self.quality_rules['max_title_length']:
                warnings.append("Title too long. Consider shortening for clarity.")
        else:
            warnings.append("Missing title. Consider adding a descriptive title.")
        
        # Check label lengths
        for rel in relationships:
            label = rel.get('label')
            if label and len(label) > self.quality_rules['max_label_length']:
                warnings.append(f"Relationship label too long: '{label[:20]}...'")
        
        # Diagram-specific quality checks
        if diagram_type == DiagramType.SEQUENCE:
            warnings.extend(self._validate_sequence_quality(parsed_diagram))
        elif diagram_type == DiagramType.CLASS:
            warnings.extend(self._validate_class_quality(parsed_diagram))
        
        return warnings
    
    def _validate_sequence_quality(self, parsed_diagram: Dict) -> List[str]:
        warnings = []
        
        participants = parsed_diagram.get('participants', [])
        relationships = parsed_diagram.get('relationships', [])
        
        # Check for unused participants
        used_participants = set()
        for rel in relationships:
            used_participants.add(rel.get('from', '').strip())
            used_participants.add(rel.get('to', '').strip())
        
        unused = set(participants) - used_participants
        if unused:
            warnings.append(f"Unused participants: {', '.join(unused)}")
        
        return warnings
    
    def _validate_class_quality(self, parsed_diagram: Dict) -> List[str]:
        warnings = []
        
        relationships = parsed_diagram.get('relationships', [])
        
        # Check for circular dependencies (simplified)
        class_deps = {}
        for rel in relationships:
            from_class = rel.get('from', '').strip()
            to_class = rel.get('to', '').strip()
            if from_class and to_class:
                if from_class not in class_deps:
                    class_deps[from_class] = set()
                class_deps[from_class].add(to_class)
        
        # Simple cycle detection
        for class_name, deps in class_deps.items():
            if class_name in deps:
                warnings.append(f"Potential circular dependency detected for class: {class_name}")
        
        return warnings