from datetime import datetime
from enum import Enum
from dataclasses import dataclass
from typing import Dict, Any, Optional
import json

class AuditAction(Enum):
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_SUSPENDED = "user_suspended"
    USER_DELETED = "user_deleted"
    USER_SEARCHED = "user_searched"
    LOGIN_ATTEMPT = "login_attempt"
    PERMISSION_DENIED = "permission_denied"

@dataclass
class AuditEntry:
    id: str
    action: AuditAction
    admin_id: str
    target_user_id: Optional[str]
    timestamp: datetime
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLogger:
    def __init__(self):
        self.entries = []  # In production, this would be a database

    def log(self, action: AuditAction, admin_id: str, 
            target_user_id: Optional[str] = None,
            details: Optional[Dict[str, Any]] = None,
            ip_address: Optional[str] = None,
            user_agent: Optional[str] = None) -> None:
        """Log an admin action for audit trail."""
        import uuid
        
        entry = AuditEntry(
            id=str(uuid.uuid4()),
            action=action,
            admin_id=admin_id,
            target_user_id=target_user_id,
            timestamp=datetime.utcnow(),
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.entries.append(entry)
        self._persist_entry(entry)

    def _persist_entry(self, entry: AuditEntry) -> None:
        """Persist audit entry (placeholder for database storage)."""
        # In production: save to database, send to logging service, etc.
        print(f"AUDIT: {entry.timestamp} - {entry.action.value} by {entry.admin_id}")

    def get_user_audit_trail(self, user_id: str) -> list:
        """Get audit trail for specific user."""
        return [entry for entry in self.entries 
                if entry.target_user_id == user_id]

    def get_admin_actions(self, admin_id: str) -> list:
        """Get all actions performed by specific admin."""
        return [entry for entry in self.entries 
                if entry.admin_id == admin_id]