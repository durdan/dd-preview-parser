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
        
        if image_path.stat().st_size == 0:
            raise ValidationError(f"Image file is empty: {image_path}")
        
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
                if not os.path.isabs(match):
                    image_path = base_dir / match
                else:
                    image_path = Path(match)
                image_paths.append(image_path)
        
        return image_paths
    
    @classmethod
    def validate_markdown_images(cls, markdown_file: Path) -> List[Path]:
        """Validate all images referenced in markdown file"""
        with open(markdown_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        base_dir = markdown_file.parent
        image_paths = cls.extract_image_paths(content, base_dir)
        
        validated_paths = []
        for image_path in image_paths:
            cls.validate_image_file(image_path)
            validated_paths.append(image_path)
        
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
    def copy_images_to_output(image_paths: List[Path], output_dir: Path) -> Dict[Path, Path]:
        """Copy images to output directory and return mapping"""
        images_dir = output_dir / "images"
        FileProcessor.ensure_directory(images_dir)
        
        image_mapping = {}
        for image_path in image_paths:
            if image_path.exists():
                dest_path = images_dir / image_path.name
                # Handle name conflicts
                counter = 1
                while dest_path.exists():
                    stem = image_path.stem
                    suffix = image_path.suffix
                    dest_path = images_dir / f"{stem}_{counter}{suffix}"
                    counter += 1
                
                shutil.copy2(image_path, dest_path)
                image_mapping[image_path] = dest_path
        
        return image_mapping
    
    @staticmethod
    def update_markdown_image_paths(markdown_content: str, image_mapping: Dict[Path, Path]) -> str:
        """Update image paths in markdown content"""
        import re
        
        updated_content = markdown_content
        
        for original_path, new_path in image_mapping.items():
            # Update relative path references
            relative_new_path = f"images/{new_path.name}"
            
            # Replace in ![alt](path) format
            pattern1 = re.escape(str(original_path))
            updated_content = re.sub(pattern1, relative_new_path, updated_content)
            
            # Replace in <img src="path"> format
            pattern2 = f'src=["\'].*?{re.escape(original_path.name)}["\']'
            replacement2 = f'src="{relative_new_path}"'
            updated_content = re.sub(pattern2, replacement2, updated_content)
        
        return updated_content

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
    def convert_to_pdf(input_file: Path, output_file: Path, config: ConversionConfig) -> bool:
        """Convert markdown to PDF using Pandoc"""
        cmd = [
            'pandoc',
            str(input_file),
            '-o', str(output_file),
            '--pdf-engine', config.pdf_engine,
            '--standalone'
        ]
        
        if config.template:
            cmd.extend(['--template', config.template])
        
        if config.css_file:
            cmd.extend(['--css', config.css_file])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            raise ValidationError(f"PDF conversion failed: {e.stderr}")
    
    @staticmethod
    def convert_to_docx(input_file: Path, output_file: Path, config: ConversionConfig) -> bool:
        """Convert markdown to Word document using Pandoc"""
        cmd = [
            'pandoc',
            str(input_file),
            '-o', str(output_file),
            '--standalone'
        ]
        
        if config.reference_doc:
            cmd.extend(['--reference-doc', config.reference_doc])
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            raise ValidationError(f"DOCX conversion failed: {e.stderr}")

class MarkdownConverter:
    """Main converter class"""
    
    def __init__(self, config: ConversionConfig = None):
        self.config = config or ConversionConfig()
        
        if not PandocWrapper.check_pandoc_available():
            raise ValidationError("Pandoc is not available. Please install Pandoc.")
    
    def convert_file(self, markdown_file: Union[str, Path]) -> Dict[str, Path]:
        """Convert a single markdown file to specified formats"""
        markdown_path = Path(markdown_file)
        
        if not markdown_path.exists():
            raise ValidationError(f"Markdown file not found: {markdown_path}")
        
        # Validate images
        image_paths = ImageValidator.validate_markdown_images(markdown_path)
        
        # Setup output directory
        output_dir = FileProcessor.ensure_directory(self.config.output_dir)
        
        # Copy images and update paths
        image_mapping = FileProcessor.copy_images_to_output(image_paths, output_dir)
        
        # Read and update markdown content
        with open(markdown_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated_content = FileProcessor.update_markdown_image_paths(content, image_mapping)
        
        # Create temporary markdown file with updated paths
        temp_md_file = output_dir / f"temp_{markdown_path.name}"
        with open(temp_md_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        
        # Convert to requested formats
        output_files = {}
        base_name = markdown_path.stem
        
        try:
            if self.config.output_format in [OutputFormat.PDF, OutputFormat.BOTH]:
                pdf_file = output_dir / f"{base_name}.pdf"
                PandocWrapper.convert_to_pdf(temp_md_file, pdf_file, self.config)
                output_files['pdf'] = pdf_file
            
            if self.config.output_format in [OutputFormat.DOCX, OutputFormat.BOTH]:
                docx_file = output_dir / f"{base_name}.docx"
                PandocWrapper.convert_to_docx(temp_md_file, docx_file, self.config)
                output_files['docx'] = docx_file
        
        finally:
            # Clean up temporary file
            if temp_md_file.exists():
                temp_md_file.unlink()
        
        return output_files
    
    def convert_directory(self, input_dir: Union[str, Path]) -> Dict[str, Dict[str, Path]]:
        """Convert all markdown files in a directory"""
        input_path = Path(input_dir)
        
        if not input_path.is_dir():
            raise ValidationError(f"Input directory not found: {input_path}")
        
        markdown_files = list(input_path.glob("*.md")) + list(input_path.glob("*.markdown"))
        
        if not markdown_files:
            raise ValidationError(f"No markdown files found in: {input_path}")
        
        results = {}
        for md_file in markdown_files:
            try:
                results[str(md_file)] = self.convert_file(md_file)
            except ValidationError as e:
                print(f"Warning: Failed to convert {md_file}: {e}")
                results[str(md_file)] = {"error": str(e)}
        
        return results