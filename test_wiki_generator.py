import unittest
import tempfile
import shutil
from pathlib import Path
from wiki_generator import WikiGenerator, DocumentProcessor, TemplateEngine, FileHandler

class TestDocumentProcessor(unittest.TestCase):
    
    def setUp(self):
        self.processor = DocumentProcessor()
        self.temp_dir = Path(tempfile.mkdtemp())
    
    def tearDown(self):
        shutil.rmtree(self.temp_dir)
    
    def test_process_valid_markdown(self):
        md_file = self.temp_dir / "test.md"
        md_file.write_text("# Test Title\n\nThis is content.")
        
        result = self.processor.process_file(md_file)
        
        self.assertEqual(result['title'], 'Test Title')
        self.assertIn('<h1>Test Title</h1>', result['content'])
        self.assertIn('<p>This is content.</p>', result['content'])
    
    def test_process_nonexistent_file(self):
        with self.assertRaises(FileNotFoundError):
            self.processor.process_file(Path("nonexistent.md"))

class TestTemplateEngine(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.engine = TemplateEngine(self.temp_dir)
    
    def tearDown(self):
        shutil.rmtree(self.temp_dir)
    
    def test_render_template(self):
        template_file = self.temp_dir / "test.html"
        template_file.write_text("<h1>{{title}}</h1><p>{{content}}</p>")
        
        result = self.engine.render("test.html", {"title": "Test", "content": "Hello"})
        
        self.assertEqual(result, "<h1>Test</h1><p>Hello</p>")
    
    def test_render_nonexistent_template(self):
        with self.assertRaises(FileNotFoundError):
            self.engine.render("nonexistent.html", {})

class TestWikiGenerator(unittest.TestCase):
    
    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp())
        self.source_dir = self.temp_dir / "source"
        self.output_dir = self.temp_dir / "output"
        self.source_dir.mkdir()
    
    def tearDown(self):
        shutil.rmtree(self.temp_dir)
    
    def test_generate_wiki_success(self):
        # Create test markdown files
        (self.source_dir / "page1.md").write_text("# Page One\n\nContent for page one.")
        (self.source_dir / "page2.md").write_text("# Page Two\n\nContent for page two.")
        
        generator = WikiGenerator(str(self.source_dir), str(self.output_dir))
        generator.generate()
        
        # Check output files exist
        self.assertTrue((self.output_dir / "index.html").exists())
        self.assertTrue((self.output_dir / "page1.html").exists())
        self.assertTrue((self.output_dir / "page2.html").exists())
        
        # Check index contains links
        index_content = (self.output_dir / "index.html").read_text()
        self.assertIn("page1.html", index_content)
        self.assertIn("page2.html", index_content)
    
    def test_generate_empty_source_directory(self):
        generator = WikiGenerator(str(self.source_dir), str(self.output_dir))
        
        with self.assertRaises(ValueError):
            generator.generate()
    
    def test_generate_nonexistent_source_directory(self):
        generator = WikiGenerator("nonexistent", str(self.output_dir))
        
        with self.assertRaises(FileNotFoundError):
            generator.generate()

if __name__ == '__main__':
    unittest.main()