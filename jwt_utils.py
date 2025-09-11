import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from exceptions import TokenExpiredError, InvalidTokenError

class JWTManager:
    def __init__(self, secret_key: str, algorithm: str = 'HS256'):
        if not secret_key:
            raise ValueError("Secret key cannot be empty")
        self.secret_key = secret_key
        self.algorithm = algorithm
    
    def create_token(self, username: str, roles: list, expires_in_hours: int = 1) -> str:
        """Create JWT token with user info and expiration"""
        payload = {
            'username': username,
            'roles': [role.value if hasattr(role, 'value') else str(role) for role in roles],
            'exp': datetime.utcnow() + timedelta(hours=expires_in_hours),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def decode_token(self, token: str) -> Dict[str, Any]:
        """Decode and validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise TokenExpiredError("Token has expired")
        except jwt.InvalidTokenError:
            raise InvalidTokenError("Invalid token")
    
    def extract_username(self, token: str) -> str:
        """Extract username from token"""
        payload = self.decode_token(token)
        return payload.get('username')
    
    def extract_roles(self, token: str) -> list:
        """Extract roles from token"""
        payload = self.decode_token(token)
        return payload.get('roles', [])