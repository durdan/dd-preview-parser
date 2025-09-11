import json
import os
import hashlib
from typing import Dict, List, Optional, Any
from datetime import datetime
import shutil

class DiagramStorage:
    """Core storage operations for diagrams"""
    
    def __init__(self, base_path: str = "diagram_storage"):
        self.base_path = base_path
        self.diagrams_path = os.path.join(base_path, "diagrams")
        self.content_path = os.path.join(base_path, "content")
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Create necessary directories"""
        os.makedirs(self.diagrams_path, exist_ok=True)
        os.makedirs(self.content_path, exist_ok=True)
    
    def _content_hash(self, content: str) -> str:
        """Generate hash for content deduplication"""
        return hashlib.sha256(content.encode()).hexdigest()
    
    def _store_content(self, content: str) -> str:
        """Store content with deduplication, return content hash"""
        content_hash = self._content_hash(content)
        content_file = os.path.join(self.content_path, f"{content_hash}.json")
        
        if not os.path.exists(content_file):
            with open(content_file, 'w') as f:
                json.dump({"content": content, "created_at": datetime.utcnow().isoformat()}, f)
        
        return content_hash
    
    def _load_content(self, content_hash: str) -> Optional[str]:
        """Load content by hash"""
        content_file = os.path.join(self.content_path, f"{content_hash}.json")
        if not os.path.exists(content_file):
            return None
        
        with open(content_file, 'r') as f:
            data = json.load(f)
            return data.get("content")
    
    def store_diagram(self, diagram_id: str, content: str) -> str:
        """Store diagram content, return content hash"""
        if not diagram_id or not content:
            raise ValueError("diagram_id and content are required")
        
        content_hash = self._store_content(content)
        diagram_file = os.path.join(self.diagrams_path, f"{diagram_id}.json")
        
        diagram_data = {
            "id": diagram_id,
            "content_hash": content_hash,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        with open(diagram_file, 'w') as f:
            json.dump(diagram_data, f)
        
        return content_hash
    
    def get_diagram(self, diagram_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve diagram by ID"""
        if not diagram_id:
            raise ValueError("diagram_id is required")
        
        diagram_file = os.path.join(self.diagrams_path, f"{diagram_id}.json")
        if not os.path.exists(diagram_file):
            return None
        
        with open(diagram_file, 'r') as f:
            diagram_data = json.load(f)
        
        content = self._load_content(diagram_data["content_hash"])
        if content is None:
            return None
        
        return {
            "id": diagram_data["id"],
            "content": content,
            "content_hash": diagram_data["content_hash"],
            "updated_at": diagram_data["updated_at"]
        }
    
    def delete_diagram(self, diagram_id: str) -> bool:
        """Delete diagram"""
        if not diagram_id:
            raise ValueError("diagram_id is required")
        
        diagram_file = os.path.join(self.diagrams_path, f"{diagram_id}.json")
        if os.path.exists(diagram_file):
            os.remove(diagram_file)
            return True
        return False
    
    def list_diagrams(self) -> List[str]:
        """List all diagram IDs"""
        if not os.path.exists(self.diagrams_path):
            return []
        
        return [f[:-5] for f in os.listdir(self.diagrams_path) if f.endswith('.json')]