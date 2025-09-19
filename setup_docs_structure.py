#!/usr/bin/env python3
"""
Documentation pipeline directory structure setup.
Creates the required directories for documentation generation.
"""

from pathlib import Path
from typing import List


def create_directory(path: Path) -> bool:
    """
    Create a directory if it doesn't exist.
    
    Args:
        path: Path object representing the directory to create
        
    Returns:
        bool: True if directory was created, False if it already existed
    """
    if path.exists():
        return False
    
    path.mkdir(parents=True, exist_ok=True)
    return True


def setup_docs_directories() -> None:
    """
    Set up the complete documentation pipeline directory structure.
    """
    # Define the directory structure
    directories = [
        "docs/markdown",
        "docs/pdf", 
        "docs/word",
        "docs/markdown_mermaid/images",
        "docs/markdown_mermaid/mermaid"
    ]
    
    created_dirs: List[str] = []
    existing_dirs: List[str] = []
    
    print("Setting up documentation pipeline directories...")
    
    for dir_path in directories:
        path = Path(dir_path)
        if create_directory(path):
            created_dirs.append(dir_path)
            print(f"✓ Created: {dir_path}")
        else:
            existing_dirs.append(dir_path)
            print(f"- Already exists: {dir_path}")
    
    # Summary
    print(f"\nSummary:")
    print(f"Created {len(created_dirs)} new directories")
    print(f"Found {len(existing_dirs)} existing directories")
    print("Documentation pipeline structure is ready!")


if __name__ == "__main__":
    setup_docs_directories()