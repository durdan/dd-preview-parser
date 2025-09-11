from dataclasses import dataclass
from typing import List
from enum import Enum

class Role(Enum):
    USER = "user"
    MODERATOR = "moderator"
    ADMIN = "admin"

@dataclass
class User:
    username: str
    password_hash: str
    roles: List[Role]
    
    def has_role(self, role: Role) -> bool:
        return role in self.roles
    
    def has_any_role(self, roles: List[Role]) -> bool:
        return any(role in self.roles for role in roles)