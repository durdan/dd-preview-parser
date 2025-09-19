import os
import subprocess
import concurrent.futures
from pathlib import Path
from typing import List, Tuple
import re

class ValidationHelper:
    @staticmethod
    def check_mmdc_available() -> None:
        """Check if mmdc command is available."""
        try:
            subprocess.run(['mmdc', '--version'], 
                         capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError("mmdc not found. Install with: npm install -g @mermaid-js/mermaid-cli")
    
    @staticmethod
    def validate_file(file_path: Path) -> None:
        """Validate that file exists and is readable."""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        if not file_path.is_file():
            raise ValueError(f"Not a file: {file_path}")

class FileScanner:
    @staticmethod
    def find_mmd_files(directory: str = ".") -> List[Path]:
        """Find all .mmd files in directory and subdirectories."""
        path = Path(directory)
        if not path.exists():
            raise FileNotFoundError(f"Directory not found: {directory}")
        
        mmd_files = list(path.rglob("*.mmd"))
        if not mmd_files:
            print(f"No .mmd files found in {directory}")
        
        return mmd_files

class ScalingCalculator:
    @staticmethod
    def calculate_scale(content: str) -> float:
        """Calculate optimal scale based on diagram content."""
        # Count nodes, connections, and text length for complexity
        node_count = len(re.findall(r'\w+\s*[\[\(]', content))
        arrow_count = len(re.findall(r'--[->]|==>', content))
        text_length = len(content)
        
        # Base scale
        scale = 1.0
        
        # Increase scale for complex diagrams
        if node_count > 10 or arrow_count > 15:
            scale = 1.5
        elif node_count > 20 or arrow_count > 30:
            scale = 2.0
        elif text_length > 2000:
            scale = 1.8
        
        return scale

class DiagramProcessor:
    def __init__(self, height: int = 600):
        self.height = height
    
    def process_file(self, mmd_file: Path) -> Tuple[Path, bool, str]:
        """Process single mermaid file to PNG."""
        try:
            ValidationHelper.validate_file(mmd_file)
            
            # Read content for scaling calculation
            content = mmd_file.read_text(encoding='utf-8')
            scale = ScalingCalculator.calculate_scale(content)
            
            # Generate output path
            output_file = mmd_file.with_suffix('.png')
            
            # Build mmdc command
            cmd = [
                'mmdc',
                '-i', str(mmd_file),
                '-o', str(output_file),
                '-H', str(self.height),
                '-s', str(scale),
                '--backgroundColor', 'white'
            ]
            
            # Execute conversion
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                error_msg = result.stderr or result.stdout or "Unknown error"
                return mmd_file, False, f"mmdc failed: {error_msg}"
            
            return mmd_file, True, f"Generated {output_file}"
            
        except Exception as e:
            return mmd_file, False, str(e)

class MermaidConverter:
    def __init__(self, height: int = 600, workers: int = 4):
        self.processor = DiagramProcessor(height)
        self.workers = workers
    
    def convert_all(self, directory: str = ".") -> None:
        """Convert all .mmd files to PNG using parallel processing."""
        # Validate environment
        ValidationHelper.check_mmdc_available()
        
        # Find files
        mmd_files = FileScanner.find_mmd_files(directory)
        if not mmd_files:
            return
        
        print(f"Found {len(mmd_files)} .mmd files")
        print(f"Converting with {self.workers} parallel workers...")
        
        # Process files in parallel
        success_count = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.workers) as executor:
            future_to_file = {
                executor.submit(self.processor.process_file, mmd_file): mmd_file 
                for mmd_file in mmd_files
            }
            
            for future in concurrent.futures.as_completed(future_to_file):
                file_path, success, message = future.result()
                
                if success:
                    success_count += 1
                    print(f"✓ {message}")
                else:
                    print(f"✗ {file_path}: {message}")
        
        print(f"\nCompleted: {success_count}/{len(mmd_files)} files converted successfully")

def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert Mermaid diagrams to PNG")
    parser.add_argument("directory", nargs="?", default=".", 
                       help="Directory to scan for .mmd files (default: current)")
    parser.add_argument("-H", "--height", type=int, default=600,
                       help="Output height in pixels (default: 600)")
    parser.add_argument("-w", "--workers", type=int, default=4,
                       help="Number of parallel workers (default: 4)")
    
    args = parser.parse_args()
    
    try:
        converter = MermaidConverter(height=args.height, workers=args.workers)
        converter.convert_all(args.directory)
    except Exception as e:
        print(f"Error: {e}")
        exit(1)

if __name__ == "__main__":
    main()