import openai
from typing import List, Dict
from diagram_error import DiagramError
from config import Config

class OpenAIHealer:
    def __init__(self, config: Config):
        self.config = config
        openai.api_key = config.openai_api_key
    
    def generate_fix(self, errors: List[DiagramError]) -> Dict[str, str]:
        """Generate fixes for a batch of similar errors"""
        if not errors:
            return {}
        
        # Create a prompt for the batch
        prompt = self._create_batch_prompt(errors)
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a diagram syntax expert. Fix the provided syntax errors with minimal changes."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.1
            )
            
            return self._parse_response(response.choices[0].message.content, errors)
            
        except Exception as e:
            # Fallback to simple fixes
            return self._generate_fallback_fixes(errors)
    
    def _create_batch_prompt(self, errors: List[DiagramError]) -> str:
        """Create a prompt for batch error fixing"""
        prompt = "Fix these diagram syntax errors:\n\n"
        
        for i, error in enumerate(errors):
            prompt += f"Error {i+1}:\n"
            prompt += f"Type: {error.error_type.value}\n"
            prompt += f"Line {error.line_number}: {error.context}\n"
            prompt += f"Issue: {error.message}\n\n"
        
        prompt += "Provide fixes in the format 'Error X: [fixed_line]'"
        return prompt
    
    def _parse_response(self, response: str, errors: List[DiagramError]) -> Dict[str, str]:
        """Parse OpenAI response into fixes"""
        fixes = {}
        lines = response.split('\n')
        
        for line in lines:
            if 'Error' in line and ':' in line:
                try:
                    parts = line.split(':', 2)
                    if len(parts) >= 2:
                        error_num = int(parts[0].split()[-1]) - 1
                        fix = parts[1].strip()
                        if 0 <= error_num < len(errors):
                            pattern_key = errors[error_num].get_pattern_key()
                            fixes[pattern_key] = fix
                except (ValueError, IndexError):
                    continue
        
        return fixes
    
    def _generate_fallback_fixes(self, errors: List[DiagramError]) -> Dict[str, str]:
        """Generate simple fallback fixes when OpenAI fails"""
        fixes = {}
        for error in errors:
            pattern_key = error.get_pattern_key()
            
            # Simple rule-based fixes
            if "missing_delimiter" in pattern_key:
                fixes[pattern_key] = error.context + ";"
            elif "malformed_arrow" in pattern_key:
                fixes[pattern_key] = error.context.replace('--', '-->')
            else:
                fixes[pattern_key] = f"// TODO: Fix {error.error_type.value}"
        
        return fixes