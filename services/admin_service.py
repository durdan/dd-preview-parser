from datetime import datetime
from typing import List, Dict, Any, Optional
from models.admin_models import User, UserRole, UserStatus

class AdminServiceError(Exception):
    pass

class AdminService:
    def __init__(self):
        # Mock data storage - replace with database
        self.users: Dict[str, User] = {
            "1": User("1", "admin", "admin@example.com", UserRole.ADMIN, UserStatus.ACTIVE, datetime.utcnow()),
            "2": User("2", "user1", "user1@example.com", UserRole.USER, UserStatus.ACTIVE, datetime.utcnow()),
            "3": User("3", "user2", "user2@example.com", UserRole.USER, UserStatus.INACTIVE, datetime.utcnow())
        }
    
    def get_all_users(self, page: int = 1, per_page: int = 10) -> Dict[str, Any]:
        """Get paginated list of users"""
        users_list = list(self.users.values())
        total = len(users_list)
        start = (page - 1) * per_page
        end = start + per_page
        
        return {
            'users': [self._user_to_dict(user) for user in users_list[start:end]],
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        user = self.users.get(user_id)
        return self._user_to_dict(user) if user else None
    
    def create_user(self, username: str, email: str, role: str) -> Dict[str, Any]:
        """Create new user"""
        if not username or not email:
            raise AdminServiceError("Username and email are required")
        
        # Check if username already exists
        for user in self.users.values():
            if user.username == username:
                raise AdminServiceError("Username already exists")
        
        try:
            user_role = UserRole(role)
        except ValueError:
            raise AdminServiceError("Invalid role")
        
        user_id = str(len(self.users) + 1)
        user = User(
            id=user_id,
            username=username,
            email=email,
            role=user_role,
            status=UserStatus.ACTIVE,
            created_at=datetime.utcnow()
        )
        
        self.users[user_id] = user
        return self._user_to_dict(user)
    
    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update user"""
        user = self.users.get(user_id)
        if not user:
            raise AdminServiceError("User not found")
        
        if 'role' in updates:
            try:
                user.role = UserRole(updates['role'])
            except ValueError:
                raise AdminServiceError("Invalid role")
        
        if 'status' in updates:
            try:
                user.status = UserStatus(updates['status'])
            except ValueError:
                raise AdminServiceError("Invalid status")
        
        if 'email' in updates:
            user.email = updates['email']
        
        return self._user_to_dict(user)
    
    def delete_user(self, user_id: str) -> bool:
        """Delete user"""
        if user_id not in self.users:
            raise AdminServiceError("User not found")
        
        del self.users[user_id]
        return True
    
    def get_user_stats(self) -> Dict[str, Any]:
        """Get user statistics"""
        total_users = len(self.users)
        active_users = sum(1 for user in self.users.values() if user.status == UserStatus.ACTIVE)
        admin_users = sum(1 for user in self.users.values() if user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN])
        
        return {
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'admin_users': admin_users,
            'regular_users': total_users - admin_users
        }
    
    def _user_to_dict(self, user: User) -> Dict[str, Any]:
        """Convert user object to dictionary"""
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.value,
            'status': user.status.value,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'login_attempts': user.login_attempts
        }