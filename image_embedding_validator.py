import re
import os
from typing import Set, List
from validation_result import ValidationResult, ValidationLevel

class ImageEmbeddingValidator:
    def __init__(self):
        self.image_patterns = {
            'markdown': re.compile(r'!\[.*?\]\((.*?)\)'),
            'html': re.compile(r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>', re.IGNORECASE),
            'svg_embed': re.compile(r'<svg[^>]*>.*?</svg>', re.DOTALL | re.IGNORECASE)
        }
    
    def validate_image_embedding(self, document_path: str) -> ValidationResult:
        result = ValidationResult(is_valid=True, issues=[])
        
        if not os.path.exists(document_path):
            result.add_issue(ValidationLevel.ERROR, f"Document not found: {document_path}")
            return result
        
        try:
            with open(document_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            result.add_issue(ValidationLevel.ERROR, 
                           f"Failed to read document: {str(e)}", document_path)
            return result
        
        # Find all image references
        image_refs = self._extract_image_references(content)
        doc_dir = os.path.dirname(document_path)
        
        # Validate each image reference
        for img_ref in image_refs:
            self._validate_image_reference(img_ref, doc_dir, document_path, result)
        
        # Check for embedded SVGs
        svg_count = len(self.image_patterns['svg_embed'].findall(content))
        if svg_count > 0:
            result.add_issue(ValidationLevel.INFO, 
                           f"Found {svg_count} embedded SVG diagrams", document_path)
        
        return result
    
    def _extract_image_references(self, content: str) -> Set[str]:
        refs = set()
        
        # Extract markdown images
        refs.update(self.image_patterns['markdown'].findall(content))
        
        # Extract HTML images
        refs.update(self.image_patterns['html'].findall(content))
        
        return refs
    
    def _validate_image_reference(self, img_ref: str, doc_dir: str, 
                                doc_path: str, result: ValidationResult):
        # Skip data URLs and external URLs
        if img_ref.startswith(('data:', 'http://', 'https://')):
            return
        
        # Resolve relative path
        if not os.path.isabs(img_ref):
            img_path = os.path.join(doc_dir, img_ref)
        else:
            img_path = img_ref
        
        img_path = os.path.normpath(img_path)
        
        if not os.path.exists(img_path):
            result.add_issue(ValidationLevel.ERROR,
                           f"Referenced image not found: {img_ref}",
                           doc_path, f"Resolved path: {img_path}")
        else:
            # Check if it's a valid image file
            if not self._is_valid_image_file(img_path):
                result.add_issue(ValidationLevel.WARNING,
                               f"Referenced file may not be a valid image: {img_ref}",
                               doc_path)
    
    def _is_valid_image_file(self, file_path: str) -> bool:
        valid_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'}
        ext = os.path.splitext(file_path)[1].lower()
        return ext in valid_extensions