from enum import Enum
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

class CategoryType(Enum):
    FLOWCHART = "flowchart"
    UML = "uml"
    NETWORK = "network"
    ORGANIZATIONAL = "organizational"
    PROCESS = "process"
    DATABASE = "database"
    ARCHITECTURE = "architecture"
    OTHER = "other"

class ModerationStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"

@dataclass
class DiagramCategory:
    id: int
    name: str
    type: CategoryType
    description: Optional[str] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

@dataclass
class ModerationAction:
    id: int
    diagram_id: int
    admin_id: int
    action: ModerationStatus
    reason: Optional[str] = None
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()

@dataclass
class SearchCriteria:
    query: Optional[str] = None
    category: Optional[CategoryType] = None
    status: Optional[ModerationStatus] = None
    user_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    limit: int = 50
    offset: int = 0