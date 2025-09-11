from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from models.admin_models import UserRole, AdminUser

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Mock admin database
ADMIN_USERS = {
    "admin": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": pwd_context.hash("admin123"),
        "role": UserRole.SUPER_ADMIN,
        "is_active": True,
        "created_at": datetime.now()
    },
    "moderator": {
        "id": 2,
        "username": "moderator",
        "email": "mod@example.com",
        "hashed_password": pwd_context.hash("mod123"),
        "role": UserRole.MODERATOR,
        "is_active": True,
        "created_at": datetime.now()
    }
}


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_admin(username: str, password: str) -> Optional[Dict[str, Any]]:
    admin = ADMIN_USERS.get(username)
    if not admin or not verify_password(password, admin["hashed_password"]):
        return None
    return admin


def create_access_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AdminUser:
    payload = verify_token(credentials.credentials)
    username = payload.get("sub")
    admin_data = ADMIN_USERS.get(username)
    
    if not admin_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found"
        )
    
    return AdminUser(
        id=admin_data["id"],
        username=admin_data["username"],
        email=admin_data["email"],
        role=admin_data["role"],
        is_active=admin_data["is_active"],
        created_at=admin_data["created_at"]
    )


def require_role(required_roles: list[UserRole]):
    def role_checker(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
        if current_admin.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_admin
    return role_checker


def require_super_admin(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    if current_admin.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super admin access required"
        )
    return current_admin