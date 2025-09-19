"""
Summary reporter for generating pipeline execution reports
"""

from datetime import datetime
from pathlib import Path
from processing_manifest import ProcessingManifest

class SummaryReporter:
    def generate_report(self, manifest: ProcessingManifest, output_path: Path):
        """Generate a comprehensive summary report"""
        summary = manifest.get_summary()
        
        report_content = self._build_report_content(manifest, summary)
        
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report_content)
    
    def _build_report_content(self, manifest: ProcessingManifest, summary: Dict) -> str:
        """Build the markdown report content"""
        duration = (manifest.pipeline_end - manifest.pipeline_start).total_seconds()
        
        report = f"""# Documentation Pipeline Summary Report

Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Pipeline Execution Overview

- **Start Time**: {manifest.pipeline_start.strftime('%Y-%m-%d %H:%M:%S')}
- **End Time**: {manifest.pipeline_end.strftime('%Y-%m-%d %H:%M:%S')}
- **Duration**: {duration:.2f} seconds
- **Total Files Processed**: {summary['total_files']}

## Processing Results

| Metric | Value |
|--------|-------|
| Successful | {summary['successful']} |
| Failed | {summary['failed']} |
| Success Rate | {summary['success_rate']:.1%} |
| Total Size | {self._format_bytes(summary['total_size_bytes'])} |
| Total Words | {summary['total_words']:,} |

## File Processing Details

### Successful Files ({summary['successful']})
"""
        
        successful_files = [f for f in manifest.files if f.status == 'success']
        if successful_files:
            report += "\n| File | Size | Words | Processing Time |\n"
            report += "|------|------|-------|----------------|\n"
            
            for file_meta in successful_files:
                report += f"| {Path(file_meta.source_path).name} | {self._format_bytes(file_meta.file_size)} | {file_meta.word_count or 'N/A'} | {file_meta.processing_time_ms:.1f}ms |\n"
        
        failed_files = [f for f in manifest.files if f.status == 'error']
        if failed_files:
            report += f"\n### Failed Files ({len(failed_files)})\n\n"
            report += "| File | Error |\n"
            report += "|------|-------|\n"
            
            for file_meta in failed_files:
                report += f"| {Path(file_meta.source_path).name} | {file_meta.error_message} |\n"
        
        report += f"""
## Performance Metrics

- **Average Processing Time**: {self._calculate_avg_processing_time(successful_files):.1f}ms
- **Files per Second**: {len(successful_files) / duration:.2f}
- **Words per Second**: {summary['total_words'] / duration:.0f}

## Output Structure