import os
import re
import json
from pathlib import Path
from typing import List, Dict, Tuple

class MermaidExtractor:
    def __init__(self, input_dir: str = "docs/markdown"):
        self.input_dir = Path(input_dir)
        self.mermaid_pattern = re.compile(r'