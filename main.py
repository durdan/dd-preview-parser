"""
Task Management System
A simple task management API with user authentication and task CRUD operations.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, asdict
from enum import Enum
import json


class TaskStatus(Enum):
    """Task status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Priority(Enum):
    """Task priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


@dataclass
class Task:
    """
    Task data model.
    
    Attributes:
        id: Unique task identifier
        title: Task title (required)
        description: Detailed task description
        status: Current task status
        priority: Task priority level
        created_at: Task creation timestamp
        updated_at: Last update timestamp
        due_date: Optional due date
        assignee: Optional user assigned to task
    """
    id: str
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM
    created_at: datetime = None
    updated_at: datetime = None
    due_date: Optional[datetime] = None
    assignee: Optional[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.updated_at is None:
            self.updated_at = datetime.now()


class TaskRepository:
    """
    Task data persistence layer.
    Handles CRUD operations for tasks.
    """
    
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
        self._next_id = 1
    
    def create(self, task_data: Dict[str, Any]) -> Task:
        """Create a new task."""
        task_id = str(self._next_id)
        self._next_id += 1
        
        task = Task(
            id=task_id,
            title=task_data["title"],
            description=task_data.get("description", ""),
            status=TaskStatus(task_data.get("status", TaskStatus.PENDING.value)),
            priority=Priority(task_data.get("priority", Priority.MEDIUM.value)),
            due_date=task_data.get("due_date"),
            assignee=task_data.get("assignee")
        )
        
        self._tasks[task_id] = task
        return task
    
    def get_by_id(self, task_id: str) -> Optional[Task]:
        """Retrieve task by ID."""
        return self._tasks.get(task_id)
    
    def get_all(self) -> List[Task]:
        """Retrieve all tasks."""
        return list(self._tasks.values())
    
    def update(self, task_id: str, updates: Dict[str, Any]) -> Optional[Task]:
        """Update existing task."""
        task = self._tasks.get(task_id)
        if not task:
            return None
        
        for key, value in updates.items():
            if hasattr(task, key):
                setattr(task, key, value)
        
        task.updated_at = datetime.now()
        return task
    
    def delete(self, task_id: str) -> bool:
        """Delete task by ID."""
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False


class TaskService:
    """
    Task business logic layer.
    Handles task operations with validation and business rules.
    """
    
    def __init__(self, repository: TaskRepository):
        self.repository = repository
    
    def create_task(self, title: str, description: str = "", 
                   priority: str = "medium", assignee: str = None) -> Task:
        """
        Create a new task with validation.
        
        Args:
            title: Task title (required, non-empty)
            description: Task description
            priority: Task priority (low, medium, high, urgent)
            assignee: Optional user to assign task to
            
        Returns:
            Created Task object
            
        Raises:
            ValueError: If validation fails
        """
        if not title or not title.strip():
            raise ValueError("Task title is required")
        
        if priority not in [p.value for p in Priority]:
            raise ValueError(f"Invalid priority. Must be one of: {[p.value for p in Priority]}")
        
        task_data = {
            "title": title.strip(),
            "description": description,
            "priority": priority,
            "assignee": assignee
        }
        
        return self.repository.create(task_data)
    
    def get_task(self, task_id: str) -> Task:
        """
        Get task by ID.
        
        Raises:
            ValueError: If task not found
        """
        task = self.repository.get_by_id(task_id)
        if not task:
            raise ValueError(f"Task with ID {task_id} not found")
        return task
    
    def update_task_status(self, task_id: str, status: str) -> Task:
        """
        Update task status with validation.
        
        Raises:
            ValueError: If task not found or invalid status
        """
        if status not in [s.value for s in TaskStatus]:
            raise ValueError(f"Invalid status. Must be one of: {[s.value for s in TaskStatus]}")
        
        task = self.get_task(task_id)
        return self.repository.update(task_id, {"status": TaskStatus(status)})
    
    def list_tasks(self, status_filter: str = None) -> List[Task]:
        """
        List all tasks with optional status filtering.
        """
        tasks = self.repository.get_all()
        
        if status_filter:
            if status_filter not in [s.value for s in TaskStatus]:
                raise ValueError(f"Invalid status filter: {status_filter}")
            tasks = [t for t in tasks if t.status.value == status_filter]
        
        return sorted(tasks, key=lambda t: t.created_at, reverse=True)


class TaskAPI:
    """
    Task API interface.
    Provides HTTP-like interface for task operations.
    """
    
    def __init__(self):
        self.service = TaskService(TaskRepository())
    
    def create_task(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create task endpoint."""
        try:
            task = self.service.create_task(
                title=request_data.get("title"),
                description=request_data.get("description", ""),
                priority=request_data.get("priority", "medium"),
                assignee=request_data.get("assignee")
            )
            return {"success": True, "data": self._task_to_dict(task)}
        except ValueError as e:
            return {"success": False, "error": str(e)}
    
    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get task endpoint."""
        try:
            task = self.service.get_task(task_id)
            return {"success": True, "data": self._task_to_dict(task)}
        except ValueError as e:
            return {"success": False, "error": str(e)}
    
    def update_task_status(self, task_id: str, status: str) -> Dict[str, Any]:
        """Update task status endpoint."""
        try:
            task = self.service.update_task_status(task_id, status)
            return {"success": True, "data": self._task_to_dict(task)}
        except ValueError as e:
            return {"success": False, "error": str(e)}
    
    def list_tasks(self, status_filter: str = None) -> Dict[str, Any]:
        """List tasks endpoint."""
        try:
            tasks = self.service.list_tasks(status_filter)
            return {
                "success": True, 
                "data": [self._task_to_dict(task) for task in tasks]
            }
        except ValueError as e:
            return {"success": False, "error": str(e)}
    
    def _task_to_dict(self, task: Task) -> Dict[str, Any]:
        """Convert Task object to dictionary for JSON serialization."""
        data = asdict(task)
        data["status"] = task.status.value
        data["priority"] = task.priority.value
        data["created_at"] = task.created_at.isoformat()
        data["updated_at"] = task.updated_at.isoformat()
        if task.due_date:
            data["due_date"] = task.due_date.isoformat()
        return data