import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime

class VersionManager:
    """Manages diagram versions"""
    
    def __init__(self, base_path: str = "diagram_storage"):
        self.versions_path = os.path.join(base_path, "versions")
        os.makedirs(self.versions_path, exist_ok=True)
    
    def create_version(self, diagram_id: str, content_hash: str, version_info: Dict[str, Any] = None) -> str:
        """Create new version, return version ID"""
        if not diagram_id or not content_hash:
            raise ValueError("diagram_id and content_hash are required")
        
        version_id = f"{diagram_id}_v{int(datetime.utcnow().timestamp())}"
        version_data = {
            "version_id": version_id,
            "diagram_id": diagram_id,
            "content_hash": content_hash,
            "created_at": datetime.utcnow().isoformat(),
            "info": version_info or {}
        }
        
        version_file = os.path.join(self.versions_path, f"{version_id}.json")
        with open(version_file, 'w') as f:
            json.dump(version_data, f)
        
        return version_id
    
    def get_version(self, version_id: str) -> Optional[Dict[str, Any]]:
        """Get specific version"""
        if not version_id:
            raise ValueError("version_id is required")
        
        version_file = os.path.join(self.versions_path, f"{version_id}.json")
        if not os.path.exists(version_file):
            return None
        
        with open(version_file, 'r') as f:
            return json.load(f)
    
    def list_versions(self, diagram_id: str) -> List[Dict[str, Any]]:
        """List all versions for a diagram"""
        if not diagram_id:
            raise ValueError("diagram_id is required")
        
        versions = []
        if not os.path.exists(self.versions_path):
            return versions
        
        for filename in os.listdir(self.versions_path):
            if filename.startswith(f"{diagram_id}_v") and filename.endswith('.json'):
                version_file = os.path.join(self.versions_path, filename)
                with open(version_file, 'r') as f:
                    versions.append(json.load(f))
        
        return sorted(versions, key=lambda x: x['created_at'], reverse=True)