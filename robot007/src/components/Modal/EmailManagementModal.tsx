import { useState, useEffect, useRef } from "react";
import {
  FiMail,
  FiUser,
  FiSettings,
  FiX,
  FiChevronDown,
  FiLock,
  FiServer,
  FiEdit,
  FiTrash2,
  FiSend,
  FiSave,
  FiLink,
  FiBarChart2,
  FiMoreVertical,
} from "react-icons/fi";
import { FaPaperclip } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  createEmailAccount,
  editEmailAccount,
  removeEmailAccount,
  testEmailAccount,
  fetchEmailAccounts,
  fetchEmailSettings,
  saveEmailSettings,
  launchEmailCampaign,
  stopEmailCampaign,
} from "../../store/email/emailActions";
import {
  selectEmailAccounts,
  selectEmailSettings,
  selectIsCampaignRunning,
  selectCampaignStatus,
  selectEmailLoading,
} from "../../store/email/emailSelectors";
import EmailCampaignStatsModal from "./EmailCampaignStatsModal";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "@reduxjs/toolkit";
import Toast from "../../shared/Message/Toast";

interface EmailManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  socket: any;
}

// ==============================================
// Account Tab Component
// ==============================================
interface AccountTabProps {
  accounts: any[];
  accountData: any;
  setAccountData: React.Dispatch<React.SetStateAction<any>>;
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  testEmailAddress: string;
  setTestEmailAddress: React.Dispatch<React.SetStateAction<string>>;
  showTestEmailInput: boolean;
  setShowTestEmailInput: React.Dispatch<React.SetStateAction<boolean>>;
  handleAccountSubmit: (e: React.FormEvent) => Promise<void>;
  handleEditAccount: (account: any) => void;
  handleDeleteAccount: (accountId: string) => Promise<void>;
  handleTestAccount: () => Promise<void>;
  isLoading: boolean;
}

