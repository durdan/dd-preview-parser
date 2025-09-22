import os
import re
from pathlib import Path
from typing import Dict, List, Optional
import markdown

class DocumentProcessor:
    """Processes source documents and extracts metadata."""
    
    def __init__(self):
        self.md = markdown.Markdown(extensions=['meta', 'toc'])
    
    def process_file(self, file_path: Path) -> Dict:
        """Process a single markdown file."""
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        content = file_path.read_text(encoding='utf-8')
        html_content = self.md.convert(content)
        
        return {
            'title': self._extract_title(content),
            'content': html_content,
            'metadata': getattr(self.md, 'Meta', {}),
            'toc': getattr(self.md, 'toc', ''),
            'file_path': file_path
        }
    
    def _extract_title(self, content: str) -> str:
        """Extract title from first H1 or filename."""
        match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        return match.group(1).strip() if match else "Untitled"

class TemplateEngine:
    """Simple template engine for generating HTML pages."""
    
    def __init__(self, template_dir: Path):
        self.template_dir = template_dir
    
    def render(self, template_name: str, context: Dict) -> str:
        """Render template with given context."""
        template_path = self.template_dir / template_name
        if not template_path.exists():
            raise FileNotFoundError(f"Template not found: {template_path}")
        
        template = template_path.read_text(encoding='utf-8')
        return self._substitute_variables(template, context)
    
    def _substitute_variables(self, template: str, context: Dict) -> str:
        """Simple variable substitution."""
        for key, value in context.items():
            template = template.replace(f"{{{{{key}}}}}", str(value))
        return template

class FileHandler:
    """Handles file operations."""
    
    @staticmethod
    def ensure_dir(path: Path) -> None:
        """Ensure directory exists."""
        path.mkdir(parents=True, exist_ok=True)
    
    @staticmethod
    def write_file(path: Path, content: str) -> None:
        """Write content to file."""
        FileHandler.ensure_dir(path.parent)
        path.write_text(content, encoding='utf-8')
    
    @staticmethod
    def find_markdown_files(source_dir: Path) -> List[Path]:
        """Find all markdown files in directory."""
        if not source_dir.exists():
            raise FileNotFoundError(f"Source directory not found: {source_dir}")
        
        return list(source_dir.rglob("*.md"))

class WikiGenerator:
    """Main wiki generator orchestrator."""
    
    def __init__(self, source_dir: str, output_dir: str, template_dir: str = "templates"):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.template_dir = Path(template_dir)
        
        self.processor = DocumentProcessor()
        self.template_engine = TemplateEngine(self.template_dir)
        self.file_handler = FileHandler()
    
    def generate(self) -> None:
        """Generate the complete wiki."""
        if not self.source_dir.exists():
            raise FileNotFoundError(f"Source directory not found: {self.source_dir}")
        
        # Find and process all markdown files
        md_files = self.file_handler.find_markdown_files(self.source_dir)
        if not md_files:
            raise ValueError("No markdown files found in source directory")
        
        documents = []
        for md_file in md_files:
            try:
                doc = self.processor.process_file(md_file)
                documents.append(doc)
            except Exception as e:
                print(f"Warning: Failed to process {md_file}: {e}")
        
        if not documents:
            raise ValueError("No documents were successfully processed")
        
        # Generate individual pages
        for doc in documents:
            self._generate_page(doc)
        
        # Generate index page
        self._generate_index(documents)
    
    def _generate_page(self, document: Dict) -> None:
        """Generate a single page."""
        context = {
            'title': document['title'],
            'content': document['content'],
            'toc': document.get('toc', '')
        }
        
        try:
            html = self.template_engine.render('page.html', context)
            output_file = self.output_dir / f"{document['file_path'].stem}.html"
            self.file_handler.write_file(output_file, html)
        except FileNotFoundError:
            # Fallback to simple HTML if template not found
            html = self._simple_page_template(context)
            output_file = self.output_dir / f"{document['file_path'].stem}.html"
            self.file_handler.write_file(output_file, html)
    
    def _generate_index(self, documents: List[Dict]) -> None:
        """Generate index page with links to all documents."""
        links = []
        for doc in documents:
            filename = f"{doc['file_path'].stem}.html"
            links.append(f'<li><a href="{filename}">{doc["title"]}</a></li>')
        
        context = {
            'title': 'Wiki Index',
            'content': f'<ul>{"".join(links)}</ul>',
            'toc': ''
        }
        
        try:
            html = self.template_engine.render('index.html', context)
        except FileNotFoundError:
            html = self._simple_page_template(context)
        
        self.file_handler.write_file(self.output_dir / 'index.html', html)
    
    def _simple_page_template(self, context: Dict) -> str:
        """Fallback template when no template files exist."""
        return f"""<!DOCTYPE html>
<html>
<head>
    <title>{context['title']}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #333; }}
        .toc {{ background: #f5f5f5; padding: 10px; margin: 20px 0; }}
    </style>
</head>
<body>
    <h1>{context['title']}</h1>
    {f'<div class="toc">{context["toc"]}</div>' if context.get('toc') else ''}
    <div class="content">{context['content']}</div>
</body>
</html>"""