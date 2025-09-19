import os
import subprocess
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Union
from dataclasses import dataclass
from enum import Enum

class OutputFormat(Enum):
    PDF = "pdf"
    DOCX = "docx"
    BOTH = "both"

@dataclass
class ConversionConfig:
    output_format: OutputFormat = OutputFormat.BOTH
    output_dir: str = "output"
    pdf_engine: str = "xelatex"  # or pdflatex, lualatex
    template: Optional[str] = None
    css_file: Optional[str] = None
    reference_doc: Optional[str] = None  # For Word styling
    
class ValidationError(Exception):
    """Raised when validation fails"""
    pass

class ImageValidator:
    """Validates images and their embedding in markdown"""
    
    SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.tiff'}
    
    @classmethod
    def validate_image_file(cls, image_path: Path) -> bool:
        """Validate that image file exists and has supported format"""
        if not image_path.exists():
            raise ValidationError(f"Image file not found: {image_path}")
        
        if image_path.suffix.lower() not in cls.SUPPORTED_FORMATS:
            raise ValidationError(f"Unsupported image format: {image_path.suffix}")
        
        return True
    
    @classmethod
    def extract_image_paths(cls, markdown_content: str, base_dir: Path) -> List[Path]:
        """Extract image paths from markdown content"""
        import re
        
        # Match both ![alt](path) and <img src="path"> formats
        img_patterns = [
            r'!\[.*?\]\(([^)]+)\)',  # ![alt](path)
            r'<img[^>]+src=["\']([^"\']+)["\']',  # <img src="path">
        ]
        
        image_paths = []
        for pattern in img_patterns:
            matches = re.findall(pattern, markdown_content)
            for match in matches:
                # Handle relative paths
                if not os.path.isabs(match):
                    img_path = base_dir / match
                else:
                    img_path = Path(match)
                image_paths.append(img_path)
        
        return image_paths
    
    @classmethod
    def validate_all_images(cls, markdown_file: Path) -> List[Path]:
        """Validate all images referenced in markdown file"""
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        base_dir = markdown_file.parent
        image_paths = cls.extract_image_paths(content, base_dir)
        
        validated_paths = []
        for img_path in image_paths:
            cls.validate_image_file(img_path)
            validated_paths.append(img_path)
        
        return validated_paths

class FileProcessor:
    """Handles file operations and path management"""
    
    @staticmethod
    def ensure_directory(path: Union[str, Path]) -> Path:
        """Ensure directory exists, create if necessary"""
        dir_path = Path(path)
        dir_path.mkdir(parents=True, exist_ok=True)
        return dir_path
    
    @staticmethod
    def copy_images_to_output(image_paths: List[Path], output_dir: Path, 
                            markdown_dir: Path) -> Dict[str, str]:
        """Copy images to output directory and return path mappings"""
        images_dir = output_dir / "images"
        FileProcessor.ensure_directory(images_dir)
        
        path_mappings = {}
        for img_path in image_paths:
            if img_path.exists():
                # Create unique filename to avoid conflicts
                new_name = f"{img_path.stem}_{hash(str(img_path)) % 10000}{img_path.suffix}"
                new_path = images_dir / new_name
                
                shutil.copy2(img_path, new_path)
                
                # Store mapping from original relative path to new relative path
                original_rel = os.path.relpath(img_path, markdown_dir)
                new_rel = os.path.relpath(new_path, output_dir)
                path_mappings[original_rel] = new_rel
        
        return path_mappings

