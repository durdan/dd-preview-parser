import unittest
import tempfile
import shutil
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
        shutil.rmtree(self.temp_dir)
    
    def test_find_markdown_files(self):
        # Create test files
        (Path(self.temp_dir) / "README.md").write_text("# Test")
        (Path(self.temp_dir) / "docs").mkdir()
        (Path(self.temp_dir) / "docs" / "guide.md").write_text("# Guide")
        (Path(self.temp_dir) / "test.txt").write_text("Not markdown")
        
        files = self.scanner.find_markdown_files()
        
        self.assertEqual(len(files), 2)
        self.assertTrue(any("README.md" in str(f) for f in files))
        self.assertTrue(any("guide.md" in str(f) for f in files))
    
    def test_ignores_git_directory(self):
        # Create .git directory with markdown
        git_dir = Path(self.temp_dir) / ".git"
        git_dir.mkdir()
        (git_dir / "config.md").write_text("# Config")
        
        files = self.scanner.find_markdown_files()
        
        self.assertEqual(len(files), 0)

class TestMermaidAnalyzer(unittest.TestCase):
    
    def setUp(self):
        self.analyzer = MermaidAnalyzer()
        self.temp_dir = tempfile.mkdtemp()
    
    def tearDown(self):
        shutil.rmtree(self.temp_dir)
    
    def test_analyze_file_with_mermaid(self):
        content = """# Test Doc