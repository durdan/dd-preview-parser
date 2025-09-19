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
    pdf_engine: str = "xelatex"
    reference_doc: Optional[str] = None
    dpi: int = 300
    validate_images: bool = True

class ValidationError(Exception):
    """Raised when validation fails"""
    pass

class ImageValidator:
    """Validates image files and paths in markdown"""
    
    SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.webp'}
    
    @classmethod
    def validate_image_file(cls, image_path: Path) -> bool:
        """Validate single image file"""
        if not image_path.exists():
            raise ValidationError(f"Image file not found: {image_path}")
        
        if image_path.suffix.lower() not in cls.SUPPORTED_FORMATS:
            raise ValidationError(f"Unsupported image format: {image_path.suffix}")
        
        if image_path.stat().st_size == 0:
            raise ValidationError(f"Empty image file: {image_path}")
        
        return True
    
    @classmethod
    def extract_image_paths(cls, markdown_content: str, base_dir: Path) -> List[Path]:
        """Extract image paths from markdown content"""
        import re
        
        # Match both ![alt](path) and <img src="path"> formats
        patterns = [
            r'!\[.*?\]\(([^)]+)\)',  # ![alt](path)
            r'<img[^>]+src=["\']([^"\']+)["\']',  # <img src="path">
        ]
        
        image_paths = []
        for pattern in patterns:
            matches = re.findall(pattern, markdown_content)
            for match in matches:
                # Handle relative paths
                if not match.startswith(('http://', 'https://', '/')):
                    image_path = base_dir / match
                else:
                    image_path = Path(match)
                image_paths.append(image_path)
        
        return image_paths
    
    @classmethod
    def validate_all_images(cls, markdown_file: Path) -> List[Path]:
        """Validate all images referenced in markdown file"""
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        image_paths = cls.extract_image_paths(content, markdown_file.parent)
        validated_paths = []
        
        for image_path in image_paths:
            if not str(image_path).startswith(('http://', 'https://')):
                cls.validate_image_file(image_path)
                validated_paths.append(image_path)
        
        return validated_paths

