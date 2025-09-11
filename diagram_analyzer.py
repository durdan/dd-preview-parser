import json
from typing import List
from .models import DiagramAnalysisResult, DiagramType, DiagramError, Enhancement
from .openai_client import OpenAIClient
from .security import SecurityValidator

class DiagramAnalyzer:
    """Main service for AI-powered diagram analysis"""
    
    def __init__(self, openai_client: OpenAIClient):
        self.client = openai_client
    
    def analyze_diagram(self, diagram_description: str) -> DiagramAnalysisResult:
        """Analyze a diagram and return comprehensive results"""
        # Sanitize input
        clean_description = SecurityValidator.sanitize_input(diagram_description)
        
        # Get analysis from OpenAI
        analysis_prompt = self._build_analysis_prompt(clean_description)
        response = self.client.chat_completion([
            {"role": "system", "content": "You are an expert diagram analyst. Respond only with valid JSON."},
            {"role": "user", "content": analysis_prompt}
        ])
        
        return self._parse_analysis_response(response)
    
    def _build_analysis_prompt(self, description: str) -> str:
        """Build the analysis prompt for OpenAI"""
        return f"""
        Analyze this diagram description and provide a JSON response with the following structure:
        {{
            "diagram_type": "flowchart|uml|network|architecture|other",
            "summary": "Brief summary of the diagram",
            "errors": [
                {{
                    "type": "error category",
                    "description": "what's wrong",
                    "severity": "low|medium|high",
                    "suggested_fix": "how to fix it"
                }}
            ],
            "enhancements": [
                {{
                    "category": "enhancement category",
                    "description": "what could be improved",
                    "priority": "low|medium|high",
                    "implementation_hint": "how to implement"
                }}
            ],
            "confidence_score": 0.85,
            "analysis_notes": "additional observations"
        }}
        
        Diagram description: {description}
        """
    
    def _parse_analysis_response(self, response: str) -> DiagramAnalysisResult:
        """Parse OpenAI response into structured result"""
        try:
            data = json.loads(response)
            
            return DiagramAnalysisResult(
                diagram_type=DiagramType(data.get('diagram_type', 'other')),
                summary=data.get('summary', ''),
                errors=[
                    DiagramError(**error) for error in data.get('errors', [])
                ],
                enhancements=[
                    Enhancement(**enhancement) for enhancement in data.get('enhancements', [])
                ],
                confidence_score=float(data.get('confidence_score', 0.0)),
                analysis_notes=data.get('analysis_notes')
            )
        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            raise Exception(f"Failed to parse analysis response: {str(e)}")

class ErrorCorrector:
    """Service for identifying and correcting diagram errors"""
    
    def __init__(self, openai_client: OpenAIClient):
        self.client = openai_client
    
    def suggest_corrections(self, diagram_description: str, errors: List[DiagramError]) -> List[str]:
        """Generate detailed correction suggestions"""
        if not errors:
            return []
        
        clean_description = SecurityValidator.sanitize_input(diagram_description)
        error_descriptions = [f"{e.type}: {e.description}" for e in errors]
        
        prompt = f"""
        Given this diagram description and identified errors, provide specific correction steps:
        
        Diagram: {clean_description}
        
        Errors: {'; '.join(error_descriptions)}
        
        Provide a numbered list of specific correction steps.
        """
        
        response = self.client.chat_completion([
            {"role": "system", "content": "You are a diagram expert providing clear correction steps."},
            {"role": "user", "content": prompt}
        ])
        
        return [step.strip() for step in response.split('\n') if step.strip()]

class DiagramEnhancer:
    """Service for generating diagram enhancement suggestions"""
    
    def __init__(self, openai_client: OpenAIClient):
        self.client = openai_client
    
    def suggest_enhancements(self, diagram_description: str, diagram_type: DiagramType) -> List[str]:
        """Generate enhancement suggestions based on diagram type"""
        clean_description = SecurityValidator.sanitize_input(diagram_description)
        
        prompt = f"""
        Suggest 3-5 specific enhancements for this {diagram_type.value} diagram:
        
        {clean_description}
        
        Focus on:
        - Visual clarity improvements
        - Missing elements or connections
        - Best practices for {diagram_type.value} diagrams
        - Accessibility improvements
        
        Provide a numbered list of actionable suggestions.
        """
        
        response = self.client.chat_completion([
            {"role": "system", "content": f"You are an expert in {diagram_type.value} diagrams."},
            {"role": "user", "content": prompt}
        ])
        
        return [suggestion.strip() for suggestion in response.split('\n') if suggestion.strip()]