import React from 'react';
import {
  Files,
  HelpCircle,
  HardDrive,
  Cpu,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  mockDashboardStats,
  mockPipelineStages,
  mockRecentDocuments,
  mockRecentActivities
} from '../../services/mockData';
import './Dashboard.css';

function Dashboard() {
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
          <div className="metric-value-num">{mockDashboardStats.totalDocuments.value}</div>
          <span className="metric-trend-badge up">{mockDashboardStats.totalDocuments.change}</span>
        </div>

        {/* Metric 2 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Questions Asked</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>
              <HelpCircle size={18} />
            </div>
          </div>
          <div className="metric-value-num">{mockDashboardStats.questionsAsked.value}</div>
          <span className="metric-trend-badge up">{mockDashboardStats.questionsAsked.change}</span>
        </div>

        {/* Metric 3 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Vector Storage Used</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc' }}>
              <HardDrive size={18} />
            </div>
          </div>
          <div className="metric-value-num">{mockDashboardStats.storageUsed.usedMB} MB</div>
          <span className="metric-trend-badge healthy">{mockDashboardStats.storageUsed.change}</span>
        </div>

        {/* Metric 4 */}
        <div className="metric-card-box">
          <div className="metric-card-header">
            <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>Indexing Health</span>
            <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Cpu size={18} />
            </div>
          </div>
          <div className="metric-value-num">{mockDashboardStats.indexingHealth.value}</div>
          <span className="metric-trend-badge healthy">System Healthy</span>
        </div>
      </div>

      {/* RAG Ingestion Pipeline Section */}
      <div className="dash-section-card">
        <div className="section-card-title-row">
          <div className="section-card-heading">
            <Sparkles size={18} style={{ color: '#818cf8' }} />
            <span>Active RAG Ingestion Pipeline Tracker</span>
          </div>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
            ● Processing Document: Q3 Enterprise Security Audit.pdf
          </span>
        </div>

        <div className="pipeline-steps-flow">
          {mockPipelineStages.slice(0, 5).map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in-progress';
            return (
              <div
                key={stage.id}
                className={`pipeline-step-item ${isCompleted ? 'completed' : isInProgress ? 'in-progress' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    className="step-num-badge"
                    style={{
                      background: isCompleted ? '#10b981' : isInProgress ? '#6366f1' : '#334155',
                      color: '#ffffff'
                    }}
                  >
                    {index + 1}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                  ) : isInProgress ? (
                    <Clock size={16} style={{ color: '#818cf8' }} />
                  ) : (
                    <AlertCircle size={16} style={{ color: '#64748b' }} />
                  )}
                </div>
                <span className="step-name-text">{stage.name}</span>
                <span className="step-desc-text">{stage.description}</span>
              </div>
            );
          })}
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
              {mockRecentDocuments.map((doc) => (
                <tr key={doc.id}>
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
              <span>Recent AI Query Log</span>
            </div>
          </div>

          <div className="activity-list-stack">
            {mockRecentActivities.map((act) => (
              <div key={act.id} className="activity-item-card">
                <span className="activity-query-text">"{act.query}"</span>
                <div className="activity-meta-row">
                  <span>{act.user} • {act.timestamp}</span>
                  <span className="confidence-tag">Match Confidence: {act.confidence}</span>
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