class PandocWrapper:
    """Wrapper for Pandoc command execution"""
    
    @staticmethod
    def check_pandoc_installed() -> bool:
        """Check if Pandoc is installed"""
        try:
            subprocess.run(['pandoc', '--version'], 
                         capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    
    @staticmethod
    def run_pandoc_command(cmd: List[str]) -> subprocess.CompletedProcess:
        """Execute Pandoc command with error handling"""
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result
        except subprocess.CalledProcessError as e:
            raise ValidationError(f"Pandoc conversion failed: {e.stderr}")
        except FileNotFoundError:
            raise ValidationError("Pandoc not found. Please install Pandoc.")

class FileProcessor:
    """Handles file operations and path management"""
    
    @staticmethod
    def ensure_output_dir(output_dir: Path) -> None:
        """Create output directory if it doesn't exist"""
        output_dir.mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    def copy_images_to_output(image_paths: List[Path], 
                            output_dir: Path, 
                            markdown_dir: Path) -> Dict[str, str]:
        """Copy images to output directory and return path mappings"""
        images_dir = output_dir / "images"
        images_dir.mkdir(exist_ok=True)
        
        path_mappings = {}
        
        for image_path in image_paths:
            if image_path.exists():
                # Create unique filename to avoid conflicts
                new_name = f"{image_path.stem}_{hash(str(image_path)) % 10000}{image_path.suffix}"
                new_path = images_dir / new_name
                
                shutil.copy2(image_path, new_path)
                
                # Store mapping for content replacement
                relative_original = os.path.relpath(image_path, markdown_dir)
                relative_new = os.path.relpath(new_path, output_dir)
                path_mappings[relative_original] = relative_new
        
        return path_mappings
    
    @staticmethod
    def update_markdown_image_paths(content: str, path_mappings: Dict[str, str]) -> str:
        """Update image paths in markdown content"""
        import re
        
        updated_content = content
        
        for old_path, new_path in path_mappings.items():
            # Replace in ![alt](path) format
            pattern1 = f'(!\\[.*?\\])\\({re.escape(old_path)}\\)'
            replacement1 = f'\\1({new_path})'
            updated_content = re.sub(pattern1, replacement1, updated_content)
            
            # Replace in <img src="path"> format
            pattern2 = f'(<img[^>]+src=["\']){re.escape(old_path)}(["\'])'
            replacement2 = f'\\1{new_path}\\2'
            updated_content = re.sub(pattern2, replacement2, updated_content)
        
        return updated_content

class MarkdownConverter:
    """Main converter class for markdown to PDF/Word conversion"""
    
    def __init__(self, config: ConversionConfig = None):
        self.config = config or ConversionConfig()
        
        if not PandocWrapper.check_pandoc_installed():
            raise ValidationError("Pandoc is not installed or not in PATH")
    
    def convert_file(self, markdown_file: Union[str, Path]) -> Dict[str, Path]:
        """Convert single markdown file to specified formats"""
        markdown_path = Path(markdown_file)
        
        if not markdown_path.exists():
            raise ValidationError(f"Markdown file not found: {markdown_path}")
        
        # Validate images if enabled
        validated_images = []
        if self.config.validate_images:
            validated_images = ImageValidator.validate_all_images(markdown_path)
        
        # Setup output directory
        output_dir = Path(self.config.output_dir)
        FileProcessor.ensure_output_dir(output_dir)
        
        # Process images
        processed_markdown_path = self._prepare_markdown_with_images(
            markdown_path, output_dir, validated_images
        )
        
        # Convert to requested formats
        output_files = {}
        
        if self.config.output_format in [OutputFormat.PDF, OutputFormat.BOTH]:
            pdf_path = self._convert_to_pdf(processed_markdown_path, output_dir)
            output_files['pdf'] = pdf_path
        
        if self.config.output_format in [OutputFormat.DOCX, OutputFormat.BOTH]:
            docx_path = self._convert_to_docx(processed_markdown_path, output_dir)
            output_files['docx'] = docx_path
        
        # Cleanup temporary processed markdown
        if processed_markdown_path != markdown_path:
            processed_markdown_path.unlink()
        
        return output_files
    
    def convert_multiple(self, markdown_files: List[Union[str, Path]]) -> Dict[str, Dict[str, Path]]:
        """Convert multiple markdown files"""
        results = {}
        
        for markdown_file in markdown_files:
            try:
                file_results = self.convert_file(markdown_file)
                results[str(markdown_file)] = file_results
            except ValidationError as e:
                results[str(markdown_file)] = {'error': str(e)}
        
        return results
    
    def _prepare_markdown_with_images(self, 
                                    markdown_path: Path, 
                                    output_dir: Path, 
                                    image_paths: List[Path]) -> Path:
        """Prepare markdown file with properly referenced images"""
        if not image_paths:
            return markdown_path
        
        # Read original content
        with open(markdown_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Copy images and get path mappings
        path_mappings = FileProcessor.copy_images_to_output(
            image_paths, output_dir, markdown_path.parent
        )
        
        # Update content with new paths
        updated_content = FileProcessor.update_markdown_image_paths(content, path_mappings)
        
        # Write processed markdown
        processed_path = output_dir / f"processed_{markdown_path.name}"
        with open(processed_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        return processed_path
    
    def _convert_to_pdf(self, markdown_path: Path, output_dir: Path) -> Path:
        """Convert markdown to PDF using Pandoc"""
        output_file = output_dir / f"{markdown_path.stem}.pdf"
        
        cmd = [
            'pandoc',
            str(markdown_path),
            '-o', str(output_file),
            f'--pdf-engine={self.config.pdf_engine}',
            f'--dpi={self.config.dpi}',
            '--standalone'
        ]
        
        PandocWrapper.run_pandoc_command(cmd)
        return output_file
    
    def _convert_to_docx(self, markdown_path: Path, output_dir: Path) -> Path:
        """Convert markdown to Word document using Pandoc"""
        output_file = output_dir / f"{markdown_path.stem}.docx"
        
        cmd = [
            'pandoc',
            str(markdown_path),
            '-o', str(output_file),
            '--standalone'
        ]
        
        if self.config.reference_doc:
            cmd.extend(['--reference-doc', self.config.reference_doc])
        
        PandocWrapper.run_pandoc_command(cmd)
        return output_file