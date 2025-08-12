import { useState, useEffect } from "react";
import {
  FiSend,
  FiX,
  FiPlus,
  FiClock,
  FiInfo,
  FiUsers,
  FiDownload,
  FiLoader,
  FiUserCheck,
} from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import "../styles/chat.css";
import {
  allGroups,
  exportGroup,
  sendMessage,
  sendMessageTelegram,
} from "../../store/generate/generateActions";
import "../styles/stats.css";
import RealTimeMonitorModal from "./StatsModal";
import { useSelector } from "react-redux";
import {
  allLoading,
  downloadLoading,
  ListGroups,
} from "../../store/generate/generateselectors";

interface Message {
  text: string;
}

interface Account {
  id: string;
  phoneNumber: string;
  profilePicUrl: string;
  connected?: string;
}

// interface Group {
//   id: string;
//   name: string;
//   memberCount: number;
//   isAdmin: boolean;
//   profilePicUrl: string | null;
// }

// interface Tip {
//   title: string;
//   content: string;
//   icon: JSX.Element;
// }

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
  availableAccounts = [], // Default to empty array
}: ChatModalProps) => {
  // Existing states
  const [messages, setMessages] = useState<Message[]>([{ text: "" }]);
  const [delay, setDelay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [useRandomDelay, setUseRandomDelay] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const listGroups = useSelector(ListGroups);

  // Group-related states
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [groupsLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const loadingDownload = useSelector(downloadLoading);

  const fetchLoading = useSelector(allLoading);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock groups data - replace with your API call

  // Simulate loading groups when account is selected
  // Initialize selectedAccountId when modal opens
  useEffect(() => {
    if (showGroupsModal && availableAccounts.length > 0) {
      const initialAccountId = availableAccounts[0].id;
      setSelectedAccountId(initialAccountId);
      dispatch(allGroups(initialAccountId));
    }
  }, [showGroupsModal, currentIndex]);

  // Group selection toggle
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Mock download function
  const downloadGroupMembers = (groupId: string, index) => {
    if (!selectedAccountId) return;
    setCurrentIndex(index);

    dispatch(exportGroup({ groupId, accountId: selectedAccountId }));
  };

  // Confirm group selection
  const handleConfirmGroups = () => {
    setShowGroupsModal(false);
    console.log("Selected groups:", selectedGroups);
  };

  // Existing functions (unchanged)
  const toggleAccountSelection = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleMessageChange = (index: number, text: string) => {
    const newMessages = [...messages];
    newMessages[index].text = text;
    setMessages(newMessages);
  };

  const addMessage = () => {
    setMessages([...messages, { text: "" }]);
    setActiveTab(messages.length);
  };

  const removeMessage = (index: number) => {
    if (messages.length > 1) {
      const newMessages = messages.filter((_, i) => i !== index);
      setMessages(newMessages);
      if (activeTab >= newMessages.length) {
        setActiveTab(newMessages.length - 1);
      }
    }
  };

  const handleSend = async () => {
    if (!socket?.connected) {
      console.error("Socket is not connected");
      return;
    }

    setIsSending(true);
    setShowMonitor(true);

    const validMessages = messages.filter((m) => m.text.trim() !== "");

    if (validMessages.length > 0) {
      try {
        if (activeService === "whatsapp") {
          await dispatch(
            sendMessage({
              delay,
              messages: validMessages,
              registeredNumbers,
              useRandomDelay,
              selectedAccounts,
            })
          );
        } else {
          await dispatch(
            sendMessageTelegram({
              delay,
              messages: validMessages,
              registeredNumbers,
              selectedAccounts,
            })
          );
        }
      } catch (error) {
        console.error("Error sending messages:", error);
        setShowMonitor(false);
      } finally {
        setIsSending(false);
      }
    }
  };
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
                        className="account-checkbox"
                      />
                    </div>
                  ))
                ) : (
                  <div className="no-accounts-message">
                    No sending accounts available
                  </div>
                )}
              </div>
            </div>

            <div className="account-selection-footer">
              <button
                className="account-selection-cancel"
                onClick={() => setShowAccountsModal(false)}
              >
                Cancel
              </button>
              <button
                className="account-selection-confirm"
                onClick={() => setShowAccountsModal(false)}
                disabled={availableAccounts.length === 0}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tips Modal */}
      {showTips && (
        <div className="tips-modal-overlay">
          <div className="tips-modal">
            <div className="tips-modal-header">
              <h3 className="tips-modal-title">
                <RiShieldKeyholeLine className="inline mr-2" />
                Messaging Guide
              </h3>
              <button
                className="tips-modal-close"
                onClick={() => setShowTips(false)}
                aria-label="Close tips"
              >
                <FiX />
              </button>
            </div>

            <div className="tips-modal-body">
              <div className="tips-intro">
                <p className="text-lg font-medium text-gray-700">
                  Here's how to get the most out of your messaging:
                </p>
              </div>

              {/* <div className="tips-grid">
                {TIPS.map((tip, index) => (
                  <div key={index} className="tip-card">
                    <div className="tip-icon-container">
                      {tip.icon}
                    </div>
                    <div className="tip-content">
                      <h4 className="tip-title">{tip.title}</h4>
                      <p className="tip-text">{tip.content}</p>
                    </div>
                  </div>
                ))}
              </div> */}

              <div className="tips-notes">
                <div className="note-item">
                  <FiInfo className="note-icon" />
                  <span>
                    Messages are sent securely through your connected WhatsApp
                    accounts
                  </span>
                </div>
                <div className="note-item">
                  <FiInfo className="note-icon" />
                  <span>You can schedule up to 1000 messages at once</span>
                </div>
              </div>
            </div>

            <div className="tips-modal-footer">
              <button
                className="got-it-button"
                onClick={() => setShowTips(false)}
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroupsModal && (
        <div className="groups-modal-overlay">
          <div className="groups-modal">
            <div className="groups-modal-header">
              <h3>Select Groups</h3>
              <button
                className="groups-modal-close"
                onClick={() => setShowGroupsModal(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="groups-account-selection">
              <label>Select Account:</label>
              <select
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  dispatch(allGroups(e.target.value));
                }}
                value={selectedAccountId}
              >
                {availableAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.phoneNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="groups-list">
              {groupsLoading ? (
                <div className="groups-loading">Loading groups...</div>
              ) : listGroups.length > 0 ? (
                listGroups.map((group, index) => (
                  <div key={group.id} className="group-item">
                    <div className="group-info">
                      {group.profilePicUrl ? (
                        <img src={group.profilePicUrl} alt={group.name} />
                      ) : (
                        <div className="group-avatar-fallback">
                          {group.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4>{group.name}</h4>
                        <span>{group.memberCount} members</span>
                      </div>
                    </div>
                    <div className="group-actions">
                      <button
                        onClick={() => toggleGroupSelection(group.id)}
                        className={
                          selectedGroups.includes(group.id) ? "selected" : ""
                        }
                      >
                        {selectedGroups.includes(group.id)
                          ? "Selected"
                          : "Select"}
                      </button>
                      <button
                        onClick={() => downloadGroupMembers(group.id, index)}
                        className="download-btn"
                        disabled={
                          !selectedAccountId ||
                          (loadingDownload && currentIndex === index)
                        }
                      >
                        {loadingDownload && currentIndex === index ? (
                          <FiLoader className="spin" /> // Show loader only for the clicked button
                        ) : (
                          <FiDownload /> // Show download icon otherwise
                        )}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-groups">
                  {fetchLoading === true ? (
                    <FiLoader className="spiner spinning" /> // Show loader while loading
                  ) : selectedAccountId ? (
                    "No groups found" // Show if no groups exist after loading
                  ) : (
                    "Select an account first" // Show if no account is selected
                  )}
                </div>
              )}
            </div>

            <div className="groups-modal-footer">
              <button
                onClick={() => setShowGroupsModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmGroups}
                disabled={selectedGroups.length === 0}
                className="confirm-btn"
              >
                Confirm ({selectedGroups.length} selected)
              </button>
            </div>
          </div>
        </div>
      )}

      {!showMonitor && (
        <div className="whatsapp-modal-overlay">
          <div className="whatsapp-modal">
<div className="whatsapp-modal-header">
  <div className="whatsapp-header-content">
    <div className="whatsapp-header-left">
      <RiShieldKeyholeLine className="whatsapp-header-icon" />
      <h3>Message Scheduler</h3>
    </div>
    
    <div className="whatsapp-header-right">
      {/* Accounts button - moved first as it's primary action */}
      <div className="header-btn-wrapper" data-tooltip="Sending accounts">
        <button
          className="whatsapp-accounts-btn pulse-on-selected"
          onClick={() => setShowAccountsModal(true)}
          aria-label="Select accounts"
        >
          <FiUserCheck />
          {selectedAccounts.length > 0 && (
            <span className="accounts-badge pulse">
              {selectedAccounts.length}
            </span>
          )}
        </button>
      </div>

      {/* Groups button - secondary but important action */}
      <div className="header-btn-wrapper" data-tooltip="Target groups">
        <button
          className="whatsapp-groups-btn pulse-on-selected"
          onClick={() => setShowGroupsModal(true)}
          aria-label="Select groups"
        >
          <FiUsers />
          {selectedGroups.length > 0 && (
            <span className="groups-badge pulse">
              {selectedGroups.length}
            </span>
          )}
        </button>
      </div>

      {/* Info button - less prominent */}
      <div className="header-btn-wrapper" data-tooltip="Help tips">
        <button
          className="whatsapp-info-btn"
          onClick={() => setShowTips(!showTips)}
          aria-label="Show tips"
        >
          <FiInfo />
        </button>
      </div>

      {/* Close button - standard position */}
      <button
        className="whatsapp-close-btn"
        onClick={onClose}
        aria-label="Close modal"
      >
        <FiX />
      </button>
    </div>
  </div>
</div>

            <div className="whatsapp-modal-body">
              <div className="whatsapp-recipient-info">
                <span className="whatsapp-recipient-label">Sending to:</span>
                <span className="whatsapp-recipient-count">
                  {registeredNumbers.length} contacts
                </span>
              </div>

              <div className="whatsapp-tabs-container">
                <div className="whatsapp-tabs-scroll">
                  {messages.map((_, index) => (
                    <button
                      key={index}
                      className={`whatsapp-tab ${
                        activeTab === index ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(index)}
                    >
                      Message {index + 1}
                      {messages.length > 1 && (
                        <span
                          className="whatsapp-tab-close"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMessage(index);
                          }}
                        >
                          <FiX size={12} />
                        </span>
                      )}
                    </button>
                  ))}
                  <button className="whatsapp-add-tab" onClick={addMessage}>
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="whatsapp-message-editor">
                <textarea
                  value={messages[activeTab].text}
                  onChange={(e) =>
                    handleMessageChange(activeTab, e.target.value)
                  }
                  placeholder="Type your message here..."
                  className="whatsapp-message-input"
                  rows={5}
                />
                <div className="whatsapp-character-count">
                  {messages[activeTab].text.length}/1000
                </div>
              </div>

              <div className="whatsapp-delay-section">
                <div className="whatsapp-delay-header">
                  <FiClock className="whatsapp-delay-icon" />
                  <h4>Schedule Options</h4>
                </div>

                <div className="whatsapp-delay-options">
                  <div className="whatsapp-preset-delays">
                    {[1, 5, 10, 30].map((minutes) => (
                      <button
                        key={minutes}
                        className={`whatsapp-delay-btn ${
                          delay === minutes ? "active" : ""
                        }`}
                        onClick={() => setDelay(minutes)}
                      >
                        {minutes} min
                      </button>
                    ))}
                  </div>

                  <div className="whatsapp-custom-delay">
                    <div className="whatsapp-delay-input-group">
                      <label>Custom delay (minutes):</label>
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={delay}
                        onChange={(e) =>
                          setDelay(
                            Math.min(parseInt(e.target.value || "1"), 1440)
                          )
                        }
                        className="whatsapp-delay-input"
                      />
                    </div>

                    <div className="whatsapp-random-delay-option">
                      <label className="whatsapp-switch">
                        <input
                          type="checkbox"
                          checked={useRandomDelay}
                          onChange={() => setUseRandomDelay(!useRandomDelay)}
                        />
                        <span className="whatsapp-slider"></span>
                      </label>
                      <span className="whatsapp-random-delay-label">
                        Random delay (1-{delay} min)
                        <span className="whatsapp-tooltip">
                          <FiInfo size={12} />
                          <span className="whatsapp-tooltip-text">
                            Messages will be sent at random times between 1
                            minute and your selected delay
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="whatsapp-modal-footer">
              <button className="whatsapp-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="whatsapp-send-btn"
                onClick={handleSend}
                disabled={messages.every((m) => !m.text.trim()) || isSending}
              >
                <FiSend className="whatsapp-send-icon" />
                {isSending ? "Sending..." : "Schedule Messages"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
