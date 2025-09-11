import json
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

from services.openai_service import OpenAIService
from services.errors import ValidationError, AIServiceError

logger = logging.getLogger(__name__)

@dataclass
class ValidationResult:
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    score: float  # 0-100

@dataclass
class CorrectionSuggestion:
    issue: str
    suggestion: str
    priority: str  # "high", "medium", "low"
    code_example: Optional[str] = None

@dataclass
class EnhancementSuggestion:
    category: str  # "performance", "readability", "maintainability", etc.
    description: str
    benefit: str
    implementation: str

class DiagramAIService:
    def __init__(self, openai_service: OpenAIService):
        self.openai_service = openai_service

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON response with error handling"""
        try:
            # Try to extract JSON from response if it's wrapped in text
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                json_str = response[start:end]
            else:
                json_str = response
            
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response was: {response}")
            raise AIServiceError(f"Invalid JSON response from AI: {e}")

    def validate_diagram(self, diagram_code: str, diagram_type: str = "mermaid") -> ValidationResult:
        """Validate diagram syntax and structure"""
        if not diagram_code.strip():
            raise ValidationError("Diagram code cannot be empty")

        system_message = f"""You are an expert in {diagram_type} diagrams. 
        Analyze the provided diagram code for syntax errors, structural issues, and best practices.
        
        Respond with valid JSON in this exact format:
        {{
            "is_valid": boolean,
            "errors": ["list of syntax/structural errors"],
            "warnings": ["list of warnings and suggestions"],
            "score": number between 0-100
        }}"""

        prompt = f"""Validate this {diagram_type} diagram: