import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class Config:
    openai_api_key: str
    max_retries: int = 3
    cache_size: int = 100
    batch_size: int = 5
    
    @classmethod
    def from_env(cls) -> 'Config':
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        return cls(openai_api_key=api_key)