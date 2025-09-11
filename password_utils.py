import bcrypt

def hash_password(password: str) -> str:
    """Hash password using bcrypt with random salt"""
    if not password or len(password.strip()) == 0:
        raise ValueError("Password cannot be empty")
    
    salt = bcrypt.gensalt()
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    if not password or not password_hash:
        return False
    
    password_bytes = password.encode('utf-8')
    hash_bytes = password_hash.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)