import json
import csv
import xml.etree.ElementTree as ET
from abc import ABC, abstractmethod
from typing import Any, Dict, List
import io
from export_types import QualitySettings, ExportFormat

class FormatExporter(ABC):
    @abstractmethod
    def export(self, data: Any, output_path: str, quality_settings: QualitySettings) -> None:
        pass
    
    @abstractmethod
    def validate_data(self, data: Any) -> bool:
        pass

class JSONExporter(FormatExporter):
    def export(self, data: Any, output_path: str, quality_settings: QualitySettings) -> None:
        if not self.validate_data(data):
            raise ValueError("Data is not JSON serializable")
        
        indent = None if quality_settings.optimize_size else 2
        separators = (',', ':') if quality_settings.optimize_size else None
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=indent, separators=separators, ensure_ascii=False)
    
    def validate_data(self, data: Any) -> bool:
        try:
            json.dumps(data)
            return True
        except (TypeError, ValueError):
            return False

class CSVExporter(FormatExporter):
    def export(self, data: Any, output_path: str, quality_settings: QualitySettings) -> None:
        if not self.validate_data(data):
            raise ValueError("Data must be a list of dictionaries for CSV export")
        
        if not data:
            # Create empty CSV file
            with open(output_path, 'w', newline='', encoding='utf-8') as f:
                pass
            return
        
        fieldnames = data[0].keys()
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
    
    def validate_data(self, data: Any) -> bool:
        return (isinstance(data, list) and 
                all(isinstance(item, dict) for item in data))

class XMLExporter(FormatExporter):
    def export(self, data: Any, output_path: str, quality_settings: QualitySettings) -> None:
        if not self.validate_data(data):
            raise ValueError("Data must be a dictionary or list for XML export")
        
        root = self._dict_to_xml(data, "root")
        tree = ET.ElementTree(root)
        
        # Format XML based on quality settings
        if not quality_settings.optimize_size:
            self._indent_xml(root)
        
        tree.write(output_path, encoding='utf-8', xml_declaration=True)
    
    def validate_data(self, data: Any) -> bool:
        return isinstance(data, (dict, list))
    
    def _dict_to_xml(self, data: Any, tag: str) -> ET.Element:
        element = ET.Element(tag)
        
        if isinstance(data, dict):
            for key, value in data.items():
                child = self._dict_to_xml(value, str(key))
                element.append(child)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                child = self._dict_to_xml(item, f"item_{i}")
                element.append(child)
        else:
            element.text = str(data)
        
        return element
    
    def _indent_xml(self, elem: ET.Element, level: int = 0):
        indent = "\n" + level * "  "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = indent + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = indent
            for child in elem:
                self._indent_xml(child, level + 1)
            if not child.tail or not child.tail.strip():
                child.tail = indent
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = indent

class PDFExporter(FormatExporter):
    def export(self, data: Any, output_path: str, quality_settings: QualitySettings) -> None:
        # Simplified PDF export - in real implementation, use reportlab or similar
        if not self.validate_data(data):
            raise ValueError("Data must be convertible to string for PDF export")
        
        # Mock PDF creation - replace with actual PDF library
        content = self._format_content(data, quality_settings)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(f"PDF Content (Mock)\nResolution: {quality_settings.resolution_dpi} DPI\n")
            f.write(f"Optimized: {quality_settings.optimize_size}\n\n")
            f.write(content)
    
    def validate_data(self, data: Any) -> bool:
        try:
            str(data)
            return True
        except:
            return False
    
    def _format_content(self, data: Any, quality_settings: QualitySettings) -> str:
        if isinstance(data, (dict, list)):
            return json.dumps(data, indent=2 if quality_settings.preserve_formatting else None)
        return str(data)

class ExporterFactory:
    _exporters = {
        ExportFormat.JSON: JSONExporter,
        ExportFormat.CSV: CSVExporter,
        ExportFormat.XML: XMLExporter,
        ExportFormat.PDF: PDFExporter,
    }
    
    @classmethod
    def get_exporter(cls, format: ExportFormat) -> FormatExporter:
        exporter_class = cls._exporters.get(format)
        if not exporter_class:
            raise ValueError(f"Unsupported export format: {format}")
        return exporter_class()