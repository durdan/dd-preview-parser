import time
from threading import Lock
from typing import Dict

class RateLimiter:
    """Token bucket rate limiter for API requests"""
    
    def __init__(self, requests_per_minute: int):
        self.requests_per_minute = requests_per_minute
        self.tokens = requests_per_minute
        self.last_refill = time.time()
        self.lock = Lock()
    
    def can_proceed(self) -> bool:
        """Check if request can proceed without blocking"""
        with self.lock:
            self._refill_tokens()
            return self.tokens > 0
    
    def acquire(self) -> bool:
        """Acquire a token for making a request"""
        with self.lock:
            self._refill_tokens()
            if self.tokens > 0:
                self.tokens -= 1
                return True
            return False
    
    def _refill_tokens(self):
        """Refill tokens based on elapsed time"""
        now = time.time()
        elapsed = now - self.last_refill
        
        # Add tokens based on elapsed time
        tokens_to_add = elapsed * (self.requests_per_minute / 60.0)
        self.tokens = min(self.requests_per_minute, self.tokens + tokens_to_add)
        self.last_refill = now