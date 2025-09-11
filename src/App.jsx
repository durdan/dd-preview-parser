import React, { useState } from 'react';
import DiagramDocumentation from './components/DiagramDocumentation';
import './App.css';

const App = () => {
  const [selectedDiagram, setSelectedDiagram] = useState('diagram-1');
  const [mode, setMode] = useState('view');

  const mockDiagrams = [
    { id: 'diagram-1', name: 'User Flow Diagram' },
    { id: 'diagram-2', name: 'System Architecture' },
    { id: 'diagram-3', name: 'Database Schema' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>Diagram Documentation System</h1>
      </header>
      
      <div className="app-content">
        <aside className="sidebar">
          <h3>Diagrams</h3>
          <ul className="diagram-list">
            {mockDiagrams.map(diagram => (
              <li key={diagram.id}>
                <button
                  onClick={() => setSelectedDiagram(diagram.id)}
                  className={selectedDiagram === diagram.id ? 'active' : ''}
                >
                  {diagram.name}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mode-selector">
            <label>
              <input
                type="radio"
                value="view"
                checked={mode === 'view'}
                onChange={(e) => setMode(e.target.value)}
              />
              View Mode
            </label>
            <label>
              <input
                type="radio"
                value="edit"
                checked={mode === 'edit'}
                onChange={(e) => setMode(e.target.value)}
              />
              Edit Mode
            </label>
          </div>
        </aside>
        
        <main className="main-content">
          <DiagramDocumentation 
            diagramId={selectedDiagram}
            mode={mode}
          />
        </main>
      </div>
    </div>
  );
};

export default App;