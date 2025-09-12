from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

@dataclass
class DiagramMetadata:
    id: str
    name: str
    user_id: str
    description: str = ""
    created_at: datetime = None
    updated_at: datetime = None
    diagram_data: Dict[Any, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = self.created_at
        if self.diagram_data is None:
            self.diagram_data = {}
    
    @classmethod
    def create_new(cls, name: str, user_id: str, description: str = "", diagram_data: Dict[Any, Any] = None):
        return cls(
            id=str(uuid.uuid4()),
            name=name,
            user_id=user_id,
            description=description,
            diagram_data=diagram_data or {}
        )
    
    def update(self, name: Optional[str] = None, description: Optional[str] = None, diagram_data: Optional[Dict[Any, Any]] = None):
        if name is not None:
            self.name = name
        if description is not None:
            self.description = description
        if diagram_data is not None:
            self.diagram_data = diagram_data
        self.updated_at = datetime.now()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'diagram_data': self.diagram_data
        }