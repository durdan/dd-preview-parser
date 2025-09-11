from typing import Dict, Optional
from models import User, Role
from password_utils import hash_password, verify_password
from jwt_utils import JWTManager
from exceptions import (
    InvalidCredentialsError, 
    UserAlreadyExistsError,
    InvalidTokenError
)

class AuthService:
    def __init__(self, jwt_manager: JWTManager):
        self.jwt_manager = jwt_manager
        self.users: Dict[str, User] = {}  # In-memory storage
    
    def register(self, username: str, password: str, roles: list = None) -> User:
        """Register new user with password hashing"""
        if not username or not username.strip():
            raise ValueError("Username cannot be empty")
        
        if len(password) < 6:
            raise ValueError("Password must be at least 6 characters")
        
        if username in self.users:
            raise UserAlreadyExistsError(f"User {username} already exists")
        
        # Default role is USER
        user_roles = roles or [Role.USER]
        password_hash = hash_password(password)
        
        user = User(
            username=username.strip(),
            password_hash=password_hash,
            roles=user_roles
        )
        
        self.users[username] = user
        return user
    
    def login(self, username: str, password: str) -> str:
        """Authenticate user and return JWT token"""
        if not username or not password:
            raise InvalidCredentialsError("Username and password required")
        
        user = self.users.get(username)
        if not user or not verify_password(password, user.password_hash):
            raise InvalidCredentialsError("Invalid username or password")
        
        return self.jwt_manager.create_token(user.username, user.roles)
    
    def validate_token(self, token: str) -> Dict[str, any]:
        """Validate JWT token and return user info"""
        return self.jwt_manager.decode_token(token)
    
    def get_user(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.users.get(username)