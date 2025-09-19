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
        
        for expected_dir in expected_dirs:
            self.assertTrue(expected_dir.exists())
            self.assertTrue(expected_dir.is_dir())
        
        # Check return value
        self.assertEqual(len(created), 5)
    
    def test_directories_already_exist(self):
        """Test when directories already exist."""
        base_path = self.temp_dir / "existing_docs"
        
        # Create directories first time
        created_first = create_directory_structure(base_path)
        self.assertEqual(len(created_first), 5)
        
        # Run again - should return empty list
        created_second = create_directory_structure(base_path)
        self.assertEqual(len(created_second), 0)
    
    def test_invalid_base_path(self):
        """Test with invalid base path."""
        with self.assertRaises(ValueError):
            create_directory_structure(Path(""))
    
    def test_nested_directory_creation(self):
        """Test that parent directories are created automatically."""
        base_path = self.temp_dir / "deep" / "nested" / "docs"
        created = create_directory_structure(base_path)
        
        # Check that deeply nested structure was created
        mermaid_dir = base_path / "markdown_mermaid" / "mermaid"
        self.assertTrue(mermaid_dir.exists())
        self.assertEqual(len(created), 5)


if __name__ == "__main__":
    unittest.main()