"""
Summary reporter for generating pipeline execution reports
"""

from datetime import datetime
from pathlib import Path
from processing_manifest import ProcessingManifest

class SummaryReporter:
    def generate_report(self, manifest: ProcessingManifest, output_path: Path):
        """Generate a comprehensive summary report"""
        report_content = self._build_report_content(manifest)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
    
    def _build_report_content(self, manifest: ProcessingManifest) -> str:
        """Build the markdown report content"""
        successful_files = manifest.get_files_by_status('success')
        error_files = manifest.get_files_by_status('error')
        
        # Calculate totals
        total_words = sum(f.word_count or 0 for f in successful_files)
        total_lines = sum(f.line_count or 0 for f in successful_files)
        total_size = sum(f.file_size for f in manifest.files.values())
        
        duration = (manifest.end_time - manifest.start_time).total_seconds() if manifest.end_time else 0
        
        report = f"""# Documentation Pipeline Summary Report

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Pipeline Execution

- **Start Time**: {manifest.start_time.strftime('%Y-%m-%d %H:%M:%S')}
- **End Time**: {manifest.end_time.strftime('%Y-%m-%d %H:%M:%S') if manifest.end_time else 'N/A'}
- **Duration**: {duration:.2f} seconds

## Processing Statistics

| Metric | Count |
|--------|-------|
| Total Files | {manifest.stats['total_files']} |
| Successfully Processed | {manifest.stats['successful']} |
| Errors | {manifest.stats['errors']} |
| Skipped | {manifest.stats['skipped']} |

## Content Statistics

| Metric | Value |
|--------|-------|
| Total Words | {total_words:,} |
| Total Lines | {total_lines:,} |
| Total File Size | {self._format_bytes(total_size)} |

## File Processing Details

### Successfully Processed Files ({len(successful_files)})

"""
        
        for file_meta in successful_files:
            report += f"- `{file_meta.source_path}` → `{file_meta.output_path}`\n"
            report += f"  - Size: {self._format_bytes(file_meta.file_size)}, Words: {file_meta.word_count or 'N/A'}, Lines: {file_meta.line_count or 'N/A'}\n"
        
        if error_files:
            report += f"\n### Failed Files ({len(error_files)})\n\n"
            for file_meta in error_files:
                report += f"- `{file_meta.source_path}`\n"
                report += f"  - Error: {file_meta.error_message}\n"
        
        report += f"""
## Pipeline Configuration

- **Input Directory**: Various source paths
- **Output Directory**: Organized in structured format
- **Supported Formats**: Markdown (.md), reStructuredText (.rst), Plain Text (.txt), AsciiDoc (.adoc), HTML (.html)

## Output Structure