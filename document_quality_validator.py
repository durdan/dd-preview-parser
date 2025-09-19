import re
import os
from validation_result import ValidationResult, ValidationLevel

class DocumentQualityValidator:
    def __init__(self):
        self.heading_pattern = re.compile(r'^#{1,6}\s+.+$', re.MULTILINE)
        self.link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
        self.empty_line_pattern = re.compile(r'\n\s*\n\s*\n')
        
    def validate_document_quality(self, document_path: str) -> ValidationResult:
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
        
        self._check_document_structure(content, document_path, result)
        self._check_content_quality(content, document_path, result)
        self._validate_links(content, document_path, result)
        
        return result
    
    def _check_document_structure(self, content: str, document_path: str, result: ValidationResult):
        lines = content.split('\n')
        
        # Check for title (first heading)
        headings = self.heading_pattern.findall(content)
        if not headings:
            result.add_issue(ValidationLevel.WARNING,
                           "No headings found in document", document_path)
        
        # Check for excessive empty lines
        excessive_empty = self.empty_line_pattern.findall(content)
        if excessive_empty:
            result.add_issue(ValidationLevel.WARNING,
                           f"Found {len(excessive_empty)} instances of excessive empty lines",
                           document_path)
        
        # Check minimum content length
        content_length = len(content.strip())
        if content_length < 100:
            result.add_issue(ValidationLevel.WARNING,
                           f"Document seems very short ({content_length} characters)",
                           document_path)
    
    def _check_content_quality(self, content: str, document_path: str, result: ValidationResult):
        # Check for common formatting issues
        if '  ' in content:  # Multiple spaces
            result.add_issue(ValidationLevel.INFO,
                           "Multiple consecutive spaces found", document_path)
        
        # Check for missing alt text in images
        img_without_alt = re.findall(r'!\[\s*\]\([^)]+\)', content)
        if img_without_alt:
            result.add_issue(ValidationLevel.WARNING,
                           f"Found {len(img_without_alt)} images without alt text",
                           document_path)
    
    def _validate_links(self, content: str, document_path: str, result: ValidationResult):
        links = self.link_pattern.findall(content)
        doc_dir = os.path.dirname(document_path)
        
        for link_text, link_url in links:
            # Skip external links
            if link_url.startswith(('http://', 'https://', 'mailto:', '#')):
                continue
            
            # Check internal links
            link_path = os.path.join(doc_dir, link_url)
            link_path = os.path.normpath(link_path)
            
            if not os.path.exists(link_path):
                result.add_issue(ValidationLevel.ERROR,
                               f"Broken internal link: {link_url}",
                               document_path, f"Link text: '{link_text}'")