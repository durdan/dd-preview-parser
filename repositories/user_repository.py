from datetime import datetime
from typing import List, Optional, Dict, Any
from models.user import User, UserStatus, UserRole
import uuid

class UserRepository:
    def __init__(self):
        self.users = {}  # In production: database connection

    def create(self, user: User) -> User:
        """Create new user."""
        if self.find_by_email(user.email):
            raise ValueError("Email already exists")
        if self.find_by_username(user.username):
            raise ValueError("Username already exists")
        
        self.users[user.id] = user
        return user

    def find_by_id(self, user_id: str) -> Optional[User]:
        """Find user by ID."""
        return self.users.get(user_id)

    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email."""
        for user in self.users.values():
            if user.email.lower() == email.lower() and user.status != UserStatus.DELETED:
                return user
        return None

    def find_by_username(self, username: str) -> Optional[User]:
        """Find user by username."""
        for user in self.users.values():
            if user.username.lower() == username.lower() and user.status != UserStatus.DELETED:
                return user
        return None

    def update(self, user: User) -> User:
        """Update existing user."""
        if user.id not in self.users:
            raise ValueError("User not found")
        
        user.updated_at = datetime.utcnow()
        self.users[user.id] = user
        return user

    def search_users(self, 
                    query: Optional[str] = None,
                    status: Optional[UserStatus] = None,
                    role: Optional[UserRole] = None,
                    created_after: Optional[datetime] = None,
                    created_before: Optional[datetime] = None,
                    limit: int = 100,
                    offset: int = 0) -> List[User]:
        """Search users with filters."""
        results = []
        
        for user in self.users.values():
            # Skip deleted users unless specifically searching for them
            if user.status == UserStatus.DELETED and status != UserStatus.DELETED:
                continue
            
            # Apply filters
            if status and user.status != status:
                continue
            
            if role and user.role != role:
                continue
            
            if created_after and user.created_at < created_after:
                continue
            
            if created_before and user.created_at > created_before:
                continue
            
            # Text search in name, email, username
            if query:
                query_lower = query.lower()
                if not any(query_lower in field.lower() for field in [
                    user.first_name, user.last_name, user.email, user.username
                ]):
                    continue
            
            results.append(user)
        
        # Sort by created_at desc and apply pagination
        results.sort(key=lambda u: u.created_at, reverse=True)
        return results[offset:offset + limit]

    def count_users(self, status: Optional[UserStatus] = None) -> int:
        """Count users by status."""
        if status is None:
            return len([u for u in self.users.values() if u.status != UserStatus.DELETED])
        return len([u for u in self.users.values() if u.status == status])