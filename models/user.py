from dataclasses import dataclass
from typing import Optional
import re
from services.password_service import PasswordService

@dataclass
class User:
    username: str
    email: str
    password_hash: str
    id: Optional[int] = None
    
    @classmethod
    def create(cls, username: str, email: str, password: str) -> 'User':
        """Create a new user with hashed password."""
        cls._validate_username(username)
        cls._validate_email(email)
        cls._validate_password(password)
        
        password_hash = PasswordService.hash_password(password)
        return cls(username=username, email=email, password_hash=password_hash)
    
    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        return PasswordService.verify_password(password, self.password_hash)
    
    def change_password(self, old_password: str, new_password: str) -> None:
        """Change user password after verifying old password."""
        if not self.verify_password(old_password):
            raise ValueError("Current password is incorrect")
        
        self._validate_password(new_password)
        self.password_hash = PasswordService.hash_password(new_password)
    
    @staticmethod
    def _validate_username(username: str) -> None:
        if not username or len(username.strip()) < 3:
            raise ValueError("Username must be at least 3 characters long")
        if len(username) > 50:
            raise ValueError("Username must be less than 50 characters")
    
    @staticmethod
    def _validate_email(email: str) -> None:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not email or not re.match(email_pattern, email):
            raise ValueError("Invalid email format")
    
    @staticmethod
    def _validate_password(password: str) -> None:
        if not password:
            raise ValueError("Password cannot be empty")
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(password) > 128:
            raise ValueError("Password must be less than 128 characters")
        if not re.search(r'[A-Z]', password):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', password):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', password):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValueError("Password must contain at least one special character")