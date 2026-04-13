import React, { useState } from 'react';
import { login, register } from '../../services/AuthService';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setError(''); setMessage('');
  };

  const toggleMode = () => { resetForm(); setIsSignUp(p => !p); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (isSignUp && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await register(email, password);
        if (result.error) { setError(result.error); }
        else { setIsSignUp(false); setEmail(''); setPassword(''); setConfirmPassword(''); setError(''); setMessage('Account created! You can now sign in.'); }
      } else {
        const result = await login(email, password);
        if (result.error) { setError(result.error); }
        else {
          localStorage.setItem('access_token', result.access_token);
          localStorage.setItem('refresh_token', result.refresh_token);
          onLoginSuccess(result.user);
        }
      }
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-brand">
          <div className="login-left-logo">🌿</div>
          <span className="login-left-name">Lūmi</span>
        </div>
        <div className="login-left-content">
          <h2 className="login-left-title">Your AI English coach, always ready</h2>
          <p className="login-left-desc">
            Have real conversations, get instant feedback, and build confidence in English — powered by advanced voice AI.
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <h2 className="login-title">{isSignUp ? 'Create account' : 'Welcome back'}</h2>
          <p className="login-subtitle">{isSignUp ? 'Start your fluency journey today' : 'Sign in to continue'}</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete={isSignUp ? 'new-password' : 'current-password'} />
            </div>
            {isSignUp && (
              <div className="login-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input id="confirmPassword" type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="new-password" />
              </div>
            )}
            {error && <p className="login-error">{error}</p>}
            {message && <p className="login-success">{message}</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="login-toggle">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={toggleMode} className="login-toggle-btn">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
