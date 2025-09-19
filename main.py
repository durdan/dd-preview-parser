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
        CANCELLED: Task has been cancelled and will not be completed
    """
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Priority(Enum):
    """
    Task priority levels.
    
    Attributes:
        LOW: Non-urgent tasks that can be done when time permits
        MEDIUM: Standard priority tasks
        HIGH: Important tasks that should be completed soon
        URGENT: Critical tasks requiring immediate attention
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
        Mark the task as completed and set the completion timestamp.
        
        Raises:
            ValueError: If the task is already completed or cancelled
        """
        if self.status == TaskStatus.COMPLETED:
            raise ValueError("Task is already completed")
        if self.status == TaskStatus.CANCELLED:
            raise ValueError("Cannot complete a cancelled task")
        
        self.status = TaskStatus.COMPLETED
        self.completed_at = datetime.now()
    
    def is_overdue(self) -> bool:
        """
        Check if the task is overdue.
        
        Returns:
            bool: True if the task has a due date and it has passed, False otherwise
        """
        if not self.due_date or self.status in [TaskStatus.COMPLETED, TaskStatus.CANCELLED]:
            return False
        return datetime.now() > self.due_date
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the task to a dictionary representation.
        
        Returns:
            Dict[str, Any]: Dictionary containing all task data
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "priority": self.priority.value,
            "created_at": self.created_at.isoformat(),
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "tags": self.tags
        }


class TaskManager:
    """
    Manages a collection of tasks with CRUD operations and filtering capabilities.
    
    This class provides a simple in-memory task management system with methods
    for creating, reading, updating, and deleting tasks, as well as various
    filtering and querying capabilities.
    
    Attributes:
        tasks (Dict[str, Task]): Dictionary mapping task IDs to Task objects
    
    Example:
        >>> manager = TaskManager()
        >>> task = manager.create_task("Write tests", "Create unit tests for the project")
        >>> print(len(manager.get_all_tasks()))
        1
    """
    
    def __init__(self):
        """Initialize an empty task manager."""
        self.tasks: Dict[str, Task] = {}
    
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
            title (str): The task title (required)
            description (str): Detailed description of the task
            priority (Priority): Priority level for the task
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
            ...     "Review the pull request #123",
            ...     Priority.HIGH,
            ...     datetime.now() + timedelta(days=2)
            ... )
        """
        if not title or not title.strip():
            raise ValueError("Task title cannot be empty")
        
        task_id = f"task-{len(self.tasks) + 1:03d}"
        task = Task(
            id=task_id,
            title=title.strip(),
            description=description,
            priority=priority,
            due_date=due_date,
            tags=tags or []
        )
        
        self.tasks[task_id] = task
        return task
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """
        Retrieve a task by its ID.
        
        Args:
            task_id (str): The unique identifier of the task
        
        Returns:
            Optional[Task]: The task if found, None otherwise
        """
        return self.tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks in the manager.
        
        Returns:
            List[Task]: List of all tasks, ordered by creation date
        """
        return sorted(self.tasks.values(), key=lambda t: t.created_at)
    
    def update_task(self, task_id: str, **kwargs) -> bool:
        """
        Update an existing task with new values.
        
        Args:
            task_id (str): The ID of the task to update
            **kwargs: Keyword arguments for fields to update
        
        Returns:
            bool: True if task was updated, False if task not found
        
        Raises:
            ValueError: If trying to update with invalid values
        """
        task = self.get_task(task_id)
        if not task:
            return False
        
        for key, value in kwargs.items():
            if hasattr(task, key):
                if key == "title" and (not value or not value.strip()):
                    raise ValueError("Task title cannot be empty")
                setattr(task, key, value)
        
        return True
    
    def delete_task(self, task_id: str) -> bool:
        """
        Delete a task from the manager.
        
        Args:
            task_id (str): The ID of the task to delete
        
        Returns:
            bool: True if task was deleted, False if task not found
        """
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False
    
    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """
        Get all tasks with a specific status.
        
        Args:
            status (TaskStatus): The status to filter by
        
        Returns:
            List[Task]: List of tasks with the specified status
        """
        return [task for task in self.tasks.values() if task.status == status]
    
    def get_overdue_tasks(self) -> List[Task]:
        """
        Get all tasks that are overdue.
        
        Returns:
            List[Task]: List of overdue tasks, sorted by due date
        """
        overdue = [task for task in self.tasks.values() if task.is_overdue()]
        return sorted(overdue, key=lambda t: t.due_date or datetime.min)
    
    def get_tasks_by_priority(self, priority: Priority) -> List[Task]:
        """
        Get all tasks with a specific priority.
        
        Args:
            priority (Priority): The priority level to filter by
        
        Returns:
            List[Task]: List of tasks with the specified priority
        """
        return [task for task in self.tasks.values() if task.priority == priority]
    
    def export_to_json(self, filename: str) -> None:
        """
        Export all tasks to a JSON file.
        
        Args:
            filename (str): Path to the output JSON file
        
        Raises:
            IOError: If the file cannot be written
        """
        data = {
            "tasks": [task.to_dict() for task in self.get_all_tasks()],
            "exported_at": datetime.now().isoformat()
        }
        
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)


def main():
    """
    Demonstration of the task management system.
    
    This function shows basic usage of the TaskManager class and its methods.
    """
    # Create a task manager
    manager = TaskManager()
    
    # Create some sample tasks
    task1 = manager.create_task(
        "Write documentation",
        "Create comprehensive documentation for the project",
        Priority.HIGH,
        datetime.now() + timedelta(days=3),
        ["documentation", "writing"]
    )
    
    task2 = manager.create_task(
        "Review code",
        "Review pull request #123",
        Priority.MEDIUM,
        datetime.now() + timedelta(days=1),
        ["code-review", "development"]
    )
    
    task3 = manager.create_task(
        "Fix bug",
        "Fix the login issue reported by users",
        Priority.URGENT,
        datetime.now() + timedelta(hours=4),
        ["bug", "urgent"]
    )
    
    # Demonstrate various operations
    print(f"Total tasks: {len(manager.get_all_tasks())}")
    print(f"Urgent tasks: {len(manager.get_tasks_by_priority(Priority.URGENT))}")
    print(f"Pending tasks: {len(manager.get_tasks_by_status(TaskStatus.PENDING))}")
    
    # Mark a task as completed
    task2.mark_completed()
    print(f"Completed tasks: {len(manager.get_tasks_by_status(TaskStatus.COMPLETED))}")
    
    # Export to JSON
    manager.export_to_json("tasks_export.json")
    print("Tasks exported to tasks_export.json")


if __name__ == "__main__":
    main()