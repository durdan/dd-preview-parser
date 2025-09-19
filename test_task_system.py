import unittest
from datetime import datetime
from main import TaskAPI, TaskService, TaskRepository, Task, TaskStatus, Priority


class TestTaskSystem(unittest.TestCase):
    
    def setUp(self):
        self.api = TaskAPI()
    
    def test_create_task_success(self):
        """Test successful task creation."""
        response = self.api.create_task({
            "title": "Test Task",
            "description": "Test description",
            "priority": "high"
        })
        
        self.assertTrue(response["success"])
        self.assertEqual(response["data"]["title"], "Test Task")
        self.assertEqual(response["data"]["priority"], "high")
        self.assertEqual(response["data"]["status"], "pending")
    
    def test_create_task_invalid_title(self):
        """Test task creation with invalid title."""
        response = self.api.create_task({"title": ""})
        
        self.assertFalse(response["success"])
        self.assertIn("title is required", response["error"])
    
    def test_create_task_invalid_priority(self):
        """Test task creation with invalid priority."""
        response = self.api.create_task({
            "title": "Test Task",
            "priority": "invalid"
        })
        
        self.assertFalse(response["success"])
        self.assertIn("Invalid priority", response["error"])
    
    def test_get_task_success(self):
        """Test successful task retrieval."""
        # Create task first
        create_response = self.api.create_task({"title": "Test Task"})
        task_id = create_response["data"]["id"]
        
        # Get task
        response = self.api.get_task(task_id)
        
        self.assertTrue(response["success"])
        self.assertEqual(response["data"]["id"], task_id)
    
    def test_get_task_not_found(self):
        """Test task retrieval with invalid ID."""
        response = self.api.get_task("999")
        
        self.assertFalse(response["success"])
        self.assertIn("not found", response["error"])
    
    def test_update_task_status(self):
        """Test task status update."""
        # Create task first
        create_response = self.api.create_task({"title": "Test Task"})
        task_id = create_response["data"]["id"]
        
        # Update status
        response = self.api.update_task_status(task_id, "completed")
        
        self.assertTrue(response["success"])
        self.assertEqual(response["data"]["status"], "completed")
    
    def test_list_tasks_with_filter(self):
        """Test task listing with status filter."""
        # Create tasks with different statuses
        self.api.create_task({"title": "Task 1"})
        create_response = self.api.create_task({"title": "Task 2"})
        task_id = create_response["data"]["id"]
        self.api.update_task_status(task_id, "completed")
        
        # List completed tasks
        response = self.api.list_tasks("completed")
        
        self.assertTrue(response["success"])
        self.assertEqual(len(response["data"]), 1)
        self.assertEqual(response["data"][0]["status"], "completed")


if __name__ == "__main__":
    unittest.main()