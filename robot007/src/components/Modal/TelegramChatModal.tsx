import React, { useState, useEffect } from "react";
import {
  FiSend,
  FiX,
  FiPlus,
  FiClock,
  FiInfo,
  FiUsers,
  FiDownload,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiRepeat,
  FiUserX,
  FiChevronRight,
  
} from "react-icons/fi";
import { RiShieldKeyholeLine } from "react-icons/ri";
import "../styles/chat.css";
import {
  exportTelegramGroupMembers,
  fetchTelegramGroups,
} from "../../store/telegram/TelegramActions";
import { useSelector } from "react-redux";
import { selectTelegramGroups } from "../../store/telegram/TelegramSelectors";

interface Message {
  text: string;
}

interface Group {
  id: string;
  name: string;
  members: number;
  avatar?: string;
  lastExported?: string;
  isAdmin?: boolean;
}

interface Account {
  id: string;
  name: string;
  avatar?: string;
  platform: string;
  phoneNumber?: string;
}

interface TelegramChatModalProps {
  onClose: () => void;
  dispatch: (action: any) => void;
  socket: any;
  registeredNumbers: string[];
  availableGroups?: Group[];
  onExportMembers?: (groupId: string) => Promise<void>;
  onRefreshGroups?: () => Promise<void>;
  availableAccounts?: Account[];
  onAccountSelect?: (accountId: string) => void;
  telegramActiveAccounts: string[];
  exportProgress?: { [groupId: string]: number };
  showExportProgress?: boolean;
}

const TEST_GROUPS: Group[] = [
  {
    id: "1",
    name: "Marketing Team",
    members: 245,
    avatar: "https://randomuser.me/api/portraits/business/1.jpg",
    lastExported: "2023-05-15",
    isAdmin: true,
  },
  {
    id: "2",
    name: "Product Updates",
    members: 189,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isAdmin: true,
  },
  {
    id: "3",
    name: "Customer Support",
    members: 312,
    lastExported: "2023-06-20",
  },
  {
    id: "4",
    name: "Sales Channel",
    members: 156,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isAdmin: true,
  },
  {
    id: "5",
    name: "Tech Discussions",
    members: 278,
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
];


const TelegramChatModal: React.FC<TelegramChatModalProps> = ({
  onClose,
  dispatch,
  socket,
  registeredNumbers,
  availableGroups = TEST_GROUPS,

  onRefreshGroups,

  onAccountSelect,
  telegramActiveAccounts,
}) => {
  const [messages, setMessages] = useState<Message[]>([{ text: "" }]);
  const [delay, setDelay] = useState<number>(1);
  const [activeTab, setActiveTab] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [useRandomDelay] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [exportingGroups, setExportingGroups] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>(availableGroups);
  const [showAccountSelection, setShowAccountSelection] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // New scheduling states
  const [scheduleType, setScheduleType] = useState<"once" | "recurring">(
    "once"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [recurringInterval, setRecurringInterval] = useState<number>(3);
  const [recurringUnit, setRecurringUnit] = useState<
    "hours" | "days" | "weeks"
  >("hours");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const listTelegramGroups = useSelector(selectTelegramGroups);

  // Initialize date/time values
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toTimeString().substring(0, 5);

    setStartDate(dateStr);
    setStartTime(timeStr);

    // Set end date to 1 week from now
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setEndDate(nextWeek.toISOString().split("T")[0]);
    setEndTime(timeStr);
  }, []);

  useEffect(() => {
    setGroups(availableGroups);
  }, [availableGroups]);

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleMessageChange = (index: number, text: string) => {
    const newMessages = [...messages];
    newMessages[index].text = text;
    setMessages(newMessages);
  };

  const addMessage = () => {
    if (messages.length < 5) {
      setMessages([...messages, { text: "" }]);
      setActiveTab(messages.length);
    }
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
        const payload: any = {
          delay,
          messages: validMessages,
          registeredNumbers,
          useRandomDelay,
          selectedGroups,
          accountId: selectedAccount?.id,
          scheduleType,
          startDateTime: `${startDate}T${startTime}:00`,
        };

        if (scheduleType === "recurring") {
          payload.recurring = {
            interval: recurringInterval,
            unit: recurringUnit,
            endDateTime: endDate ? `${endDate}T${endTime}:00` : null,
          };
        }

        await dispatch({
          type: "SEND_TELEGRAM_MESSAGES",
          payload,
        });
      } catch (error) {
        console.error("Error sending messages:", error);
      } finally {
        setIsSending(false);
      }
    }
  };

