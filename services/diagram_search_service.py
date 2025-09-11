from typing import List, Dict, Any
from models.diagram_category import SearchCriteria, CategoryType, ModerationStatus
from repositories.admin_diagram_repository import AdminDiagramRepository

class DiagramSearchService:
    def __init__(self, repository: AdminDiagramRepository):
        self.repository = repository
    
    def search_diagrams(self, criteria: SearchCriteria) -> Dict[str, Any]:
        """Search diagrams with pagination and filtering"""
        if criteria.limit > 100:
            raise ValueError("Limit cannot exceed 100")
        
        diagrams = self.repository.get_all_diagrams(criteria)
        
        # Get total count for pagination
        total_criteria = SearchCriteria(
            query=criteria.query,
            category=criteria.category,
            status=criteria.status,
            user_id=criteria.user_id,
            date_from=criteria.date_from,
            date_to=criteria.date_to,
            limit=1000000,  # Large number to get all
            offset=0
        )
        total_count = len(self.repository.get_all_diagrams(total_criteria))
        
        return {
            'diagrams': diagrams,
            'total_count': total_count,
            'page': criteria.offset // criteria.limit + 1,
            'per_page': criteria.limit,
            'has_next': criteria.offset + criteria.limit < total_count,
            'has_prev': criteria.offset > 0
        }
    
    def get_search_suggestions(self, query: str) -> List[str]:
        """Get search suggestions based on existing diagram titles"""
        if not query or len(query) < 2:
            return []
        
        criteria = SearchCriteria(query=query, limit=10)
        diagrams = self.repository.get_all_diagrams(criteria)
        
        suggestions = []
        for diagram in diagrams:
            title = diagram.get('title', '')
            if title and title.lower().startswith(query.lower()):
                suggestions.append(title)
        
        return list(set(suggestions))[:5]  # Return unique suggestions, max 5
    
    def get_category_stats(self) -> Dict[str, int]:
        """Get diagram count by category"""
        categories = self.repository.get_all_categories()
        stats = {}
        
        for category in categories:
            criteria = SearchCriteria(category=category.type, limit=1000000)
            count = len(self.repository.get_all_diagrams(criteria))
            stats[category.type.value] = count
        
        return stats
    
    def get_moderation_stats(self) -> Dict[str, int]:
        """Get diagram count by moderation status"""
        stats = {}
        
        for status in ModerationStatus:
            criteria = SearchCriteria(status=status, limit=1000000)
            count = len(self.repository.get_all_diagrams(criteria))
            stats[status.value] = count
        
        return stats