from flask import Flask, request, jsonify
import os
from services.validation_service import ValidationService
from models.validation_result import ValidationResult

app = Flask(__name__)

# Initialize services
validation_service = ValidationService(
    openai_api_key=os.getenv('OPENAI_API_KEY')
)

@app.route('/api/diagrams/validate', methods=['POST'])
def validate_diagram():
    """Validate diagram syntax and structure"""
    try:
        data = request.get_json()
        if not data or 'diagram' not in data:
            return jsonify({'error': 'Diagram content required'}), 400
        
        diagram_type = data.get('type', 'mermaid')
        diagram_content = data['diagram']
        
        result = validation_service.validate_diagram(diagram_content, diagram_type)
        return jsonify(result.to_dict())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/diagrams/analyze', methods=['POST'])
def analyze_diagram():
    """Analyze diagram for errors and improvements"""
    try:
        data = request.get_json()
        if not data or 'diagram' not in data:
            return jsonify({'error': 'Diagram content required'}), 400
        
        diagram_content = data['diagram']
        diagram_type = data.get('type', 'mermaid')
        
        result = validation_service.analyze_diagram(diagram_content, diagram_type)
        return jsonify(result.to_dict())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/diagrams/suggest-improvements', methods=['POST'])
def suggest_improvements():
    """Get AI-powered improvement suggestions"""
    try:
        data = request.get_json()
        if not data or 'diagram' not in data:
            return jsonify({'error': 'Diagram content required'}), 400
        
        diagram_content = data['diagram']
        diagram_type = data.get('type', 'mermaid')
        
        result = validation_service.suggest_improvements(diagram_content, diagram_type)
        return jsonify(result.to_dict())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)