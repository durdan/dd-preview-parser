from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class DiagramType(Enum):
    FLOWCHART = "flowchart"
    UML = "uml"
    NETWORK = "network"
    ARCHITECTURE = "architecture"
    OTHER = "other"

@dataclass
class DiagramError:
    type: str
    description: str
    severity: str  # low, medium, high
    suggested_fix: str

@dataclass
class Enhancement:
    category: str
    description: str
    priority: str  # low, medium, high
    implementation_hint: str

@dataclass
class DiagramAnalysisResult:
    diagram_type: DiagramType
    summary: str
    errors: List[DiagramError]
    enhancements: List[Enhancement]
    confidence_score: float
    analysis_notes: Optional[str] = None