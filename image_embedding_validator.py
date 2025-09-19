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
        
        # Validate each image reference
        for img_ref in image_refs:
            self._validate_image_reference(img_ref, document_path, result)
        
        # Check for inline SVGs
        inline_svgs = self.image_patterns['svg_embed'].findall(content)
        if inline_svgs:
            result.add_issue(ValidationLevel.INFO,
                           f"Found {len(inline_svgs)} inline SVG(s)", document_path)
        
        return result
    
    def _extract_image_references(self, content: str) -> Set[str]:
        image_refs = set()
        
        # Extract markdown images
        image_refs.update(self.image_patterns['markdown'].findall(content))
        
        # Extract HTML images
        image_refs.update(self.image_patterns['html'].findall(content))
        
        return image_refs
    
    def _validate_image_reference(self, img_ref: str, document_path: str, result: ValidationResult):
        # Skip data URLs and external URLs
        if img_ref.startswith(('data:', 'http://', 'https://')):
            return
        
        # Resolve relative paths
        doc_dir = os.path.dirname(document_path)
        img_path = os.path.join(doc_dir, img_ref)
        img_path = os.path.normpath(img_path)
        
        if not os.path.exists(img_path):
            result.add_issue(ValidationLevel.ERROR,
                           f"Referenced image not found: {img_ref}",
                           document_path, f"Resolved path: {img_path}")
        else:
            # Check if it's actually an image
            if not self._is_valid_image_file(img_path):
                result.add_issue(ValidationLevel.WARNING,
                               f"Referenced file may not be a valid image: {img_ref}",
                               document_path)
    
    def _is_valid_image_file(self, file_path: str) -> bool:
        image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'}
        return os.path.splitext(file_path)[1].lower() in image_extensions