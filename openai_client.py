import openai
from typing import Dict, Any, Optional
import logging
from .config import OpenAIConfig
from .security import SecurityValidator
from .rate_limiter import RateLimiter

logger = logging.getLogger(__name__)

class OpenAIClient:
    """Secure OpenAI API client with rate limiting"""
    
    def __init__(self, config: OpenAIConfig):
        if not SecurityValidator.validate_api_key(config.api_key):
            raise ValueError("Invalid OpenAI API key format")
        
        self.config = config
        self.rate_limiter = RateLimiter(config.requests_per_minute)
        openai.api_key = config.api_key
        
        logger.info(f"OpenAI client initialized with key: {SecurityValidator.mask_api_key(config.api_key)}")
    
    def chat_completion(self, messages: list, **kwargs) -> Optional[str]:
        """Make a chat completion request with rate limiting"""
        if not self.rate_limiter.acquire():
            raise Exception("Rate limit exceeded. Please try again later.")
        
        try:
            response = openai.ChatCompletion.create(
                model=self.config.model,
                messages=messages,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                **kwargs
            )
            
            return response.choices[0].message.content.strip()
        
        except openai.error.RateLimitError:
            logger.warning("OpenAI rate limit hit")
            raise Exception("OpenAI rate limit exceeded")
        
        except openai.error.AuthenticationError:
            logger.error("OpenAI authentication failed")
            raise Exception("Invalid OpenAI API key")
        
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise Exception(f"OpenAI API request failed: {str(e)}")