from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class ErrorType(Enum):
    SYNTAX_ERROR = "syntax_error"
    MISSING_DELIMITER = "missing_delimiter"
    INVALID_NODE = "invalid_node"
    MALFORMED_ARROW = "malformed_arrow"
    UNKNOWN = "unknown"

@dataclass
class DiagramError:
    error_type: ErrorType
    line_number: int
    message: str
    context: str
    suggested_fix: Optional[str] = None
    
    def get_pattern_key(self) -> str:
        """Generate a key for caching similar error patterns"""
        return f"{self.error_type.value}:{self.message[:50]}"