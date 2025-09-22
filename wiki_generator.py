import os
import json
from pathlib import Path
from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class Document:
    title: str
    content: str
    metadata: Dict[str, Any]
    output_path: str

class ConfigLoader:
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path
    
    def load(self) -> Dict[str, Any]:
        if not os.path.exists(self.config_path):
            return self._default_config()
        
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            raise ValueError(f"Invalid config file: {e}")
    
    def _default_config(self) -> Dict[str, Any]:
        return {
            "source_dir": "source",
            "output_dir": "wiki",
            "template_dir": "templates",
            "file_extensions": [".md", ".txt"]
        }

class DocumentParser:
    def __init__(self, source_dir: str, file_extensions: List[str]):
        self.source_dir = Path(source_dir)
        self.file_extensions = file_extensions
    
    def parse_documents(self) -> List[Document]:
        if not self.source_dir.exists():
            raise ValueError(f"Source directory does not exist: {self.source_dir}")
        
        documents = []
        for file_path in self._find_source_files():
            doc = self._parse_file(file_path)
            if doc:
                documents.append(doc)
        
        return documents
    
    def _find_source_files(self) -> List[Path]:
        files = []
        for ext in self.file_extensions:
            files.extend(self.source_dir.glob(f"**/*{ext}"))
        return files
    
    def _parse_file(self, file_path: Path) -> Document:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract title from first line or filename
            lines = content.split('\n')
            title = lines[0].strip('#').strip() if lines and lines[0].startswith('#') else file_path.stem
            
            # Create output path maintaining directory structure
            rel_path = file_path.relative_to(self.source_dir)
            output_path = str(rel_path.with_suffix('.html'))
            
            return Document(
                title=title,
                content=content,
                metadata={"source_file": str(file_path)},
                output_path=output_path
            )
        except IOError as e:
            print(f"Warning: Could not read file {file_path}: {e}")
            return None

class TemplateEngine:
    def __init__(self, template_dir: str):
        self.template_dir = Path(template_dir)
        self.base_template = self._load_base_template()
    
    def _load_base_template(self) -> str:
        template_path = self.template_dir / "base.html"
        if template_path.exists():
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        
        # Default template if none exists
        return """<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1, h2, h3 { color: #333; }
        pre { background: #f4f4f4; padding: 10px; }
    </style>
</head>
<body>
    <h1>{title}</h1>
    <div class="content">
        {content}
    </div>
</body>
</html>"""
    
    def render(self, document: Document) -> str:
        # Simple template substitution
        rendered = self.base_template.format(
            title=document.title,
            content=self._format_content(document.content)
        )
        return rendered
    
    def _format_content(self, content: str) -> str:
        # Basic markdown-like formatting
        lines = content.split('\n')
        formatted_lines = []
        
        for line in lines:
            if line.startswith('# '):
                formatted_lines.append(f"<h1>{line[2:]}</h1>")
            elif line.startswith('## '):
                formatted_lines.append(f"<h2>{line[3:]}</h2>")
            elif line.startswith('### '):
                formatted_lines.append(f"<h3>{line[4:]}</h3>")
            elif line.strip().startswith('