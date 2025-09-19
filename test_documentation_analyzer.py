import unittest
import tempfile
import os
from pathlib import Path
from main import (
    DocumentationScanner, MermaidAnalyzer, DocumentationAnalyzer,
    PipelineRecommender, MermaidDiagram
)

class TestDocumentationScanner(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.scanner = DocumentationScanner(self.temp_dir)
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_find_markdown_files(self):
        # Create test files
        (Path(self.temp_dir) / "README.md").write_text("# Test")
        (Path(self.temp_dir) / "docs.markdown").write_text("# Docs")
        (Path(self.temp_dir) / "test.txt").write_text("Not markdown")
        
        files = self.scanner.find_markdown_files()
        
        self.assertEqual(len(files), 2)
        self.assertTrue(any(f.name == "README.md" for f in files))
        self.assertTrue(any(f.name == "docs.markdown" for f in files))

class TestMermaidAnalyzer(unittest.TestCase):
    
    def setUp(self):
        self.analyzer = MermaidAnalyzer()
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_extract_diagrams_flowchart(self):
        content = """# Test Doc