import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error' | 'complete';
}

interface VerificationPausedData {
  message: string;
  waitTime: number;
  nextAvailableAccount: {
    id: string;
    phoneNumber: string;
    availableAt: string;
  };
}

interface OperationFailedData {
  operation: string;
  error: string;
  progress: {
    processed: number;
    total: number;
    successRate: number;
  };
  floodedAccounts: Array<{
    id: string;
    phoneNumber: string;
    waitTimeSeconds: number;
    formattedWaitTime: string;
  }>;
}

interface NumberVerifiedData {
  phoneNumber: string;
  status: 'registered' | 'not_registered';
  accountId: string;
}

interface VerificationErrorData {
  phoneNumber: string;
  error: string;
  accountId: string;
}

interface VerificationCompleteData {
  registered: number;
  rejected: number;
  total: number;
  processed: number;
  unprocessed: number;
  floodedAccounts: Array<{
    id: string;
    phoneNumber: string;
    waitTimeSeconds: number;
    formattedWaitTime: string;
  }>;
}

const Modal: React.FC<ModalProps> = ({ visible, onClose, children, type = 'info' }) => {
  if (!visible) return null;

  const getColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      case 'complete': return '#2196F3';
      default: return '#9C27B0';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ borderTop: `5px solid ${getColor()}` }}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const VerificationSystem: React.FC = () => {
  
  // Modal states
  const [pausedVisible, setPausedVisible] = useState(false);
  const [failedVisible, setFailedVisible] = useState(false);
  const [numberVerifiedVisible, setNumberVerifiedVisible] = useState(false);
  const [verificationErrorVisible, setVerificationErrorVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  
  // Modal data
  const [pausedData, setPausedData] = useState<VerificationPausedData | null>(null);
  const [failedData, setFailedData] = useState<OperationFailedData | null>(null);
  const [numberData, setNumberData] = useState<NumberVerifiedData | null>(null);
  const [errorData, setErrorData] = useState<VerificationErrorData | null>(null);
  const [completeData, setCompleteData] = useState<VerificationCompleteData | null>(null);

  useEffect(() => {
    const newSocket = io('http://your-backend-url');


    // Setup event listeners
    newSocket.on('verification-paused', (data: VerificationPausedData) => {
      setPausedData(data);
      setPausedVisible(true);
    });

    newSocket.on('operation-failed', (data: OperationFailedData) => {
      setFailedData(data);
      setFailedVisible(true);
    });

    newSocket.on('number-verified', (data: NumberVerifiedData) => {
      setNumberData(data);
      setNumberVerifiedVisible(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => setNumberVerifiedVisible(false), 5000);
    });

    newSocket.on('verification-error', (data: VerificationErrorData) => {
      setErrorData(data);
      setVerificationErrorVisible(true);
    });

    newSocket.on('verification-complete', (data: VerificationCompleteData) => {
      setCompleteData(data);
      setCompleteVisible(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  return (
    <div className="verification-system">
      <h1>Telegram Number Verification</h1>
      <p>Real-time verification status monitoring</p>
      
      {/* Verification Paused Modal */}
      <Modal 
        visible={pausedVisible} 
        onClose={() => setPausedVisible(false)}
        type="warning"
      >
        <div className="modal-content">
          <h2>Verification Paused</h2>
          {pausedData && (
            <>
              <div className="icon-container">
                <div className="warning-icon">⏱️</div>
              </div>
              <p className="message">{pausedData.message}</p>
              
              <div className="info-card">
                <h3>Next Available Account</h3>
                <p><strong>ID:</strong> {pausedData.nextAvailableAccount.id}</p>
                <p><strong>Number:</strong> {pausedData.nextAvailableAccount.phoneNumber}</p>
                <p><strong>Available At:</strong> {new Date(pausedData.nextAvailableAccount.availableAt).toLocaleTimeString()}</p>
                <p><strong>Wait Time:</strong> {formatTime(pausedData.waitTime)}</p>
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Operation Failed Modal */}
      <Modal 
        visible={failedVisible} 
        onClose={() => setFailedVisible(false)}
        type="error"
      >
        <div className="modal-content">
          <h2>Operation Failed</h2>
          {failedData && (
            <>
              <div className="icon-container">
                <div className="error-icon">❌</div>
              </div>
              <p className="message">Operation: {failedData.operation}</p>
              <p className="error-message">{failedData.error}</p>
              
              <div className="progress-info">
                <h3>Progress</h3>
                <p><strong>Processed:</strong> {failedData.progress.processed}</p>
                <p><strong>Total:</strong> {failedData.progress.total}</p>
                <p><strong>Success Rate:</strong> {failedData.progress.successRate}%</p>
              </div>
              
              {failedData.floodedAccounts.length > 0 && (
                <div className="flooded-accounts">
                  <h3>Flooded Accounts</h3>
                  {failedData.floodedAccounts.map(account => (
                    <div key={account.id} className="account-card">
                      <p><strong>ID:</strong> {account.id}</p>
                      <p><strong>Number:</strong> {account.phoneNumber}</p>
                      <p><strong>Wait Time:</strong> {account.formattedWaitTime}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
      
      {/* Number Verified Modal */}
      <Modal 
        visible={numberVerifiedVisible} 
        onClose={() => setNumberVerifiedVisible(false)}
        type={numberData?.status === 'registered' ? 'success' : 'error'}
      >
        <div className="modal-content">
          {numberData && (
            <>
              <h2>Number Verified</h2>
              <div className="icon-container">
                {numberData.status === 'registered' ? (
                  <div className="success-icon">✓</div>
                ) : (
                  <div className="not-registered-icon">✗</div>
                )}
              </div>
              
              <div className="number-result">
                <p className="phone-number">{numberData.phoneNumber}</p>
                <p className={`status ${numberData.status}`}>
                  {numberData.status === 'registered' ? 'Registered' : 'Not Registered'}
                </p>
              </div>
              
              <div className="account-info">
                <p><strong>Account ID:</strong> {numberData.accountId}</p>
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Verification Error Modal */}
      <Modal 
        visible={verificationErrorVisible} 
        onClose={() => setVerificationErrorVisible(false)}
        type="error"
      >
        <div className="modal-content">
          <h2>Verification Error</h2>
          {errorData && (
            <>
              <div className="icon-container">
                <div className="error-icon">⚠️</div>
              </div>
              
              <div className="error-details">
                <p><strong>Phone Number:</strong> {errorData.phoneNumber}</p>
                <p><strong>Account ID:</strong> {errorData.accountId}</p>
                <p className="error-message">{errorData.error}</p>
              </div>
            </>
          )}
        </div>
      </Modal>
      
      {/* Verification Complete Modal */}
      <Modal 
        visible={completeVisible} 
        onClose={() => setCompleteVisible(false)}
        type="complete"
      >
        <div className="modal-content">
          <h2>Verification Complete!</h2>
          {completeData && (
            <>
              <div className="icon-container">
                <div className="complete-icon">🎉</div>
              </div>
              
              <div className="stats-container">
                <div className="stat-card registered">
                  <div className="stat-value">{completeData.registered}</div>
                  <div className="stat-label">Registered</div>
                </div>
                
                <div className="stat-card rejected">
                  <div className="stat-value">{completeData.rejected}</div>
                  <div className="stat-label">Rejected</div>
                </div>
                
                <div className="stat-card total">
                  <div className="stat-value">{completeData.total}</div>
                  <div className="stat-label">Total</div>
                </div>
              </div>
              
              <div className="summary">
                <p><strong>Processed:</strong> {completeData.processed}</p>
                <p><strong>Unprocessed:</strong> {completeData.unprocessed}</p>
              </div>
              
              {completeData.floodedAccounts.length > 0 && (
                <div className="flooded-accounts">
                  <h3>Accounts in Flood Wait</h3>
                  {completeData.floodedAccounts.map(account => (
                    <div key={account.id} className="account-card">
                      <p><strong>ID:</strong> {account.id}</p>
                      <p><strong>Number:</strong> {account.phoneNumber}</p>
                      <p><strong>Wait Time:</strong> {account.formattedWaitTime}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
      
  
    </div>
  );
};

export default VerificationSystem;