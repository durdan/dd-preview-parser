from datetime import datetime
from enum import Enum
from dataclasses import dataclass
from typing import Optional
import hashlib
import secrets

class UserStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

@dataclass
class User:
    id: str
    email: str
    username: str
    first_name: str
    last_name: str
    role: UserRole
    status: UserStatus
    password_hash: str
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    suspended_at: Optional[datetime] = None
    suspended_by: Optional[str] = None
    suspension_reason: Optional[str] = None

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password with salt for secure storage."""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', 
                                          password.encode('utf-8'), 
                                          salt.encode('utf-8'), 
                                          100000)
        return f"{salt}:{password_hash.hex()}"

    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        try:
            salt, stored_hash = self.password_hash.split(':')
            password_hash = hashlib.pbkdf2_hmac('sha256',
                                              password.encode('utf-8'),
                                              salt.encode('utf-8'),
                                              100000)
            return password_hash.hex() == stored_hash
        except ValueError:
            return False

    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE

    def can_login(self) -> bool:
        return self.status in [UserStatus.ACTIVE]

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Convert to dict, optionally excluding sensitive data."""
        data = {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role.value,
            'status': self.status.value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_sensitive:
            data.update({
                'suspended_at': self.suspended_at.isoformat() if self.suspended_at else None,
                'suspended_by': self.suspended_by,
                'suspension_reason': self.suspension_reason
            })
        
        return data