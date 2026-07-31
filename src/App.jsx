import React, { useState } from 'react';
import './App.css';
import { ChecklistProvider } from './context/ChecklistContext';
import Sidebar from './components/Sidebar/Sidebar';
import Board from './components/Board/Board';
import UserSwitcher from './components/UserSwitcher/UserSwitcher';

function AppContent() {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  return (
    <div className="app-container">
      <Sidebar 
        selectedGroupId={selectedGroupId} 
        onSelectGroup={setSelectedGroupId} 
      />
      
      <main className="main-content">
        <header className="header">
          <div className="header-title">TaskFlow</div>
          <UserSwitcher />
        </header>
        
        <div className="content-area">
          <Board selectedGroupId={selectedGroupId} />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ChecklistProvider>
      <AppContent />
    </ChecklistProvider>
  );
}

export default App;
