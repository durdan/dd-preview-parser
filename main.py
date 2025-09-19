"""
Task Management System

A simple task management system demonstrating comprehensive documentation practices.
This module provides core functionality for creating, managing, and tracking tasks.

Author: Claude AI
Version: 1.0.0
"""

from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field
import json


class TaskStatus(Enum):
    """
    Enumeration of possible task statuses.
    
    Attributes:
        PENDING: Task has been created but not started
        IN_PROGRESS: Task is currently being worked on
        COMPLETED: Task has been finished successfully
        CANCELLED: Task has been cancelled and won't be completed
    """
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Priority(Enum):
    """
    Task priority levels.
    
    Attributes:
        LOW: Low priority task
        MEDIUM: Medium priority task
        HIGH: High priority task
        URGENT: Urgent task requiring immediate attention
    """
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4


@dataclass
class Task:
    """
    Represents a single task in the task management system.
    
    Attributes:
        id (str): Unique identifier for the task
        title (str): Brief description of the task
        description (str): Detailed description of what needs to be done
        status (TaskStatus): Current status of the task
        priority (Priority): Priority level of the task
        created_at (datetime): When the task was created
        due_date (Optional[datetime]): When the task should be completed
        completed_at (Optional[datetime]): When the task was actually completed
        tags (List[str]): List of tags for categorization
    
    Example:
        >>> task = Task(
        ...     id="task-001",
        ...     title="Write documentation",
        ...     description="Create comprehensive docs for the project"
        ... )
        >>> print(task.title)
        Write documentation
    """
    id: str
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM
    created_at: datetime = field(default_factory=datetime.now)
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    tags: List[str] = field(default_factory=list)
    
    def mark_completed(self) -> None:
        """
        Mark the task as completed and set completion timestamp.
        
        Raises:
            ValueError: If task is already completed or cancelled
            
        Example:
            >>> task = Task(id="1", title="Test task")
            >>> task.mark_completed()
            >>> task.status == TaskStatus.COMPLETED
            True
        """
        if self.status in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            raise ValueError(f"Cannot complete task with status: {self.status.value}")
        
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now()
    
    def is_overdue(self) -> bool:
        """
        Check if the task is overdue.
        
        Returns:
            bool: True if task has a due date and it's in the past, False otherwise
            
        Example:
            >>> from datetime import datetime, timedelta
            >>> past_date = datetime.now() - timedelta(days=1)
            >>> task = Task(id="1", title="Overdue task", due_date=past_date)
            >>> task.is_overdue()
            True
        """
        if not self.due_date or self.status == TaskStatus.COMPLETED:
            return False
        return datetime.now() > self.due_date


