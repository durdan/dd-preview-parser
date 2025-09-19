from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class ValidationLevel(Enum):
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

@dataclass
class ValidationIssue:
    level: ValidationLevel
    message: str
    file_path: Optional[str] = None
    details: Optional[str] = None

@dataclass
class ValidationResult:
    is_valid: bool
    issues: List[ValidationIssue]
    
    def add_issue(self, level: ValidationLevel, message: str, 
                  file_path: str = None, details: str = None):
        self.issues.append(ValidationIssue(level, message, file_path, details))
        if level == ValidationLevel.ERROR:
            self.is_valid = False
    
    def has_errors(self) -> bool:
        return any(issue.level == ValidationLevel.ERROR for issue in self.issues)
    
    def get_summary(self) -> str:
        errors = sum(1 for issue in self.issues if issue.level == ValidationLevel.ERROR)
        warnings = sum(1 for issue in self.issues if issue.level == ValidationLevel.WARNING)
        return f"Validation {'PASSED' if self.is_valid else 'FAILED'}: {errors} errors, {warnings} warnings"

class ValidationError(Exception):
    def __init__(self, message: str, validation_result: ValidationResult = None):
        super().__init__(message)
        self.validation_result = validation_result