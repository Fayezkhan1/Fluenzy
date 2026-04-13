import React, { useRef, useEffect, useState } from 'react';
import { saveSession } from '../../services/SessionService';
import { fetchWithAuth } from '../../services/AuthService';
import { useElevenLabsConversation } from '../../services/ElevenLabsService';
import GrammarBreakdown from '../../Components/GrammarBreakdown/GrammarBreakdown';
import './Practise.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MODES = [
  { key: 'live', label: 'Live Conversation', icon: '💬', desc: 'Free-flowing chat to build fluency', env: 'REACT_APP_AGENT_LIVE_CONVERSATION' },
  { key: 'scenario', label: 'Scenario Practice', icon: '🎭', desc: 'Role-play real-life situations', env: 'REACT_APP_AGENT_SCENARIO_PRACTICE' },
  { key: 'debate', label: 'Debate', icon: '⚔️', desc: 'Argue a position and defend your views', env: 'REACT_APP_AGENT_DEBATE' },
  { key: 'speed', label: 'Speed Thinking', icon: '⚡', desc: 'Quick-fire responses under pressure', env: 'REACT_APP_AGENT_SPEED_THINKING' },
];

function Practise() {
  const transcriptEndRef = useRef(null);
  const [credits, setCredits] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [grammarAnalysis, setGrammarAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [endedTranscripts, setEndedTranscripts] = useState([]);

  useEffect(() => {
    fetchWithAuth(`${API_URL}/api/credits`)
      .then(r => r.json())
      .then(d => setCredits(d.remaining));
  }, []);

  const formatTranscripts = (transcripts) => {
    return transcripts.map(t => `${t.role}: ${t.text}`).join('\n');
  };

  const handleSessionEnd = async (transcripts, stats) => {
    if (transcripts.length > 0) {
      setAnalysisLoading(true);
      setSessionEnded(true);
      setEndedTranscripts(transcripts);
      const result = await saveSession(formatTranscripts(transcripts), stats.durationSeconds, stats.wordsSpoken);
      if (result?.grammar_analysis) {
        setGrammarAnalysis(result.grammar_analysis);
      }
      setAnalysisLoading(false);
    }
  };

  const { startConversation, endConversation, getSessionStats, clearTranscripts, status, isSpeaking, transcripts } = useElevenLabsConversation();
  const isConnected = status === 'connected';

  useEffect(() => {
    if (transcriptEndRef.current && !sessionEnded) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, sessionEnded]);

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setGrammarAnalysis(null);
    setSessionEnded(false);
    setEndedTranscripts([]);
  };

  const handleBack = async () => {
    if (isConnected) {
      const stats = getSessionStats();
      await endConversation();
      await handleSessionEnd(transcripts, stats);
    }
    clearTranscripts();
    setSelectedMode(null);
    setGrammarAnalysis(null);
    setSessionEnded(false);
    setEndedTranscripts([]);
  };

  const handleNewSession = () => {
    clearTranscripts();
    setGrammarAnalysis(null);
    setSessionEnded(false);
    setEndedTranscripts([]);
  };

  const toggleConversation = async () => {
    if (isConnected) {
      const stats = getSessionStats();
      await endConversation();
      await handleSessionEnd(transcripts, stats);
    } else {
      setGrammarAnalysis(null);
      setSessionEnded(false);
      setEndedTranscripts([]);
      const agentId = process.env[selectedMode.env];
      await startConversation(agentId);
    }
  };

  const statusText = isConnected
    ? isSpeaking ? 'AI is speaking...' : 'Listening to you...'
    : sessionEnded ? 'Session complete' : 'Ready when you are';

  const displayTranscripts = sessionEnded ? endedTranscripts : transcripts;

  if (!selectedMode) {
    return (
      <div className="practise-container">
        <div className="practise-header">
          <h1 className="practise-title">Practice</h1>
          <p className="practise-subtitle">Choose a mode to start practicing</p>
          {credits !== null && (
            <span className="credits-badge">{credits.toLocaleString()} credits remaining</span>
          )}
        </div>
        <div className="mode-grid">
          {MODES.map(mode => (
            <button key={mode.key} className="mode-card" onClick={() => handleModeSelect(mode)}>
              <span className="mode-icon">{mode.icon}</span>
              <span className="mode-label">{mode.label}</span>
              <span className="mode-desc">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="practise-container">
      <div className="practise-header">
        <button className="back-button" onClick={handleBack}>← Back</button>
        <h1 className="practise-title">{selectedMode.icon} {selectedMode.label}</h1>
        <p className="practise-subtitle">{selectedMode.desc}</p>
        {credits !== null && (
          <span className="credits-badge">{credits.toLocaleString()} credits remaining</span>
        )}
      </div>

      <div className="practise-main">
        <div className="transcript-panel">
          <div className="transcript-list">
            {displayTranscripts.map((t, i) => (
              <div key={i} className={`transcript-item ${t.role}`}>
                <span className="transcript-role">{t.role}</span>
                <span className="transcript-text">{t.text}</span>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        <div className="mic-section">
          <div className="mic-ring">
            <div className={`mic-ring-pulse ${isConnected ? 'active' : ''}`} />
            <button
              className={`mic-button ${isConnected ? 'connected' : ''} ${sessionEnded ? 'ended' : ''}`}
              onClick={sessionEnded ? handleNewSession : toggleConversation}
              aria-label={isConnected ? 'Stop conversation' : sessionEnded ? 'Start new session' : 'Start conversation'}
            >
              {isConnected ? '⏹' : sessionEnded ? '🔄' : '🎙️'}
            </button>
          </div>

          <div className={`practise-status ${isConnected ? 'active' : ''} ${sessionEnded ? 'ended' : ''}`}>
            <div className={`status-dot ${isConnected ? 'active' : ''} ${sessionEnded ? 'done' : ''}`} />
            {statusText}
          </div>

          <p className="practise-hint">
            {isConnected ? 'Click to end the session' : sessionEnded ? 'Click to start a new session' : 'Microphone access required'}
          </p>
        </div>
      </div>

      {(sessionEnded || analysisLoading) && (
        <GrammarBreakdown
          analysis={grammarAnalysis}
          loading={analysisLoading}
          transcripts={endedTranscripts}
        />
      )}
    </div>
  );
}

export default Practise;
