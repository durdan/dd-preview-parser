import React, { useState, useEffect } from 'react';
import exportService from '../services/exportService.js';

const ExportHistoryPanel = () => {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ format: '', dateRange: '30' });

  useEffect(() => {
    loadExports();
  }, [filters]);

  const loadExports = async () => {
    try {
      setLoading(true);
      const data = await exportService.getExportHistory(filters);
      setExports(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="loading">Loading export history...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="exports-panel">
      <div className="panel-header">
        <h2>Export History</h2>
        <div className="filters">
          <select 
            value={filters.format} 
            onChange={(e) => handleFilterChange('format', e.target.value)}
          >
            <option value="">All Formats</option>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
            <option value="pdf">PDF</option>
          </select>
          <select 
            value={filters.dateRange} 
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {exports.length === 0 ? (
        <div className="empty-state">
          <p>No exports found for the selected criteria.</p>
        </div>
      ) : (
        <div className="exports-table">
          <table>
            <thead>
              <tr>
                <th>Diagram</th>
                <th>Format</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exports.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.diagramName}</td>
                  <td>{exp.format.toUpperCase()}</td>
                  <td>{new Date(exp.createdAt).toLocaleString()}</td>
                  <td className={`status ${exp.status}`}>{exp.status}</td>
                  <td>
                    {exp.status === 'completed' && exp.downloadUrl && (
                      <a href={exp.downloadUrl} download>Download</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExportHistoryPanel;