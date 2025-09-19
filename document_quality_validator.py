import re
import os
from validation_result import ValidationResult, ValidationLevel

class DocumentQualityValidator:
    def __init__(self):
        self.heading_pattern = re.compile(r'^#{1,6}\s+.+$', re.MULTILINE)
        self.link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
        self.empty_link_pattern = re.compile(r'\[([^\]]*)\]\(\s*\)')
        self.broken_markup_patterns = [
            re.compile(r'<[^>]*$'),  # Unclosed HTML tags
            re.compile(r'^[^<]*>'),  # Orphaned closing tags
        ]
    
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
        self._check_links(content, document_path, result)
        self._check_markup_quality(content, document_path, result)
        self._check_content_quality(content, document_path, result)
        
        return result
    
    def _check_document_structure(self, content: str, doc_path: str, result: ValidationResult):
        lines = content.split('\n')
        
        # Check for headings
        headings = self.heading_pattern.findall(content)
        if not headings:
            result.add_issue(ValidationLevel.WARNING,
                           "Document has no headings", doc_path)
        
        # Check for very short documents
        if len(content.strip()) < 100:
            result.add_issue(ValidationLevel.WARNING,
                           "Document appears to be very short", doc_path)
        
        # Check for extremely long lines
        for i, line in enumerate(lines, 1):
            if len(line) > 200:
                result.add_issue(ValidationLevel.INFO,
                               f"Very long line at line {i} ({len(line)} chars)",
                               doc_path)
    
    def _check_links(self, content: str, doc_path: str, result: ValidationResult):
        # Find empty links
        empty_links = self.empty_link_pattern.findall(content)
        for link_text in empty_links:
            result.add_issue(ValidationLevel.ERROR,
                           f"Empty link found: [{link_text}]()",
                           doc_path)
        
        # Check internal links
        links = self.link_pattern.findall(content)
        doc_dir = os.path.dirname(doc_path)
        
        for link_text, link_url in links:
            if link_url.startswith(('http://', 'https://', 'mailto:', '#')):
                continue  # Skip external links and anchors
            
            # Check internal file links
            if not os.path.isabs(link_url):
                full_path = os.path.join(doc_dir, link_url)
            else:
                full_path = link_url
            
            if not os.path.exists(full_path):
                result.add_issue(ValidationLevel.ERROR,
                               f"Broken internal link: {link_url}",
                               doc_path)
    
    def _check_markup_quality(self, content: str, doc_path: str, result: ValidationResult):
        for pattern in self.broken_markup_patterns:
            matches = pattern.findall(content)
            if matches:
                result.add_issue(ValidationLevel.WARNING,
                               f"Potentially broken markup found: {matches[0][:50]}...",
                               doc_path)
    
    def _check_content_quality(self, content: str, doc_path: str, result: ValidationResult):
        # Check for placeholder text
        placeholders = ['TODO', 'FIXME', 'XXX', 'lorem ipsum']
        for placeholder in placeholders:
            if placeholder.lower() in content.lower():
                result.add_issue(ValidationLevel.WARNING,
                               f"Placeholder text found: {placeholder}",
                               doc_path)