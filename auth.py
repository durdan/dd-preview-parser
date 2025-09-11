from functools import wraps
from flask import session, request, jsonify, redirect, url_for
from flask_login import current_user
from models import User, UserRole

def require_admin(f):
    """Decorator to require admin role for route access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            if request.is_json:
                return jsonify({'error': 'Authentication required'}), 401
            return redirect(url_for('login'))
        
        if not current_user.is_admin():
            if request.is_json:
                return jsonify({'error': 'Admin access required'}), 403
            return redirect(url_for('dashboard'))
        
        return f(*args, **kwargs)
    return decorated_function

def validate_user_data(data, is_update=False):
    """Validate user creation/update data"""
    errors = []
    
    if not is_update or 'username' in data:
        username = data.get('username', '').strip()
        if not username:
            errors.append('Username is required')
        elif len(username) < 3:
            errors.append('Username must be at least 3 characters')
        elif len(username) > 80:
            errors.append('Username must be less than 80 characters')
    
    if not is_update or 'email' in data:
        email = data.get('email', '').strip()
        if not email:
            errors.append('Email is required')
        elif '@' not in email or len(email) > 120:
            errors.append('Valid email is required')
    
    if not is_update and 'password' in data:
        password = data.get('password', '')
        if not password:
            errors.append('Password is required')
        elif len(password) < 6:
            errors.append('Password must be at least 6 characters')
    
    if 'role' in data:
        role = data.get('role')
        if role not in [r.value for r in UserRole]:
            errors.append('Invalid role specified')
    
    return errors

class SecurityAudit:
    """Security audit helper for admin operations"""
    
    @staticmethod
    def log_admin_action(action, target_user_id=None, details=None):
        """Log admin actions for security audit"""
        # In production, this would write to a secure audit log
        print(f"ADMIN ACTION: {current_user.username} performed {action}")
        if target_user_id:
            print(f"  Target User ID: {target_user_id}")
        if details:
            print(f"  Details: {details}")
    
    @staticmethod
    def validate_admin_operation(operation, target_user_id=None):
        """Validate admin operations for security"""
        if not current_user.is_admin():
            return False, "Admin access required"
        
        # Prevent admin from demoting themselves
        if operation == 'role_change' and target_user_id == current_user.id:
            target_user = User.query.get(target_user_id)
            if target_user and target_user.role == UserRole.ADMIN:
                return False, "Cannot modify your own admin role"
        
        return True, None