class PandocWrapper:
    """Wraps Pandoc command execution"""
    
    @staticmethod
    def check_pandoc_available() -> bool:
        """Check if Pandoc is available in system PATH"""
        try:
            subprocess.run(['pandoc', '--version'], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    @staticmethod
    def build_pandoc_command(input_file: Path, output_file: Path, 
                           config: ConversionConfig) -> List[str]:
        """Build Pandoc command with appropriate options"""
        cmd = ['pandoc', str(input_file), '-o', str(output_file)]
        
        # Add format-specific options
        if output_file.suffix == '.pdf':
            cmd.extend(['--pdf-engine', config.pdf_engine])
            if config.template:
                cmd.extend(['--template', config.template])
        elif output_file.suffix == '.docx':
            if config.reference_doc:
                cmd.extend(['--reference-doc', config.reference_doc])
        
        # Add CSS for HTML-based outputs
        if config.css_file and output_file.suffix in ['.html', '.pdf']:
            cmd.extend(['--css', config.css_file])
        
        # Enable standalone document
        cmd.append('--standalone')
        
        return cmd
    
    @staticmethod
    def execute_conversion(cmd: List[str]) -> None:
        """Execute Pandoc conversion command"""
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            raise ValidationError(f"Pandoc conversion failed: {e.stderr}")

class MarkdownConverter:
    """Main converter class for markdown to PDF/Word conversion"""
    
    def __init__(self, config: ConversionConfig = None):
        self.config = config or ConversionConfig()
        
        if not PandocWrapper.check_pandoc_available():
            raise ValidationError("Pandoc is not available. Please install Pandoc.")
    
    def convert_file(self, markdown_file: Union[str, Path]) -> Dict[str, Path]:
        """Convert single markdown file to specified formats"""
        md_path = Path(markdown_file)
        if not md_path.exists():
            raise ValidationError(f"Markdown file not found: {md_path}")
        
        # Validate all images
        print(f"Validating images in {md_path.name}...")
        image_paths = ImageValidator.validate_all_images(md_path)
        print(f"Found and validated {len(image_paths)} images")
        
        # Setup output directory
        output_dir = FileProcessor.ensure_directory(self.config.output_dir)
        
        # Copy images to output directory
        if image_paths:
            print("Copying images to output directory...")
            path_mappings = FileProcessor.copy_images_to_output(
                image_paths, output_dir, md_path.parent
            )
            
            # Update markdown content with new image paths
            temp_md_path = self._update_image_paths(md_path, path_mappings, output_dir)
        else:
            temp_md_path = md_path
        
        # Perform conversions
        output_files = {}
        base_name = md_path.stem
        
        try:
            if self.config.output_format in [OutputFormat.PDF, OutputFormat.BOTH]:
                pdf_file = output_dir / f"{base_name}.pdf"
                print(f"Converting to PDF: {pdf_file}")
                self._convert_to_format(temp_md_path, pdf_file)
                output_files['pdf'] = pdf_file
            
            if self.config.output_format in [OutputFormat.DOCX, OutputFormat.BOTH]:
                docx_file = output_dir / f"{base_name}.docx"
                print(f"Converting to Word: {docx_file}")
                self._convert_to_format(temp_md_path, docx_file)
                output_files['docx'] = docx_file
        
        finally:
            # Clean up temporary file if created
            if temp_md_path != md_path and temp_md_path.exists():
                temp_md_path.unlink()
        
        return output_files
    
    def convert_directory(self, input_dir: Union[str, Path]) -> Dict[str, Dict[str, Path]]:
        """Convert all markdown files in directory"""
        dir_path = Path(input_dir)
        if not dir_path.exists():
            raise ValidationError(f"Input directory not found: {dir_path}")
        
        md_files = list(dir_path.glob("*.md")) + list(dir_path.glob("*.markdown"))
        if not md_files:
            raise ValidationError(f"No markdown files found in: {dir_path}")
        
        results = {}
        for md_file in md_files:
            print(f"\nProcessing: {md_file.name}")
            try:
                output_files = self.convert_file(md_file)
                results[md_file.name] = output_files
                print(f"✓ Successfully converted {md_file.name}")
            except Exception as e:
                print(f"✗ Failed to convert {md_file.name}: {e}")
                results[md_file.name] = {'error': str(e)}
        
        return results
    
    def _update_image_paths(self, md_file: Path, path_mappings: Dict[str, str], 
                          output_dir: Path) -> Path:
        """Create temporary markdown file with updated image paths"""
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace image paths in content
        for old_path, new_path in path_mappings.items():
            # Handle different path separators
            old_path_norm = old_path.replace('\\', '/')
            new_path_norm = new_path.replace('\\', '/')
            
            content = content.replace(old_path, new_path_norm)
            content = content.replace(old_path_norm, new_path_norm)
        
        # Create temporary file
        temp_file = output_dir / f"temp_{md_file.name}"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return temp_file
    
    def _convert_to_format(self, input_file: Path, output_file: Path) -> None:
        """Convert file using Pandoc"""
        cmd = PandocWrapper.build_pandoc_command(input_file, output_file, self.config)
        PandocWrapper.execute_conversion(cmd)