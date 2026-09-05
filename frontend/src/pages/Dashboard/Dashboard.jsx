import React, { useState, useEffect } from 'react';
import {
  Files, HelpCircle, HardDrive, Cpu, ArrowUpRight,
  Sparkles, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { documentService } from '../../services/documentService';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, docsData] = await Promise.all([
          dashboardService.getStats(),
          documentService.getDocuments()
        ]);
        setStats(statsData.stats);
        setRecentActivity(statsData.recent_activity || []);
        setRecentDocs(docsData.slice(0, 5) || []);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ color: 'white', padding: '20px' }}>Loading Dashboard Data...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-title">
        <div>
          <h1 className="dash-title-text">Dashboard Overview</h1>
          <p className="dash-subtitle-text">Real-time vector indexing, ingestion pipeline status, and AI query analytics.</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid-4">
        {/* Metric 1 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Total Documents</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Files size={18} />
            </div>
          </div>
          <div className="metric-value-num">{stats?.total_documents || 0}</div>
          <span className="metric-trend-badge healthy">Active</span>
        </div>

        {/* Metric 2 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Total Conversations</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="metric-value-num">{stats?.total_conversations || 0}</div>
          <span className="metric-trend-badge healthy">Active</span>
        </div>

        {/* Metric 3 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Total Queries</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="metric-value-num">{stats?.total_queries || 0}</div>
          <span className="metric-trend-badge healthy">Processed</span>
        </div>

        {/* Metric 4 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Indexing Health</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Cpu size={18} />
            </div>
          </div>
          <div className="metric-value-num">100%</div>
          <span className="metric-trend-badge healthy">System Healthy</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="dash-two-column-grid">
        {/* Recent Documents Table */}
        <div className="dash-section-card">
          <div className="section-card-title-row">
            <div className="section-card-heading">
              <Files size={18} style={{ color: '#38bdf8' }} />
              <span>Recent Documents</span>
            </div>
            <a href="/documents" style={{ fontSize: '12px', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View All</span>
              <ArrowUpRight size={14} />
            </a>
          </div>

          <table className="custom-dark-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Chunks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDocs.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#64748b' }}>No documents uploaded.</td></tr>
              )}
              {recentDocs.map((doc) => (
                <tr key={doc.document_id}>
                  <td style={{ fontWeight: 600, color: '#f8fafc' }}>{doc.name}</td>
                  <td>{doc.type}</td>
                  <td>{doc.chunks}</td>
                  <td>
                    <span className={`doc-status-chip ${doc.status.toLowerCase()}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Query Activity */}
        <div className="dash-section-card">
          <div className="section-card-title-row">
            <div className="section-card-heading">
              <HelpCircle size={18} style={{ color: '#c084fc' }} />
              <span>Recent Chat Activity</span>
            </div>
          </div>

          <div className="activity-list-stack">
            {recentActivity.length === 0 && (
              <div style={{ color: '#64748b', fontSize: '14px' }}>No recent chats.</div>
            )}
            {recentActivity.map((act) => (
              <div key={act.id} className="activity-item-card">
                <span className="activity-query-text">"{act.title}"</span>
                <div className="activity-meta-row">
                  <span>Chat Session • {new Date(act.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;