const handleExportMembers = async (accountId: string, groupId: string) => {
  try {
    dispatch(exportTelegramGroupMembers({ accountId, groupId }));
  } catch (error) {
    console.error("Error exporting members:", error);
  } finally {
    setExportingGroups((prev) => prev.filter((id) => id !== groupId));
  }
};


  const handleRefreshGroups = async () => {
    try {
      setIsRefreshing(true);
      if (onRefreshGroups) {
        await onRefreshGroups();
      } else {
        const refreshedGroups = await dispatch({
          type: "REFRESH_TELEGRAM_GROUPS",
        });
        if (Array.isArray(refreshedGroups) && refreshedGroups.length > 0) {
          setGroups(refreshedGroups);
        }
      }
    } catch (error) {
      console.error("Error refreshing groups:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const TIPS = [
    {
      title: "Message Scheduling",
      content:
        "Schedule messages to be sent at specific times or with random delays between 1 minute and your selected maximum time.",
      icon: <FiClock size={20} className="text-blue-400" />,
    },
    {
      title: "Group Targeting",
      content:
        "Select which Telegram groups to use for sending. You can choose one or multiple groups.",
      icon: <FiUsers size={20} className="text-blue-400" />,
    },
    {
      title: "Member Export",
      content:
        "Export group members as CSV for your records. Only available for groups where you're an admin.",
      icon: <FiDownload size={20} className="text-blue-400" />,
    },
    {
      title: "Message Variations",
      content:
        "Create multiple message versions to add variety. The system will randomly select one for each recipient.",
      icon: <FiPlus size={20} className="text-blue-400" />,
    },
    {
      title: "Recurring Campaigns",
      content:
        "Set up recurring campaigns to automatically send messages at regular intervals.",
      icon: <FiRepeat size={20} className="text-blue-400" />,
    },
  ];

  // Account Selection Modal Component
  const AccountSelectionModal: React.FC = () => (
    <div className="telegram-modal-overlay">
      <div className="telegram-modal">
        <div className="telegram-modal-header">
          <div className="telegram-header-left">
            <RiShieldKeyholeLine className="telegram-header-icon" />
            <h3>Select Account</h3>
          </div>
          <button
            className="telegram-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <div className="telegram-modal-body">
          {telegramActiveAccounts.length === 0 ? (
            <div className="no-accounts-container">
              <div className="no-accounts-icon">
                <FiUserX size={48} />
              </div>
              <h4>No Accounts Available</h4>
              <p>Please add an account to continue</p>
              <button className="telegram-btn" onClick={onClose}>
                <FiPlus /> Add Account
              </button>
            </div>
          ) : (
            <div className="accounts-list">
          {telegramActiveAccounts.map((account: any) => (
                <div
                  key={account.id}
                  className="account-item"
                  onClick={() => {
                    dispatch(fetchTelegramGroups(account.id));
                    setSelectedAccount(account);
                    setShowAccountSelection(false);
                    if (onAccountSelect) onAccountSelect(account.id);
                  }}
                >
                  <div className="account-avatar">
                    <div className="account-avatar-fallback">
                      {account.name.charAt(0)}
                    </div>
                  </div>
                  <div className="account-details">
                    <span className="account-name">{account.name}</span>
                    <div className="account-meta">
                      {account.phoneNumber && (
                        <span className="account-phone">
                          {account.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="account-select-icon">
                    <FiChevronRight />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // If we're showing account selection, render that modal
  if (showAccountSelection) {
    return <AccountSelectionModal />;
  }

  // Main modal content
  return (
    <>
      {showGroupsModal && (
        <div className="groups-selection-overlay">
          <div className="groups-selection-modal">
            <div className="groups-selection-header">
              <h3>Select Target Groups</h3>
              <div className="groups-selection-actions">
                <button
                  className="refresh-groups-btn"
                  onClick={handleRefreshGroups}
                  disabled={isRefreshing}
                  title="Refresh groups list"
                >
                  <FiRefreshCw className={isRefreshing ? "spinning" : ""} />
                </button>
                <button
                  className="groups-selection-close"
                  onClick={() => setShowGroupsModal(false)}
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="groups-selection-body">
              <div className="groups-selection-info">
                <FiInfo className="info-icon" />
                <span>Select which groups to send these messages to</span>
              </div>

              <div className="groups-list">
                {listTelegramGroups.length > 0 ? (
                  listTelegramGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`group-item ${
                        selectedGroups.includes(group.id) ? "selected" : ""
                      }`}
                      onClick={() => toggleGroupSelection(group.id)}
                    >
                      <div className="group-avatar">
                        {group.avatar ? (
                          <img src={group.avatar} alt={group.name} />
                        ) : (
                          <div className="group-avatar-fallback">
                            {group.name.charAt(0)}
                          </div>
                        )}
                        {group.isAdmin && (
                          <span className="admin-badge">Admin</span>
                        )}
                      </div>
                      <div className="group-details">
                        <span className="group-name">{group.name}</span>
                        <div className="group-meta">
                          <span className="group-members">
                            {group.memberCount.toLocaleString()} members
                          </span>
                          {group.memberCount && (
                            <span className="group-export-date">
                              Exported: {group.memberCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="group-actions">
                        {group.memberCount && (
                          <button
                            className="export-members-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectedAccount?.id && handleExportMembers(selectedAccount.id, group.id);
                            }}
                            disabled={exportingGroups.includes(group.id)}
                            title="Export group members"
                          >
                            {exportingGroups.includes(group.id) ? (
                              <span className="loading-spinner"></span>
                            ) : (
                              <FiDownload />
                            )}
                          </button>
                        )}
                        <input
                          type="checkbox"
                          checked={selectedGroups.includes(group.id)}
                          onChange={() => toggleGroupSelection(group.id)}
                          className="group-checkbox"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-groups-message">
                    {isRefreshing
                      ? "Refreshing groups..."
                      : "No Telegram groups available"}
                  </div>
                )}
              </div>
            </div>

            <div className="groups-selection-footer">
              <button
                className="groups-selection-cancel"
                onClick={() => setShowGroupsModal(false)}
              >
                Cancel
              </button>
              <button
                className="groups-selection-confirm"
                onClick={() => setShowGroupsModal(false)}
                disabled={groups.length === 0}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {showTips && (
        <div className="tips-modal-overlay">
          <div className="tips-modal telegram-tips">
            <div className="tips-modal-header">
              <h3 className="tips-modal-title">
                <RiShieldKeyholeLine className="inline mr-2" />
                Telegram Messaging Guide
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
                  Here's how to get the most out of your Telegram messaging:
                </p>
              </div>

              <div className="tips-grid">
                {TIPS.map((tip, index) => (
                  <div key={index} className="tip-card">
                    <div className="tip-icon-container">{tip.icon}</div>
                    <div className="tip-content">
                      <h4 className="tip-title">{tip.title}</h4>
                      <p className="tip-text">{tip.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="tips-notes telegram-notes">
                <div className="note-item">
                  <FiInfo className="note-icon" />
                  <span>
                    Admin privileges required for member export functionality
                  </span>
                </div>
                <div className="note-item">
                  <FiInfo className="note-icon" />
                  <span>Exported members will be saved as CSV files</span>
                </div>
              </div>
            </div>

            <div className="tips-modal-footer">
              <button
                className="got-it-button telegram-got-it"
                onClick={() => setShowTips(false)}
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {!showMonitor && (
        <div className="telegram-modal-overlay">
          <div className="telegram-modal">
            <div className="telegram-modal-header">
              <div className="telegram-header-content">
                <div className="telegram-header-left">
                  <button
                    className="account-back-btn"
                    onClick={() => setShowAccountSelection(true)}
                  >
                    <FiArrowLeft />
                    <span>Switch Account</span>
                  </button>
                  <RiShieldKeyholeLine className="telegram-header-icon" />
                  <h3>Telegram Group Message Scheduler</h3>
                </div>
                <div className="telegram-header-right">
                  <button
                    className="telegram-groups-btn"
                    onClick={() => setShowGroupsModal(true)}
                    aria-label="Select groups"
                    title="Select target groups"
                  >
                    <FiUsers />
                    {selectedGroups.length > 0 && (
                      <span className="groups-badge">
                        {selectedGroups.length}
                      </span>
                    )}
                  </button>
                  <button
                    className="telegram-info-btn"
                    onClick={() => setShowTips(!showTips)}
                    aria-label="Show tips"
                  >
                    <FiInfo />
                  </button>
                  <button
                    className="telegram-close-btn"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            </div>

            <div className="telegram-modal-body">
              {/* Account Info Bar */}
              <div className="account-info-bar">
                <div className="current-account">
                  <div className="account-details-small">
                    <span className="account-name-small">
                      {selectedAccount?.name || "No Account Selected"}
                    </span>
                    {selectedAccount?.phoneNumber && (
                      <span className="account-phone-small">
                        {selectedAccount.phoneNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="telegram-recipient-info">
                <span className="telegram-recipient-label">Sending to:</span>
                <span className="telegram-recipient-count">
                  {selectedGroups.length > 0 && (
                    <span className="groups-count">
                      across {selectedGroups.length} group
                      {selectedGroups.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              </div>

              <div className="telegram-tabs-container">
                <div className="telegram-tabs-scroll">
                  {messages.map((_, index) => (
                    <button
                      key={index}
                      className={`telegram-tab ${
                        activeTab === index ? "active" : ""
                      }`}
                      onClick={() => setActiveTab(index)}
                    >
                      Message {index + 1}
                      {messages.length > 1 && (
                        <span
                          className="telegram-tab-close"
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
                  {messages.length < 5 && (
                    <button
                      className="telegram-add-tab"
                      onClick={addMessage}
                      title="Add another message variation"
                    >
                      <FiPlus />
                    </button>
                  )}
                </div>
              </div>

              <div className="telegram-message-editor">
                <textarea
                  value={messages[activeTab].text}
                  onChange={(e) =>
                    handleMessageChange(activeTab, e.target.value)
                  }
                  placeholder="Type your message here..."
                  className="telegram-message-input"
                  rows={5}
                  maxLength={1000}
                />
                <div className="telegram-character-count">
                  {messages[activeTab].text.length}/1000
                </div>
              </div>

              {/* Enhanced Scheduling Section */}
              <div className="telegram-delay-section">
                <div className="telegram-delay-header">
                  <FiClock className="telegram-delay-icon" />
                  <h4>Message Timing Options</h4>
                </div>

                <div className="scheduling-container">
                  <div className="scheduling-type-selector">
                    <button
                      className={`scheduling-type-btn ${
                        scheduleType === "once" ? "active" : ""
                      }`}
                      onClick={() => setScheduleType("once")}
                    >
                      <FiClock className="icon" /> One-Time
                    </button>
                    <button
                      className={`scheduling-type-btn ${
                        scheduleType === "recurring" ? "active" : ""
                      }`}
                      onClick={() => setScheduleType("recurring")}
                    >
                      <FiRepeat className="icon" /> Recurring
                    </button>
                  </div>

                  <div className="scheduling-options">
                    {/* Message Interval */}
                    <div className="scheduling-group">
                      <label className="scheduling-label">
                        <FiClock className="icon" /> Time Between Messages
                      </label>
                      <div className="interval-control">
                        <div className="telegram-preset-delays">
                          {[0.5, 1, 2, 5].map((minutes) => (
                            <button
                              key={minutes}
                              className={`interval-btn ${
                                delay === minutes ? "active" : ""
                              }`}
                              onClick={() => setDelay(minutes)}
                            >
                              {minutes} min
                            </button>
                          ))}
                        </div>
                        <div className="custom-interval">
                          <input
                            type="number"
                            min="0.1"
                            max="60"
                            step="0.1"
                            value={delay}
                            onChange={(e) =>
                              setDelay(parseFloat(e.target.value) || 1)
                            }
                            className="telegram-delay-input"
                          />
                          <span>minutes</span>
                        </div>
                      </div>
                    </div>

                    {/* Start Date/Time */}
                    <div className="scheduling-group">
                      <label className="scheduling-label">
                        <FiCalendar className="icon" /> Start Date & Time
                      </label>
                      <div className="datetime-control">
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="datetime-input"
                        />
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="datetime-input"
                        />
                      </div>
                    </div>

                    {/* Recurring Options */}
                    {scheduleType === "recurring" && (
                      <>
                        <div className="scheduling-group">
                          <label className="scheduling-label">
                            <FiRepeat className="icon" /> Repeat Every
                          </label>
                          <div className="recurring-control">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={recurringInterval}
                              onChange={(e) =>
                                setRecurringInterval(
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="interval-input"
                            />
                            <select
                              value={recurringUnit}
                              onChange={(e) =>
                                setRecurringUnit(e.target.value as any)
                              }
                              className="unit-select"
                            >
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                            </select>
                          </div>
                        </div>

                        <div className="scheduling-group">
                          <label className="scheduling-label">
                            <FiCalendar className="icon" /> End Date & Time
                          </label>
                          <div className="datetime-control">
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="datetime-input"
                            />
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="datetime-input"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="telegram-modal-footer">
              <button className="telegram-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="telegram-send-btn"
                onClick={handleSend}
                disabled={
                  messages.every((m) => !m.text.trim()) ||
                  isSending ||
                  !selectedAccount
                }
              >
                <FiSend className="telegram-send-icon" />
                {isSending ? "Scheduling..." : "Schedule Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TelegramChatModal;
