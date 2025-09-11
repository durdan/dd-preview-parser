import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class OpenAIConfig:
    api_key: str
    model: str = "gpt-4"
    max_tokens: int = 1000
    temperature: float = 0.7
    requests_per_minute: int = 60
    
    @classmethod
    def from_env(cls) -> 'OpenAIConfig':
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        return cls(
            api_key=api_key,
            model=os.getenv('OPENAI_MODEL', 'gpt-4'),
            max_tokens=int(os.getenv('OPENAI_MAX_TOKENS', '1000')),
            temperature=float(os.getenv('OPENAI_TEMPERATURE', '0.7')),
            requests_per_minute=int(os.getenv('OPENAI_REQUESTS_PER_MINUTE', '60'))
        )