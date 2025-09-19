import unittest
import tempfile
import json
from pathlib import Path
from extractor import MermaidExtractor, MermaidBlock

class TestMermaidBlock(unittest.TestCase):
    def test_detect_flowchart_type(self):
        block = MermaidBlock("graph TD\nA --> B", 1, 5)
        self.assertEqual(block.diagram_type, "flowchart")
    
    def test_detect_sequence_type(self):
        block = MermaidBlock("sequenceDiagram\nAlice->>Bob: Hello", 1, 5)
        self.assertEqual(block.diagram_type, "sequence")
    
    def test_detect_unknown_type(self):
        block = MermaidBlock("some unknown content", 1, 5)
        self.assertEqual(block.diagram_type, "unknown")

class TestMermaidExtractor(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.source_dir = Path(self.temp_dir.name) / "docs"
        self.output_dir = Path(self.temp_dir.name) / "output"
        self.source_dir.mkdir(parents=True)
    
    def tearDown(self):
        self.temp_dir.cleanup()
    
    def test_invalid_source_directory(self):
        with self.assertRaises(ValueError):
            MermaidExtractor("nonexistent_dir")
    
    def test_extract_single_diagram(self):
        # Create test markdown file
        md_content = """# Test Document

Some text here.