import os
from typing import Dict
from validation_result import ValidationResult, ValidationLevel

class FileSizeChecker:
    def __init__(self, max_file_size_mb: float = 50, max_image_size_mb: float = 10):
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024
        self.max_image_size_bytes = max_image_size_mb * 1024 * 1024
        self.image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}
    
    def validate_file_sizes(self, file_paths: list) -> ValidationResult:
        result = ValidationResult(is_valid=True, issues=[])
        
        for file_path in file_paths:
            if not os.path.exists(file_path):
                result.add_issue(ValidationLevel.ERROR, 
                               f"File not found: {file_path}")
                continue
            
            file_size = os.path.getsize(file_path)
            file_ext = os.path.splitext(file_path)[1].lower()
            
            # Check image file sizes
            if file_ext in self.image_extensions:
                if file_size > self.max_image_size_bytes:
                    result.add_issue(ValidationLevel.ERROR,
                                   f"Image file too large: {file_size / (1024*1024):.1f}MB",
                                   file_path,
                                   f"Maximum allowed: {self.max_image_size_bytes / (1024*1024):.1f}MB")
                elif file_size > self.max_image_size_bytes * 0.8:
                    result.add_issue(ValidationLevel.WARNING,
                                   f"Image file approaching size limit: {file_size / (1024*1024):.1f}MB",
                                   file_path)
            
            # Check general file sizes
            elif file_size > self.max_file_size_bytes:
                result.add_issue(ValidationLevel.ERROR,
                               f"File too large: {file_size / (1024*1024):.1f}MB",
                               file_path,
                               f"Maximum allowed: {self.max_file_size_bytes / (1024*1024):.1f}MB")
            
            # Check for empty files
            if file_size == 0:
                result.add_issue(ValidationLevel.ERROR,
                               f"Empty file detected", file_path)
        
        return result