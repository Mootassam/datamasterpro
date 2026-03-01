import { FaTelegram } from "react-icons/fa";
import { useState, useEffect } from 'react';
import { FiLoader } from "react-icons/fi";
import { confirmTelegram2FA, confirmTelegramOTP, loginTelegram } from "../../store/telegram/TelegramActions";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";


interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: ThunkDispatch<any, void, AnyAction>;
  socket?: any;
}

const TelegramAuthModal = ({
  isOpen,
  onClose,
  dispatch,
  socket
}: TelegramAuthModalProps) => {

  const [step, setStep] = useState<'phone' | 'otp' | 'twoFA'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneCode, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [accountId, setAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for 2FA required socket event
  useEffect(() => {
    if (socket && step === 'otp') {
      const handle2FARequired = (data: { accountId: string; phoneNumber: string }) => {
        setAccountId(data.accountId);
        setStep('twoFA');
      };
      
      socket.on("2fa-required", handle2FARequired);
      
      return () => {
        socket.off("2fa-required", handle2FARequired);
      };
    }
  }, [socket, step]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setPassword('');
    setPhoneCodeHash('');
    setAccountId('');
    setIsLoading(false);
    setError('');
  };

  const handlePhoneSubmit = async () => {
    if (!phone) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await dispatch(loginTelegram(phone)).unwrap();
      setPhoneCodeHash(result.phoneCodeHash); 
      setAccountId(result.accountId);
      setStep('otp');
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!phoneCode) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await dispatch(confirmTelegramOTP({
        accountId,
        phoneCode,
        phoneCodeHash
      })).unwrap();
      
      onClose(); // Close on successful OTP verification
    } catch (error: any) {
      // Check if error requires 2FA (from socket event or error message)
      if (error.is2FA || error.message?.includes('SESSION_PASSWORD_NEEDED')) {
        setStep('twoFA');
      } else {
        setError(error.message || 'Invalid OTP code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async () => {
    if (!password) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await dispatch(confirmTelegram2FA({
        accountId,
        password
      })).unwrap();
      
      onClose(); // Close on successful 2FA
    } catch (error: any) {
      setError(error.message || 'Invalid 2FA password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dm-telegram-modal">
      <div className="dm-telegram-modal-content">
        <button 
          className="dm-telegram-modal-close" 
          onClick={onClose}
          disabled={isLoading}
        >
          &times;
        </button>
        
        <div className="dm-telegram-modal-header">
          <FaTelegram className="dm-telegram-icon" />
          <h3>Connect Telegram Account</h3>
        </div>

        {/* Error Message */}
        {error && (
          <div className="dm-telegram-error">
            {error}
          </div>
        )}

        {/* Phone Step */}
        {step === 'phone' && (
          <div className="dm-telegram-phone-step">
            <p>Enter your phone number with country code</p>
            <input
              type="text"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="dm-telegram-input"
              disabled={isLoading}
            />
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="dm-telegram-code-step">
            <p>We sent a code to {phone}. Please enter it below:</p>
            <input
              type="text"
              placeholder="12345"
              value={phoneCode}
              onChange={(e) => setCode(e.target.value)}
              className="dm-telegram-input"
              disabled={isLoading}
            />
            <button 
              className="dm-telegram-back-btn"
              onClick={() => setStep('phone')}
              disabled={isLoading}
            >
              Back to phone number
            </button>
          </div>
        )}

        {/* 2FA Step */}
        {step === 'twoFA' && (
          <div className="dm-telegram-2fa-step">
            <p>This account requires two-step verification. Please enter your password:</p>
            <input
              type="password"
              placeholder="Your 2FA password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="dm-telegram-input"
              disabled={isLoading}
            />
            <button 
              className="dm-telegram-back-btn"
              onClick={() => setStep('otp')}
              disabled={isLoading}
            >
              Back to OTP entry
            </button>
          </div>
        )}

        <div className="dm-telegram-modal-footer">
          <button
            className={`dm-telegram-connect-btn ${isLoading ? 'dm-loading' : ''}`}
            onClick={() => {
              if (step === 'phone') handlePhoneSubmit();
              else if (step === 'otp') handleOTPSubmit();
              else if (step === 'twoFA') handle2FASubmit();
            }}
            disabled={
              isLoading || 
              (step === 'phone' ? !phone : 
               step === 'otp' ? !phoneCode : 
               !password)
            }
          >
            {isLoading ? (
              <FiLoader className="dm-spin-icon" />
            ) : step === 'phone' ? (
              'Send OTP'
            ) : step === 'otp' ? (
              'Verify OTP'
            ) : (
              'Complete Setup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TelegramAuthModal;
