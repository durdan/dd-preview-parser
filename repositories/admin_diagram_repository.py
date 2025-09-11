from typing import List, Optional, Dict, Any
from datetime import datetime
import sqlite3
from contextlib import contextmanager

from models.diagram_category import DiagramCategory, ModerationAction, SearchCriteria, CategoryType, ModerationStatus

class AdminDiagramRepository:
    def __init__(self, db_path: str = "diagrams.db"):
        self.db_path = db_path
        self._init_tables()
    
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def _init_tables(self):
        with self.get_connection() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS diagram_categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    type TEXT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                
                CREATE TABLE IF NOT EXISTS diagram_moderation (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    diagram_id INTEGER NOT NULL,
                    admin_id INTEGER NOT NULL,
                    action TEXT NOT NULL,
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (diagram_id) REFERENCES diagrams (id)
                );
                
                CREATE TABLE IF NOT EXISTS diagram_category_mapping (
                    diagram_id INTEGER,
                    category_id INTEGER,
                    PRIMARY KEY (diagram_id, category_id),
                    FOREIGN KEY (diagram_id) REFERENCES diagrams (id),
                    FOREIGN KEY (category_id) REFERENCES diagram_categories (id)
                );
                
                -- Add moderation status to diagrams table if not exists
                ALTER TABLE diagrams ADD COLUMN moderation_status TEXT DEFAULT 'pending';
                ALTER TABLE diagrams ADD COLUMN category_id INTEGER;
            """)
            conn.commit()
    
    def get_all_diagrams(self, criteria: SearchCriteria) -> List[Dict[str, Any]]:
        query = """
            SELECT d.*, u.username, dc.name as category_name, dc.type as category_type
            FROM diagrams d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN diagram_categories dc ON d.category_id = dc.id
            WHERE 1=1
        """
        params = []
        
        if criteria.query:
            query += " AND (d.title LIKE ? OR d.description LIKE ?)"
            params.extend([f"%{criteria.query}%", f"%{criteria.query}%"])
        
        if criteria.category:
            query += " AND dc.type = ?"
            params.append(criteria.category.value)
        
        if criteria.status:
            query += " AND d.moderation_status = ?"
            params.append(criteria.status.value)
        
        if criteria.user_id:
            query += " AND d.user_id = ?"
            params.append(criteria.user_id)
        
        if criteria.date_from:
            query += " AND d.created_at >= ?"
            params.append(criteria.date_from.isoformat())
        
        if criteria.date_to:
            query += " AND d.created_at <= ?"
            params.append(criteria.date_to.isoformat())
        
        query += " ORDER BY d.created_at DESC LIMIT ? OFFSET ?"
        params.extend([criteria.limit, criteria.offset])
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_diagram_by_id(self, diagram_id: int) -> Optional[Dict[str, Any]]:
        query = """
            SELECT d.*, u.username, dc.name as category_name, dc.type as category_type
            FROM diagrams d
            LEFT JOIN users u ON d.user_id = u.id
            LEFT JOIN diagram_categories dc ON d.category_id = dc.id
            WHERE d.id = ?
        """
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, [diagram_id])
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def update_diagram(self, diagram_id: int, updates: Dict[str, Any]) -> bool:
        if not updates:
            return False
        
        set_clause = ", ".join([f"{key} = ?" for key in updates.keys()])
        query = f"UPDATE diagrams SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
        params = list(updates.values()) + [diagram_id]
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, params)
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_diagram(self, diagram_id: int) -> bool:
        with self.get_connection() as conn:
            # Delete related records first
            conn.execute("DELETE FROM diagram_category_mapping WHERE diagram_id = ?", [diagram_id])
            conn.execute("DELETE FROM diagram_moderation WHERE diagram_id = ?", [diagram_id])
            
            # Delete the diagram
            cursor = conn.execute("DELETE FROM diagrams WHERE id = ?", [diagram_id])
            conn.commit()
            return cursor.rowcount > 0
    
    def create_category(self, category: DiagramCategory) -> int:
        query = """
            INSERT INTO diagram_categories (name, type, description)
            VALUES (?, ?, ?)
        """
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, [category.name, category.type.value, category.description])
            conn.commit()
            return cursor.lastrowid
    
    def get_all_categories(self) -> List[DiagramCategory]:
        query = "SELECT * FROM diagram_categories ORDER BY name"
        
        with self.get_connection() as conn:
            cursor = conn.execute(query)
            return [
                DiagramCategory(
                    id=row['id'],
                    name=row['name'],
                    type=CategoryType(row['type']),
                    description=row['description'],
                    created_at=datetime.fromisoformat(row['created_at'])
                )
                for row in cursor.fetchall()
            ]
    
    def add_moderation_action(self, action: ModerationAction) -> int:
        query = """
            INSERT INTO diagram_moderation (diagram_id, admin_id, action, reason)
            VALUES (?, ?, ?, ?)
        """
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, [
                action.diagram_id, action.admin_id, action.action.value, action.reason
            ])
            
            # Update diagram status
            conn.execute(
                "UPDATE diagrams SET moderation_status = ? WHERE id = ?",
                [action.action.value, action.diagram_id]
            )
            
            conn.commit()
            return cursor.lastrowid
    
    def get_moderation_history(self, diagram_id: int) -> List[ModerationAction]:
        query = """
            SELECT dm.*, u.username as admin_username
            FROM diagram_moderation dm
            LEFT JOIN users u ON dm.admin_id = u.id
            WHERE dm.diagram_id = ?
            ORDER BY dm.created_at DESC
        """
        
        with self.get_connection() as conn:
            cursor = conn.execute(query, [diagram_id])
            return [
                ModerationAction(
                    id=row['id'],
                    diagram_id=row['diagram_id'],
                    admin_id=row['admin_id'],
                    action=ModerationStatus(row['action']),
                    reason=row['reason'],
                    created_at=datetime.fromisoformat(row['created_at'])
                )
                for row in cursor.fetchall()
            ]