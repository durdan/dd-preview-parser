#!/usr/bin/env python3
"""
Documentation Pipeline - Organizes and processes documentation files
"""

import os
import sys
from pathlib import Path
from documentation_pipeline import DocumentationPipeline

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <input_directory> [output_directory]")
        sys.exit(1)
    
    input_dir = Path(sys.argv[1])
    output_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output")
    
    if not input_dir.exists():
        print(f"Error: Input directory '{input_dir}' does not exist")
        sys.exit(1)
    
    pipeline = DocumentationPipeline(input_dir, output_dir)
    success = pipeline.execute()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()