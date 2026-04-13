import React, { useState } from 'react';
import './GrammarBreakdown.css';

const CATEGORY_COLORS = {
  'Tense': '#ef4444',
  'Subject-Verb Agreement': '#f97316',
  'Article': '#eab308',
  'Preposition': '#8b5cf6',
  'Word Choice': '#3b82f6',
  'Sentence Structure': '#ec4899',
  'Spelling': '#14b8a6',
  'Punctuation': '#6366f1',
  'Other': '#6b7280',
};

function ErrorHighlight({ text, corrected, explanation }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="grammar-error-wrap">
      <span
        className="grammar-error-highlight"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {text}
      </span>
      {visible && (
        <span className="grammar-tooltip">
          <span className="grammar-tooltip-corrected">✓ {corrected}</span>
          <span className="grammar-tooltip-explanation">{explanation}</span>
        </span>
      )}
    </span>
  );
}

function AnnotatedText({ text, errorIndices }) {
  if (!errorIndices || errorIndices.length === 0) {
    return <span>{text}</span>;
  }

  const sorted = [...errorIndices].sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;

  sorted.forEach((err, i) => {
    if (err.start > cursor) {
      parts.push(<span key={`plain-${i}`}>{text.slice(cursor, err.start)}</span>);
    }
    parts.push(
      <ErrorHighlight
        key={`err-${i}`}
        text={text.slice(err.start, err.end)}
        corrected={err.corrected}
        explanation={err.explanation}
      />
    );
    cursor = err.end;
  });

  if (cursor < text.length) {
    parts.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

export default function GrammarBreakdown({ analysis, loading, transcripts }) {
  const [activeTab, setActiveTab] = useState('annotated');

  if (loading) {
    return (
      <div className="grammar-breakdown">
        <div className="grammar-breakdown-header">
          <span className="grammar-breakdown-icon">🔍</span>
          <h2 className="grammar-breakdown-title">Analyzing your grammar...</h2>
          <p className="grammar-breakdown-subtitle">Gemini AI is reviewing your conversation</p>
        </div>
        <div className="grammar-skeleton">
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line narrow" />
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { errors, annotated_lines, summary } = analysis;
  const hasErrors = errors && errors.length > 0;
  const userLines = annotated_lines ? annotated_lines.filter(l => l.role === 'user') : [];

  const categoryEntries = summary?.categories
    ? Object.entries(summary.categories).filter(([, count]) => count > 0)
    : [];

  return (
    <div className="grammar-breakdown">
      <div className="grammar-breakdown-header">
        <span className="grammar-breakdown-icon">{hasErrors ? '📝' : '🎉'}</span>
        <h2 className="grammar-breakdown-title">Grammar Breakdown</h2>
        <p className="grammar-breakdown-subtitle">{summary?.overall_feedback}</p>
      </div>

      {/* Score bar */}
      <div className="grammar-score-row">
        <div className="grammar-score-card">
          <span className="grammar-score-num">{summary?.total_errors ?? 0}</span>
          <span className="grammar-score-label">Errors Found</span>
        </div>
        {categoryEntries.map(([cat, count]) => (
          <div className="grammar-score-card" key={cat} style={{ borderTop: `3px solid ${CATEGORY_COLORS[cat] || '#6b7280'}` }}>
            <span className="grammar-score-num" style={{ color: CATEGORY_COLORS[cat] || '#6b7280' }}>{count}</span>
            <span className="grammar-score-label">{cat}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="grammar-tabs">
        <button className={`grammar-tab ${activeTab === 'annotated' ? 'active' : ''}`} onClick={() => setActiveTab('annotated')}>
          Annotated Transcript
        </button>
        <button className={`grammar-tab ${activeTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveTab('errors')}>
          Error List {hasErrors && <span className="grammar-tab-badge">{errors.length}</span>}
        </button>
      </div>

      {activeTab === 'annotated' && (
        <div className="grammar-annotated">
          {!hasErrors ? (
            <div className="grammar-no-errors">
              <span>✅</span> No grammatical errors detected — great job!
            </div>
          ) : (
            <>
              <p className="grammar-annotated-hint">
                Hover over <span className="grammar-error-highlight sample">highlighted text</span> to see corrections
              </p>
              <div className="grammar-transcript-list">
                {userLines.map((line, i) => (
                  <div key={i} className="grammar-transcript-item">
                    <span className="grammar-transcript-role">you</span>
                    <span className="grammar-transcript-text">
                      <AnnotatedText text={line.text} errorIndices={line.error_indices} />
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'errors' && (
        <div className="grammar-errors-list">
          {!hasErrors ? (
            <div className="grammar-no-errors">
              <span>✅</span> No grammatical errors detected — great job!
            </div>
          ) : (
            errors.map((err, i) => (
              <div key={i} className="grammar-error-card" style={{ borderLeft: `4px solid ${CATEGORY_COLORS[err.category] || '#6b7280'}` }}>
                <div className="grammar-error-top">
                  <span className="grammar-error-badge" style={{ background: CATEGORY_COLORS[err.category] || '#6b7280' }}>
                    {err.category}
                  </span>
                  <span className={`grammar-error-severity ${err.severity}`}>{err.severity}</span>
                </div>
                <div className="grammar-error-comparison">
                  <div className="grammar-error-original">
                    <span className="grammar-error-label">❌ Said</span>
                    <span className="grammar-error-text wrong">"{err.original}"</span>
                  </div>
                  <div className="grammar-error-arrow">→</div>
                  <div className="grammar-error-corrected">
                    <span className="grammar-error-label">✅ Should be</span>
                    <span className="grammar-error-text right">"{err.corrected}"</span>
                  </div>
                </div>
                <p className="grammar-error-explanation">{err.explanation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
