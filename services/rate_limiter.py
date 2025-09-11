import time
import threading
from typing import Dict, Tuple

class TokenBucket:
    def __init__(self, capacity: int, refill_rate: int):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def consume(self, tokens: int = 1) -> bool:
        with self.lock:
            now = time.time()
            # Add tokens based on time passed
            tokens_to_add = (now - self.last_refill) * (self.refill_rate / 60.0)
            self.tokens = min(self.capacity, self.tokens + tokens_to_add)
            self.last_refill = now

            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

    def wait_time(self, tokens: int = 1) -> float:
        with self.lock:
            if self.tokens >= tokens:
                return 0.0
            needed_tokens = tokens - self.tokens
            return needed_tokens / (self.refill_rate / 60.0)

class RateLimiter:
    def __init__(self, requests_per_minute: int, tokens_per_minute: int):
        self.request_bucket = TokenBucket(requests_per_minute, requests_per_minute)
        self.token_bucket = TokenBucket(tokens_per_minute, tokens_per_minute)

    def can_proceed(self, estimated_tokens: int = 100) -> Tuple[bool, float]:
        if not self.request_bucket.consume(1):
            return False, self.request_bucket.wait_time(1)
        
        if not self.token_bucket.consume(estimated_tokens):
            return False, self.token_bucket.wait_time(estimated_tokens)
        
        return True, 0.0

    def wait_if_needed(self, estimated_tokens: int = 100) -> None:
        can_proceed, wait_time = self.can_proceed(estimated_tokens)
        if not can_proceed and wait_time > 0:
            time.sleep(min(wait_time, 60))  # Cap wait time at 1 minute