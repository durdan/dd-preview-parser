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
        duration = (manifest.end_time - manifest.start_time).total_seconds()
        
        report = f"""# Documentation Pipeline Summary Report

## Execution Overview
- **Start Time**: {manifest.start_time.strftime('%Y-%m-%d %H:%M:%S')}
- **End Time**: {manifest.end_time.strftime('%Y-%m-%d %H:%M:%S')}
- **Duration**: {duration:.2f} seconds

## Processing Statistics
- **Total Files**: {manifest.stats['total_files']}
- **Successfully Processed**: {manifest.stats['successful']}
- **Errors**: {manifest.stats['errors']}
- **Skipped**: {manifest.stats['skipped']}
- **Success Rate**: {(manifest.stats['successful'] / max(manifest.stats['total_files'], 1) * 100):.1f}%

"""
        
        # Add error details if any
        error_files = manifest.get_files_by_status('error')
        if error_files:
            report += "## Processing Errors\n\n"
            for file_meta in error_files:
                report += f"- **{file_meta.source_path}**: {file_meta.error_message}\n"
            report += "\n"
        
        # Add file statistics
        successful_files = manifest.get_files_by_status('success')
        if successful_files:
            total_words = sum(f.word_count or 0 for f in successful_files)
            total_lines = sum(f.line_count or 0 for f in successful_files)
            
            report += f"""## Content Statistics
- **Total Words**: {total_words:,}
- **Total Lines**: {total_lines:,}
- **Average Words per File**: {total_words // len(successful_files):,}

"""
        
        # Add file listing
        report += "## Processed Files\n\n"
        for file_path, metadata in sorted(manifest.files.items()):
            status_icon = "✅" if metadata.status == 'success' else "❌"
            size_kb = metadata.file_size / 1024
            report += f"- {status_icon} **{Path(file_path).name}** ({size_kb:.1f} KB)\n"
            if metadata.word_count:
                report += f"  - Words: {metadata.word_count:,}, Lines: {metadata.line_count:,}\n"
        
        report += f"\n---\n*Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
        
        return report