const AccountTab: React.FC<AccountTabProps> = ({
  accounts,
  accountData,
  setAccountData,
  isEditMode,
  setIsEditMode,
  testEmailAddress,
  setTestEmailAddress,
  showTestEmailInput,
  setShowTestEmailInput,
  handleAccountSubmit,
  handleEditAccount,
  handleDeleteAccount,
  handleTestAccount,
  isLoading,
}) => {
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveAccountId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleAccountActions = (accountId: string) => {
    setActiveAccountId(activeAccountId === accountId ? null : accountId);
  };

  return (
    <div className="email-dashboard__account-section">
      {/* Account List */}
      {accounts.length > 0 && (
        <div className="email-account-list">
          <div className="email-section-header">
            <h3 className="email-section-title">Your Email Accounts</h3>
            <span className="email-account-count">
              {accounts.length} connected
            </span>
          </div>

          <div className="email-account-grid">
            {accounts.map((account) => (
              <div key={account.id} className="email-account-card">
                <div className="account-badge">
                  <div className="account-avatar">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="account-details">
                  <div className="account-name">{account.name}</div>
                  <div className="account-email">{account.email}</div>

                  <div className="account-stats">
                    <div className="stat-item">
                      <span className="stat-label">Daily Limit</span>
                      <span className="stat-values">{account.dailyLimit}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Used Today</span>
                      <span className="stat-values">0</span>
                    </div>
                  </div>
                </div>

                <div className="account-actions" ref={dropdownRef}>
                  <button
                    className="account-actions-toggle"
                    onClick={() => toggleAccountActions(account.id)}
                  >
                    <FiMoreVertical />
                  </button>

                  {activeAccountId === account.id && (
                    <div className="account-actions-menu">
                      <button
                        className="menu-item"
                        onClick={() => {
                          handleEditAccount(account);
                          setActiveAccountId(null);
                        }}
                      >
                        <FiEdit className="menu-icon" />
                        Edit Account
                      </button>
                      <button
                        className="menu-item"
                        onClick={() => {
                          handleDeleteAccount(account.id);
                          setActiveAccountId(null);
                        }}
                      >
                        <FiTrash2 className="menu-icon" />
                        Delete
                      </button>
                      <button
                        className="menu-item"
                        onClick={() => {
                          setAccountData((prev) => ({
                            ...prev,
                            id: account.id,
                          }));
                          setShowTestEmailInput(true);
                          setActiveAccountId(null);
                        }}
                      >
                        <FiSend className="menu-icon" />
                        Send Test
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Email Input */}
      {showTestEmailInput && (
        <div className="email-test-card">
          <div className="email-section-header">
            <h3 className="email-section-title">Send Test Email</h3>
            <button
              className="email-close-btn"
              onClick={() => setShowTestEmailInput(false)}
            >
              <FiX />
            </button>
          </div>

          <div className="email-form-group">
            <label className="email-form-label">Recipient Email</label>
            <input
              type="email"
              className="email-form-input"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="recipient@example.com"
            />
          </div>

          <div className="email-form-footer">
            <button
              type="button"
              className="email-btn email-btn--secondary"
              onClick={() => setShowTestEmailInput(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="email-btn email-btn--primary"
              onClick={handleTestAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="email-spinner"></div>
              ) : (
                <>
                  <FiSend className="btn-icon" />
                  Send Test
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Account Form */}
      <div className="email-account-form">
        <div className="email-section-header">
          <h3 className="email-section-title">
            {isEditMode ? "Edit Email Account" : "Add New Account"}
          </h3>
        </div>

        <form onSubmit={handleAccountSubmit}>
          <div className="email-form-row">
            <div className="email-form-group">
              <label className="email-form-label">Display Name</label>
              <input
                type="text"
                className="email-form-input"
                value={accountData.name}
                onChange={(e) =>
                  setAccountData({ ...accountData, name: e.target.value })
                }
                placeholder="Marketing Team"
                required
              />
            </div>

            <div className="email-form-group">
              <label className="email-form-label">Email Address</label>
              <div className="email-input-with-icon">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  className="email-form-input"
                  value={accountData.email}
                  onChange={(e) =>
                    setAccountData({ ...accountData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="email-form-row">
            <div className="email-form-group">
              <label className="email-form-label">Password/App Password</label>
              <div className="email-input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  className="email-form-input"
                  value={accountData.password}
                  onChange={(e) =>
                    setAccountData({ ...accountData, password: e.target.value })
                  }
                  placeholder={isEditMode ? "Leave blank to keep current" : ""}
                  required={!isEditMode}
                />
              </div>
            </div>

            <div className="email-form-group">
              <label className="email-form-label">SMTP Host</label>
              <div className="email-input-with-icon">
                <FiServer className="input-icon" />
                <input
                  type="text"
                  className="email-form-input"
                  value={accountData.smtpHost}
                  onChange={(e) =>
                    setAccountData({ ...accountData, smtpHost: e.target.value })
                  }
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
            </div>
          </div>

          <div className="email-form-row">
            <div className="email-form-group">
              <label className="email-form-label">Port</label>
              <input
                type="text"
                className="email-form-input"
                value={accountData.smtpPort}
                onChange={(e) =>
                  setAccountData({ ...accountData, smtpPort: e.target.value })
                }
                placeholder="587"
                required
              />
            </div>

            <div className="email-form-group">
              <label className="email-form-label">Security</label>
              <div className="email-select-wrapper">
                <select
                  className="email-form-select"
                  value={accountData.security}
                  onChange={(e) =>
                    setAccountData({ ...accountData, security: e.target.value })
                  }
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">None</option>
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>
          </div>

          <div className="email-form-group">
            <label className="email-form-label">
              Daily Limit:{" "}
              <span className="limit-value">
                {accountData.dailyLimit} emails/day
              </span>
            </label>
            <div className="email-range-slider">
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={accountData.dailyLimit}
                onChange={(e) =>
                  setAccountData({
                    ...accountData,
                    dailyLimit: parseInt(e.target.value),
                  })
                }
              />
              <div className="range-labels">
                <span>10</span>
                <span>500</span>
              </div>
            </div>
          </div>

          <div className="email-form-footer">
            <button
              type="button"
              className="email-btn email-btn--secondary"
              onClick={() => {
                setIsEditMode(false);
                setAccountData({
                  id: "",
                  name: "",
                  email: "",
                  password: "",
                  smtpHost: "smtp.gmail.com",
                  smtpPort: "587",
                  security: "tls",
                  dailyLimit: 100,
                });
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="email-btn email-btn--primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="email-spinner"></div>
              ) : (
                <>
                  <FiLink className="btn-icon" />
                  {isEditMode ? "Update Account" : "Connect Account"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==============================================
// Campaign Tab Component
// ==============================================
interface CampaignTabProps {
  accounts: any[];
  isCampaignRunning: boolean;
  campaignStatus: any;
  handleCampaignSubmit: (
    e: React.FormEvent,
    data: {
      subject: string;
      content: string;
      selectedSenders: string[];
      recipients: string[];
    }
  ) => Promise<void>;
  handleCancelCampaign: () => Promise<void>;
  isLoading: boolean;
}

const CampaignTab: React.FC<CampaignTabProps> = ({
  accounts,
  handleCampaignSubmit,
  isLoading,
}) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedSenders, setSelectedSenders] = useState<string[]>([]);
  const [recipientsText, setRecipientsText] = useState("");
  const [isSenderDropdownOpen, setIsSenderDropdownOpen] = useState(false);

  const handleRecipientsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    setRecipientsText(text);
  };

  const toggleSenderSelection = (senderId: string) => {
    setSelectedSenders((prev) =>
      prev.includes(senderId)
        ? prev.filter((id) => id !== senderId)
        : [...prev, senderId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse recipients
    const recipients = recipientsText
      .split(/[\n,]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    handleCampaignSubmit(e, {
      subject,
      content,
      selectedSenders,
      recipients,
    });
  };

  const resetForm = () => {
    setSubject("");
    setContent("");
    setSelectedSenders([]);
    setRecipientsText("");
  };

  return (
    <form onSubmit={handleSubmit} className="email-campaign-form">
      <div className="email-section-header">
        <h3 className="email-section-title">New Email Campaign</h3>
        <div className="campaign-stats">
          <div className="stat-badge">
            <span className="stat-label">Accounts</span>
            <span className="stat-values">{accounts.length}</span>
          </div>
        </div>
      </div>

      <div className="email-form-row">
        <div className="email-form-group">
          <label className="email-form-label">Send From</label>
          <div className="email-sender-dropdown">
            <button
              type="button"
              className="email-dropdown-toggle"
              onClick={() => setIsSenderDropdownOpen(!isSenderDropdownOpen)}
            >
              <span>
                {selectedSenders.length > 0
                  ? `${selectedSenders.length} sender${
                      selectedSenders.length > 1 ? "s" : ""
                    } selected`
                  : "Select senders"}
              </span>
              <FiChevronDown
                className={`dropdown-chevron ${
                  isSenderDropdownOpen ? "open" : ""
                }`}
              />
            </button>
            {isSenderDropdownOpen && (
              <div className="email-dropdown-menu">
                {accounts.map((account) => (
                  <label key={account.id} className="email-sender-option">
                    <div className="custom-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSenders.includes(account.id)}
                        onChange={() => toggleSenderSelection(account.id)}
                      />
                      <span className="checkmark"></span>
                    </div>
                    <span className="sender-label">
                      <span className="sender-name">{account.name}</span>
                      <span className="sender-email">{account.email}</span>
                    </span>
                  </label>
                ))}
                {accounts.length === 0 && (
                  <div className="email-sender-option email-no-accounts">
                    <div>No accounts available</div>
                    <div>Add an account in Account tab</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="email-form-group">
        <label className="email-form-label">
          Recipients{" "}
          <span className="recipient-count">
            ({recipientsText.split(/[\n,]+/).filter((e) => e.trim()).length})
          </span>
        </label>
        <textarea
          className="email-form-textarea"
          value={recipientsText}
          onChange={handleRecipientsChange}
          placeholder="Enter emails, one per line or comma-separated"
          required
        ></textarea>
      </div>

      <div className="email-form-group">
        <label className="email-form-label">Subject</label>
        <input
          type="text"
          className="email-form-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Your subject line"
          required
        />
      </div>

      <div className="email-form-group">
        <label className="email-form-label">Email Content</label>
        <textarea
          className="email-form-textarea email-content-editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your email content here..."
          rows={8}
          required
        />
      </div>

      <div className="email-form-footer">
        <div className="footer-actions">
          <button
            type="button"
            className="email-btn email-btn--attachment"
            onClick={() => alert("Attachments not implemented")}
          >
            <FaPaperclip className="btn-icon" />
            <span>Add Attachments</span>
          </button>

          <div className="action-buttons">
            <button
              type="button"
              className="email-btn email-btn--secondary"
              onClick={resetForm}
            >
              Reset
            </button>
            <button
              type="submit"
              className="email-btn email-btn--primary"
              disabled={isLoading || accounts.length === 0}
            >
              {isLoading ? (
                <div className="email-spinner"></div>
              ) : (
                <>
                  <FiSend className="btn-icon" />
                  Launch Campaign
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ==============================================
// Preferences Tab Component
// ==============================================
interface PreferencesTabProps {
  preferences: {
    dailyLimit: number;
    delayBetween: number;
  };
  setPreferences: React.Dispatch<
    React.SetStateAction<{
      dailyLimit: number;
      delayBetween: number;
    }>
  >;
  handlePreferencesSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  setPreferences,
  handlePreferencesSubmit,
  isLoading,
}) => {
  return (
    <div className="email-preferences-form">
      <div className="email-section-header">
        <h3 className="email-section-title">Email Preferences</h3>
      </div>

      <form onSubmit={handlePreferencesSubmit}>
        <div className="email-form-group">
          <label className="email-form-label">Global Daily Limit</label>
          <div className="preference-slider">
            <input
              type="range"
              min="1"
              max="1000"
              value={preferences.dailyLimit}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  dailyLimit: parseInt(e.target.value),
                })
              }
            />
            <div className="slider-value">
              {preferences.dailyLimit} emails/day
            </div>
          </div>
        </div>

        <div className="email-form-group">
          <label className="email-form-label">
            Delay Between Emails:{" "}
            <span className="delay-value">{preferences.delayBetween}s</span>
          </label>
          <div className="preference-slider">
            <input
              type="range"
              min="1"
              max="60"
              value={preferences.delayBetween}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  delayBetween: parseInt(e.target.value),
                })
              }
            />
            <div className="slider-labels">
              <span>1s</span>
              <span>60s</span>
            </div>
          </div>
        </div>

        <div className="email-form-footer">
          <button
            type="submit"
            className="email-btn email-btn--primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="email-spinner"></div>
            ) : (
              <>
                <FiSave className="btn-icon" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ==============================================
// Main Component
// ==============================================
const EmailManagementModal: React.FC<EmailManagementModalProps> = ({
  isOpen,
  onClose,
  socket,
}) => {
  const dispatch: ThunkDispatch<any, void, AnyAction> = useDispatch();

  const accounts = useSelector(selectEmailAccounts);
  const settings = useSelector(selectEmailSettings);
  const isLoading = useSelector(selectEmailLoading);
  const isCampaignRunning = useSelector(selectIsCampaignRunning);
  const campaignStatus = useSelector(selectCampaignStatus);

  const [activeTab, setActiveTab] = useState<
    "account" | "campaign" | "preferences"
  >("campaign");
  const [accountData, setAccountData] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    security: "tls",
    dailyLimit: 100,
  });
  const [preferences, setPreferences] = useState({
    dailyLimit: settings?.dailyLimit || 100,
    delayBetween: settings?.delayBetween || 2,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [showTestEmailInput, setShowTestEmailInput] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // State for campaign progress data
  const [progressData, setProgressData] = useState<any>(null);
  const [campaignStartTime, setCampaignStartTime] = useState<Date | null>(null);

  // Fetch data on open
  useEffect(() => {
    const handleCampaignProgress = (data: any) => {
      setProgressData(data);

      // Set start time on first progress event
      if (!campaignStartTime) {
        setCampaignStartTime(new Date());
      }
    };

    if (isOpen) {
      dispatch(fetchEmailAccounts());
      dispatch(fetchEmailSettings());
      socket.on("email-sending-progress", handleCampaignProgress);
    }

    return () => {
      socket.off("email-sending-progress", handleCampaignProgress);
      setProgressData(null);
      setCampaignStartTime(null);
    };
  }, [isOpen, dispatch, socket]);

  const handleCampaignSubmit = async (
    e: React.FormEvent,
    data: {
      subject: string;
      content: string;
      selectedSenders: string[];
      recipients: string[];
    }
  ) => {
    e.preventDefault();

    if (data.recipients.length === 0) {
      Toast.Error("Add at least one recipient");
      return;
    }

    if (data.selectedSenders.length === 0) {
      Toast.Error("Select at least one sender");

      return;
    }

    if (!data.subject || !data.content) {
      Toast.Error("Subject and content required");

      return;
    }
    try {
      setProgressData(null);

      const result = await dispatch(
        launchEmailCampaign({
          subject: data.subject,
          content: data.content,
          senders: data.selectedSenders,
          recipients: data.recipients,
        })
      );

      if (result?.payload && typeof result.payload === 'object' && 'success' in result.payload && result.payload.success) {
        setCampaignStartTime(new Date());
        setShowStatsModal(true);
      } else {
        Toast.Error("Failed to launch campaign. Please check your settings.");
      }
    } catch (error) {
      Toast.Error("Failed to launch campaign. Please try again.");
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !accountData.name ||
      !accountData.email ||
      !accountData.smtpHost ||
      !accountData.smtpPort
    ) {
      Toast.Error("Fill all required fields");

      return;
    }

    if (!isEditMode && !accountData.password) {
      Toast.Error("Password is required");

      return;
    }

    try {
      if (isEditMode) {
        await dispatch(
          editEmailAccount({
            accountId: accountData.id,
            accountData: {
              name: accountData.name,
              email: accountData.email,
              password: accountData.password,
              smtpHost: accountData.smtpHost,
              smtpPort: accountData.smtpPort,
              security: accountData.security,
              dailyLimit: accountData.dailyLimit,
            },
          })
        );
        setIsEditMode(false);
      } else {
        await dispatch(
          createEmailAccount({
            name: accountData.name,
            email: accountData.email,
            password: accountData.password,
            smtpHost: accountData.smtpHost,
            smtpPort: accountData.smtpPort,
            security: accountData.security,
            dailyLimit: accountData.dailyLimit,
          })
        );
      }

      // Reset form
      setAccountData({
        id: "",
        name: "",
        email: "",
        password: "",
        smtpHost: "smtp.gmail.com",
        smtpPort: "587",
        security: "tls",
        dailyLimit: 100,
      });
      Toast.Success("Account saved successfully!");
    } catch (error) {
      Toast.Error("Failed to save account. Please try again.");
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        saveEmailSettings({
          dailyLimit: Number(preferences.dailyLimit),
          delayBetween: Number(preferences.delayBetween),
        })
      );
      Toast.Error("Preferences saved successfully!");
    } catch (error) {
      Toast.Error("Failed to save preferences. Please try again.");
    }
  };

  const handleEditAccount = (account: any) => {
    setAccountData({
      id: account.id,
      name: account.name,
      email: account.email,
      password: "",
      smtpHost: account.smtpHost,
      smtpPort: account.smtpPort,
      security: account.security,
      dailyLimit: account.dailyLimit,
    });
    setIsEditMode(true);
    setActiveTab("account");
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (window.confirm("Are you sure you want to delete this account?")) {
      try {
        await dispatch(removeEmailAccount(accountId));
      Toast.Success("Account deleted successfully!");

        Toast.Error("");
      } catch (error) {
      Toast.Error("Failed to delete account. Please try again.");

      }
    }
  };

  const handleTestAccount = async () => {
    if (!testEmailAddress) {
      Toast.Error("Enter a test email address");
      return;
    }

    let accountId = accountData.id;
    if (!accountId && accounts.length > 0) {
      accountId = accounts[0].id;
    }

    if (!accountId) {
      Toast.Error("No account available for testing");
      return;
    }

    try {
      const result = await dispatch(
        testEmailAccount({
          accountId,
          testEmailAddress,
        })
      );

        if (result?.payload && typeof result.payload === 'object' && 'success' in result.payload && result.payload.success) {

        Toast.Success("Test email sent successfully!");
        setShowTestEmailInput(false);
        setTestEmailAddress("");
      }
    } catch (error) {
      Toast.Error("Failed to send test email. Please check your settings.");
    }
  };

  const handleCancelCampaign = async () => {
    if (
      window.confirm("Are you sure you want to cancel the running campaign?")
    ) {
      try {
        await dispatch(stopEmailCampaign());
        Toast.Success("Campaign stopped successfully!");
      } catch (error) {
        Toast.Error("Failed to stop campaign. Please try again.");
      }
    }
  };

  if (!isOpen && !showStatsModal) return null;

  return (
    <>
      {showStatsModal && (
        <EmailCampaignStatsModal
          isOpen={showStatsModal}
          onClose={() => {
            setShowStatsModal(false);
            if (!isOpen) onClose();
          }}
          progressData={progressData}
          startTime={campaignStartTime || new Date()}
        />
      )}
      {isOpen && !showStatsModal && (
        <div className="email-modal-overlay">
          <div className="email-modal-container">
            {/* Modal Header */}
            <div className="email-modal-header">
              <div className="header-content">
                <h2 className="email-modal-title">
                  {activeTab === "account"
                    ? "Email Accounts"
                    : activeTab === "campaign"
                    ? "New Campaign"
                    : "Email Preferences"}
                </h2>
                <div className="header-actions">
                  <button
                    className="email-stats-btn"
                    onClick={() => setShowStatsModal(true)}
                  >
                    <FiBarChart2 />
                    <span>View Stats</span>
                  </button>
                </div>
              </div>
              <button onClick={onClose} className="email-modal-close">
                <FiX size={24} />
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="email-tab-nav">
              <button
                className={`email-tab ${
                  activeTab === "account" ? "active" : ""
                }`}
                onClick={() => setActiveTab("account")}
              >
                <FiUser className="tab-icon" />
                <span>Account</span>
              </button>
              <button
                className={`email-tab ${
                  activeTab === "campaign" ? "active" : ""
                }`}
                onClick={() => setActiveTab("campaign")}
              >
                <FiMail className="tab-icon" />
                <span>Campaign</span>
              </button>
              <button
                className={`email-tab ${
                  activeTab === "preferences" ? "active" : ""
                }`}
                onClick={() => setActiveTab("preferences")}
              >
                <FiSettings className="tab-icon" />
                <span>Preferences</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="email-content-area">
              {activeTab === "account" && (
                <AccountTab
                  accounts={accounts}
                  accountData={accountData}
                  setAccountData={setAccountData}
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  testEmailAddress={testEmailAddress}
                  setTestEmailAddress={setTestEmailAddress}
                  showTestEmailInput={showTestEmailInput}
                  setShowTestEmailInput={setShowTestEmailInput}
                  handleAccountSubmit={handleAccountSubmit}
                  handleEditAccount={handleEditAccount}
                  handleDeleteAccount={handleDeleteAccount}
                  handleTestAccount={handleTestAccount}
                  isLoading={isLoading}
                />
              )}

              {activeTab === "campaign" && (
                <CampaignTab
                  accounts={accounts}
                  isCampaignRunning={isCampaignRunning}
                  campaignStatus={campaignStatus}
                  handleCampaignSubmit={handleCampaignSubmit}
                  handleCancelCampaign={handleCancelCampaign}
                  isLoading={isLoading}
                />
              )}

              {activeTab === "preferences" && (
                <PreferencesTab
                  preferences={preferences}
                  setPreferences={setPreferences}
                  handlePreferencesSubmit={handlePreferencesSubmit}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailManagementModal;
