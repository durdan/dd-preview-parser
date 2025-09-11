import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime

class MetadataManager:
    """Manages diagram metadata"""
    
    def __init__(self, base_path: str = "diagram_storage"):
        self.metadata_path = os.path.join(base_path, "metadata")
        os.makedirs(self.metadata_path, exist_ok=True)
    
    def set_metadata(self, diagram_id: str, metadata: Dict[str, Any]) -> None:
        """Set metadata for diagram"""
        if not diagram_id:
            raise ValueError("diagram_id is required")
        
        metadata_data = {
            "diagram_id": diagram_id,
            "metadata": metadata,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        metadata_file = os.path.join(self.metadata_path, f"{diagram_id}.json")
        with open(metadata_file, 'w') as f:
            json.dump(metadata_data, f)
    
    def get_metadata(self, diagram_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata for diagram"""
        if not diagram_id:
            raise ValueError("diagram_id is required")
        
        metadata_file = os.path.join(self.metadata_path, f"{diagram_id}.json")
        if not os.path.exists(metadata_file):
            return None
        
        with open(metadata_file, 'r') as f:
            data = json.load(f)
            return data.get("metadata", {})
    
    def search_by_tags(self, tags: List[str]) -> List[str]:
        """Search diagrams by tags"""
        if not tags:
            return []
        
        matching_diagrams = []
        if not os.path.exists(self.metadata_path):
            return matching_diagrams
        
        for filename in os.listdir(self.metadata_path):
            if filename.endswith('.json'):
                metadata_file = os.path.join(self.metadata_path, filename)
                with open(metadata_file, 'r') as f:
                    data = json.load(f)
                    diagram_tags = data.get("metadata", {}).get("tags", [])
                    if any(tag in diagram_tags for tag in tags):
                        matching_diagrams.append(data["diagram_id"])
        
        return matching_diagrams