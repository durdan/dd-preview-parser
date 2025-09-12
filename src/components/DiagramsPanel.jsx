import React, { useState, useEffect } from 'react';
import diagramService from '../services/diagramService.js';

const DiagramsPanel = () => {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    try {
      setLoading(true);
      const data = await diagramService.getUserDiagrams();
      setDiagrams(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this diagram?')) return;
    
    try {
      await diagramService.deleteDiagram(id);
      setDiagrams(diagrams.filter(d => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading diagrams...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="diagrams-panel">
      <div className="panel-header">
        <h2>My Diagrams</h2>
        <button className="create-btn">Create New Diagram</button>
      </div>

      {diagrams.length === 0 ? (
        <div className="empty-state">
          <p>No diagrams found. Create your first diagram to get started!</p>
        </div>
      ) : (
        <div className="diagrams-grid">
          {diagrams.map(diagram => (
            <div key={diagram.id} className="diagram-card">
              <h3>{diagram.name}</h3>
              <p className="diagram-meta">
                Created: {new Date(diagram.createdAt).toLocaleDateString()}
              </p>
              <p className="diagram-meta">
                Modified: {new Date(diagram.updatedAt).toLocaleDateString()}
              </p>
              <div className="diagram-actions">
                <button onClick={() => window.open(`/editor/${diagram.id}`)}>
                  Edit
                </button>
                <button onClick={() => handleDelete(diagram.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiagramsPanel;