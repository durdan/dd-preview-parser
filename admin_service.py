from models import db, User, Diagram, SystemStats, UserRole
from auth import SecurityAudit, validate_user_data
from flask_login import current_user
from datetime import datetime

class AdminService:
    
    @staticmethod
    def get_dashboard_data():
        """Get comprehensive dashboard data"""
        stats = SystemStats.get_stats()
        recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
        recent_diagrams = Diagram.query.order_by(Diagram.created_at.desc()).limit(5).all()
        
        return {
            'stats': stats,
            'recent_users': [user.to_dict() for user in recent_users],
            'recent_diagrams': [diagram.to_dict() for diagram in recent_diagrams]
        }
    
    @staticmethod
    def get_all_users(page=1, per_page=20):
        """Get paginated user list"""
        users = User.query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        return {
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }
    
    @staticmethod
    def create_user(data):
        """Create new user with validation"""
        errors = validate_user_data(data)
        if errors:
            return None, errors
        
        # Check for existing username/email
        if User.query.filter_by(username=data['username']).first():
            return None, ['Username already exists']
        if User.query.filter_by(email=data['email']).first():
            return None, ['Email already exists']
        
        try:
            user = User(
                username=data['username'].strip(),
                email=data['email'].strip(),
                role=UserRole(data.get('role', 'user'))
            )
            user.set_password(data['password'])
            
            db.session.add(user)
            db.session.commit()
            
            SecurityAudit.log_admin_action('user_created', user.id, 
                                         f"Created user: {user.username}")
            return user, None
            
        except Exception as e:
            db.session.rollback()
            return None, [f'Database error: {str(e)}']
    
    @staticmethod
    def update_user(user_id, data):
        """Update user with validation"""
        user = User.query.get(user_id)
        if not user:
            return None, ['User not found']
        
        # Security check for role changes
        if 'role' in data:
            is_valid, error = SecurityAudit.validate_admin_operation('role_change', user_id)
            if not is_valid:
                return None, [error]
        
        errors = validate_user_data(data, is_update=True)
        if errors:
            return None, errors
        
        try:
            if 'username' in data:
                new_username = data['username'].strip()
                if new_username != user.username:
                    if User.query.filter_by(username=new_username).first():
                        return None, ['Username already exists']
                    user.username = new_username
            
            if 'email' in data:
                new_email = data['email'].strip()
                if new_email != user.email:
                    if User.query.filter_by(email=new_email).first():
                        return None, ['Email already exists']
                    user.email = new_email
            
            if 'role' in data:
                user.role = UserRole(data['role'])
            
            if 'is_active' in data:
                user.is_active = bool(data['is_active'])
            
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            db.session.commit()
            
            SecurityAudit.log_admin_action('user_updated', user_id, 
                                         f"Updated user: {user.username}")
            return user, None
            
        except Exception as e:
            db.session.rollback()
            return None, [f'Database error: {str(e)}']
    
    @staticmethod
    def delete_user(user_id):
        """Delete user with security checks"""
        if user_id == current_user.id:
            return False, ['Cannot delete your own account']
        
        user = User.query.get(user_id)
        if not user:
            return False, ['User not found']
        
        try:
            username = user.username
            db.session.delete(user)
            db.session.commit()
            
            SecurityAudit.log_admin_action('user_deleted', user_id, 
                                         f"Deleted user: {username}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, [f'Database error: {str(e)}']
    
    @staticmethod
    def get_all_diagrams(page=1, per_page=20):
        """Get paginated diagram list"""
        diagrams = Diagram.query.order_by(Diagram.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return {
            'diagrams': [diagram.to_dict() for diagram in diagrams.items],
            'total': diagrams.total,
            'pages': diagrams.pages,
            'current_page': page
        }
    
    @staticmethod
    def delete_diagram(diagram_id):
        """Delete diagram"""
        diagram = Diagram.query.get(diagram_id)
        if not diagram:
            return False, ['Diagram not found']
        
        try:
            title = diagram.title
            db.session.delete(diagram)
            db.session.commit()
            
            SecurityAudit.log_admin_action('diagram_deleted', diagram.user_id, 
                                         f"Deleted diagram: {title}")
            return True, None
            
        except Exception as e:
            db.session.rollback()
            return False, [f'Database error: {str(e)}']