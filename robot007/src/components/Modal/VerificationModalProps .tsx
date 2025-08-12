import React, { useEffect, useRef } from 'react';
import { FiCheck, FiX, FiClock, FiZap, FiBarChart2 } from 'react-icons/fi';
import { ProcessCancel } from '../../store/generate/generateActions';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: number;
  progress: number;
  total: number;
  currentBatch?: string[];
  registeredCount?: number;
  rejectedCount?: number;
  eta: string,
  dispatch,
  activeService
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isOpen,
  onClose,
  batches,
  progress,
  total,
  currentBatch = [],
  registeredCount = 0,
  rejectedCount = 0,
  eta,
  dispatch,
  activeService
}) => {
  if (!isOpen) return null;

  const isComplete = progress >= 100;
  // const [isFewBatches, setIsFewBatches] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkBatchesFit = () => {
      if (trackRef.current) {
        // const containerWidth = trackRef.current.offsetWidth;
        // const requiredWidth = total * 44; // 32px per batch + gap
        // setIsFewBatches(requiredWidth < containerWidth);
      }
    };

    checkBatchesFit();
    window.addEventListener('resize', checkBatchesFit);
    return () => window.removeEventListener('resize', checkBatchesFit);
  }, [total, activeService]);


  const cancel = () => {
    dispatch(ProcessCancel(activeService))
  }


  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>
            {isComplete ? (
              <span className="completed">
                <FiCheck className="icon" /> Verification Complete
              </span>
            ) : (
              <span className="in-progress">
                <FiZap className="icon spinning" /> Verification ends in: <b>{eta}</b>
              </span>
            )}
          </h2>
          <button onClick={onClose} className="close-btn">
            <FiX />
          </button>
        </div>

        {/* Main Content */}
        <div className="modal-content">
          {/* Circular Progress */}
          <div className="circular-progress">
            <svg className="progress-ring" viewBox="0 0 100 100">
              <circle
                className="progress-ring-track"
                stroke="#e0e7ff"
                strokeWidth="8"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
              />
              <circle
                className="progress-ring-fill"
                stroke="#4f46e5"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="42"
                cx="50"
                cy="50"
                strokeDasharray={`${progress * 2.64} 264`}
              />
            </svg>
            <div className="progress-text">
              <span>{progress}%</span>
              <small>Completed</small>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grids">
            <div className="stat-cards">
              <div className="stat-icon batches">
                <FiBarChart2 />
              </div>
              <div className="stat-info">
                <span className="stat-value">{batches}/{total}</span>
                <span className="stat-labels">Batches</span>
              </div>
            </div>

            <div className="stat-cards">
              <div className="stat-icon registered">
                <FiCheck />
              </div>
              <div className="stat-info">
                <span className="stat-value">{registeredCount}</span>
                <span className="stat-labels">Registered</span>
              </div>
            </div>

            <div className="stat-cards">
              <div className="stat-icon rejected">
                <FiX />
              </div>
              <div className="stat-info">
                <span className="stat-value">{rejectedCount}</span>
                <span className="stat-labels">Rejected</span>
              </div>
            </div>
          </div>

          {/* Batch Progress */}
          <div className="batch-progress">
            <div className="progress-header">
              <FiClock className="icon" />
              <span>Batch Progress</span>
              <span className="batch-count">{batches}/{total}</span>
            </div>

            <div className="batch-progress-container">
              <div className="batch-track-scroll">
                <div className="batch-track">
                  {Array.from({ length: total }).map((_, i) => (
                    <div
                      key={i}
                      className={`batch-step ${i < batches ? 'completed' : ''} ${i === batches && !isComplete ? 'active' : ''}`}
                    >
                      {i < batches ? (
                        <FiCheck className="batch-icon" />
                      ) : (
                        <span className="batch-number">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Batch */}
          {currentBatch.length > 0 && !isComplete && (
            <div className="current-batch">
              <div className="batch-header">
                <span>Processing Batch #{batches}</span>
              </div>
              <div className="number-grid">
                {currentBatch.map((num, i) => (
                  <div key={i} className="number-badge">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>





        {/* Footer */}
        <div className="modal-footer">

          <button
            onClick={cancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffffff',
              color: '#4f46e5',  // Indigo-600
              border: '1px solid #c7d2fe',  // Light indigo border
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '40px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className={`dismiss-btn ${isComplete ? 'success' : ''}`}
          >
            {isComplete ? 'View Results' : 'Dismiss'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;