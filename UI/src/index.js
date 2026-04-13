import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Home from './Webpages/Home/Home';
import Login from './Webpages/Login/Login';
import History from './Webpages/History/History';
import Profile from './Webpages/Profile/Profile';
import AppBar from './Components/AppBar/AppBar';
import Progress from './Webpages/Progress/Progress';
import Practise from './Webpages/Practise/Practise';
import { getUser } from './services/AuthService';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((result) => {
      if (result?.user) setUser(result.user);
    }).finally(() => setLoading(false));
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setCurrentPage('home');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f4f0' }}>
      <div className="spinner" />
    </div>
  );


  if (!user) return <Login onLoginSuccess={handleLoginSuccess} />;

  const renderPage = () => {
    if (currentPage === 'practise') return <Practise />;
    if (currentPage === 'history') return <History />;
    if (currentPage === 'progress') return <Progress />;
    if (currentPage === 'profile') return <Profile user={user} />;
    return <Home onNavigate={setCurrentPage} />;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', zIndex: 1 }}>
      <AppBar currentPage={currentPage} onNavigate={setCurrentPage} user={user} onLogout={handleLogout} />
      {renderPage()}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
