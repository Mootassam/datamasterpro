import { 
  FiDownload, 
  FiX, 
  FiUpload, 
  FiCopy,
  FiCheckCircle,
  FiDatabase
} from "react-icons/fi";
import { HiOutlineDuplicate, HiOutlineExclamation } from "react-icons/hi";

const UploadResultsModal = ({ onClose, onUpload, duplicates, newNumbers, invalidNumbers }) => {
  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-title-group">
            <FiDatabase className="header-icon" />
            <div>
              <h2>Upload Analysis</h2>
              <p className="subtitle">Review your file processing results</p>
            </div>
          </div>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon total">
              <FiDatabase />
            </div>
            <div className="stat-content">
              <span className="stat-value">{duplicates.length + newNumbers.length + invalidNumbers.length}</span>
              <span className="stat-label">Total Records</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon valid">
              <FiCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-value">{newNumbers.length}</span>
              <span className="stat-label">Valid Numbers</span>
            </div>
          </div>
        </div>

        {/* Results Sections */}
        <div className="results-grid">
          {/* Duplicates Card */}
          <div className="result-card duplicate">
            <div className="card-header">
              <div className="icon-wrapper duplicate">
                <HiOutlineDuplicate />
              </div>
              <h3>Duplicates</h3>
              <span className="count-badge">{duplicates.length}</span>
            </div>
            <p className="card-description">
              Numbers already existing in your database
            </p>
            <div className="card-actions">
              <button className="action-button download">
                <FiDownload /> Download
              </button>
              <button className="action-button secondary">
                <FiCopy /> Copy
              </button>
            </div>
          </div>

          {/* New Numbers Card */}
          <div className="result-card new">
            <div className="card-header">
              <div className="icon-wrapper new">
                <FiCheckCircle />
              </div>
              <h3>New Numbers</h3>
              <span className="count-badge">{newNumbers.length}</span>
            </div>
            <p className="card-description">
              Verified numbers ready for upload
            </p>
            <div className="card-actions">
              <button className="action-button download">
                <FiDownload /> Download
              </button>
              <button className="action-button secondary">
                <FiCopy /> Copy
              </button>
            </div>
          </div>

          {/* Invalid Numbers Card */}
          <div className="result-card invalid">
            <div className="card-header">
              <div className="icon-wrapper invalid">
                <HiOutlineExclamation />
              </div>
              <h3>Invalid</h3>
              <span className="count-badge">{invalidNumbers.length}</span>
            </div>
            <p className="card-description">
              Numbers with formatting errors
            </p>
            <div className="card-actions">
              <button className="action-button download">
                <FiDownload /> Download
              </button>
              <button className="action-button secondary">
                <FiCopy /> Copy
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button onClick={onClose} className="footer-button cancel">
            Cancel
          </button>
          <button 
            onClick={onUpload} 
            className="footer-button upload"
            disabled={newNumbers.length === 0}
          >
            <FiUpload /> Upload {newNumbers.length} Numbers
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadResultsModal;