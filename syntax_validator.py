import re
from typing import List, Dict, Pattern
from diagram_error import DiagramError, ErrorType

class DiagramSyntaxValidator:
    def __init__(self):
        self.error_patterns: Dict[ErrorType, List[Pattern]] = {
            ErrorType.MISSING_DELIMITER: [
                re.compile(r'^\s*[A-Za-z][^;]*$'),  # Missing semicolon
                re.compile(r'[^"]\s*-->\s*[^"]'),   # Missing quotes around arrows
            ],
            ErrorType.MALFORMED_ARROW: [
                re.compile(r'--[^>-]'),  # Incomplete arrow
                re.compile(r'-[^-]>'),   # Malformed arrow
            ],
            ErrorType.INVALID_NODE: [
                re.compile(r'^\s*[0-9][A-Za-z]'),  # Node starting with number
                re.compile(r'[^\w\s\-_]'),         # Invalid characters in node
            ]
        }
    
    def validate(self, diagram_content: str) -> List[DiagramError]:
        """Detect syntax errors in diagram content"""
        if not diagram_content or not diagram_content.strip():
            return [DiagramError(
                ErrorType.SYNTAX_ERROR, 
                0, 
                "Empty diagram content", 
                ""
            )]
        
        errors = []
        lines = diagram_content.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith('//'):  # Skip empty lines and comments
                continue
                
            for error_type, patterns in self.error_patterns.items():
                for pattern in patterns:
                    if pattern.search(line):
                        errors.append(DiagramError(
                            error_type=error_type,
                            line_number=line_num,
                            message=f"Pattern violation: {pattern.pattern}",
                            context=line
                        ))
        
        return errors