import React, { useState } from 'react';
import DiagramsPanel from './DiagramsPanel.jsx';
import ExportHistoryPanel from './ExportHistoryPanel.jsx';
import AccountSettingsPanel from './AccountSettingsPanel.jsx';
import authService from '../services/authService.js';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('diagrams');
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const tabs = [
    { id: 'diagrams', label: 'My Diagrams', component: DiagramsPanel },
    { id: 'exports', label: 'Export History', component: ExportHistoryPanel },
    { id: 'settings', label: 'Account Settings', component: AccountSettingsPanel },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || user?.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="dashboard-content">
        {ActiveComponent && <ActiveComponent />}
      </main>
    </div>
  );
};

export default Dashboard;