from typing import Dict, Any, Optional
from collections import OrderedDict
import time

class LRUCache:
    """LRU Cache implementation"""
    
    def __init__(self, capacity: int = 100):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.access_times = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get item from cache"""
        if key in self.cache:
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            self.access_times[key] = time.time()
            return self.cache[key]
        return None
    
    def put(self, key: str, value: Any) -> None:
        """Put item in cache"""
        if key in self.cache:
            self.cache.move_to_end(key)
        else:
            if len(self.cache) >= self.capacity:
                # Remove least recently used
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
                del self.access_times[oldest_key]
            
        self.cache[key] = value
        self.access_times[key] = time.time()
    
    def invalidate(self, key: str) -> None:
        """Remove item from cache"""
        if key in self.cache:
            del self.cache[key]
            del self.access_times[key]
    
    def clear(self) -> None:
        """Clear all cache"""
        self.cache.clear()
        self.access_times.clear()
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "size": len(self.cache),
            "capacity": self.capacity,
            "keys": list(self.cache.keys())
        }

class CacheManager:
    """Manages caching for diagram service"""
    
    def __init__(self, cache_size: int = 100):
        self.diagram_cache = LRUCache(cache_size)
        self.metadata_cache = LRUCache(cache_size // 2)
        self.hit_count = 0
        self.miss_count = 0
    
    def get_diagram(self, diagram_id: str) -> Optional[Dict[str, Any]]:
        """Get diagram from cache"""
        result = self.diagram_cache.get(diagram_id)
        if result:
            self.hit_count += 1
        else:
            self.miss_count += 1
        return result
    
    def cache_diagram(self, diagram_id: str, diagram_data: Dict[str, Any]) -> None:
        """Cache diagram data"""
        self.diagram_cache.put(diagram_id, diagram_data)
    
    def get_metadata(self, diagram_id: str) -> Optional[Dict[str, Any]]:
        """Get metadata from cache"""
        return self.metadata_cache.get(diagram_id)
    
    def cache_metadata(self, diagram_id: str, metadata: Dict[str, Any]) -> None:
        """Cache metadata"""
        self.metadata_cache.put(diagram_id, metadata)
    
    def invalidate_diagram(self, diagram_id: str) -> None:
        """Invalidate cached diagram and metadata"""
        self.diagram_cache.invalidate(diagram_id)
        self.metadata_cache.invalidate(diagram_id)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hit_count + self.miss_count
        hit_rate = self.hit_count / total_requests if total_requests > 0 else 0
        
        return {
            "hit_count": self.hit_count,
            "miss_count": self.miss_count,
            "hit_rate": hit_rate,
            "diagram_cache": self.diagram_cache.stats(),
            "metadata_cache": self.metadata_cache.stats()
        }