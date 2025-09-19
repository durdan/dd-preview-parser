import os
import re
from typing import List
from validation_result import ValidationResult, ValidationLevel

class DocumentQualityValidator:
    def __init__(self):
        self.min_content_length = 100
        self.heading_patterns = {
            'html': re.compile(r'<h[1-6][^>]*>(.+?)</h[1-6]>', re.IGNORECASE | re.DOTALL),
            'markdown': re.compile(r'^#{1,6}\s+(.+)$', re.MULTILINE)
        }
        self.link_patterns = {
            'html': re.compile(r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>', re.IGNORECASE),
            'markdown': re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
        }
    
    def validate_document_quality(self, document_files: List[str]) -> ValidationResult:
        result = ValidationResult(is_valid=True, issues=[])
        
        for doc_file in document_files:
            if not os.path.exists(doc_file):
                result.add_issue(ValidationLevel.ERROR,
                               f"Document file not found: {doc_file}")
                continue
            
            try:
                with open(doc_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                self._validate_document_content(doc_file, content, result)
                
            except Exception as e:
                result.add_issue(ValidationLevel.ERROR,
                               f"Failed to read document: {str(e)}", doc_file)
        
        return result
    
    def _validate_document_content(self, doc_file: str, content: str, result: ValidationResult):
        # Check content length
        clean_content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
        clean_content = re.sub(r'[#*`_\[\]()]', '', clean_content)  # Remove markdown syntax
        clean_content = clean_content.strip()
        
        if len(clean_content) < self.min_content_length:
            result.add_issue(ValidationLevel.WARNING,
                           f"Document content is very short ({len(clean_content)} chars)",
                           doc_file)
        
        # Detect document type and validate structure
        doc_type = self._detect_document_type(content)
        
        # Check for headings
        headings = self._extract_headings(content, doc_type)
        if not headings:
            result.add_issue(ValidationLevel.WARNING,
                           "No headings found in document", doc_file)
        
        # Check for broken links
        self._validate_links(doc_file, content, doc_type, result)
        
        # Check for common formatting issues
        self._check_formatting_issues(doc_file, content, result)
    
    def _detect_document_type(self, content: str) -> str:
        html_tags = len(re.findall(r'<[^>]+>', content))
        markdown_syntax = len(re.findall(r'[#*`_]', content))
        
        return 'html' if html_tags > markdown_syntax else 'markdown'
    
    def _extract_headings(self, content: str, doc_type: str) -> List[str]:
        pattern = self.heading_patterns.get(doc_type)
        if pattern:
            return pattern.findall(content)
        return []
    
    def _validate_links(self, doc_file: str, content: str, doc_type: str, result: ValidationResult):
        pattern = self.link_patterns.get(doc_type)
        if not pattern:
            return
        
        links = pattern.findall(content)
        doc_dir = os.path.dirname(doc_file)
        
        for link_data in links:
            # Handle different regex group structures
            if isinstance(link_data, tuple):
                link_url = link_data[1] if len(link_data) > 1 else link_data[0]
            else:
                link_url = link_data
            
            # Skip external URLs and anchors
            if link_url.startswith(('http://', 'https://', 'mailto:', '#')):
                continue
            
            # Check local file links
            if not link_url.startswith('/'):
                link_path = os.path.join(doc_dir, link_url)
                link_path = os.path.normpath(link_path)
                
                if not os.path.exists(link_path):
                    result.add_issue(ValidationLevel.ERROR,
                                   f"Broken link: {link_url}", doc_file)
    
    def _check_formatting_issues(self, doc_file: str, content: str, result: ValidationResult):
        # Check for multiple consecutive empty lines
        if re.search(r'\n\s*\n\s*\n\s*\n', content):
            result.add_issue(ValidationLevel.WARNING,
                           "Multiple consecutive empty lines found", doc_file)
        
        # Check for trailing whitespace
        lines_with_trailing_space = len(re.findall(r' +$', content, re.MULTILINE))
        if lines_with_trailing_space > 0:
            result.add_issue(ValidationLevel.INFO,
                           f"{lines_with_trailing_space} lines with trailing whitespace", doc_file)