import unittest
from datetime import datetime
from main import TaskAPI, TaskService, TaskRepository, Task, TaskStatus, Priority


class TestTaskSystem(unittest.TestCase):
    
    def setUp(self):
        self.api = TaskAPI()
        self.service = TaskService(TaskRepository())

    def test_create_task_success(self):
        """Test successful task creation."""
        task_data = {
            "title": "Test Task",
            "description": "Test description",
            "priority": "high"
        }
        
        result = self.api.create_task(task_data)
        
        self.assertTrue(result["success"])
        self.assertIn("data", result)
        self.assertEqual(result["data"]["title"], "Test Task")
        self.assertEqual(result["data"]["priority"], "high")

    def test_create_task_missing_title(self):
        """Test task creation with missing title."""
        task_data = {"description": "Test description"}
        
        result = self.api.create_task(task_data)
        
        self.assertFalse(result["success"])
        self.assertIn("error", result)

    def test_get_task_success(self):
        """Test successful task retrieval."""
        # Create task first
        task_data = {"title": "Test Task"}
        create_result = self.api.create_task(task_data)
        task_id = create_result["data"]["id"]
        
        # Get task
        result = self.api.get_task(task_id)
        
        self.assertTrue(result["success"])
        self.assertEqual(result["data"]["id"], task_id)

    def test_get_task_not_found(self):
        """Test getting non-existent task."""
        result = self.api.get_task("999")
        
        self.assertFalse(result["success"])
        self.assertIn("not found", result["error"])

    def test_list_tasks_with_filter(self):
        """Test listing tasks with status filter."""
        # Create tasks with different statuses
        self.api.create_task({"title": "Task 1", "status": "pending"})
        self.api.create_task({"title": "Task 2", "status": "completed"})
        
        # Filter by status
        result = self.api.list_tasks({"status": "pending"})
        
        self.assertTrue(result["success"])
        self.assertEqual(result["count"], 1)
        self.assertEqual(result["data"][0]["status"], "pending")

    def test_task_validation(self):
        """Test task data validation."""
        with self.assertRaises(ValueError):
            self.service.create_task({"title": ""})
            
        with self.assertRaises(ValueError):
            self.service.create_task({"title": "Test", "status": "invalid"})


if __name__ == "__main__":
    unittest.main()