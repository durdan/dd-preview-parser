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
        OSError: If directory creation fails due to permissions or other issues
    """
    if not base_path:
        raise ValueError("Base path cannot be empty")
    
    # Define the directory structure
    directories = [
        base_path / "markdown",
        base_path / "pdf", 
        base_path / "word",
        base_path / "markdown_mermaid" / "images",
        base_path / "markdown_mermaid" / "mermaid"
    ]
    
    created_dirs = []
    
    try:
        for directory in directories:
            if not directory.exists():
                directory.mkdir(parents=True, exist_ok=True)
                created_dirs.append(str(directory))
                print(f"Created: {directory}")
            else:
                print(f"Already exists: {directory}")
                
    except OSError as e:
        raise OSError(f"Failed to create directory structure: {e}")
    
    return created_dirs


def main():
    """Main function to set up documentation structure."""
    try:
        created = create_directory_structure()
        
        if created:
            print(f"\n✅ Successfully created {len(created)} directories")
        else:
            print("\n✅ All directories already exist")
            
        print("\n📁 Documentation structure:")
        print("docs/")
        print("├── markdown/")
        print("├── pdf/")
        print("├── word/")
        print("└── markdown_mermaid/")
        print("    ├── images/")
        print("    └── mermaid/")
        
    except (ValueError, OSError) as e:
        print(f"❌ Error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())