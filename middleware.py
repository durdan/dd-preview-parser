from functools import wraps
from flask import request, jsonify, g
from typing import List, Callable
from models import Role
from auth_service import AuthService
from exceptions import (
    InvalidTokenError, 
    TokenExpiredError, 
    InsufficientPermissionsError
)

def create_auth_middleware(auth_service: AuthService):
    """Factory function to create authentication middleware"""
    
    def require_auth(f: Callable) -> Callable:
        """Decorator to require valid JWT token"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = extract_token_from_request()
            if not token:
                return jsonify({'error': 'Token required'}), 401
            
            try:
                payload = auth_service.validate_token(token)
                g.current_user = payload['username']
                g.current_roles = payload['roles']
                return f(*args, **kwargs)
            except (InvalidTokenError, TokenExpiredError) as e:
                return jsonify({'error': str(e)}), 401
        
        return decorated_function
    
    def require_roles(required_roles: List[Role]):
        """Decorator to require specific roles"""
        def decorator(f: Callable) -> Callable:
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if not hasattr(g, 'current_roles'):
                    return jsonify({'error': 'Authentication required'}), 401
                
                user_roles = [Role(role) for role in g.current_roles]
                has_required_role = any(role in user_roles for role in required_roles)
                
                if not has_required_role:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                
                return f(*args, **kwargs)
            
            return decorated_function
        return decorator
    
    return require_auth, require_roles

def extract_token_from_request() -> str:
    """Extract JWT token from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None