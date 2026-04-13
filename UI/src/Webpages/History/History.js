import React, { useState, useEffect } from 'react';
import { getSessions, deleteSession } from '../../services/SessionService';
import './History.css';

function History() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessions().then((result) => {
      if (result?.sessions) setSessions(result.sessions);
    }).finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPreview = (transcripts) => {
    if (!transcripts) return 'No conversation recorded';
    const lines = transcripts.split('\n');
    return lines[0]?.substring(0, 80) + (lines[0]?.length > 80 ? '...' : '');
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this session?')) return;
    await deleteSession(selectedSession.session_id);
    setSessions(sessions.filter(s => s.session_id !== selectedSession.session_id));
    setSelectedSession(null);
  };

  if (loading) return (
    <div className="history-container">
      <div className="history-loading">Loading sessions...</div>
    </div>
  );

  if (selectedSession) return (
    <div className="history-container">
      <div className="history-header">
        <button className="back-button" onClick={() => setSelectedSession(null)}>← Back</button>
        <h1 className="history-title">Session #{selectedSession.session_id}</h1>
        <p className="history-subtitle">{formatDate(selectedSession.created_at)}</p>
      </div>

      <div className="session-summary">
        <div className="summary-card">
          <span className="summary-label">Duration</span>
          <span className="summary-value">{formatDuration(selectedSession.duration_seconds || 0)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Words Spoken</span>
          <span className="summary-value">{selectedSession.words_spoken || 0}</span>
        </div>
      </div>

      <div className="grammar-section">
        <h2 className="grammar-title">Grammatical Analysis</h2>
        <div className="grammar-content">
          {selectedSession.grammatical_errors === 'GEMINI_ERROR' 
            ? 'Unable to analyze grammar - Gemini API error. Please try again later.'
            : (selectedSession.grammatical_errors || 'No grammatical errors detected.')}
        </div>
      </div>

      <div className="transcript-section">
        <h2 className="transcript-title">Conversation</h2>
        <div className="history-card-content">
          {selectedSession.transcripts?.split('\n').map((line, i) => {
            const [role, ...textParts] = line.split(': ');
            const text = textParts.join(': ');
            return (
              <div key={i} className={`history-line ${role?.toLowerCase()}`}>
                <span className="history-line-role">{role}</span>
                <span className="history-line-text">{text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <button className="delete-button" onClick={handleDelete}>Delete Session</button>
    </div>
  );

  return (
    <div className="history-container">
      <div className="history-header">
        <h1 className="history-title">Conversation History</h1>
        <p className="history-subtitle">Review your past practice sessions</p>
      </div>

      <div className="history-list">
        {sessions.length === 0 ? (
          <div className="history-empty">No sessions yet. Start practicing to see your history here.</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.session_id}
              className="history-card"
              onClick={() => setSelectedSession(session)}
            >
              <div className="history-card-header">
                <div className="history-card-info">
                  <span className="history-card-number">Session #{session.session_id}</span>
                  <span className="history-card-date">{formatDate(session.created_at)}</span>
                </div>
                <span className="history-card-arrow">→</span>
              </div>
              <p className="history-card-preview">{getPreview(session.transcripts)}</p>
              <div className="history-card-stats">
                <span>{formatDuration(session.duration_seconds || 0)}</span>
                <span>{session.words_spoken || 0} words</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default History;
