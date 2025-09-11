from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class ValidationError:
    line: int
    column: int
    message: str
    severity: str  # 'error', 'warning', 'info'
    suggestion: Optional[str] = None

@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[ValidationError]
    suggestions: List[str]
    corrected_diagram: Optional[str] = None
    confidence_score: float = 0.0
    verification_passed: bool = False
    
    def to_dict(self) -> Dict:
        return {
            'is_valid': self.is_valid,
            'errors': [
                {
                    'line': err.line,
                    'column': err.column,
                    'message': err.message,
                    'severity': err.severity,
                    'suggestion': err.suggestion
                } for err in self.errors
            ],
            'suggestions': self.suggestions,
            'corrected_diagram': self.corrected_diagram,
            'confidence_score': self.confidence_score,
            'verification_passed': self.verification_passed
        }