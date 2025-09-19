import unittest
import tempfile
import os
from pathlib import Path
from unittest.mock import patch, MagicMock
from mermaid_converter import (
    MermaidConverter, FileScanner, ImageGenerator, 
    ScalingCalculator, ValidationHelper
)

class TestFileScanner(unittest.TestCase):
    def test_find_mmd_files(self):
        scanner = FileScanner()
        
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test files
            (Path(temp_dir) / 'diagram1.mmd').touch()
            (Path(temp_dir) / 'diagram2.mmd').touch()
            (Path(temp_dir) / 'not_mmd.txt').touch()
            
            # Create subdirectory with mmd file
            sub_dir = Path(temp_dir) / 'subdir'
            sub_dir.mkdir()
            (sub_dir / 'diagram3.mmd').touch()
            
            files = scanner.find_mmd_files(temp_dir)
            
            self.assertEqual(len(files), 3)
            self.assertTrue(all(f.endswith('.mmd') for f in files))

class TestScalingCalculator(unittest.TestCase):
    def setUp(self):
        self.calc = ScalingCalculator()
    
    def test_simple_diagram_scale(self):
        content = "graph TD\n    A --> B"
        scale = self.calc.calculate_scale(content)
        self.assertEqual(scale, 1.0)
    
    def test_complex_diagram_scale(self):
        content = """
        graph TD
            A[Node1] --> B[Node2]
            B --> C[Node3]
            C --> D[Node4]
            D --> E[Node5]
            E --> F[Node6]
            F --> G[Node7]
        """
        scale = self.calc.calculate_scale(content)
        self.assertGreater(scale, 1.0)
    
    def test_empty_content(self):
        scale = self.calc.calculate_scale("")
        self.assertEqual(scale, 1.0)

class TestValidationHelper(unittest.TestCase):
    @patch('shutil.which')
    def test_validate_environment_success(self, mock_which):
        mock_which.return_value = '/usr/bin/mmdc'
        validator = ValidationHelper()
        
        # Should not raise
        validator.validate_environment()
    
    @patch('shutil.which')
    def test_validate_environment_failure(self, mock_which):
        mock_which.return_value = None
        validator = ValidationHelper()
        
        with self.assertRaises(RuntimeError) as cm:
            validator.validate_environment()
        
        self.assertIn('mmdc not found', str(cm.exception))

class TestImageGenerator(unittest.TestCase):
    def setUp(self):
        self.generator = ImageGenerator(600)
    
    def test_get_output_path(self):
        mmd_file = '/path/to/diagram.mmd'
        png_file = self.generator._get_output_path(mmd_file)
        self.assertEqual(png_file, '/path/to/diagram.png')
    
    @patch('subprocess.run')
    @patch('builtins.open')
    def test_convert_file_success(self, mock_open, mock_run):
        mock_open.return_value.__enter__.return_value.read.return_value = "graph TD\n A --> B"
        mock_run.return_value.returncode = 0
        
        success, message = self.generator.convert_file('test.mmd')
        
        self.assertTrue(success)
        self.assertIn('Generated', message)
    
    @patch('subprocess.run')
    @patch('builtins.open')
    def test_convert_file_failure(self, mock_open, mock_run):
        mock_open.return_value.__enter__.return_value.read.return_value = "graph TD\n A --> B"
        mock_run.return_value.returncode = 1
        mock_run.return_value.stderr = "Invalid syntax"
        
        success, message = self.generator.convert_file('test.mmd')
        
        self.assertFalse(success)
        self.assertIn('mmdc error', message)

class TestMermaidConverter(unittest.TestCase):
    @patch('mermaid_converter.ValidationHelper.validate_environment')
    @patch('mermaid_converter.FileScanner.find_mmd_files')
    def test_convert_all_no_files(self, mock_find, mock_validate):
        mock_find.return_value = []
        
        converter = MermaidConverter()
        results = converter.convert_all()
        
        self.assertEqual(len(results), 0)
    
    @patch('mermaid_converter.ValidationHelper.validate_environment')
    @patch('mermaid_converter.FileScanner.find_mmd_files')
    @patch('mermaid_converter.ImageGenerator.convert_file')
    def test_convert_all_with_files(self, mock_convert, mock_find, mock_validate):
        mock_find.return_value = ['test1.mmd', 'test2.mmd']
        mock_convert.return_value = (True, "Generated test.png")
        
        converter = MermaidConverter()
        results = converter.convert_all()
        
        self.assertEqual(len(results), 2)
        self.assertTrue(all(success for _, success, _ in results))

if __name__ == '__main__':
    unittest.main()