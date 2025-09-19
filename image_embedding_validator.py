import os
import re
from typing import Set, List
from validation_result import ValidationResult, ValidationLevel

class ImageEmbeddingValidator:
    def __init__(self):
        self.image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
        # Patterns for different image embedding formats
        self.html_img_pattern = re.compile(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', re.IGNORECASE)
        self.markdown_img_pattern = re.compile(r'!\[[^\]]*\]\(([^)]+)\)')
        self.base64_pattern = re.compile(r'data:image/[^;]+;base64,')
    
    def validate_image_embedding(self, document_files: List[str], 
                                image_directory: str = None) -> ValidationResult:
        result = ValidationResult(is_valid=True, issues=[])
        
        for doc_file in document_files:
            if not os.path.exists(doc_file):
                result.add_issue(ValidationLevel.ERROR, 
                               f"Document file not found: {doc_file}")
                continue
            
            try:
                with open(doc_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self._validate_document_images(doc_file, content, result, image_directory)
                
            except Exception as e:
                result.add_issue(ValidationLevel.ERROR,
                               f"Failed to read document: {str(e)}", doc_file)
        
        return result
    
    def _validate_document_images(self, doc_file: str, content: str, 
                                 result: ValidationResult, image_directory: str):
        # Find all image references
        html_images = self.html_img_pattern.findall(content)
        markdown_images = self.markdown_img_pattern.findall(content)
        all_image_refs = html_images + markdown_images
        
        # Check for base64 embedded images
        base64_images = len(self.base64_pattern.findall(content))
        if base64_images > 0:
            result.add_issue(ValidationLevel.INFO,
                           f"Found {base64_images} base64 embedded images", doc_file)
        
        # Validate each image reference
        for img_ref in all_image_refs:
            self._validate_image_reference(doc_file, img_ref, result, image_directory)
        
        if not all_image_refs and not base64_images:
            # Check if there should be images based on file structure
            if image_directory and os.path.exists(image_directory):
                image_files = self._find_image_files(image_directory)
                if image_files:
                    result.add_issue(ValidationLevel.WARNING,
                                   f"No images embedded but {len(image_files)} images found in directory",
                                   doc_file)
    
    def _validate_image_reference(self, doc_file: str, img_ref: str, 
                                 result: ValidationResult, image_directory: str):
        # Skip URLs and base64 data
        if img_ref.startswith(('http://', 'https://', 'data:')):
            return
        
        # Resolve relative paths
        doc_dir = os.path.dirname(doc_file)
        if img_ref.startswith('./') or not img_ref.startswith('/'):
            img_path = os.path.join(doc_dir, img_ref)
        else:
            img_path = img_ref
        
        img_path = os.path.normpath(img_path)
        
        # Check if image file exists
        if not os.path.exists(img_path):
            result.add_issue(ValidationLevel.ERROR,
                           f"Referenced image not found: {img_ref}", doc_file)
        else:
            # Check if it's a valid image file
            _, ext = os.path.splitext(img_path)
            if ext.lower() not in self.image_extensions:
                result.add_issue(ValidationLevel.WARNING,
                               f"Unusual image extension: {ext}", doc_file)
    
    def _find_image_files(self, directory: str) -> List[str]:
        image_files = []
        for root, dirs, files in os.walk(directory):
            for file in files:
                _, ext = os.path.splitext(file)
                if ext.lower() in self.image_extensions:
                    image_files.append(os.path.join(root, file))
        return image_files