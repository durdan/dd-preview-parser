import pytest
import tempfile
import shutil
import os
from pathlib import Path
from app import create_app
from models.database import Database

@pytest.fixture(scope="session")
def test_app():
    """Create test application with temporary database and upload directory."""
    # Create temporary directories
    temp_dir = tempfile.mkdtemp()
    db_path = os.path.join(temp_dir, "test.db")
    upload_dir = os.path.join(temp_dir, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Configure test app
    app = create_app({
        'TESTING': True,
        'DATABASE_PATH': db_path,
        'UPLOAD_FOLDER': upload_dir,
        'SECRET_KEY': 'test-secret-key'
    })
    
    with app.app_context():
        # Initialize database
        db = Database(db_path)
        db.init_db()
        
        yield app
    
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)

@pytest.fixture
def client(test_app):
    """Create test client."""
    return test_app.test_client()

@pytest.fixture
def db(test_app):
    """Get database instance."""
    return Database(test_app.config['DATABASE_PATH'])

@pytest.fixture(autouse=True)
def clean_db(db):
    """Clean database before each test."""
    # Clear all tables
    conn = db.get_connection()
    try:
        conn.execute("DELETE FROM diagrams")
        conn.execute("DELETE FROM users")
        conn.commit()
    finally:
        conn.close()