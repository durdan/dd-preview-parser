import unittest
import tempfile
import os
from pathlib import Path
from unittest.mock import patch

from mermaid_converter import MermaidConverter

class TestIntegration(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        
        # Create test .mmd files
        self.test_files = [
            ("simple.mmd", "graph TD\n    A --> B"),
            ("complex.mmd", "graph TD\n" + "\n".join([
                f"    Node{i}[Label {i}]" for i in range(12)
            ] + [f"    Node{i} --> Node{i+1}" for i in range(11)]))
        ]
        
        for filename, content in self.test_files:
            file_path = Path(self.temp_dir) / filename
            file_path.write_text(content)
    
    def tearDown(self):
        # Clean up temp directory
        import shutil
        shutil.rmtree(self.temp_dir)
    
    @patch('subprocess.run')
    def test_end_to_end_conversion(self, mock_run):
        # Mock successful mmdc execution
        mock_run.return_value.returncode = 0
        mock_run.return_value.stderr = ""
        
        converter = MermaidConverter(workers=2)
        converter.convert_directory(self.temp_dir)
        
        # Verify mmdc was called for each file
        self.assertEqual(mock_run.call_count, len(self.test_files) + 1)  # +1 for version check

if __name__ == '__main__':
    unittest.main()