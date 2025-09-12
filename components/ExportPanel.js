import React, { useState } from 'react';
import { exportDiagram } from '../services/exportService';

const EXPORT_FORMATS = [
  { value: 'svg', label: 'SVG', description: 'Vector format, scalable' },
  { value: 'png', label: 'PNG', description: 'Raster image, web-friendly' },
  { value: 'pdf', label: 'PDF', description: 'Document format, printable' }
];

export default function ExportPanel({ diagramId, diagramTitle, onClose }) {
  const [selectedFormat, setSelectedFormat] = useState('svg');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    if (!diagramId) {
      setError('No diagram selected for export');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      await exportDiagram(diagramId, selectedFormat, diagramTitle);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-panel">
      <div className="export-panel-header">
        <h3>Export Diagram</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="export-panel-content">
        <div className="format-selection">
          <h4>Select Format</h4>
          {EXPORT_FORMATS.map(format => (
            <label key={format.value} className="format-option">
              <input
                type="radio"
                name="format"
                value={format.value}
                checked={selectedFormat === format.value}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div className="format-info">
                <span className="format-label">{format.label}</span>
                <span className="format-description">{format.description}</span>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="export-actions">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="export-button"
          >
            {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
          </button>
        </div>
      </div>

      <style jsx>{`
        .export-panel {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          width: 400px;
          max-width: 90vw;
        }

        .export-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .export-panel-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #333;
        }

        .export-panel-content {
          padding: 20px;
        }

        .format-selection h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .format-option {
          display: flex;
          align-items: center;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .format-option:hover {
          border-color: #007bff;
          background-color: #f8f9ff;
        }

        .format-option input[type="radio"] {
          margin-right: 12px;
        }

        .format-info {
          display: flex;
          flex-direction: column;
        }

        .format-label {
          font-weight: 600;
          color: #333;
        }

        .format-description {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
          font-size: 14px;
        }

        .export-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }

        .export-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .export-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .export-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}