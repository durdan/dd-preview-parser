from flask import Flask, request, jsonify, g
from auth_service import AuthService
from jwt_utils import JWTManager
from middleware import create_auth_middleware
from models import Role
from exceptions import (
    InvalidCredentialsError,
    UserAlreadyExistsError,
    AuthenticationError
)

app = Flask(__name__)

# Initialize services
jwt_manager = JWTManager(secret_key="your-secret-key-change-in-production")
auth_service = AuthService(jwt_manager)
require_auth, require_roles = create_auth_middleware(auth_service)

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        user = auth_service.register(username, password)
        return jsonify({
            'message': 'User registered successfully',
            'username': user.username
        }), 201
        
    except (ValueError, UserAlreadyExistsError) as e:
        return jsonify({'error': str(e)}), 400

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        token = auth_service.login(username, password)
        return jsonify({'token': token}), 200
        
    except InvalidCredentialsError as e:
        return jsonify({'error': str(e)}), 401

@app.route('/profile', methods=['GET'])
@require_auth
def profile():
    return jsonify({
        'username': g.current_user,
        'roles': g.current_roles
    })

@app.route('/admin', methods=['GET'])
@require_auth
@require_roles([Role.ADMIN])
def admin_only():
    return jsonify({'message': 'Admin access granted'})

@app.route('/moderator', methods=['GET'])
@require_auth
@require_roles([Role.ADMIN, Role.MODERATOR])
def moderator_access():
    return jsonify({'message': 'Moderator access granted'})

if __name__ == '__main__':
    # Create sample admin user
    auth_service.register('admin', 'admin123', [Role.ADMIN])
    auth_service.register('user', 'user123', [Role.USER])
    
    app.run(debug=True)