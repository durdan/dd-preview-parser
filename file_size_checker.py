import os
from typing import Dict
from validation_result import ValidationResult, ValidationLevel

class FileSizeChecker:
    def __init__(self, max_file_size_mb: float = 50, max_image_size_mb: float = 10):
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024
        self.max_image_size_bytes = max_image_size_mb * 1024 * 1024
    
    def validate_file_sizes(self, file_paths: list) -> ValidationResult:
        result = ValidationResult(is_valid=True, issues=[])
        
        for file_path in file_paths:
            if not os.path.exists(file_path):
                result.add_issue(ValidationLevel.ERROR, 
                               f"File not found: {file_path}")
                continue
            
            file_size = os.path.getsize(file_path)
            max_size = self._get_max_size_for_file(file_path)
            
            if file_size > max_size:
                size_mb = file_size / (1024 * 1024)
                max_mb = max_size / (1024 * 1024)
                result.add_issue(ValidationLevel.ERROR,
                               f"File too large: {size_mb:.2f}MB > {max_mb:.2f}MB",
                               file_path)
            elif file_size == 0:
                result.add_issue(ValidationLevel.ERROR,
                               "File is empty", file_path)
        
        return result
    
    def _get_max_size_for_file(self, file_path: str) -> int:
        image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
        ext = os.path.splitext(file_path)[1].lower()
        return self.max_image_size_bytes if ext in image_extensions else self.max_file_size_bytes