import unittest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path
import tempfile
import os

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
        nodes = [f"    Node{i} --> Node{i+1}" for i in range(15)]
        content = "graph TD\n" + "\n".join(nodes)
        scale = ScalingCalculator.calculate_scale(content)
        self.assertEqual(scale, 1.5)
    
    def test_very_complex_diagram_scale(self):
        # Create content with many nodes and arrows
        nodes = [f"    Node{i} --> Node{i+1}" for i in range(25)]
        content = "graph TD\n" + "\n".join(nodes)
        scale = ScalingCalculator.calculate_scale(content)
        self.assertEqual(scale, 2.0)

class TestFileScanner(unittest.TestCase):
    def test_find_mmd_files_empty_directory(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            files = FileScanner.find_mmd_files(temp_dir)
            self.assertEqual(files, [])
    
    def test_find_mmd_files_with_files(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test files
            mmd_file = Path(temp_dir) / "test.mmd"
            mmd_file.write_text("graph TD\n    A --> B")
            
            txt_file = Path(temp_dir) / "test.txt"
            txt_file.write_text("not a mermaid file")
            
            files = FileScanner.find_mmd_files(temp_dir)
            self.assertEqual(len(files), 1)
            self.assertEqual(files[0].name, "test.mmd")
    
    def test_find_mmd_files_nonexistent_directory(self):
        with self.assertRaises(FileNotFoundError):
            FileScanner.find_mmd_files("nonexistent_directory")

class TestDiagramProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = DiagramProcessor(height=600)
    
    @patch('subprocess.run')
    @patch('pathlib.Path.read_text')
    def test_process_file_success(self, mock_read_text, mock_run):
        mock_read_text.return_value = "graph TD\n    A --> B"
        mock_run.return_value = MagicMock(returncode=0, stderr="", stdout="")
        
        test_file = Path("test.mmd")
        with patch.object(ValidationHelper, 'validate_file'):
            file_path, success, message = self.processor.process_file(test_file)
        
        self.assertTrue(success)
        self.assertIn("Generated", message)
    
    @patch('subprocess.run')
    @patch('pathlib.Path.read_text')
    def test_process_file_mmdc_failure(self, mock_read_text, mock_run):
        mock_read_text.return_value = "graph TD\n    A --> B"
        mock_run.return_value = MagicMock(returncode=1, stderr="Error message", stdout="")
        
        test_file = Path("test.mmd")
        with patch.object(ValidationHelper, 'validate_file'):
            file_path, success, message = self.processor.process_file(test_file)
        
        self.assertFalse(success)
        self.assertIn("mmdc failed", message)

class TestMermaidConverter(unittest.TestCase):
    def setUp(self):
        self.converter = MermaidConverter(height=600, workers=2)
    
    @patch.object(ValidationHelper, 'check_mmdc_available')
    @patch.object(FileScanner, 'find_mmd_files')
    def test_convert_all_no_files(self, mock_find_files, mock_check_mmdc):
        mock_find_files.return_value = []
        
        # Should complete without error
        self.converter.convert_all(".")
        
        mock_check_mmdc.assert_called_once()
        mock_find_files.assert_called_once_with(".")

if __name__ == '__main__':
    unittest.main()