#!/bin/bash

echo "🧹 Cleaning up Python backend files..."

# Remove Python backend directories
echo "Removing Python directories..."
rm -rf models/ services/ repositories/ middleware/

# Remove Python files
echo "Removing Python files..."
rm -f auth_service.py requirements.txt

# Clean up Python cache and compiled files
echo "Cleaning Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "*.pyo" -delete 2>/dev/null || true
find . -name "*.pyd" -delete 2>/dev/null || true

# Remove Python environment directories
echo "Removing Python virtual environments..."
rm -rf venv/ env/ .venv/ .env/

# Remove Python configuration files
echo "Removing Python config files..."
rm -f .python-version pyproject.toml setup.py setup.cfg
rm -f Pipfile Pipfile.lock poetry.lock

echo "✅ Python cleanup complete!"

# Verification
echo "🔍 Verification:"
echo "Python files remaining: $(find . -name "*.py" -type f | wc -l)"
echo "Cache directories remaining: $(find . -name "__pycache__" -type d | wc -l)"

echo "📁 Current structure:"
tree -a -I 'node_modules|.git' . 2>/dev/null || ls -la