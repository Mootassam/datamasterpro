import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

const ACCENT: Record<NonNullable<ModalProps['type']>, string> = {
  success:  '#10b981',
  warning:  '#f59e0b',
  error:    '#ef4444',
  complete: '#2AABEE',
  info:     '#9C27B0',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(6,10,18,0.82)',
  backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 2000,
};

const modalStyle = (color: string): React.CSSProperties => ({
  background: '#161b27',
  border: `1px solid rgba(255,255,255,0.08)`,
  borderTop: `4px solid ${color}`,
  borderRadius: 14,
  padding: 28,
  minWidth: 340,
  maxWidth: 520,
  width: '90%',
  maxHeight: '80vh',
  overflowY: 'auto',
  position: 'relative',
  boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${color}22`,
  color: '#e2e8f0',
});

const Modal: React.FC<ModalProps> = ({ visible, onClose, children, type = 'info' }) => {
  if (!visible) return null;
  const color = ACCENT[type];
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle(color)} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: '50%', width: 30, height: 30,
            cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: '#1e2538', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', margin: '12px 0', fontSize: '0.9rem' }}>
    {children}
  </div>
);

const StatCard: React.FC<{ value: number; label: string; color?: string }> = ({ value, label, color = '#2AABEE' }) => (
  <div style={{ textAlign: 'center', background: '#1e2538', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 20px', flex: 1 }}>
    <div style={{ fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</div>
  </div>
);

const VerificationSystem: React.FC = () => {
  const socketRef = useRef<Socket | null>(null);

  const [pausedVisible,             setPausedVisible]             = useState(false);
  const [failedVisible,             setFailedVisible]             = useState(false);
  const [numberVerifiedVisible,     setNumberVerifiedVisible]     = useState(false);
  const [verificationErrorVisible,  setVerificationErrorVisible]  = useState(false);
  const [completeVisible,           setCompleteVisible]           = useState(false);

  const [pausedData,   setPausedData]   = useState<VerificationPausedData | null>(null);
  const [failedData,   setFailedData]   = useState<OperationFailedData | null>(null);
  const [numberData,   setNumberData]   = useState<NumberVerifiedData | null>(null);
  const [errorData,    setErrorData]    = useState<VerificationErrorData | null>(null);
  const [completeData, setCompleteData] = useState<VerificationCompleteData | null>(null);

  useEffect(() => {
    const socket = io('http://162.0.230.49:8087', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      randomizationFactor: 0.4,
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('verification-paused', (data: VerificationPausedData) => {
      setPausedData(data);
      setPausedVisible(true);
    });

    socket.on('operation-failed', (data: OperationFailedData) => {
      setFailedData(data);
      setFailedVisible(true);
    });

    socket.on('number-verified', (data: NumberVerifiedData) => {
      setNumberData(data);
      setNumberVerifiedVisible(true);
      setTimeout(() => setNumberVerifiedVisible(false), 5000);
    });

    socket.on('verification-error', (data: VerificationErrorData) => {
      setErrorData(data);
      setVerificationErrorVisible(true);
    });

    socket.on('verification-complete', (data: VerificationCompleteData) => {
      setCompleteData(data);
      setCompleteVisible(true);
    });

    // Reconnect on screen unlock / network resume
    const onVisible = () => {
      if (!socket.connected) socket.connect();
    };
    const onOnline = () => {
      if (!socket.connected) socket.connect();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
      socket.disconnect();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const h2Style: React.CSSProperties = { margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0' };
  const pStyle:  React.CSSProperties = { margin: '6px 0', fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 };

  return (
    <>
      {/* Verification Paused */}
      <Modal visible={pausedVisible} onClose={() => setPausedVisible(false)} type="warning">
        <h2 style={h2Style}>⏱ Verification Paused</h2>
        {pausedData && (
          <>
            <p style={pStyle}>{pausedData.message}</p>
            <Card>
              <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Available Account</div>
              <p style={pStyle}><strong>Number:</strong> {pausedData.nextAvailableAccount.phoneNumber}</p>
              <p style={pStyle}><strong>Available at:</strong> {new Date(pausedData.nextAvailableAccount.availableAt).toLocaleTimeString()}</p>
              <p style={pStyle}><strong>Wait:</strong> {formatTime(pausedData.waitTime)}</p>
            </Card>
          </>
        )}
      </Modal>

      {/* Operation Failed */}
      <Modal visible={failedVisible} onClose={() => setFailedVisible(false)} type="error">
        <h2 style={h2Style}>❌ Operation Failed</h2>
        {failedData && (
          <>
            <p style={pStyle}><strong>Operation:</strong> {failedData.operation}</p>
            <p style={{ ...pStyle, color: '#fca5a5' }}>{failedData.error}</p>
            <Card>
              <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</div>
              <p style={pStyle}>Processed: {failedData.progress.processed} / {failedData.progress.total}</p>
              <p style={pStyle}>Success rate: {failedData.progress.successRate}%</p>
            </Card>
            {failedData.floodedAccounts.length > 0 && (
              <Card>
                <div style={{ fontWeight: 700, color: '#fcd34d', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flooded Accounts</div>
                {failedData.floodedAccounts.map((a) => (
                  <p key={a.id} style={pStyle}>{a.phoneNumber} — wait {a.formattedWaitTime}</p>
                ))}
              </Card>
            )}
          </>
        )}
      </Modal>

      {/* Number Verified */}
      <Modal
        visible={numberVerifiedVisible}
        onClose={() => setNumberVerifiedVisible(false)}
        type={numberData?.status === 'registered' ? 'success' : 'error'}
      >
        {numberData && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>
                {numberData.status === 'registered' ? '✓' : '✗'}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e2e8f0' }}>{numberData.phoneNumber}</div>
              <div style={{
                display: 'inline-block', marginTop: 8, padding: '4px 14px',
                background: numberData.status === 'registered' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: numberData.status === 'registered' ? '#6ee7b7' : '#fca5a5',
                borderRadius: 9999, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {numberData.status === 'registered' ? 'Registered' : 'Not Registered'}
              </div>
            </div>
          </>
        )}
      </Modal>

      {/* Verification Error */}
      <Modal visible={verificationErrorVisible} onClose={() => setVerificationErrorVisible(false)} type="error">
        <h2 style={h2Style}>⚠ Verification Error</h2>
        {errorData && (
          <Card>
            <p style={pStyle}><strong>Number:</strong> {errorData.phoneNumber}</p>
            <p style={{ ...pStyle, color: '#fca5a5' }}>{errorData.error}</p>
          </Card>
        )}
      </Modal>

      {/* Verification Complete */}
      <Modal visible={completeVisible} onClose={() => setCompleteVisible(false)} type="complete">
        <h2 style={h2Style}>🎉 Verification Complete</h2>
        {completeData && (
          <>
            <div style={{ display: 'flex', gap: 10, margin: '16px 0' }}>
              <StatCard value={completeData.registered} label="Registered" color="#10b981" />
              <StatCard value={completeData.rejected}   label="Rejected"   color="#ef4444" />
              <StatCard value={completeData.total}      label="Total"      color="#2AABEE" />
            </div>
            <p style={pStyle}>Processed: {completeData.processed} | Unprocessed: {completeData.unprocessed}</p>
            {completeData.floodedAccounts.length > 0 && (
              <Card>
                <div style={{ fontWeight: 700, color: '#fcd34d', marginBottom: 8, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Flood Wait Accounts</div>
                {completeData.floodedAccounts.map((a) => (
                  <p key={a.id} style={pStyle}>{a.phoneNumber} — {a.formattedWaitTime}</p>
                ))}
              </Card>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

export default VerificationSystem;
