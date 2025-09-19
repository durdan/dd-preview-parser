#!/usr/bin/env python3
"""
Documentation pipeline directory structure setup.
Creates the necessary directories for documentation generation.
"""

from pathlib import Path
from typing import List


def create_docs_directories() -> List[str]:
    """
    Create documentation pipeline directory structure.
    
    Returns:
        List of created directory paths
    """
    directories = [
        "docs/markdown",
        "docs/pdf", 
        "docs/word",
        "docs/markdown_mermaid/images",
        "docs/markdown_mermaid/mermaid"
    ]
    
    created_dirs = []
    
    for dir_path in directories:
        path = Path(dir_path)
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
            created_dirs.append(str(path))
            print(f"Created directory: {path}")
        else:
            print(f"Directory already exists: {path}")
    
    return created_dirs


def validate_structure() -> bool:
    """
    Validate that all required directories exist.
    
    Returns:
        True if all directories exist, False otherwise
    """
    required_dirs = [
        "docs/markdown",
        "docs/pdf",
        "docs/word", 
        "docs/markdown_mermaid/images",
        "docs/markdown_mermaid/mermaid"
    ]
    
    for dir_path in required_dirs:
        if not Path(dir_path).exists():
            print(f"Missing directory: {dir_path}")
            return False
    
    print("All documentation directories exist")
    return True


if __name__ == "__main__":
    print("Setting up documentation pipeline directory structure...")
    created = create_docs_directories()
    
    if created:
        print(f"\nCreated {len(created)} new directories")
    else:
        print("\nAll directories already existed")
    
    print("\nValidating structure...")
    validate_structure()