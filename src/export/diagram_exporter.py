import time
from pathlib import Path
from typing import Any, Dict
import cairosvg
import io
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing
from svglib.svglib import renderSVG

from .types import ExportFormat, ExportOptions, ExportResult

class DiagramExporter:
    """Core service for exporting individual diagrams"""
    
    def export_diagram(self, diagram_data: str, output_path: Path, options: ExportOptions) -> ExportResult:
        """Export a single diagram to specified format"""
        if not diagram_data or not diagram_data.strip():
            return ExportResult(success=False, error_message="Empty diagram data")
        
        start_time = time.time()
        
        try:
            if options.format == ExportFormat.SVG:
                result = self._export_svg(diagram_data, output_path, options)
            elif options.format == ExportFormat.PNG:
                result = self._export_png(diagram_data, output_path, options)
            elif options.format == ExportFormat.PDF:
                result = self._export_pdf(diagram_data, output_path, options)
            else:
                return ExportResult(success=False, error_message=f"Unsupported format: {options.format}")
            
            processing_time = time.time() - start_time
            if result.success:
                result.processing_time = processing_time
                result.file_size = output_path.stat().st_size if output_path.exists() else None
            
            return result
            
        except Exception as e:
            return ExportResult(success=False, error_message=f"Export failed: {str(e)}")
    
    def _export_svg(self, diagram_data: str, output_path: Path, options: ExportOptions) -> ExportResult:
        """Export as SVG format"""
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Apply any SVG-specific modifications
            svg_content = self._apply_svg_options(diagram_data, options)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            
            return ExportResult(success=True, file_path=output_path)
        except Exception as e:
            return ExportResult(success=False, error_message=f"SVG export failed: {str(e)}")
    
    def _export_png(self, diagram_data: str, output_path: Path, options: ExportOptions) -> ExportResult:
        """Export as PNG format"""
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            quality_settings = options.get_quality_settings()
            
            cairosvg.svg2png(
                bytestring=diagram_data.encode('utf-8'),
                write_to=str(output_path),
                output_width=options.width,
                output_height=options.height,
                dpi=quality_settings["dpi"],
                background_color=None if options.transparent else options.background_color
            )
            
            return ExportResult(success=True, file_path=output_path)
        except Exception as e:
            return ExportResult(success=False, error_message=f"PNG export failed: {str(e)}")
    
    def _export_pdf(self, diagram_data: str, output_path: Path, options: ExportOptions) -> ExportResult:
        """Export as PDF format"""
        try:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Convert SVG to ReportLab drawing
            svg_file = io.StringIO(diagram_data)
            drawing = renderSVG.renderSVG(svg_file)
            
            # Apply quality settings
            quality_settings = options.get_quality_settings()
            
            renderPDF.drawToFile(drawing, str(output_path), fmt='PDF')
            
            return ExportResult(success=True, file_path=output_path)
        except Exception as e:
            return ExportResult(success=False, error_message=f"PDF export failed: {str(e)}")
    
    def _apply_svg_options(self, svg_content: str, options: ExportOptions) -> str:
        """Apply SVG-specific options like dimensions and background"""
        # Simple implementation - in practice, would use proper SVG parsing
        if options.width and options.height:
            # Replace or add width/height attributes
            import re
            svg_content = re.sub(r'width="[^"]*"', f'width="{options.width}"', svg_content)
            svg_content = re.sub(r'height="[^"]*"', f'height="{options.height}"', svg_content)
        
        return svg_content