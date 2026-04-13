import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getStats } from '../../services/SessionService';
import './Progress.css';

function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const getCalendarWeeks = (calendarData) => {
    if (!calendarData?.length) return [];
    const firstDay = new Date(calendarData[0].date).getDay();
    const padded = [...Array(firstDay).fill(null), ...calendarData];
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    return weeks;
  };

  if (loading) return (
    <div className="progress-container">
      <div className="progress-loading">Loading stats...</div>
    </div>
  );

  const weeks = getCalendarWeeks(stats?.calendar_data);
  const monthLabel = stats?.calendar_data?.[0]
    ? new Date(stats.calendar_data[0].date).toLocaleString('default', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="progress-container">
      <div className="progress-header">
        <h1 className="progress-title">Progress Dashboard</h1>
        <p className="progress-subtitle">Track your learning journey</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📚</span>
          <span className="stat-value">{stats?.total_sessions || 0}</span>
          <span className="stat-label">Sessions Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{stats?.streak || 0}</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatTime(stats?.total_practice_time || 0)}</span>
          <span className="stat-label">Total Practice Time</span>
        </div>
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Practice Time — Last 7 Days</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={stats?.daily_data || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} unit="m" />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              formatter={(val) => [`${val} min`, 'Practice']}
            />
            <Line type="monotone" dataKey="minutes" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h2 className="chart-title">Activity — {monthLabel}</h2>
        <div className="calendar-day-labels">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="calendar-day-label">{d}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="calendar-week">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`calendar-cell ${day === null ? 'empty' : day.active ? 'active' : 'inactive'}`}
                  title={day?.date || ''}
                >
                  {day && <span className="calendar-day-num">{new Date(day.date).getDate()}</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Progress;
