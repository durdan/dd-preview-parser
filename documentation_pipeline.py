"""
Main documentation pipeline orchestrator
"""

import logging
from pathlib import Path
from typing import List
from processing_manifest import ProcessingManifest
from file_organizer import FileOrganizer
from summary_reporter import SummaryReporter
from document_processor import DocumentProcessor

class DocumentationPipeline:
    def __init__(self, input_dir: Path, output_dir: Path):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.manifest = ProcessingManifest()
        self.organizer = FileOrganizer(output_dir)
        self.processor = DocumentProcessor()
        self.reporter = SummaryReporter()
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
    
    def execute(self) -> bool:
        """Execute the complete documentation pipeline"""
        try:
            self.logger.info(f"Starting documentation pipeline: {self.input_dir} -> {self.output_dir}")
            
            # Initialize output structure
            self.organizer.setup_directories()
            
            # Discover and process files
            files = self._discover_files()
            self.logger.info(f"Found {len(files)} files to process")
            
            # Process each file
            for file_path in files:
                self._process_file(file_path)
            
            # Generate outputs
            self._finalize_pipeline()
            
            self.logger.info("Documentation pipeline completed successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Pipeline failed: {e}")
            return False
    
    def _discover_files(self) -> List[Path]:
        """Discover documentation files in input directory"""
        doc_extensions = {'.md', '.rst', '.txt', '.adoc', '.html'}
        files = []
        
        for file_path in self.input_dir.rglob('*'):
            if file_path.is_file() and file_path.suffix.lower() in doc_extensions:
                files.append(file_path)
        
        return sorted(files)
    
    def _process_file(self, file_path: Path):
        """Process a single documentation file"""
        try:
            self.logger.info(f"Processing: {file_path}")
            
            # Process the file
            result = self.processor.process(file_path)
            
            # Organize output
            output_path = self.organizer.place_file(file_path, self.input_dir)
            
            # Record in manifest
            self.manifest.add_file(file_path, output_path, result)
            
        except Exception as e:
            self.logger.error(f"Failed to process {file_path}: {e}")
            self.manifest.add_error(file_path, str(e))
    
    def _finalize_pipeline(self):
        """Generate final outputs and reports"""
        # Save processing manifest
        manifest_path = self.output_dir / "processing_manifest.json"
        self.manifest.save(manifest_path)
        
        # Generate summary report
        report_path = self.output_dir / "pipeline_summary.md"
        self.reporter.generate_report(self.manifest, report_path)
        
        self.logger.info(f"Manifest saved to: {manifest_path}")
        self.logger.info(f"Summary report saved to: {report_path}")