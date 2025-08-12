import { useEffect, useState } from 'react';
import { FaDownload, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
// import { Socket } from 'socket.io-client';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  description: string;
  onDownload: () => void;
  type: string;
}

interface VerificationState {
  progress: number;
  stats: {
    total: number;
    duplicates: number;
    newNumbers: number;
    invalid: number;
    processed: number;
  };
}



const FileStatsModal = ({
  isOpen,
  onClose,
  fileName,
  onUploadNewNumbers,
  onCancelUpload,
  onDownloadSection,
  newSocket,
  duplicate,
  invalid,
  news
}) => {
  if (!isOpen) return null;

  const [verificationState, setVerificationState] = useState<VerificationState>({
    progress: 0,
    stats: {
      total: 0,
      duplicates: 0,
      newNumbers: 0,
      invalid: 0,
      processed: 0
    }
  });
  useEffect(() => {
    if (!newSocket) return;

    const handleFileProgress = (data: any) => {
      setVerificationState({
        progress: data.progress,
        stats: {
          total: data.stats.total,
          duplicates: data.stats.duplicates,
          newNumbers: data.stats.new,
          invalid: data.stats.invalid,
          processed: data.stats.processed
        }
      });
    };

    newSocket.on("file-progress", handleFileProgress);

    return () => {
      newSocket.off("file-progress", handleFileProgress);
    };
  }, [newSocket]);

  return (
    <div className="file-stats-modal-overlay">
      <div className="file-stats-modal-container">
        <div className="file-stats-modal-header">
          <div className="file-stats-modal-title">
            <FaInfoCircle className="file-stats-modal-title-icon" />
            <h3>File Analysis: <span className="file-stats-modal-filename">{fileName || "numbers.csv"}</span></h3>
          </div>
          <button onClick={onClose} className="file-stats-modal-close-btn">
            <IoMdClose />
          </button>
        </div>

        <div className="file-stats-grid">
          {/* <StatCard
            icon={<FaCheckCircle className="file-stats-icon-total" />}
            title="Total Numbers"
            value={verificationState.stats.total}
            description="All numbers found in your file"
            onDownload={() => onDownloadSection()}
            type="total"
          /> */}

          <StatCard
            icon={<FaCheckCircle className="file-stats-icon-new" />}
            title="New Numbers"
            value={verificationState.stats.newNumbers}
            description="Never seen before in our system"
            onDownload={() => onDownloadSection(news, 'news')}
            type="new"
          />


          <StatCard
            icon={<FaExclamationTriangle className="file-stats-icon-duplicates" />}
            title="Duplicates"
            value={verificationState.stats.duplicates}
            description="Repeated in this file"
            onDownload={() => onDownloadSection(duplicate, 'invalid')}
            type="duplicates"
          />

          <StatCard
            icon={<FaTimes className="file-stats-icon-invalid" />}
            title="Invalid Formats"
            value={verificationState.stats.invalid}
            description="Don't match phone number patterns"
            onDownload={() => onDownloadSection(invalid, 'invalid')}
            type="invalid"
          />
        </div>

        <div className="file-stats-progress-section">
          <h4 className="file-stats-progress-title">Processing Progress</h4>
          <div className="file-stats-progress-container">
            <div
              className="file-stats-progress-bar"
              style={{ width: `${verificationState.progress}%` }}
            >
              <span className="file-stats-progress-text">
                {verificationState.progress}%
              </span>
            </div>
          </div>

          <div className="file-stats-progress-message">
            {verificationState.progress < 100 ? (
              <p className="file-stats-progress-info">
                <FaInfoCircle className="file-stats-progress-icon" />
                Processing {verificationState.stats.newNumbers} numbers...
              </p>
            ) : (
              <p className="file-stats-progress-success">
                <FaCheckCircle className="file-stats-progress-icon" />
                All numbers processed successfully!
              </p>
            )}
          </div>

          <div className="file-stats-action-buttons">
            {verificationState.progress < 100 ? (
              <button
                onClick={onCancelUpload}
                className="file-stats-cancel-btn"
              >
                Cancel Processing
              </button>
            ) : null}

            <button
              onClick={onUploadNewNumbers}
              disabled={verificationState.progress < 100}
              className={`file-stats-save-btn ${verificationState.progress < 100 ? 'file-stats-btn-disabled' : ''}`}
            >
              {verificationState.progress < 100 ? 'Processing...' : 'Import New Numbers'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, description, onDownload, type }: StatCardProps) => {
  return (
    <div className={`file-stats-card file-stats-card-${type}`}>
      <div className="file-stats-card-header">
        <span className="file-stats-card-icon">{icon}</span>
        <h4 className="file-stats-card-title">{title}</h4>
      </div>
      <div className="file-stats-card-body">
        <span className="file-stats-card-value">{value}</span>
        <p className="file-stats-card-description">{description}</p>
      </div>
      <button
        onClick={onDownload}
        className="file-stats-download-btn"
      >
        <FaDownload className="file-stats-download-icon" /> Download CSV
      </button>
    </div>
  );
};

export default FileStatsModal;