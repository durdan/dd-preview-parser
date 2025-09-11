import subprocess
import tempfile
import os
from typing import List
from diagram_engine import DiagramRenderer, DiagramFormat, RenderError

class PlantUMLRenderer(DiagramRenderer):
    def __init__(self, plantuml_jar_path: str = None):
        self.plantuml_jar_path = plantuml_jar_path or self._find_plantuml_jar()
        if not self.plantuml_jar_path:
            raise RenderError("PlantUML JAR not found. Please install PlantUML.")
    
    def render(self, content: str, format: DiagramFormat) -> bytes:
        if format not in self.supported_formats():
            raise RenderError(f"Unsupported format: {format}")
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.puml', delete=False) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            output_format = self._get_plantuml_format(format)
            output_file = temp_file_path.replace('.puml', f'.{output_format}')
            
            cmd = [
                'java', '-jar', self.plantuml_jar_path,
                f'-t{output_format}',
                temp_file_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise RenderError(f"PlantUML rendering failed: {result.stderr}")
            
            if os.path.exists(output_file):
                with open(output_file, 'rb') as f:
                    return f.read()
            else:
                raise RenderError("Output file not generated")
        
        finally:
            # Cleanup
            for file_path in [temp_file_path, output_file]:
                if os.path.exists(file_path):
                    os.unlink(file_path)
    
    def supported_formats(self) -> List[DiagramFormat]:
        return [DiagramFormat.SVG, DiagramFormat.PNG, DiagramFormat.TXT]
    
    def _find_plantuml_jar(self) -> str:
        # Try common locations
        common_paths = [
            '/usr/local/bin/plantuml.jar',
            '/opt/plantuml/plantuml.jar',
            'plantuml.jar'
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                return path
        
        return None
    
    def _get_plantuml_format(self, format: DiagramFormat) -> str:
        format_map = {
            DiagramFormat.SVG: 'svg',
            DiagramFormat.PNG: 'png',
            DiagramFormat.TXT: 'txt'
        }
        return format_map[format]