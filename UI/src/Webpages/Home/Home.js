import React from 'react';
import './Home.css';

const features = [
  { icon: '🎙️', title: 'Real-time Voice AI', desc: 'Speak naturally and get instant responses from your AI English coach.' },
  { icon: '📊', title: 'Fluency Feedback', desc: 'Track your pronunciation, grammar, and fluency improvements over time.' },
  { icon: '🧠', title: 'Adaptive Learning', desc: 'The AI adapts to your level and focuses on your weak spots automatically.' },
];

function Home({ onNavigate }) {
  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-badge">✦ AI-Powered English Coach</div>
        <h1 className="home-title">
          Speak English with<br /><span>confidence</span>
        </h1>
        <p className="home-description">
          Practice real conversations with an AI coach that listens, responds, and helps you improve — anytime, anywhere.
        </p>
        <div className="home-cta">
          <button className="btn-primary" onClick={() => onNavigate('practise')}>
            Start practicing →
          </button>
          <button className="btn-secondary" onClick={() => onNavigate('profile')}>
            View profile
          </button>
        </div>
      </div>
      <div className="home-features">
        {features.map((f) => (
          <div className="feature-card" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
