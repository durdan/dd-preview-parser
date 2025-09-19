import unittest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path
import subprocess

from mermaid_converter import (
    ValidationHelper, FileScanner, ScalingCalculator, 
    DiagramProcessor, MermaidConverter
)

class TestValidationHelper(unittest.TestCase):
    
    @patch('subprocess.run')
    def test_check_mmdc_available_success(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0)
        # Should not raise
        ValidationHelper.check_mmdc_available()
    
    @patch('subprocess.run')
    def test_check_mmdc_not_found(self, mock_run):
        mock_run.side_effect = FileNotFoundError()
        with self.assertRaises(RuntimeError):
            ValidationHelper.check_mmdc_available()
    
    def test_validate_file_not_exists(self):
        with self.assertRaises(FileNotFoundError):
            ValidationHelper.validate_file(Path("nonexistent.mmd"))

class TestScalingCalculator(unittest.TestCase):
    
    def test_simple_diagram_scale(self):
        content = "graph TD\n    A --> B"
        scale = ScalingCalculator.calculate_scale(content)
        self.assertEqual(scale, 1.0)
    
    def test_complex_diagram_scale(self):
        # Create content with many nodes
        nodes = [f"    Node{i}[Label {i}]" for i in range(15)]
        arrows = [f"    Node{i} --> Node{i+1}" for i in range(14)]
        content = "graph TD\n" + "\n".join(nodes + arrows)
        
        scale = ScalingCalculator.calculate_scale(content)
        self.assertEqual(scale, 1.5)
    
    def test_very_complex_diagram_scale(self):
        # Create content with many nodes and arrows
        nodes = [f"    Node{i}[Label {i}]" for i in range(25)]
        arrows = [f"    Node{i} --> Node{i+1}" for i in range(24)]
        content = "graph TD\n" + "\n".join(nodes + arrows)
        
        scale = ScalingCalculator.calculate_scale(content)
        self.assertEqual(scale, 2.0)

class TestFileScanner(unittest.TestCase):
    
    @patch('pathlib.Path.rglob')
    @patch('pathlib.Path.exists')
    def test_find_mmd_files(self, mock_exists, mock_rglob):
        mock_exists.return_value = True
        mock_files = [Path("test1.mmd"), Path("test2.mmd")]
        mock_rglob.return_value = mock_files
        
        result = FileScanner.find_mmd_files(".")
        self.assertEqual(result, mock_files)
    
    def test_directory_not_exists(self):
        with self.assertRaises(FileNotFoundError):
            FileScanner.find_mmd_files("nonexistent_dir")

class TestDiagramProcessor(unittest.TestCase):
    
    def setUp(self):
        self.processor = DiagramProcessor()
    
    @patch('subprocess.run')
    @patch('pathlib.Path.read_text')
    @patch('pathlib.Path.exists')
    @patch('pathlib.Path.is_file')
    def test_process_file_success(self, mock_is_file, mock_exists, mock_read_text, mock_run):
        mock_exists.return_value = True
        mock_is_file.return_value = True
        mock_read_text.return_value = "graph TD\n    A --> B"
        mock_run.return_value = MagicMock(returncode=0, stderr="")
        
        file_path, success, message = self.processor.process_file(Path("test.mmd"))
        
        self.assertTrue(success)
        self.assertIn("Generated", message)
    
    @patch('subprocess.run')
    @patch('pathlib.Path.read_text')
    @patch('pathlib.Path.exists')
    @patch('pathlib.Path.is_file')
    def test_process_file_mmdc_failure(self, mock_is_file, mock_exists, mock_read_text, mock_run):
        mock_exists.return_value = True
        mock_is_file.return_value = True
        mock_read_text.return_value = "graph TD\n    A --> B"
        mock_run.return_value = MagicMock(returncode=1, stderr="Error message")
        
        file_path, success, message = self.processor.process_file(Path("test.mmd"))
        
        self.assertFalse(success)
        self.assertIn("mmdc failed", message)

class TestMermaidConverter(unittest.TestCase):
    
    @patch('mermaid_converter.ValidationHelper.check_mmdc_available')
    @patch('mermaid_converter.FileScanner.find_mmd_files')
    def test_convert_directory_no_files(self, mock_find_files, mock_check_mmdc):
        mock_find_files.return_value = []
        
        converter = MermaidConverter()
        # Should not raise and handle empty file list gracefully
        converter.convert_directory()

if __name__ == '__main__':
    unittest.main()