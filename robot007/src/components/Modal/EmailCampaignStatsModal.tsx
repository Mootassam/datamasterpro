// Updated EmailCampaignStatsModal.tsx
import React, { useState, useEffect } from 'react';
import { FiX, FiStopCircle, FiClock, FiMail, FiCheckCircle, FiAlertCircle, FiSend } from 'react-icons/fi';
import { stopEmailCampaign } from '../../store/email/emailActions';
import { useDispatch } from 'react-redux';
import Toast from '../../shared/Message/Toast';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from '@reduxjs/toolkit';

interface EmailCampaignStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressData: any;
  startTime: Date;
}

const EmailCampaignStatsModal: React.FC<EmailCampaignStatsModalProps> = ({
  isOpen,
  onClose,
  progressData,
  startTime
}) => {
  const dispatch: ThunkDispatch<any, void, AnyAction> = useDispatch();


  const [isCancelling, setIsCancelling] = useState(false);
  const [duration, setDuration] = useState('0s');
  const [localStartTime] = useState(startTime);

  // Update duration every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen) {
      interval = setInterval(() => {
        const seconds = Math.floor((new Date().getTime() - localStartTime.getTime()) / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        setDuration(`${mins > 0 ? `${mins}m ` : ''}${secs}s`);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, localStartTime]);

  const handleCancelCampaign = async () => {
    setIsCancelling(true);
    try {
      await dispatch(stopEmailCampaign()).unwrap(); // unwrap gets the real result or throws
      onClose();
    } catch {
      Toast.Error("Failed to cancel campaign");
    } finally {
      setIsCancelling(false);
    }
  };


  if (!isOpen) return null;

  // Extract progress data with defaults
  const {
    operationId = 'N/A',
    total = 0,
    sent = 0,
    failed = 0,
    remaining = 0,
    progress = 0,
    eta = 'Calculating...',
    accounts = []
  } = progressData || {};

  return (
    <div className="em-stats-modal-overlay">
      <div className="em-stats-modal-container">
        {/* Modal Header */}
        <div className="em-stats-modal-header">
          <h2 className="em-stats-modal-title">
            <FiMail className="em-stats-header-icon" />
            Campaign Statistics
          </h2>
          <button onClick={onClose} className="em-stats-modal-close">
            <FiX size={24} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="em-stats-modal-content">
          <div className="em-stats-campaign-info">
            <h3 className="em-stats-campaign-name">Email Campaign</h3>
            <p className="em-stats-campaign-subject">
              {operationId ? `Campaign ID: ${operationId}` : 'Active Campaign'}
            </p>
            
            <div className="em-stats-meta">
              <div className="em-stats-meta-item">
                <span className="em-stats-meta-label">Started</span>
                <span className="em-stats-meta-value">
                  {localStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="em-stats-meta-item">
                <span className="em-stats-meta-label">Duration</span>
                <span className="em-stats-meta-value">{duration}</span>
              </div>
              <div className="em-stats-meta-item">
                <span className="em-stats-meta-label">Status</span>
                <span className={`em-stats-meta-value ${
                  progress >= 100 ? 'status-completed' : 'status-in-progress'
                }`}>
                  {progress >= 100 ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Section */}
          <div className="em-stats-progress-section">
            <div className="em-stats-progress-header">
              <h4>Campaign Progress</h4>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="em-stats-progress-bar">
              <div 
                className="em-stats-progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="em-stats-eta">
              <FiClock className="em-stats-eta-icon" />
              <span>Estimated completion: {eta}</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="em-stats-grid">
            <div className="em-stats-card total">
              <FiMail className="em-stats-card-icon" />
              <div className="em-stats-card-value">{total}</div>
              <div className="em-stats-card-label">Total</div>
            </div>
            
            <div className="em-stats-card sent">
              <FiSend className="em-stats-card-icon" />
              <div className="em-stats-card-value">{sent}</div>
              <div className="em-stats-card-label">Sent</div>
            </div>
            
            <div className="em-stats-card successful">
              <FiCheckCircle className="em-stats-card-icon" />
              <div className="em-stats-card-value">{sent - failed}</div>
              <div className="em-stats-card-label">Successful</div>
            </div>
            
            <div className="em-stats-card failed">
              <FiAlertCircle className="em-stats-card-icon" />
              <div className="em-stats-card-value">{failed}</div>
              <div className="em-stats-card-label">Failed</div>
            </div>
            
            <div className="em-stats-card remaining">
              <FiClock className="em-stats-card-icon" />
              <div className="em-stats-card-value">{remaining}</div>
              <div className="em-stats-card-label">Remaining</div>
            </div>
          </div>
          
          {/* Account Usage */}
          <div className="em-stats-accounts">
            <h4>Account Usage</h4>
            
            {accounts && accounts.length > 0 ? (
              accounts.map(account => (
                <div key={account.id} className="em-stats-account">
                  <div className="em-stats-account-info">
                    <div className="em-stats-account-name">{account.name}</div>
                    <div className="em-stats-account-email">{account.email}</div>
                  </div>
                  
                  <div className="em-stats-account-stats">
                    <div className="em-stats-account-sent">
                      {account.sentToday || 0} / {account.dailyLimit}
                    </div>
                    <div className="em-stats-account-progress">
                      <div 
                        className="em-stats-account-progress-bar" 
                        style={{ 
                          width: `${Math.min(100, ((account.sentToday || 0) / account.dailyLimit) * 100)}%`,
                          backgroundColor: account.sentToday >= account.dailyLimit ? '#ff6b6b' : '#4da1ff'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="em-stats-no-accounts">No account data available</div>
            )}
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="em-stats-modal-footer">
          {progress < 100 && (
            <button 
              className="em-stats-cancel-btn"
              onClick={handleCancelCampaign}
              disabled={isCancelling}
            >
              <FiStopCircle className="em-stats-cancel-icon" />
              {isCancelling ? 'Cancelling...' : 'Cancel Campaign'}
            </button>
          )}
          
          {/* <button 
            className="em-stats-close-btn"
            onClick={onClose}
          >
            Close
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default EmailCampaignStatsModal;