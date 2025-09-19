"""
Task Management System

A simple task management system that allows users to create, read, update,
and delete tasks with priority levels and status tracking.

Author: Claude AI Assistant
Version: 1.0.0
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
import json


class TaskStatus(Enum):
    """Enumeration for task status values."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(Enum):
    """Enumeration for task priority levels."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4


class Task:
    """
    Represents a single task in the task management system.
    
    Attributes:
        id (int): Unique identifier for the task
        title (str): Task title/name
        description (str): Detailed task description
        status (TaskStatus): Current status of the task
        priority (TaskPriority): Priority level of the task
        created_at (datetime): Timestamp when task was created
        updated_at (datetime): Timestamp when task was last updated
        due_date (Optional[datetime]): Optional due date for the task
    """
    
    def __init__(self, id: int, title: str, description: str = "", 
                 priority: TaskPriority = TaskPriority.MEDIUM,
                 due_date: Optional[datetime] = None):
        """
        Initialize a new task.
        
        Args:
            id: Unique identifier for the task
            title: Task title (required)
            description: Task description (optional)
            priority: Task priority level (defaults to MEDIUM)
            due_date: Optional due date for the task
            
        Raises:
            ValueError: If title is empty or id is negative
        """
        if not title.strip():
            raise ValueError("Task title cannot be empty")
        if id < 0:
            raise ValueError("Task ID must be non-negative")
            
        self.id = id
        self.title = title.strip()
        self.description = description.strip()
        self.status = TaskStatus.PENDING
        self.priority = priority
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.due_date = due_date
    
    def update_status(self, status: TaskStatus) -> None:
        """
        Update the task status and refresh the updated_at timestamp.
        
        Args:
            status: New status for the task
        """
        self.status = status
        self.updated_at = datetime.now()
    
    def update_details(self, title: Optional[str] = None, 
                      description: Optional[str] = None,
                      priority: Optional[TaskPriority] = None,
                      due_date: Optional[datetime] = None) -> None:
        """
        Update task details and refresh the updated_at timestamp.
        
        Args:
            title: New title (optional)
            description: New description (optional)
            priority: New priority (optional)
            due_date: New due date (optional)
            
        Raises:
            ValueError: If provided title is empty
        """
        if title is not None:
            if not title.strip():
                raise ValueError("Task title cannot be empty")
            self.title = title.strip()
        
        if description is not None:
            self.description = description.strip()
        
        if priority is not None:
            self.priority = priority
            
        if due_date is not None:
            self.due_date = due_date
            
        self.updated_at = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert task to dictionary representation.
        
        Returns:
            Dictionary containing all task data
        """
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status.value,
            'priority': self.priority.value,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'due_date': self.due_date.isoformat() if self.due_date else None
        }
    
    def __str__(self) -> str:
        """String representation of the task."""
        return f"Task({self.id}): {self.title} [{self.status.value}]"


class TaskManager:
    """
    Main task management system that handles CRUD operations for tasks.
    
    This class provides a simple in-memory storage system for tasks with
    methods to create, read, update, and delete tasks.
    
    Attributes:
        _tasks (Dict[int, Task]): Internal storage for tasks
        _next_id (int): Counter for generating unique task IDs
    """
    
    def __init__(self):
        """Initialize an empty task manager."""
        self._tasks: Dict[int, Task] = {}
        self._next_id = 1
    
    def create_task(self, title: str, description: str = "",
                   priority: TaskPriority = TaskPriority.MEDIUM,
                   due_date: Optional[datetime] = None) -> Task:
        """
        Create a new task and add it to the system.
        
        Args:
            title: Task title (required)
            description: Task description (optional)
            priority: Task priority level (defaults to MEDIUM)
            due_date: Optional due date for the task
            
        Returns:
            The newly created Task object
            
        Raises:
            ValueError: If title is empty
        """
        task = Task(self._next_id, title, description, priority, due_date)
        self._tasks[task.id] = task
        self._next_id += 1
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by its ID.
        
        Args:
            task_id: The ID of the task to retrieve
            
        Returns:
            The Task object if found, None otherwise
        """
        return self._tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks in the system.
        
        Returns:
            List of all Task objects
        """
        return list(self._tasks.values())
    
    def update_task(self, task_id: int, **kwargs) -> bool:
        """
        Update an existing task with new details.
        
        Args:
            task_id: ID of the task to update
            **kwargs: Keyword arguments for task details to update
            
        Returns:
            True if task was updated successfully, False if task not found
            
        Raises:
            ValueError: If invalid data is provided
        """
        task = self.get_task(task_id)
        if not task:
            return False
        
        task.update_details(**kwargs)
        return True
    
    def update_task_status(self, task_id: int, status: TaskStatus) -> bool:
        """
        Update the status of a specific task.
        
        Args:
            task_id: ID of the task to update
            status: New status for the task
            
        Returns:
            True if task status was updated, False if task not found
        """
        task = self.get_task(task_id)
        if not task:
            return False
        
        task.update_status(status)
        return True
    
    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task from the system.
        
        Args:
            task_id: ID of the task to delete
            
        Returns:
            True if task was deleted, False if task not found
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False
    
    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """
        Get all tasks with a specific status.
        
        Args:
            status: The status to filter by
            
        Returns:
            List of tasks with the specified status
        """
        return [task for task in self._tasks.values() if task.status == status]
    
    def get_tasks_by_priority(self, priority: TaskPriority) -> List[Task]:
        """
        Get all tasks with a specific priority.
        
        Args:
            priority: The priority level to filter by
            
        Returns:
            List of tasks with the specified priority
        """
        return [task for task in self._tasks.values() if task.priority == priority]
    
    def export_to_json(self) -> str:
        """
        Export all tasks to JSON format.
        
        Returns:
            JSON string representation of all tasks
        """
        tasks_data = [task.to_dict() for task in self._tasks.values()]
        return json.dumps(tasks_data, indent=2)
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the current tasks.
        
        Returns:
            Dictionary containing task statistics
        """
        total_tasks = len(self._tasks)
        if total_tasks == 0:
            return {
                'total_tasks': 0,
                'status_breakdown': {},
                'priority_breakdown': {}
            }
        
        status_counts = {}
        priority_counts = {}
        
        for task in self._tasks.values():
            status_counts[task.status.value] = status_counts.get(task.status.value, 0) + 1
            priority_counts[task.priority.name] = priority_counts.get(task.priority.name, 0) + 1
        
        return {
            'total_tasks': total_tasks,
            'status_breakdown': status_counts,
            'priority_breakdown': priority_counts
        }