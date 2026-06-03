import { useState, useEffect } from "react";
import { FiX, FiSend, FiUser, FiMessageSquare } from "react-icons/fi";
import "../styles/chat.css";
import "../styles/stats.css";
import { allGroups, sendMessage } from "../../store/generate/generateActions";
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
  void activeService;

  const [showMonitor, setShowMonitor] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [delay, setDelay] = useState(3);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (availableAccounts.length > 0) {
      dispatch(allGroups(availableAccounts[0].id));
      // Auto-select all connected accounts
      const connectedIds = availableAccounts
        .filter((a) => a.connected === "connected" || a.connected === "true" || a.connected)
        .map((a) => a.id);
      setSelectedAccounts(connectedIds.length > 0 ? connectedIds : [availableAccounts[0].id]);
    }
  }, [availableAccounts]);

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (!message.trim()) { setError("Please enter a message."); return; }
    if (selectedAccounts.length === 0) { setError("Please select at least one account."); return; }
    const numbers = Array.isArray(registeredNumbers) ? registeredNumbers : [];
    if (numbers.length === 0) { setError("No registered numbers to send to."); return; }

    setError("");
    setIsSending(true);
    try {
      await dispatch(
        sendMessage({
          delay: delay * 1000,
          messages: [message.trim()],
          registeredNumbers: numbers,
          useRandomDelay: false,
          selectedAccounts,
        })
      );
      setShowMonitor(true);
    } catch (err: any) {
      setError(err?.message || "Failed to start sending. Check your connection.");
    } finally {
      setIsSending(false);
    }
  };

  if (showMonitor) {
    return (
      <RealTimeMonitorModal
        setShowMonitor={setShowMonitor}
        socket={socket}
        onClose={() => { setShowMonitor(false); onClose(); }}
      />
    );
  }

  return (
    <div className="wa-modal-overlay" onClick={onClose}>
      <div className="wa-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wa-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FiMessageSquare style={{ fontSize: 20, color: "#25D366" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1e293b" }}>
                Message All
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>
                {Array.isArray(registeredNumbers) ? registeredNumbers.length : 0} registered numbers
              </p>
            </div>
          </div>
          <button className="wa-close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="wa-modal-body">
          {/* Account selection */}
          <div className="wa-section">
            <label className="wa-label">
              <FiUser style={{ marginRight: 6 }} /> Sending Accounts
            </label>
            {availableAccounts.length === 0 ? (
              <div className="wa-empty-accounts">
                No WhatsApp accounts connected. Please connect an account first.
              </div>
            ) : (
              <div className="wa-accounts-list">
                {availableAccounts.map((account) => {
                  const selected = selectedAccounts.includes(account.id);
                  return (
                    <div
                      key={account.id}
                      className={`wa-account-item ${selected ? "selected" : ""}`}
                      onClick={() => toggleAccount(account.id)}
                    >
                      <div className="wa-account-avatar">
                        {account.profilePicUrl ? (
                          <img src={account.profilePicUrl} alt="" />
                        ) : (
                          <span>{(account.phoneNumber || account.id).charAt(0)}</span>
                        )}
                      </div>
                      <span className="wa-account-number">{account.phoneNumber || account.id}</span>
                      <div className={`wa-check ${selected ? "visible" : ""}`}>✓</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Message composition */}
          <div className="wa-section">
            <label className="wa-label">
              <FiMessageSquare style={{ marginRight: 6 }} /> Message
            </label>
            <textarea
              className="wa-message-input"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
          </div>

          {/* Delay setting */}
          <div className="wa-section">
            <label className="wa-label">Delay between messages (seconds)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="wa-delay-input"
              value={delay}
              onChange={(e) => setDelay(Math.max(1, Number(e.target.value)))}
            />
          </div>

          {error && <div className="wa-error">{error}</div>}
        </div>

        {/* Footer */}
        <div className="wa-modal-footer">
          <button className="wa-cancel-btn" onClick={onClose}>Cancel</button>
          <button
            className="wa-send-btn"
            onClick={handleSend}
            disabled={isSending || !message.trim() || selectedAccounts.length === 0}
          >
            {isSending ? (
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className="spinning" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                Sending...
              </span>
            ) : (
              <><FiSend /> Send to {Array.isArray(registeredNumbers) ? registeredNumbers.length : 0} Numbers</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