class TaskManager:
    """
    Manages a collection of tasks with CRUD operations and filtering capabilities.
    
    This class provides a centralized way to manage tasks, including creation,
    retrieval, updating, and deletion operations. It also supports filtering
    and searching functionality.
    
    Attributes:
        _tasks (Dict[str, Task]): Internal storage for tasks indexed by ID
        
    Example:
        >>> manager = TaskManager()
        >>> task = manager.create_task("Write tests", "Create unit tests for the project")
        >>> len(manager.get_all_tasks())
        1
    """
    
    def __init__(self):
        """Initialize an empty task manager."""
        self._tasks: Dict[str, Task] = {}
    
    def create_task(
        self,
        title: str,
        description: str = "",
        priority: Priority = Priority.MEDIUM,
        due_date: Optional[datetime] = None,
        tags: Optional[List[str]] = None
    ) -> Task:
        """
        Create a new task and add it to the manager.
        
        Args:
            title (str): Task title (required, non-empty)
            description (str): Detailed task description
            priority (Priority): Task priority level
            due_date (Optional[datetime]): When the task should be completed
            tags (Optional[List[str]]): List of tags for categorization
            
        Returns:
            Task: The newly created task
            
        Raises:
            ValueError: If title is empty or None
            
        Example:
            >>> manager = TaskManager()
            >>> task = manager.create_task(
            ...     "Review code",
            ...     "Review pull request #123",
            ...     Priority.HIGH,
            ...     tags=["code-review", "urgent"]
            ... )
            >>> task.title
            'Review code'
        """
        if not title or not title.strip():
            raise ValueError("Task title cannot be empty")
        
        task_id = f"task-{len(self._tasks) + 1:04d}"
        task = Task(
            id=task_id,
            title=title.strip(),
            description=description.strip(),
            priority=priority,
            due_date=due_date,
            tags=tags or []
        )
        
        self._tasks[task_id] = task
        return task
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """
        Retrieve a task by its ID.
        
        Args:
            task_id (str): The unique identifier of the task
            
        Returns:
            Optional[Task]: The task if found, None otherwise
            
        Example:
            >>> manager = TaskManager()
            >>> task = manager.create_task("Test task")
            >>> retrieved = manager.get_task(task.id)
            >>> retrieved.title
            'Test task'
        """
        return self._tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks in the manager.
        
        Returns:
            List[Task]: List of all tasks, ordered by creation date
            
        Example:
            >>> manager = TaskManager()
            >>> manager.create_task("Task 1")
            >>> manager.create_task("Task 2")
            >>> len(manager.get_all_tasks())
            2
        """
        return sorted(self._tasks.values(), key=lambda t: t.created_at)
    
    def filter_tasks(
        self,
        status: Optional[TaskStatus] = None,
        priority: Optional[Priority] = None,
        tag: Optional[str] = None,
        overdue_only: bool = False
    ) -> List[Task]:
        """
        Filter tasks based on various criteria.
        
        Args:
            status (Optional[TaskStatus]): Filter by task status
            priority (Optional[Priority]): Filter by priority level
            tag (Optional[str]): Filter by tag (tasks containing this tag)
            overdue_only (bool): If True, only return overdue tasks
            
        Returns:
            List[Task]: Filtered list of tasks
            
        Example:
            >>> manager = TaskManager()
            >>> task1 = manager.create_task("High priority", priority=Priority.HIGH)
            >>> task2 = manager.create_task("Low priority", priority=Priority.LOW)
            >>> high_priority_tasks = manager.filter_tasks(priority=Priority.HIGH)
            >>> len(high_priority_tasks)
            1
        """
        filtered_tasks = list(self._tasks.values())
        
        if status:
            filtered_tasks = [t for t in filtered_tasks if t.status == status]
        
        if priority:
            filtered_tasks = [t for t in filtered_tasks if t.priority == priority]
        
        if tag:
            filtered_tasks = [t for t in filtered_tasks if tag in t.tags]
        
        if overdue_only:
            filtered_tasks = [t for t in filtered_tasks if t.is_overdue()]
        
        return sorted(filtered_tasks, key=lambda t: t.created_at)
    
    def update_task(
        self,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[TaskStatus] = None,
        priority: Optional[Priority] = None,
        due_date: Optional[datetime] = None,
        tags: Optional[List[str]] = None
    ) -> bool:
        """
        Update an existing task with new values.
        
        Args:
            task_id (str): ID of the task to update
            title (Optional[str]): New title
            description (Optional[str]): New description
            status (Optional[TaskStatus]): New status
            priority (Optional[Priority]): New priority
            due_date (Optional[datetime]): New due date
            tags (Optional[List[str]]): New tags list
            
        Returns:
            bool: True if task was updated, False if task not found
            
        Raises:
            ValueError: If trying to set empty title
            
        Example:
            >>> manager = TaskManager()
            >>> task = manager.create_task("Original title")
            >>> success = manager.update_task(task.id, title="Updated title")
            >>> success
            True
        """
        task = self._tasks.get(task_id)
        if not task:
            return False
        
        if title is not None:
            if not title.strip():
                raise ValueError("Task title cannot be empty")
            task.title = title.strip()
        
        if description is not None:
            task.description = description.strip()
        
        if status is not None:
            task.status = status
            if status == TaskStatus.COMPLETED and not task.completed_at:
                task.completed_at = datetime.now()
        
        if priority is not None:
            task.priority = priority
        
        if due_date is not None:
            task.due_date = due_date
        
        if tags is not None:
            task.tags = tags
        
        return True
    
    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task from the manager.
        
        Args:
            task_id (str): ID of the task to delete
            
        Returns:
            bool: True if task was deleted, False if task not found
            
        Example:
            >>> manager = TaskManager()
            >>> task = manager.create_task("To be deleted")
            >>> success = manager.delete_task(task.id)
            >>> success
            True
            >>> manager.get_task(task.id) is None
            True
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the tasks in the manager.
        
        Returns:
            Dict[str, Any]: Dictionary containing various statistics
            
        Example:
            >>> manager = TaskManager()
            >>> manager.create_task("Task 1")
            >>> manager.create_task("Task 2", priority=Priority.HIGH)
            >>> stats = manager.get_statistics()
            >>> stats['total_tasks']
            2
        """
        tasks = list(self._tasks.values())
        
        status_counts = {}
        for status in TaskStatus:
            status_counts[status.value] = len([t for t in tasks if t.status == status])
        
        priority_counts = {}
        for priority in Priority:
            priority_counts[priority.name.lower()] = len([t for t in tasks if t.priority == priority])
        
        overdue_count = len([t for t in tasks if t.is_overdue()])
        
        return {
            'total_tasks': len(tasks),
            'status_breakdown': status_counts,
            'priority_breakdown': priority_counts,
            'overdue_tasks': overdue_count,
            'completion_rate': (status_counts.get('completed', 0) / len(tasks) * 100) if tasks else 0
        }


def export_tasks_to_json(manager: TaskManager, filename: str) -> None:
    """
    Export all tasks to a JSON file.
    
    Args:
        manager (TaskManager): The task manager instance
        filename (str): Path to the output JSON file
        
    Raises:
        IOError: If file cannot be written
        
    Example:
        >>> manager = TaskManager()
        >>> manager.create_task("Export test")
        >>> export_tasks_to_json(manager, "tasks.json")
    """
    tasks_data = []
    for task in manager.get_all_tasks():
        task_dict = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status.value,
            'priority': task.priority.name,
            'created_at': task.created_at.isoformat(),
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'completed_at': task.completed_at.isoformat() if task.completed_at else None,
            'tags': task.tags
        }
        tasks_data.append(task_dict)
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(tasks_data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    # Example usage
    manager = TaskManager()
    
    # Create some sample tasks
    task1 = manager.create_task(
        "Implement user authentication",
        "Add login/logout functionality with JWT tokens",
        Priority.HIGH,
        tags=["backend", "security"]
    )
    
    task2 = manager.create_task(
        "Write unit tests",
        "Create comprehensive test suite",
        Priority.MEDIUM,
        tags=["testing", "quality"]
    )
    
    # Display statistics
    stats = manager.get_statistics()
    print("Task Statistics:")
    print(f"Total tasks: {stats['total_tasks']}")
    print(f"Completion rate: {stats['completion_rate']:.1f}%")