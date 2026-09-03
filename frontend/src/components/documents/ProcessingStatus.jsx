import React from 'react';
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertCircle,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { mockPipelineStages } from '../../services/mockData';
import './DocumentComponents.css';

/**
 * ProcessingStatus - Stepper visualization of the multi-stage RAG document processing pipeline:
 * Upload -> Validation -> Extraction -> Cleaning -> Chunking -> Embedding -> Indexing.
 */
function ProcessingStatus({
  stages = mockPipelineStages,
  documentName = 'Document.pdf',
  currentStageId = null
}) {
  const completedCount = stages.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / stages.length) * 100);

  return (
    <div className="pipeline-status-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} style={{ color: '#818cf8' }} />
            RAG Pipeline Status
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Target: <strong style={{ color: '#e2e8f0' }}>{documentName}</strong>
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#818cf8' }}>
            {progressPercent}%
          </span>
          <span style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
            {completedCount} of {stages.length} stages
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="upload-progress-bar-track" style={{ height: '5px' }}>
        <div
          className="upload-progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Stepper items */}
      <div className="pipeline-stepper">
        {stages.map((stage, idx) => {
          const isDone = stage.status === 'completed';
          const isCurrent = stage.status === 'in-progress' || stage.id === currentStageId;
          const isFailed = stage.status === 'failed';
          const isPending = !isDone && !isCurrent && !isFailed;

          let statusClass = 'pending';
          if (isDone) statusClass = 'completed';
          else if (isFailed) statusClass = 'failed';
          else if (isCurrent) statusClass = 'in-progress';

          return (
            <div key={stage.id || idx} className="pipeline-step-item">
              <div className={`pipeline-step-icon ${statusClass}`}>
                {isDone && <CheckCircle2 size={16} />}
                {isCurrent && <Loader2 size={16} className="btn-spinner" />}
                {isFailed && <AlertCircle size={16} />}
                {isPending && <Clock size={15} />}
              </div>

              <div className="pipeline-step-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="pipeline-step-title">{stage.name}</span>
                  {isCurrent && (
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      color: '#a5b4fc',
                      textTransform: 'uppercase'
                    }}>
                      Active
                    </span>
                  )}
                </div>
                <span className="pipeline-step-desc">{stage.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProcessingStatus;
