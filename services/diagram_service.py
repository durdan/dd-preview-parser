import json
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models.diagram import Diagram
from models.user import User

class DiagramService:
    @staticmethod
    def create_diagram(db: Session, title: str, description: str, 
                      diagram_data: dict, owner_id: int, is_public: bool = False) -> Diagram:
        """Create a new diagram."""
        if not title.strip():
            raise ValueError("Title cannot be empty")
        
        if not diagram_data:
            raise ValueError("Diagram data cannot be empty")
        
        diagram = Diagram(
            title=title.strip(),
            description=description.strip() if description else None,
            diagram_data=json.dumps(diagram_data),
            owner_id=owner_id,
            is_public=is_public
        )
        
        db.add(diagram)
        db.commit()
        db.refresh(diagram)
        return diagram
    
    @staticmethod
    def get_diagram_by_id(db: Session, diagram_id: int, user_id: Optional[int] = None) -> Optional[Diagram]:
        """Get diagram by ID with ownership/visibility check."""
        query = db.query(Diagram).filter(Diagram.id == diagram_id)
        
        if user_id is not None:
            # User can see their own diagrams or public diagrams
            query = query.filter(
                and_(
                    (Diagram.owner_id == user_id) | (Diagram.is_public == True)
                )
            )
        else:
            # Anonymous users can only see public diagrams
            query = query.filter(Diagram.is_public == True)
        
        return query.first()
    
    @staticmethod
    def get_user_diagrams(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Diagram]:
        """Get all diagrams owned by a user."""
        return db.query(Diagram)\
                 .filter(Diagram.owner_id == user_id)\
                 .offset(skip)\
                 .limit(limit)\
                 .all()
    
    @staticmethod
    def get_public_diagrams(db: Session, skip: int = 0, limit: int = 100) -> List[Diagram]:
        """Get all public diagrams."""
        return db.query(Diagram)\
                 .filter(Diagram.is_public == True)\
                 .offset(skip)\
                 .limit(limit)\
                 .all()
    
    @staticmethod
    def update_diagram(db: Session, diagram_id: int, user_id: int, 
                      title: Optional[str] = None, description: Optional[str] = None,
                      diagram_data: Optional[dict] = None, is_public: Optional[bool] = None) -> Optional[Diagram]:
        """Update a diagram (only by owner)."""
        diagram = db.query(Diagram).filter(
            and_(Diagram.id == diagram_id, Diagram.owner_id == user_id)
        ).first()
        
        if not diagram:
            return None
        
        if title is not None:
            if not title.strip():
                raise ValueError("Title cannot be empty")
            diagram.title = title.strip()
        
        if description is not None:
            diagram.description = description.strip() if description else None
        
        if diagram_data is not None:
            if not diagram_data:
                raise ValueError("Diagram data cannot be empty")
            diagram.diagram_data = json.dumps(diagram_data)
        
        if is_public is not None:
            diagram.is_public = is_public
        
        db.commit()
        db.refresh(diagram)
        return diagram
    
    @staticmethod
    def delete_diagram(db: Session, diagram_id: int, user_id: int) -> bool:
        """Delete a diagram (only by owner)."""
        diagram = db.query(Diagram).filter(
            and_(Diagram.id == diagram_id, Diagram.owner_id == user_id)
        ).first()
        
        if not diagram:
            return False
        
        db.delete(diagram)
        db.commit()
        return True
    
    @staticmethod
    def check_ownership(db: Session, diagram_id: int, user_id: int) -> bool:
        """Check if user owns the diagram."""
        return db.query(Diagram).filter(
            and_(Diagram.id == diagram_id, Diagram.owner_id == user_id)
        ).first() is not None