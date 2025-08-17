import React from 'react';
import "../styles/TelegramExportModal.css"
interface ExportProgress {
  operationId: string;
  status: 'started' | 'progress' | 'completed' | 'error' | 'cancelled' | 'warning';
  accountId: string;
  groupId: string;
  progress?: number;
  currentCount?: number;
  total?: number | string;
  message?: string;
  error?: string;
  code?: number;
  batchSize?: number;
  currentStrategy?: string;
  uniqueMembers?: number;
  duration?: number;
  partialCount?: number;
}

interface TelegramExportProgressModalProps {
  progressData: ExportProgress | null;
  onClose: () => void;
  onDownload?: () => void;
}

const TelegramExportProgressModal: React.FC<TelegramExportProgressModalProps> = ({ 
  progressData, 
  onClose,
  onDownload
}) => {
  if (!progressData) return null;

  const getStatusColor = () => {
    switch (progressData.status) {
      case 'error': return 'tg-export-error';
      case 'completed': return 'tg-export-success';
      case 'cancelled': return 'tg-export-warning';
      case 'warning': return 'tg-export-warning';
      default: return 'tg-export-progress';
    }
  };

  const getStatusIcon = () => {
    switch (progressData.status) {
      case 'error': return '❌';
      case 'completed': return '✅';
      case 'started': return '⏳';
      case 'cancelled': return '⚠️';
      case 'warning': return '⚠️';
      default: return '🔄';
    }
  };

  const getStatusTitle = () => {
    switch (progressData.status) {
      case 'started': return 'Export Started';
      case 'progress': return 'Export in Progress';
      case 'completed': return 'Export Completed!';
      case 'error': return 'Export Failed';
      case 'cancelled': return 'Export Cancelled';
      case 'warning': return 'Notice';
      default: return 'Export Status';
    }
  };

  return (
    <div className="tg-export-modal-overlay">
      <div className={`tg-export-modal-container ${getStatusColor()}`}>
        <div className="tg-export-modal-header">
          <h2 className="tg-export-modal-title">
            {getStatusIcon()} {getStatusTitle()}
          </h2>
          <button 
            onClick={onClose}
            className="tg-export-modal-close"
          >
            &times;
          </button>
        </div>

        <div className="tg-export-modal-body">
          <div className="tg-export-meta">
            <div className="tg-export-meta-item">
              <span className="tg-export-meta-label">Group ID:</span>
              <span className="tg-export-meta-value">{progressData.groupId}</span>
            </div>
            <div className="tg-export-meta-item">
              <span className="tg-export-meta-label">Account ID:</span>
              <span className="tg-export-meta-value">{progressData.accountId}</span>
            </div>
          </div>

          {progressData.currentStrategy && (
            <div className="tg-export-strategy">
              <span className="tg-export-strategy-label">Current Strategy:</span>
              <span className="tg-export-strategy-value">{progressData.currentStrategy}</span>
            </div>
          )}

          {progressData.progress !== undefined && (
            <div className="tg-export-progress-container">
              <div className="tg-export-progress-bar">
                <div 
                  className="tg-export-progress-fill"
                  style={{ width: `${progressData.progress}%` }}
                ></div>
              </div>
              <div className="tg-export-progress-text">
                {progressData.progress}% Complete
              </div>
            </div>
          )}

          <div className="tg-export-stats">
            {progressData.currentCount !== undefined && (
              <div className="tg-export-stat">
                <span className="tg-export-stat-label">Members Exported:</span>
                <span className="tg-export-stat-value">
                  {progressData.currentCount.toLocaleString()}
                  {progressData.total && typeof progressData.total === 'number' 
                    ? ` of ${progressData.total.toLocaleString()}` 
                    : ''}
                </span>
              </div>
            )}
            
            {progressData.batchSize !== undefined && (
              <div className="tg-export-stat">
                <span className="tg-export-stat-label">Last Batch:</span>
                <span className="tg-export-stat-value">{progressData.batchSize} members</span>
              </div>
            )}
            
            {progressData.uniqueMembers !== undefined && (
              <div className="tg-export-stat">
                <span className="tg-export-stat-label">Unique Members:</span>
                <span className="tg-export-stat-value">{progressData.uniqueMembers.toLocaleString()}</span>
              </div>
            )}
            
            {progressData.duration !== undefined && (
              <div className="tg-export-stat">
                <span className="tg-export-stat-label">Duration:</span>
                <span className="tg-export-stat-value">{progressData.duration.toFixed(2)} seconds</span>
              </div>
            )}
          </div>

          {progressData.message && (
            <div className="tg-export-message">
              {progressData.message}
            </div>
          )}

          {progressData.status === 'error' && progressData.error && (
            <div className="tg-export-error-details">
              <div className="tg-export-error-title">Error Details:</div>
              <div className="tg-export-error-text">{progressData.error}</div>
              {progressData.code && (
                <div className="tg-export-error-code">Code: {progressData.code}</div>
              )}
            </div>
          )}
        </div>

        <div className="tg-export-modal-footer">
          
          <button
            onClick={onClose}
            className="tg-export-close-btn"
          >
            {progressData.status === 'completed' ? 'Close' : 'Cancel Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramExportProgressModal;