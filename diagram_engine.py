from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, List, Optional, Union
import re

class DiagramType(Enum):
    SEQUENCE = "sequence"
    CLASS = "class"
    ACTIVITY = "activity"
    USE_CASE = "usecase"
    COMPONENT = "component"
    STATE = "state"

class DiagramFormat(Enum):
    SVG = "svg"
    PNG = "png"
    TXT = "txt"

class ValidationError(Exception):
    pass

class RenderError(Exception):
    pass

class DiagramParser(ABC):
    @abstractmethod
    def parse(self, content: str) -> Dict:
        pass
    
    @abstractmethod
    def validate(self, content: str) -> List[str]:
        pass
    
    @abstractmethod
    def get_diagram_type(self, content: str) -> Optional[DiagramType]:
        pass

class DiagramRenderer(ABC):
    @abstractmethod
    def render(self, content: str, format: DiagramFormat) -> bytes:
        pass
    
    @abstractmethod
    def supported_formats(self) -> List[DiagramFormat]:
        pass