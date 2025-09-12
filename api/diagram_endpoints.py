from flask import Flask, request, jsonify
from services.diagram_storage import DiagramStorage
from models.diagram_metadata import DiagramMetadata

app = Flask(__name__)
storage = DiagramStorage()

def get_user_id():
    # Simple user identification - in real app would use authentication
    return request.headers.get('X-User-ID', 'anonymous')

@app.route('/api/diagrams', methods=['POST'])
def create_diagram():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = get_user_id()
        diagram = DiagramMetadata.create_new(
            name=data.get('name', ''),
            user_id=user_id,
            description=data.get('description', ''),
            diagram_data=data.get('diagram_data', {})
        )
        
        saved_diagram = storage.save_diagram(diagram)
        return jsonify(saved_diagram.to_dict()), 201
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/diagrams', methods=['GET'])
def get_user_diagrams():
    try:
        user_id = get_user_id()
        diagrams = storage.get_user_diagrams(user_id)
        return jsonify([d.to_dict() for d in diagrams])
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/diagrams/<diagram_id>', methods=['GET'])
def get_diagram(diagram_id):
    try:
        diagram = storage.load_diagram(diagram_id)
        if not diagram:
            return jsonify({'error': 'Diagram not found'}), 404
        
        user_id = get_user_id()
        if diagram.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify(diagram.to_dict())
    
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/diagrams/<diagram_id>', methods=['PUT'])
def update_diagram(diagram_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = get_user_id()
        updated_diagram = storage.update_diagram(
            diagram_id, 
            user_id,
            name=data.get('name'),
            description=data.get('description'),
            diagram_data=data.get('diagram_data')
        )
        
        if not updated_diagram:
            return jsonify({'error': 'Diagram not found'}), 404
        
        return jsonify(updated_diagram.to_dict())
    
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/diagrams/<diagram_id>', methods=['DELETE'])
def delete_diagram(diagram_id):
    try:
        user_id = get_user_id()
        success = storage.delete_diagram(diagram_id, user_id)
        
        if not success:
            return jsonify({'error': 'Diagram not found'}), 404
        
        return jsonify({'message': 'Diagram deleted successfully'})
    
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)