from models.user import User, UserRole
from typing import Optional

class AuthorizationError(Exception):
    pass

class AuthorizationService:
    @staticmethod
    def can_manage_users(admin: User) -> bool:
        """Check if user can perform admin operations."""
        return admin.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN] and admin.is_active()

    @staticmethod
    def can_delete_users(admin: User) -> bool:
        """Check if user can delete other users."""
        return admin.role == UserRole.SUPER_ADMIN and admin.is_active()

    @staticmethod
    def can_modify_user(admin: User, target_user: User) -> bool:
        """Check if admin can modify specific user."""
        if not AuthorizationService.can_manage_users(admin):
            return False
        
        # Super admins can modify anyone except other super admins
        if admin.role == UserRole.SUPER_ADMIN:
            return target_user.role != UserRole.SUPER_ADMIN or admin.id == target_user.id
        
        # Regular admins can only modify regular users
        if admin.role == UserRole.ADMIN:
            return target_user.role == UserRole.USER
        
        return False

    @staticmethod
    def can_assign_role(admin: User, target_role: UserRole) -> bool:
        """Check if admin can assign specific role."""
        if admin.role == UserRole.SUPER_ADMIN:
            return target_role in [UserRole.USER, UserRole.ADMIN]
        
        if admin.role == UserRole.ADMIN:
            return target_role == UserRole.USER
        
        return False

    @staticmethod
    def require_permission(admin: User, permission_check, error_msg: str):
        """Require specific permission or raise error."""
        if not permission_check:
            raise AuthorizationError(error_msg)