import os
import re
from typing import List
from validation_result import ValidationResult, ValidationLevel

class DiagramValidator:
    def __init__(self):
        self.diagram_patterns = {
            'mermaid': re.compile(r'