from .config import OpenAIConfig
from .openai_client import OpenAIClient
from .diagram_analyzer import DiagramAnalyzer, ErrorCorrector, DiagramEnhancer

class DiagramAnalysisService:
    """Main service orchestrating diagram analysis"""
    
    def __init__(self, config: OpenAIConfig = None):
        self.config = config or OpenAIConfig.from_env()
        self.client = OpenAIClient(self.config)
        self.analyzer = DiagramAnalyzer(self.client)
        self.corrector = ErrorCorrector(self.client)
        self.enhancer = DiagramEnhancer(self.client)
    
    def full_analysis(self, diagram_description: str) -> dict:
        """Perform complete diagram analysis with corrections and enhancements"""
        # Main analysis
        result = self.analyzer.analyze_diagram(diagram_description)
        
        # Get correction suggestions
        corrections = self.corrector.suggest_corrections(
            diagram_description, result.errors
        )
        
        # Get enhancement suggestions
        enhancements = self.enhancer.suggest_enhancements(
            diagram_description, result.diagram_type
        )
        
        return {
            'analysis': result,
            'correction_steps': corrections,
            'enhancement_suggestions': enhancements
        }

# Example usage
def main():
    service = DiagramAnalysisService()
    
    diagram_desc = """
    A simple flowchart showing user login process:
    Start -> Enter credentials -> Check database -> Valid? -> Login success
    If invalid -> Show error -> Back to enter credentials
    """
    
    results = service.full_analysis(diagram_desc)
    
    print("Analysis Results:")
    print(f"Type: {results['analysis'].diagram_type.value}")
    print(f"Summary: {results['analysis'].summary}")
    print(f"Errors found: {len(results['analysis'].errors)}")
    print(f"Enhancements suggested: {len(results['analysis'].enhancements)}")

if __name__ == "__main__":
    main()