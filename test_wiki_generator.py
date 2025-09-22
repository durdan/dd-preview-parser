import unittest
import tempfile
import shutil
import json
from pathlib import Path
from wiki_generator import WikiGenerator, DocumentParser, TemplateEngine, Document

class TestWikiGenerator(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.source_dir = self.test_dir / "source"
        self.output_dir = self.test_dir / "wiki"
        self.template_dir = self.test_dir / "templates"
        
        # Create directories
        self.source_dir.mkdir()
        self.template_dir.mkdir()
        
        # Create test config
        self.config_path = self.test_dir / "config.json"
        config = {
            "source_dir": str(self.source_dir),
            "output_dir": str(self.output_dir),
            "template_dir": str(self.template_dir),
            "file_extensions": [".md"]
        }
        with open(self.config_path, 'w') as f:
            json.dump(config, f)
    
    def tearDown(self):
        shutil.rmtree(self.test_dir)
    
    def test_generate_single_document(self):
        # Create source file
        source_file = self.source_dir / "test.md"
        source_file.write_text("# Test Document\n\nThis is test content.")
        
        generator = WikiGenerator(str(self.config_path))
        count = generator.generate()
        
        self.assertEqual(count, 1)
        output_file = self.output_dir / "test.html"
        self.assertTrue(output_file.exists())
        
        content = output_file.read_text()
        self.assertIn("Test Document", content)
        self.assertIn("This is test content", content)
    
    def test_generate_nested_documents(self):
        # Create nested structure
        nested_dir = self.source_dir / "subdir"
        nested_dir.mkdir()
        
        (self.source_dir / "root.md").write_text("# Root Doc")
        (nested_dir / "nested.md").write_text("# Nested Doc")
        
        generator = WikiGenerator(str(self.config_path))
        count = generator.generate()
        
        self.assertEqual(count, 2)
        self.assertTrue((self.output_dir / "root.html").exists())
        self.assertTrue((self.output_dir / "subdir" / "nested.html").exists())
    
    def test_empty_source_directory(self):
        generator = WikiGenerator(str(self.config_path))
        count = generator.generate()
        self.assertEqual(count, 0)
    
    def test_invalid_source_directory(self):
        config = {
            "source_dir": "nonexistent",
            "output_dir": str(self.output_dir),
            "template_dir": str(self.template_dir),
            "file_extensions": [".md"]
        }
        invalid_config_path = self.test_dir / "invalid_config.json"
        with open(invalid_config_path, 'w') as f:
            json.dump(config, f)
        
        with self.assertRaises(ValueError):
            generator = WikiGenerator(str(invalid_config_path))
            generator.generate()

class TestDocumentParser(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.source_dir = self.test_dir / "source"
        self.source_dir.mkdir()
    
    def tearDown(self):
        shutil.rmtree(self.test_dir)
    
    def test_parse_markdown_with_title(self):
        source_file = self.source_dir / "test.md"
        source_file.write_text("# My Title\n\nContent here")
        
        parser = DocumentParser(str(self.source_dir), [".md"])
        documents = parser.parse_documents()
        
        self.assertEqual(len(documents), 1)
        self.assertEqual(documents[0].title, "My Title")
        self.assertIn("Content here", documents[0].content)
    
    def test_parse_file_without_title(self):
        source_file = self.source_dir / "notitle.md"
        source_file.write_text("Just content without title")
        
        parser = DocumentParser(str(self.source_dir), [".md"])
        documents = parser.parse_documents()
        
        self.assertEqual(len(documents), 1)
        self.assertEqual(documents[0].title, "notitle")

class TestTemplateEngine(unittest.TestCase):
    def setUp(self):
        self.test_dir = Path(tempfile.mkdtemp())
        self.template_dir = self.test_dir / "templates"
        self.template_dir.mkdir()
    
    def tearDown(self):
        shutil.rmtree(self.test_dir)
    
    def test_render_with_default_template(self):
        engine = TemplateEngine(str(self.template_dir))
        doc = Document("Test", "# Header\nContent", {}, "test.html")
        
        rendered = engine.render(doc)
        
        self.assertIn("<title>Test</title>", rendered)
        self.assertIn("<h1>Header</h1>", rendered)
        self.assertIn("<p>Content</p>", rendered)

if __name__ == '__main__':
    unittest.main()