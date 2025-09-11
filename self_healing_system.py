from typing import List, Tuple
from syntax_validator import DiagramSyntaxValidator
from error_optimizer import ErrorPatternOptimizer
from openai_healer import OpenAIHealer
from diagram_error import DiagramError
from config import Config

class SelfHealingDiagramSystem:
    def __init__(self, config: Config):
        self.validator = DiagramSyntaxValidator()
        self.optimizer = ErrorPatternOptimizer(config.cache_size, config.batch_size)
        self.healer = OpenAIHealer(config)
        self.config = config
    
    def heal_diagram(self, diagram_content: str) -> Tuple[str, List[DiagramError]]:
        """Main method to detect and fix diagram syntax errors"""
        if not diagram_content:
            raise ValueError("Diagram content cannot be empty")
        
        # Step 1: Detect errors
        errors = self.validator.validate(diagram_content)
        
        if not errors:
            return diagram_content, []
        
        # Step 2: Optimize error processing
        optimized = self.optimizer.optimize_errors(errors)
        
        # Step 3: Process cached errors (no API call needed)
        all_fixed_errors = optimized['cached']
        
        # Step 4: Process uncached errors with OpenAI
        for pattern_key, pattern_errors in optimized['batched'].items():
            fixes = self.healer.generate_fix(pattern_errors)
            
            for error in pattern_errors:
                error_pattern_key = error.get_pattern_key()
                if error_pattern_key in fixes:
                    fix = fixes[error_pattern_key]
                    error.suggested_fix = fix
                    # Cache the fix for future use
                    self.optimizer.cache_fix(error, fix)
                    all_fixed_errors.append(error)
        
        # Step 5: Apply fixes to diagram
        healed_content = self._apply_fixes(diagram_content, all_fixed_errors)
        
        return healed_content, all_fixed_errors
    
    def _apply_fixes(self, content: str, errors: List[DiagramError]) -> str:
        """Apply suggested fixes to the diagram content"""
        lines = content.split('\n')
        
        # Sort errors by line number in reverse order to avoid index shifting
        sorted_errors = sorted(errors, key=lambda e: e.line_number, reverse=True)
        
        for error in sorted_errors:
            if error.suggested_fix and 0 < error.line_number <= len(lines):
                lines[error.line_number - 1] = error.suggested_fix
        
        return '\n'.join(lines)