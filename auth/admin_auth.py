import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from typing import Optional, Dict, Any
from flask import request, jsonify, session

from models.admin_models import User, AdminSession, UserRole
from config.admin_config import admin_config

class AdminAuthError(Exception):
    pass

class AdminAuth:
    def __init__(self):
        self.sessions: Dict[str, AdminSession] = {}
        self.failed_attempts: Dict[str, int] = {}
    
    def authenticate_admin(self, username: str, password: str) -> Optional[User]:
        """Authenticate admin user with username/password"""
        if self._is_locked_out(username):
            raise AdminAuthError("Account temporarily locked due to failed attempts")
        
        # In real implementation, this would query database
        user = self._get_user_by_username(username)
        if not user or not self._verify_password(password, user):
            self._record_failed_attempt(username)
            raise AdminAuthError("Invalid credentials")
        
        if user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise AdminAuthError("Insufficient privileges")
        
        self._clear_failed_attempts(username)
        return user
    
    def create_session(self, user: User) -> str:
        """Create admin session and return token"""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(seconds=admin_config.session_timeout)
        
        admin_session = AdminSession(
            user_id=user.id,
            session_token=token,
            created_at=datetime.utcnow(),
            expires_at=expires_at
        )
        
        self.sessions[token] = admin_session
        return token
    
    def validate_session(self, token: str) -> Optional[User]:
        """Validate session token and return user"""
        admin_session = self.sessions.get(token)
        if not admin_session or not admin_session.is_active:
            return None
        
        if datetime.utcnow() > admin_session.expires_at:
            self.invalidate_session(token)
            return None
        
        return self._get_user_by_id(admin_session.user_id)
    
    def invalidate_session(self, token: str):
        """Invalidate admin session"""
        if token in self.sessions:
            self.sessions[token].is_active = False
    
    def _is_locked_out(self, username: str) -> bool:
        return self.failed_attempts.get(username, 0) >= admin_config.max_login_attempts
    
    def _record_failed_attempt(self, username: str):
        self.failed_attempts[username] = self.failed_attempts.get(username, 0) + 1
    
    def _clear_failed_attempts(self, username: str):
        self.failed_attempts.pop(username, None)
    
    def _get_user_by_username(self, username: str) -> Optional[User]:
        # Mock implementation - replace with database query
        if username == "admin":
            return User(
                id="1",
                username="admin",
                email="admin@example.com",
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                created_at=datetime.utcnow()
            )
        return None
    
    def _get_user_by_id(self, user_id: str) -> Optional[User]:
        # Mock implementation - replace with database query
        if user_id == "1":
            return User(
                id="1",
                username="admin",
                email="admin@example.com",
                role=UserRole.ADMIN,
                status=UserStatus.ACTIVE,
                created_at=datetime.utcnow()
            )
        return None
    
    def _verify_password(self, password: str, user: User) -> bool:
        # Mock implementation - replace with proper password hashing
        return password == "admin123"

# Decorator for admin authentication
def require_admin_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
        
        auth = AdminAuth()
        user = auth.validate_session(token)
        if not user:
            return jsonify({'error': 'Invalid or expired session'}), 401
        
        request.admin_user = user
        return f(*args, **kwargs)
    return decorated_function

def require_super_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'admin_user') or request.admin_user.role != UserRole.SUPER_ADMIN:
            return jsonify({'error': 'Super admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated_function