from typing import List
from models.validation_result import ValidationResult, ValidationError
from services.openai_client import OpenAIClient
from services.diagram_analyzer import DiagramAnalyzer
from services.task_verifier import TaskVerifier

class ValidationService:
    def __init__(self, openai_api_key: str):
        self.openai_client = OpenAIClient(openai_api_key)
        self.diagram_analyzer = DiagramAnalyzer()
        self.task_verifier = TaskVerifier()
    
    def validate_diagram(self, diagram_content: str, diagram_type: str) -> ValidationResult:
        """Validate diagram syntax and structure"""
        if not diagram_content.strip():
            return ValidationResult(
                is_valid=False,
                errors=[ValidationError(1, 1, "Empty diagram content", "error")],
                suggestions=[]
            )
        
        # Basic syntax analysis
        basic_errors = self.diagram_analyzer.analyze_syntax(diagram_content, diagram_type)
        
        # AI-powered validation
        ai_result = self.openai_client.validate_diagram(diagram_content, diagram_type)
        
        # Combine results
        all_errors = basic_errors + ai_result.errors
        
        # Verify AI suggestions
        verification_result = self.task_verifier.verify_validation(
            diagram_content, ai_result, diagram_type
        )
        
        return ValidationResult(
            is_valid=len(all_errors) == 0,
            errors=all_errors,
            suggestions=ai_result.suggestions,
            corrected_diagram=ai_result.corrected_diagram,
            confidence_score=ai_result.confidence_score,
            verification_passed=verification_result.passed
        )
    
    def analyze_diagram(self, diagram_content: str, diagram_type: str) -> ValidationResult:
        """Analyze diagram for errors and structural issues"""
        structural_analysis = self.diagram_analyzer.analyze_structure(diagram_content, diagram_type)
        ai_analysis = self.openai_client.analyze_diagram(diagram_content, diagram_type)
        
        verification_result = self.task_verifier.verify_analysis(
            diagram_content, ai_analysis, diagram_type
        )
        
        return ValidationResult(
            is_valid=ai_analysis.is_valid,
            errors=structural_analysis + ai_analysis.errors,
            suggestions=ai_analysis.suggestions,
            confidence_score=ai_analysis.confidence_score,
            verification_passed=verification_result.passed
        )
    
    def suggest_improvements(self, diagram_content: str, diagram_type: str) -> ValidationResult:
        """Get AI-powered improvement suggestions"""
        ai_suggestions = self.openai_client.suggest_improvements(diagram_content, diagram_type)
        
        verification_result = self.task_verifier.verify_suggestions(
            diagram_content, ai_suggestions, diagram_type
        )
        
        return ValidationResult(
            is_valid=True,
            errors=[],
            suggestions=ai_suggestions.suggestions,
            corrected_diagram=ai_suggestions.corrected_diagram,
            confidence_score=ai_suggestions.confidence_score,
            verification_passed=verification_result.passed
        )