import os
from dataclasses import dataclass
from typing import List

@dataclass
class AdminConfig:
    secret_key: str
    admin_roles: List[str]
    session_timeout: int
    max_login_attempts: int
    monitoring_interval: int
    
    @classmethod
    def from_env(cls):
        return cls(
            secret_key=os.getenv('ADMIN_SECRET_KEY', 'dev-secret-key'),
            admin_roles=['admin', 'super_admin'],
            session_timeout=int(os.getenv('ADMIN_SESSION_TIMEOUT', '3600')),
            max_login_attempts=int(os.getenv('MAX_LOGIN_ATTEMPTS', '5')),
            monitoring_interval=int(os.getenv('MONITORING_INTERVAL', '60'))
        )

admin_config = AdminConfig.from_env()