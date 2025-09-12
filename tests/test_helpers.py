import json
from typing import Dict, Any

class TestUser:
    """Helper class for test user operations."""
    
    def __init__(self, client, username: str = "testuser", email: str = "test@example.com", password: str = "password123"):
        self.client = client
        self.username = username
        self.email = email
        self.password = password
        self.user_id = None
    
    def register(self) -> Dict[str, Any]:
        """Register the test user."""
        response = self.client.post('/register', data={
            'username': self.username,
            'email': self.email,
            'password': self.password
        }, follow_redirects=True)
        return response
    
    def login(self) -> Dict[str, Any]:
        """Login the test user."""
        response = self.client.post('/login', data={
            'username': self.username,
            'password': self.password
        }, follow_redirects=True)
        return response
    
    def logout(self) -> Dict[str, Any]:
        """Logout the test user."""
        return self.client.get('/logout', follow_redirects=True)

class DiagramHelper:
    """Helper class for diagram operations."""
    
    @staticmethod
    def create_sample_diagram(client, title: str = "Test Diagram", content: str = None) -> Dict[str, Any]:
        """Create a sample diagram."""
        if content is None:
            content = "@startuml\nAlice -> Bob: Hello\n@enduml"
        
        return client.post('/create', data={
            'title': title,
            'content': content
        }, follow_redirects=True)
    
    @staticmethod
    def get_valid_plantuml_content() -> str:
        """Get valid PlantUML content for testing."""
        return "@startuml\nAlice -> Bob: Hello World\nBob -> Alice: Hi there!\n@enduml"
    
    @staticmethod
    def get_complex_plantuml_content() -> str:
        """Get complex PlantUML content for testing."""
        return """@startuml
        !define RECTANGLE class
        
        RECTANGLE User {
            +id: int
            +username: string
            +email: string
            +created_at: datetime
            --
            +register()
            +login()
            +logout()
        }
        
        RECTANGLE Diagram {
            +id: int
            +title: string
            +content: text
            +user_id: int
            +created_at: datetime
            +updated_at: datetime
            --
            +save()
            +render()
            +delete()
        }
        
        User ||--o{ Diagram : creates
        @enduml"""

def assert_response_ok(response, expected_status=200):
    """Assert response is successful."""
    assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}: {response.data.decode()}"

def assert_contains_text(response, text: str):
    """Assert response contains specific text."""
    content = response.data.decode()
    assert text in content, f"Expected '{text}' in response, but got: {content[:500]}..."

def assert_redirects_to(response, path: str):
    """Assert response redirects to specific path."""
    assert response.status_code in [301, 302], f"Expected redirect, got {response.status_code}"
    assert path in response.location, f"Expected redirect to '{path}', got '{response.location}'"