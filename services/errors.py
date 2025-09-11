class AIServiceError(Exception):
    """Base exception for AI service errors"""
    pass

class RateLimitError(AIServiceError):
    """Raised when rate limit is exceeded"""
    def __init__(self, wait_time: float):
        self.wait_time = wait_time
        super().__init__(f"Rate limit exceeded. Wait {wait_time:.1f} seconds")

class APIError(AIServiceError):
    """Raised when OpenAI API returns an error"""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        super().__init__(f"API Error {status_code}: {message}")

class ValidationError(AIServiceError):
    """Raised when input validation fails"""
    pass

class TimeoutError(AIServiceError):
    """Raised when API request times out"""
    pass