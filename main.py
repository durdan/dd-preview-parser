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
    Task persistence layer.
    Handles storage and retrieval of tasks.
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
    Handles task operations and validation.
    """
    
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def create_task(self, task_data: Dict[str, Any]) -> Task:
        """
        Create a new task with validation.
        
        Args:
            task_data: Dictionary containing task information
            
        Returns:
            Created Task object
            
        Raises:
            ValueError: If required fields are missing or invalid
        """
        self._validate_task_data(task_data)
        return self.repository.create(task_data)

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get task by ID."""
        if not task_id:
            raise ValueError("Task ID is required")
        return self.repository.get_by_id(task_id)

    def list_tasks(self, status: Optional[str] = None, assignee: Optional[str] = None) -> List[Task]:
        """
        List tasks with optional filtering.
        
        Args:
            status: Filter by task status
            assignee: Filter by assignee
            
        Returns:
            List of matching tasks
        """
        tasks = self.repository.get_all()
        
        if status:
            tasks = [t for t in tasks if t.status.value == status]
        if assignee:
            tasks = [t for t in tasks if t.assignee == assignee]
            
        return tasks

    def update_task(self, task_id: str, updates: Dict[str, Any]) -> Optional[Task]:
        """Update task with validation."""
        if not task_id:
            raise ValueError("Task ID is required")
            
        self._validate_updates(updates)
        return self.repository.update(task_id, updates)

    def delete_task(self, task_id: str) -> bool:
        """Delete task by ID."""
        if not task_id:
            raise ValueError("Task ID is required")
        return self.repository.delete(task_id)

    def _validate_task_data(self, data: Dict[str, Any]) -> None:
        """Validate task creation data."""
        if not data.get("title", "").strip():
            raise ValueError("Task title is required")
            
        if "status" in data:
            try:
                TaskStatus(data["status"])
            except ValueError:
                raise ValueError(f"Invalid status: {data['status']}")
                
        if "priority" in data:
            try:
                Priority(data["priority"])
            except ValueError:
                raise ValueError(f"Invalid priority: {data['priority']}")

    def _validate_updates(self, updates: Dict[str, Any]) -> None:
        """Validate task update data."""
        if "title" in updates and not updates["title"].strip():
            raise ValueError("Task title cannot be empty")
            
        if "status" in updates:
            try:
                TaskStatus(updates["status"])
            except ValueError:
                raise ValueError(f"Invalid status: {updates['status']}")


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
            task = self.service.create_task(request_data)
            return {
                "success": True,
                "data": self._task_to_dict(task),
                "message": "Task created successfully"
            }
        except ValueError as e:
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to create task"
            }

    def get_task(self, task_id: str) -> Dict[str, Any]:
        """Get task endpoint."""
        try:
            task = self.service.get_task(task_id)
            if task:
                return {
                    "success": True,
                    "data": self._task_to_dict(task)
                }
            else:
                return {
                    "success": False,
                    "error": "Task not found",
                    "message": f"No task found with ID: {task_id}"
                }
        except ValueError as e:
            return {
                "success": False,
                "error": str(e)
            }

    def list_tasks(self, filters: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """List tasks endpoint."""
        try:
            filters = filters or {}
            tasks = self.service.list_tasks(
                status=filters.get("status"),
                assignee=filters.get("assignee")
            )
            return {
                "success": True,
                "data": [self._task_to_dict(task) for task in tasks],
                "count": len(tasks)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _task_to_dict(self, task: Task) -> Dict[str, Any]:
        """Convert Task object to dictionary."""
        data = asdict(task)
        data["status"] = task.status.value
        data["priority"] = task.priority.value
        data["created_at"] = task.created_at.isoformat() if task.created_at else None
        data["updated_at"] = task.updated_at.isoformat() if task.updated_at else None
        data["due_date"] = task.due_date.isoformat() if task.due_date else None
        return data