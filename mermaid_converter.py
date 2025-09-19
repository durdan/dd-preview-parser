import os
import subprocess
import concurrent.futures
import re
from pathlib import Path
from typing import List, Tuple, Optional
import shutil

class MermaidConverter:
    def __init__(self, base_height: int = 600, max_workers: int = 4):
        self.base_height = base_height
        self.max_workers = max_workers
        self.validator = ValidationHelper()
        self.scanner = FileScanner()
        self.generator = ImageGenerator(base_height)
        
    def convert_all(self, directory: str = ".") -> List[Tuple[str, bool, str]]:
        """Convert all .mmd files to PNG images."""
        self.validator.validate_environment()
        
        mmd_files = self.scanner.find_mmd_files(directory)
        if not mmd_files:
            print("No .mmd files found")
            return []
            
        print(f"Found {len(mmd_files)} .mmd files")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {executor.submit(self.generator.convert_file, file_path): file_path 
                      for file_path in mmd_files}
            
            results = []
            for future in concurrent.futures.as_completed(futures):
                file_path = futures[future]
                try:
                    success, message = future.result()
                    results.append((file_path, success, message))
                    status = "✓" if success else "✗"
                    print(f"{status} {file_path}: {message}")
                except Exception as e:
                    results.append((file_path, False, str(e)))
                    print(f"✗ {file_path}: {str(e)}")
                    
        return results

class FileScanner:
    def find_mmd_files(self, directory: str) -> List[str]:
        """Find all .mmd files recursively."""
        mmd_files = []
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.mmd'):
                    mmd_files.append(os.path.join(root, file))
        return sorted(mmd_files)

class ImageGenerator:
    def __init__(self, base_height: int):
        self.base_height = base_height
        self.scaling_calc = ScalingCalculator()
        
    def convert_file(self, mmd_file: str) -> Tuple[bool, str]:
        """Convert single .mmd file to PNG."""
        try:
            png_file = self._get_output_path(mmd_file)
            scale_factor = self._calculate_scale(mmd_file)
            
            cmd = [
                'mmdc',
                '-i', mmd_file,
                '-o', png_file,
                '-H', str(self.base_height),
                '-s', str(scale_factor),
                '--backgroundColor', 'white'
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                return True, f"Generated {png_file}"
            else:
                return False, f"mmdc error: {result.stderr.strip()}"
                
        except subprocess.TimeoutExpired:
            return False, "Conversion timeout (30s)"
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    def _get_output_path(self, mmd_file: str) -> str:
        """Get PNG output path for .mmd file."""
        return str(Path(mmd_file).with_suffix('.png'))
    
    def _calculate_scale(self, mmd_file: str) -> float:
        """Calculate scale factor based on diagram content."""
        try:
            with open(mmd_file, 'r', encoding='utf-8') as f:
                content = f.read()
            return self.scaling_calc.calculate_scale(content)
        except Exception:
            return 1.0  # Default scale if content analysis fails

class ScalingCalculator:
    def calculate_scale(self, content: str) -> float:
        """Calculate smart scale factor based on diagram complexity."""
        # Count nodes/elements as complexity indicator
        node_patterns = [
            r'\w+\s*\[.*?\]',  # Flowchart nodes
            r'\w+\s*\{.*?\}',  # Class diagram classes
            r'\w+\s*--\s*\w+', # Relationships
            r'\w+\s*->\s*\w+', # Arrows
            r'participant\s+\w+', # Sequence diagram participants
        ]
        
        total_elements = 0
        for pattern in node_patterns:
            total_elements += len(re.findall(pattern, content, re.IGNORECASE))
        
        # Base scale factors based on complexity
        if total_elements <= 5:
            return 1.0
        elif total_elements <= 15:
            return 1.5
        elif total_elements <= 30:
            return 2.0
        else:
            return 2.5

class ValidationHelper:
    def validate_environment(self) -> None:
        """Validate that mmdc is available."""
        if not shutil.which('mmdc'):
            raise RuntimeError(
                "mmdc not found. Install mermaid-cli: npm install -g @mermaid-js/mermaid-cli"
            )

def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert Mermaid diagrams to PNG images')
    parser.add_argument('directory', nargs='?', default='.', 
                       help='Directory to scan for .mmd files (default: current)')
    parser.add_argument('--height', '-H', type=int, default=600,
                       help='Base height for images (default: 600)')
    parser.add_argument('--workers', '-w', type=int, default=4,
                       help='Number of parallel workers (default: 4)')
    
    args = parser.parse_args()
    
    try:
        converter = MermaidConverter(args.height, args.workers)
        results = converter.convert_all(args.directory)
        
        successful = sum(1 for _, success, _ in results if success)
        total = len(results)
        print(f"\nCompleted: {successful}/{total} files converted successfully")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == '__main__':
    exit(main())