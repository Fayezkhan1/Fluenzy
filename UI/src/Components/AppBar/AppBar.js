import React from 'react';
import './AppBar.css';

function AppBar({ currentPage, onNavigate, user, onLogout }) {
  return (
    <nav className="appbar">
      <div className="appbar-brand" onClick={() => onNavigate('home')}>
        <div className="appbar-logo">🌿</div>
        <span className="appbar-title">Lūmi</span>
      </div>
      <div className="appbar-nav">
        <button onClick={() => onNavigate('home')} className={currentPage === 'home' ? 'active' : ''}>
          Home
        </button>
        <button onClick={() => onNavigate('practise')} className={currentPage === 'practise' ? 'active' : ''}>
          Practice
        </button>
        <button onClick={() => onNavigate('progress')} className={currentPage === 'progress' ? 'active' : ''}>
          Progress
        </button>
        <button
          className="appbar-avatar"
          onClick={() => onNavigate('profile')}
          title={user?.email}
        >
          {user?.email?.[0].toUpperCase() ?? '?'}
        </button>
        <button onClick={onLogout} className="logout-btn">
          Sign out
        </button>
      </div>
    </nav>
  );
}

export default AppBar;
