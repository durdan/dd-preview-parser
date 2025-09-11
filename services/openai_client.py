import openai
from typing import List
from models.validation_result import ValidationResult, ValidationError

class OpenAIClient:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("OpenAI API key is required")
        openai.api_key = api_key
    
    def validate_diagram(self, diagram_content: str, diagram_type: str) -> ValidationResult:
        """Use OpenAI to validate diagram syntax"""
        prompt = self._build_validation_prompt(diagram_content, diagram_type)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1
            )
            
            return self._parse_validation_response(response.choices[0].message.content)
        
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                errors=[ValidationError(1, 1, f"AI validation failed: {str(e)}", "error")],
                suggestions=[],
                confidence_score=0.0
            )
    
    def analyze_diagram(self, diagram_content: str, diagram_type: str) -> ValidationResult:
        """Use OpenAI to analyze diagram structure"""
        prompt = self._build_analysis_prompt(diagram_content, diagram_type)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            
            return self._parse_analysis_response(response.choices[0].message.content)
        
        except Exception as e:
            return ValidationResult(
                is_valid=False,
                errors=[ValidationError(1, 1, f"AI analysis failed: {str(e)}", "error")],
                suggestions=[],
                confidence_score=0.0
            )
    
    def suggest_improvements(self, diagram_content: str, diagram_type: str) -> ValidationResult:
        """Use OpenAI to suggest diagram improvements"""
        prompt = self._build_improvement_prompt(diagram_content, diagram_type)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            return self._parse_improvement_response(response.choices[0].message.content)
        
        except Exception as e:
            return ValidationResult(
                is_valid=True,
                errors=[],
                suggestions=[f"AI improvement suggestion failed: {str(e)}"],
                confidence_score=0.0
            )
    
    def _build_validation_prompt(self, diagram_content: str, diagram_type: str) -> str:
        return f"""
        Validate this {diagram_type} diagram for syntax errors:

        {diagram_content}

        Respond in JSON format:
        {{
            "is_valid": boolean,
            "errors": [
                {{"line": number, "column": number, "message": "string", "severity": "error|warning|info"}}
            ],
            "suggestions": ["string"],
            "confidence_score": number (0-1)
        }}
        """
    
    def _build_analysis_prompt(self, diagram_content: str, diagram_type: str) -> str:
        return f"""
        Analyze this {diagram_type} diagram for structural issues and best practices:

        {diagram_content}

        Respond in JSON format with structural analysis, potential issues, and recommendations.
        """
    
    def _build_improvement_prompt(self, diagram_content: str, diagram_type: str) -> str:
        return f"""
        Suggest improvements for this {diagram_type} diagram:

        {diagram_content}

        Provide specific suggestions and an improved version if possible.
        Respond in JSON format.
        """
    
    def _parse_validation_response(self, response: str) -> ValidationResult:
        """Parse OpenAI validation response"""
        try:
            import json
            data = json.loads(response)
            
            errors = [
                ValidationError(
                    line=err.get('line', 1),
                    column=err.get('column', 1),
                    message=err.get('message', ''),
                    severity=err.get('severity', 'error')
                ) for err in data.get('errors', [])
            ]
            
            return ValidationResult(
                is_valid=data.get('is_valid', False),
                errors=errors,
                suggestions=data.get('suggestions', []),
                confidence_score=data.get('confidence_score', 0.0)
            )
        
        except json.JSONDecodeError:
            return ValidationResult(
                is_valid=False,
                errors=[ValidationError(1, 1, "Failed to parse AI response", "error")],
                suggestions=[],
                confidence_score=0.0
            )
    
    def _parse_analysis_response(self, response: str) -> ValidationResult:
        """Parse OpenAI analysis response"""
        return self._parse_validation_response(response)
    
    def _parse_improvement_response(self, response: str) -> ValidationResult:
        """Parse OpenAI improvement response"""
        try:
            import json
            data = json.loads(response)
            
            return ValidationResult(
                is_valid=True,
                errors=[],
                suggestions=data.get('suggestions', []),
                corrected_diagram=data.get('corrected_diagram'),
                confidence_score=data.get('confidence_score', 0.0)
            )
        
        except json.JSONDecodeError:
            return ValidationResult(
                is_valid=True,
                errors=[],
                suggestions=["Failed to parse improvement suggestions"],
                confidence_score=0.0
            )