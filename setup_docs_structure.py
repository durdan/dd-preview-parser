#!/usr/bin/env python3
"""
Documentation pipeline directory structure setup.
Creates the required directories for documentation generation.
"""

from pathlib import Path
from typing import List


def create_directory_structure(base_path: Path = Path("docs")) -> List[str]:
    """
    Create documentation pipeline directory structure.
    
    Args:
        base_path: Base directory path (default: "docs")
        
    Returns:
        List of created directory paths
        
    Raises:
        OSError: If directory creation fails due to permissions or other OS issues
    """
    if not base_path:
        raise ValueError("Base path cannot be empty")
    
    # Define required directories
    directories = [
        base_path / "markdown",
        base_path / "pdf", 
        base_path / "word",
        base_path / "markdown_mermaid" / "images",
        base_path / "markdown_mermaid" / "mermaid"
    ]
    
    created_dirs = []
    
    for directory in directories:
        try:
            if not directory.exists():
                directory.mkdir(parents=True, exist_ok=True)
                created_dirs.append(str(directory))
                print(f"Created: {directory}")
            else:
                print(f"Already exists: {directory}")
        except OSError as e:
            raise OSError(f"Failed to create directory {directory}: {e}")
    
    return created_dirs


def main():
    """Main function to set up documentation structure."""
    try:
        created = create_directory_structure()
        
        if created:
            print(f"\nSuccessfully created {len(created)} directories:")
            for dir_path in created:
                print(f"  - {dir_path}")
        else:
            print("\nAll directories already exist.")
            
    except (ValueError, OSError) as e:
        print(f"Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())