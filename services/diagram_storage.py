from typing import Dict, List, Optional
from models.diagram_metadata import DiagramMetadata

class DiagramStorage:
    def __init__(self):
        self._diagrams: Dict[str, DiagramMetadata] = {}
    
    def save_diagram(self, diagram: DiagramMetadata) -> DiagramMetadata:
        if not diagram.name.strip():
            raise ValueError("Diagram name cannot be empty")
        if not diagram.user_id.strip():
            raise ValueError("User ID cannot be empty")
        
        self._diagrams[diagram.id] = diagram
        return diagram
    
    def load_diagram(self, diagram_id: str) -> Optional[DiagramMetadata]:
        return self._diagrams.get(diagram_id)
    
    def get_user_diagrams(self, user_id: str) -> List[DiagramMetadata]:
        if not user_id.strip():
            raise ValueError("User ID cannot be empty")
        
        return [diagram for diagram in self._diagrams.values() 
                if diagram.user_id == user_id]
    
    def delete_diagram(self, diagram_id: str, user_id: str) -> bool:
        diagram = self._diagrams.get(diagram_id)
        if not diagram:
            return False
        
        if diagram.user_id != user_id:
            raise PermissionError("Cannot delete diagram belonging to another user")
        
        del self._diagrams[diagram_id]
        return True
    
    def update_diagram(self, diagram_id: str, user_id: str, **updates) -> Optional[DiagramMetadata]:
        diagram = self._diagrams.get(diagram_id)
        if not diagram:
            return None
        
        if diagram.user_id != user_id:
            raise PermissionError("Cannot update diagram belonging to another user")
        
        diagram.update(**updates)
        return diagram