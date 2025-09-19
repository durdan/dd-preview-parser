#!/usr/bin/env python3
"""Tests for documentation structure setup."""

import unittest
import tempfile
import shutil
from pathlib import Path
from setup_docs_structure import create_directory_structure


class TestSetupDocsStructure(unittest.TestCase):
    
    def setUp(self):
        """Create temporary directory for testing."""
        self.temp_dir = Path(tempfile.mkdtemp())
        
    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.temp_dir)
    
    def test_create_directory_structure_success(self):
        """Test successful directory creation."""
        base_path = self.temp_dir / "test_docs"
        created = create_directory_structure(base_path)
        
        # Check all directories were created
        expected_dirs = [
            base_path / "markdown",
            base_path / "pdf",
            base_path / "word", 
            base_path / "markdown_mermaid" / "images",
            base_path / "markdown_mermaid" / "mermaid"
        ]
        
        for directory in expected_dirs:
            self.assertTrue(directory.exists())
            self.assertTrue(directory.is_dir())
        
        # Check return value
        self.assertEqual(len(created), 5)
    
    def test_directories_already_exist(self):
        """Test when directories already exist."""
        base_path = self.temp_dir / "existing_docs"
        
        # Create directories first time
        created_first = create_directory_structure(base_path)
        self.assertEqual(len(created_first), 5)
        
        # Create again - should return empty list
        created_second = create_directory_structure(base_path)
        self.assertEqual(len(created_second), 0)
    
    def test_invalid_base_path(self):
        """Test with invalid base path."""
        with self.assertRaises(ValueError):
            create_directory_structure(Path(""))
    
    def test_nested_structure_creation(self):
        """Test that nested directories are created properly."""
        base_path = self.temp_dir / "deep" / "nested" / "docs"
        create_directory_structure(base_path)
        
        # Check that deeply nested structure exists
        mermaid_images = base_path / "markdown_mermaid" / "images"
        self.assertTrue(mermaid_images.exists())
        self.assertTrue(mermaid_images.is_dir())


if __name__ == "__main__":
    unittest.main()