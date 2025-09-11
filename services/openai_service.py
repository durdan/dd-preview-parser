import json
import time
import logging
from typing import Dict, Any, Optional, List
import openai
from openai import OpenAI

from config.ai_config import OpenAIConfig
from services.rate_limiter import RateLimiter
from services.errors import APIError, RateLimitError, TimeoutError, ValidationError

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self, config: OpenAIConfig):
        self.config = config
        self.config.validate()
        
        self.client = OpenAI(api_key=config.api_key)
        self.rate_limiter = RateLimiter(
            config.rate_limit_requests_per_minute,
            config.rate_limit_tokens_per_minute
        )

    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimation (4 chars ≈ 1 token)"""
        return len(text) // 4 + 10  # Add buffer

    def _sanitize_input(self, content: str) -> str:
        """Sanitize input to prevent injection attacks"""
        if not isinstance(content, str):
            raise ValidationError("Content must be a string")
        
        if len(content) > 50000:  # Reasonable limit
            raise ValidationError("Content too long (max 50,000 characters)")
        
        # Remove potential harmful patterns
        sanitized = content.replace('\x00', '').strip()
        return sanitized

    def _validate_response(self, response: Any) -> str:
        """Validate and extract content from OpenAI response"""
        try:
            if not response.choices:
                raise APIError(500, "No response choices returned")
            
            content = response.choices[0].message.content
            if not content:
                raise APIError(500, "Empty response content")
            
            return content.strip()
        except AttributeError as e:
            raise APIError(500, f"Invalid response format: {e}")

    def _make_request_with_retry(self, messages: List[Dict[str, str]], 
                                estimated_tokens: int) -> str:
        """Make API request with retry logic"""
        
        # Check rate limits
        can_proceed, wait_time = self.rate_limiter.can_proceed(estimated_tokens)
        if not can_proceed:
            raise RateLimitError(wait_time)

        last_exception = None
        
        for attempt in range(self.config.max_retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.config.model,
                    messages=messages,
                    max_tokens=self.config.max_tokens,
                    temperature=self.config.temperature,
                    timeout=self.config.timeout
                )
                
                return self._validate_response(response)
                
            except openai.RateLimitError as e:
                logger.warning(f"Rate limit hit on attempt {attempt + 1}: {e}")
                if attempt < self.config.max_retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                last_exception = RateLimitError(60)
                
            except openai.APITimeoutError as e:
                logger.warning(f"Timeout on attempt {attempt + 1}: {e}")
                if attempt < self.config.max_retries - 1:
                    time.sleep(1)
                last_exception = TimeoutError(f"Request timed out after {self.config.timeout}s")
                
            except openai.APIError as e:
                logger.error(f"API error on attempt {attempt + 1}: {e}")
                last_exception = APIError(getattr(e, 'status_code', 500), str(e))
                if e.status_code and e.status_code < 500:  # Don't retry client errors
                    break
                if attempt < self.config.max_retries - 1:
                    time.sleep(2 ** attempt)
                    
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
                last_exception = APIError(500, f"Unexpected error: {e}")
                break

        raise last_exception or APIError(500, "All retry attempts failed")

    def generate_completion(self, prompt: str, system_message: Optional[str] = None) -> str:
        """Generate completion for given prompt"""
        prompt = self._sanitize_input(prompt)
        
        messages = []
        if system_message:
            system_message = self._sanitize_input(system_message)
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        estimated_tokens = sum(self._estimate_tokens(msg["content"]) for msg in messages)
        estimated_tokens += self.config.max_tokens  # Add response tokens
        
        return self._make_request_with_retry(messages, estimated_tokens)