from typing import Dict, List, Set
from collections import defaultdict
from diagram_error import DiagramError

class ErrorPatternOptimizer:
    def __init__(self, cache_size: int = 100, batch_size: int = 5):
        self.cache_size = cache_size
        self.batch_size = batch_size
        self.fix_cache: Dict[str, str] = {}
        self.pattern_frequency: Dict[str, int] = defaultdict(int)
    
    def should_use_cache(self, error: DiagramError) -> bool:
        """Check if we have a cached fix for this error pattern"""
        pattern_key = error.get_pattern_key()
        return pattern_key in self.fix_cache
    
    def get_cached_fix(self, error: DiagramError) -> str:
        """Retrieve cached fix for error pattern"""
        pattern_key = error.get_pattern_key()
        return self.fix_cache.get(pattern_key, "")
    
    def cache_fix(self, error: DiagramError, fix: str) -> None:
        """Cache a fix for future use"""
        pattern_key = error.get_pattern_key()
        
        # Implement LRU-like behavior
        if len(self.fix_cache) >= self.cache_size:
            # Remove least frequent pattern
            least_frequent = min(self.pattern_frequency.items(), key=lambda x: x[1])
            del self.fix_cache[least_frequent[0]]
            del self.pattern_frequency[least_frequent[0]]
        
        self.fix_cache[pattern_key] = fix
        self.pattern_frequency[pattern_key] += 1
    
    def optimize_errors(self, errors: List[DiagramError]) -> Dict[str, List[DiagramError]]:
        """Group errors for batch processing to minimize API calls"""
        cached_errors = []
        uncached_errors = []
        
        for error in errors:
            if self.should_use_cache(error):
                error.suggested_fix = self.get_cached_fix(error)
                cached_errors.append(error)
            else:
                uncached_errors.append(error)
        
        # Group uncached errors by pattern for batch processing
        batched_errors = defaultdict(list)
        for error in uncached_errors:
            pattern_key = error.get_pattern_key()
            batched_errors[pattern_key].append(error)
        
        return {
            'cached': cached_errors,
            'batched': dict(batched_errors)
        }