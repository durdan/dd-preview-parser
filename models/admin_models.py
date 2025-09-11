from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class UserRole(str, Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"
    PENDING = "pending"


class ContentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"


class AdminUser(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None


class UserManagementRequest(BaseModel):
    user_id: int
    action: str = Field(..., regex="^(suspend|ban|activate|delete|change_role)$")
    reason: Optional[str] = None
    role: Optional[UserRole] = None
    duration_days: Optional[int] = None


class SystemMetrics(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    active_users: int
    total_requests: int
    error_rate: float
    response_time_avg: float


class ContentItem(BaseModel):
    id: int
    type: str  # post, comment, message
    content: str
    author_id: int
    author_username: str
    status: ContentStatus
    flags_count: int
    created_at: datetime
    flagged_at: Optional[datetime] = None
    moderated_at: Optional[datetime] = None
    moderator_id: Optional[int] = None


class ModerationAction(BaseModel):
    content_id: int
    action: str = Field(..., regex="^(approve|reject|flag|delete)$")
    reason: Optional[str] = None
    notify_user: bool = True


class AuditLog(BaseModel):
    id: int
    admin_id: int
    admin_username: str
    action: str
    target_type: str  # user, content, system
    target_id: Optional[int] = None
    details: Dict[str, Any]
    timestamp: datetime
    ip_address: str


class AdminStats(BaseModel):
    total_users: int
    active_users: int
    suspended_users: int
    banned_users: int
    pending_content: int
    flagged_content: int
    total_content: int
    system_health: str