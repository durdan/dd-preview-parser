from datetime import datetime
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from enum import Enum

class UserRole(Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

@dataclass
class User:
    id: str
    username: str
    email: str
    role: UserRole
    status: UserStatus
    created_at: datetime
    last_login: Optional[datetime] = None
    login_attempts: int = 0

@dataclass
class SystemMetrics:
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    active_users: int
    total_diagrams: int

@dataclass
class DiagramAnalytics:
    total_diagrams: int
    diagrams_created_today: int
    most_popular_types: List[Dict[str, Any]]
    user_activity: List[Dict[str, Any]]
    usage_trends: List[Dict[str, Any]]

@dataclass
class AdminSession:
    user_id: str
    session_token: str
    created_at: datetime
    expires_at: datetime
    is_active: bool = True