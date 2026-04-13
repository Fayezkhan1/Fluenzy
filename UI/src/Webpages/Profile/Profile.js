import React from 'react';
import './Profile.css';

function Profile({ user }) {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user?.email?.[0].toUpperCase() ?? '?'}
        </div>
        <div className="profile-header-info">
          <h2>{user?.email ?? 'Unknown'}</h2>
          <p>Lūmi member</p>
        </div>
      </div>

      <p className="profile-section-title">Account details</p>
      <div className="profile-card">
        <div className="profile-row">
          <span className="profile-label">Email</span>
          <span className="profile-value">{user?.email ?? '—'}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">User ID</span>
          <span className="profile-value mono">{user?.id ?? '—'}</span>
        </div>
        <div className="profile-row">
          <span className="profile-label">Status</span>
          <span className="profile-badge">✓ Active</span>
        </div>
      </div>
    </div>
  );
}

export default Profile;
