#!/usr/bin/env python3
"""
Tests for documentation pipeline directory setup.
"""

import unittest
import tempfile
import shutil
from pathlib import Path
from setup_docs_structure import create_directory, setup_docs_directories


class TestDocsStructureSetup(unittest.TestCase):
    
    def setUp(self):
        """Create a temporary directory for testing."""
        self.test_dir = Path(tempfile.mkdtemp())
        self.original_cwd = Path.cwd()
        # Change to test directory
        import os
        os.chdir(self.test_dir)
    
    def tearDown(self):
        """Clean up test directory."""
        import os
        os.chdir(self.original_cwd)
        shutil.rmtree(self.test_dir)
    
    def test_create_directory_new(self):
        """Test creating a new directory."""
        test_path = self.test_dir / "new_dir"
        result = create_directory(test_path)
        
        self.assertTrue(result)
        self.assertTrue(test_path.exists())
        self.assertTrue(test_path.is_dir())
    
    def test_create_directory_existing(self):
        """Test creating an already existing directory."""
        test_path = self.test_dir / "existing_dir"
        test_path.mkdir()
        
        result = create_directory(test_path)
        
        self.assertFalse(result)
        self.assertTrue(test_path.exists())
    
    def test_create_directory_nested(self):
        """Test creating nested directories."""
        test_path = self.test_dir / "level1" / "level2" / "level3"
        result = create_directory(test_path)
        
        self.assertTrue(result)
        self.assertTrue(test_path.exists())
        self.assertTrue(test_path.is_dir())
    
    def test_setup_docs_directories(self):
        """Test setting up the complete docs structure."""
        setup_docs_directories()
        
        expected_dirs = [
            "docs/markdown",
            "docs/pdf",
            "docs/word", 
            "docs/markdown_mermaid/images",
            "docs/markdown_mermaid/mermaid"
        ]
        
        for dir_path in expected_dirs:
            path = Path(dir_path)
            self.assertTrue(path.exists(), f"Directory {dir_path} should exist")
            self.assertTrue(path.is_dir(), f"{dir_path} should be a directory")
    
    def test_setup_docs_directories_idempotent(self):
        """Test that running setup twice doesn't cause issues."""
        # Run setup twice
        setup_docs_directories()
        setup_docs_directories()
        
        # Should still work without errors
        expected_dirs = [
            "docs/markdown",
            "docs/pdf",
            "docs/word",
            "docs/markdown_mermaid/images", 
            "docs/markdown_mermaid/mermaid"
        ]
        
        for dir_path in expected_dirs:
            path = Path(dir_path)
            self.assertTrue(path.exists())


if __name__ == "__main__":
    unittest.main()