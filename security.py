import re
from typing import Optional

class SecurityValidator:
    """Validates API keys and ensures secure handling"""
    
    @staticmethod
    def validate_api_key(api_key: str) -> bool:
        """Validate OpenAI API key format"""
        if not api_key:
            return False
        
        # OpenAI API keys start with 'sk-' and are typically 51 characters
        pattern = r'^sk-[a-zA-Z0-9]{48}$'
        return bool(re.match(pattern, api_key))
    
    @staticmethod
    def mask_api_key(api_key: str) -> str:
        """Mask API key for logging purposes"""
        if len(api_key) < 8:
            return "***"
        return f"{api_key[:4]}...{api_key[-4:]}"
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 10000) -> str:
        """Sanitize input text to prevent injection attacks"""
        if not text:
            raise ValueError("Input text cannot be empty")
        
        if len(text) > max_length:
            raise ValueError(f"Input text exceeds maximum length of {max_length}")
        
        # Remove potential harmful characters
        sanitized = re.sub(r'[^\w\s\-.,;:()\[\]{}/"\'=<>+*&%$#@!?]', '', text)
        return sanitized.strip()