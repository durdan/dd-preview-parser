import bcrypt
from typing import Union

class PasswordService:
    # Industry standard: 12 rounds provides good security vs performance balance
    # Each additional round doubles the time, 12 rounds ≈ 250ms on modern hardware
    SALT_ROUNDS = 12
    
    @classmethod
    def hash_password(cls, password: str) -> str:
        """Hash a password using bcrypt with secure salt rounds."""
        if not isinstance(password, str):
            raise TypeError("Password must be a string")
        
        try:
            # Convert string to bytes, generate salt, and hash
            password_bytes = password.encode('utf-8')
            salt = bcrypt.gensalt(rounds=cls.SALT_ROUNDS)
            hashed = bcrypt.hashpw(password_bytes, salt)
            return hashed.decode('utf-8')
        except Exception as e:
            raise RuntimeError(f"Failed to hash password: {str(e)}")
    
    @classmethod
    def verify_password(cls, password: str, password_hash: str) -> bool:
        """Verify a password against its hash."""
        if not isinstance(password, str) or not isinstance(password_hash, str):
            raise TypeError("Password and hash must be strings")
        
        try:
            password_bytes = password.encode('utf-8')
            hash_bytes = password_hash.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hash_bytes)
        except Exception:
            # Don't leak information about why verification failed
            return False
    
    @classmethod
    def needs_rehash(cls, password_hash: str) -> bool:
        """Check if password hash needs to be updated (e.g., salt rounds changed)."""
        try:
            hash_bytes = password_hash.encode('utf-8')
            # Extract current rounds from hash
            current_rounds = bcrypt.gensalt(rounds=cls.SALT_ROUNDS)
            return not password_hash.startswith(f"$2b${cls.SALT_ROUNDS:02d}$")
        except Exception:
            return True  # If we can't determine, assume it needs rehashing