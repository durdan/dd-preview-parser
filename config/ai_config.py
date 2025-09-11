import os
from dataclasses import dataclass
from typing import Optional

@dataclass
class OpenAIConfig:
    api_key: str
    model: str = "gpt-4"
    max_tokens: int = 2000
    temperature: float = 0.3
    timeout: int = 30
    max_retries: int = 3
    rate_limit_requests_per_minute: int = 60
    rate_limit_tokens_per_minute: int = 90000

    @classmethod
    def from_env(cls) -> 'OpenAIConfig':
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        return cls(
            api_key=api_key,
            model=os.getenv('OPENAI_MODEL', 'gpt-4'),
            max_tokens=int(os.getenv('OPENAI_MAX_TOKENS', '2000')),
            temperature=float(os.getenv('OPENAI_TEMPERATURE', '0.3')),
            timeout=int(os.getenv('OPENAI_TIMEOUT', '30')),
            max_retries=int(os.getenv('OPENAI_MAX_RETRIES', '3')),
            rate_limit_requests_per_minute=int(os.getenv('OPENAI_RATE_LIMIT_RPM', '60')),
            rate_limit_tokens_per_minute=int(os.getenv('OPENAI_RATE_LIMIT_TPM', '90000'))
        )

    def validate(self) -> None:
        if not self.api_key or len(self.api_key) < 10:
            raise ValueError("Invalid API key")
        if self.max_tokens <= 0 or self.max_tokens > 4000:
            raise ValueError("max_tokens must be between 1 and 4000")
        if not 0 <= self.temperature <= 2:
            raise ValueError("temperature must be between 0 and 2")