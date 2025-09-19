#!/usr/bin/env python3
"""Tests for documentation directory structure setup."""

import unittest
import tempfile
import shutil
from pathlib import Path
import os
import sys

# Add the parent directory to sys.path to import our module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from setup_docs_structure import create_docs_directories, validate_structure


class TestDocsStructure(unittest.TestCase):
    
    def setUp(self):
        """Set up temporary directory for testing."""
        self.test_dir = tempfile.mkdtemp()
        self.original_cwd = os.getcwd()
        os.chdir(self.test_dir)
    
    def tearDown(self):
        """Clean up temporary directory."""
        os.chdir(self.original_cwd)
        shutil.rmtree(self.test_dir)
    
    def test_create_docs_directories_new(self):
        """Test creating directories when they don't exist."""
        created = create_docs_directories()
        
        # Should create all 5 directories
        self.assertEqual(len(created), 5)
        
        # Verify all directories exist
        expected_dirs = [
            "docs/markdown",
            "docs/pdf",
            "docs/word",
            "docs/markdown_mermaid/images", 
            "docs/markdown_mermaid/mermaid"
        ]
        
        for dir_path in expected_dirs:
            self.assertTrue(Path(dir_path).exists())
            self.assertTrue(Path(dir_path).is_dir())
    
    def test_create_docs_directories_existing(self):
        """Test creating directories when they already exist."""
        # Create directories first time
        create_docs_directories()
        
        # Create again - should return empty list
        created = create_docs_directories()
        self.assertEqual(len(created), 0)
    
    def test_validate_structure_success(self):
        """Test validation when all directories exist."""
        create_docs_directories()
        self.assertTrue(validate_structure())
    
    def test_validate_structure_missing(self):
        """Test validation when directories are missing."""
        # Only create some directories
        Path("docs/markdown").mkdir(parents=True)
        Path("docs/pdf").mkdir(parents=True)
        
        self.assertFalse(validate_structure())
    
    def test_nested_directory_creation(self):
        """Test that nested directories are created properly."""
        create_docs_directories()
        
        # Check that parent directories were created
        self.assertTrue(Path("docs").exists())
        self.assertTrue(Path("docs/markdown_mermaid").exists())
        
        # Check that nested directories exist
        self.assertTrue(Path("docs/markdown_mermaid/images").exists())
        self.assertTrue(Path("docs/markdown_mermaid/mermaid").exists())


if __name__ == "__main__":
    unittest.main()