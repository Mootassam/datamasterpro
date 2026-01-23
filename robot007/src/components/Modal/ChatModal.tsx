import { useState, useEffect } from "react";
import { FiX, FiInfo } from "react-icons/fi";
import "../styles/chat.css";
import {
  allGroups,
} from "../../store/generate/generateActions";
import "../styles/stats.css";
import RealTimeMonitorModal from "./StatsModal";

interface Account {
  id: string;
  phoneNumber: string;
  profilePicUrl: string;
  connected?: string;
}

interface ChatModalProps {
  onClose: () => void;
  dispatch: (action: any) => void;
  socket: any;
  registeredNumbers: any;
  activeService: string;
  availableAccounts?: Account[];
}

const ChatModal = ({
  onClose,
  dispatch,
  socket,
  registeredNumbers,
  activeService,
  availableAccounts = [],
}: ChatModalProps) => {
  void registeredNumbers;
  void activeService;
  const [showMonitor, setShowMonitor] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const [, setSelectedAccountId] = useState<string>("");

  useEffect(() => {
    if (availableAccounts.length > 0) {
      const initialAccountId = availableAccounts[0].id;
      setSelectedAccountId(initialAccountId);
      dispatch(allGroups(initialAccountId));
    }
  }, [availableAccounts]);

  // Group-related helpers are handled in other views

  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  // Messaging handled by dedicated components
  return (
    <>
      {showMonitor && (
        <RealTimeMonitorModal
          setShowMonitor={setShowMonitor}
          socket={socket}
          onClose={() => {
            setShowMonitor(false);
            onClose();
          }}
        />
      )}

      {showAccountsModal && (
        <div className="account-selection-overlay">
          <div className="account-selection-modal">
            <div className="account-selection-header">
              <h3>Select Sending Accounts</h3>
              <button
                className="account-selection-close"
                onClick={() => setShowAccountsModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="account-selection-body">
              <div className="account-selection-info">
                <FiInfo className="info-icon" />
                <span>
                  Select which accounts to use for sending these messages
                </span>
              </div>

              <div className="account-list">
                {availableAccounts.length > 0 ? (
                  availableAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`account-item ${
                        selectedAccounts.includes(account.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleAccountSelection(account.id)}
                    >
                      <div className="account-avatar">
                        {account.profilePicUrl ? (
                          <img src={account.profilePicUrl} alt={account.id} />
                        ) : (
                          <div className="account-avatar-fallback">
                            {account.phoneNumber}
                          </div>
                        )}
                      </div>
                      <div className="account-details">
                        <span className="account-name">
                          {account.phoneNumber}
                        </span>
                        <span className="account-number">
                          {account.phoneNumber}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={() => toggleAccountSelection(account.id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-accounts">No accounts available</div>
                )}
              </div>
            </div>

            <div className="account-selection-footer">
              <button className="confirm-btn" onClick={() => setShowAccountsModal(false)}>
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
