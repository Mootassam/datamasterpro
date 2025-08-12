import React, { useState, useEffect, useRef } from "react";
import {
  FiCheck,
  FiInfo,
  FiPlay,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

interface Account {
  id: string;
  phoneNumber: string;
  profilePicUrl?: string;
  platform: "whatsapp" | "telegram" | "signal";
}

interface TelegramAccount {
  connected: Boolean;
  id: string;
  name: string;
  phoneNumber: string;
}

interface VerificationSetupModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onStart: (config: {
    batchSize: number;
    delayBetweenNumbers: number;
    delayBetweenBatches: number;
    selectedAccounts: string[];
  }) => void;
  availableAccounts?: Account[];
  telegramActiveAccounts?: TelegramAccount[];
  activeService: string;
}

interface AccountPickerModalProps {
  isOpen: boolean;
  accounts: any[];
  telegramAccounts: TelegramAccount[];
  selectedAccounts: string[];
  onSelect: (accounts: string[]) => void;
  onClose: () => void;
  activeService: string;
}

const AccountPickerModal: React.FC<AccountPickerModalProps> = ({
  isOpen,
  accounts,
  telegramAccounts,
  selectedAccounts,
  onSelect,
  onClose,
  activeService,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Combine both account types with a type indicator
  const allAccounts = [
    ...(activeService === "whatsapp" 
      ? accounts.map(acc => ({ ...acc, __type: "whatsapp" })) 
      : []),
    ...(activeService === "telegram" 
      ? telegramAccounts.map(acc => ({ ...acc, __type: "telegram" })) 
      : []),
  ];

  const filteredAccounts = allAccounts.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.phoneNumber.toLowerCase().includes(searchLower) ||
      (account.name && account.name.toLowerCase().includes(searchLower))
    );
  });

  const toggleAccount = (accountId: string) => {
    const newSelection = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter((id) => id !== accountId)
      : [...selectedAccounts, accountId];
    onSelect(newSelection);
  };

  if (!isOpen) return null;

  return (
    <div className="account-selector__overlay">
      <div className="account-selector__modal">
        <div className="account-selector__header">
          <h3 className="account-selector__title">
            Select Verification Accounts
          </h3>
          <button onClick={onClose} className="account-selector__close-btn">
            <FiX size={20} />
          </button>
        </div>

        <div className="account-selector__search-container">
          <FiSearch className="account-selector__search-icon" />
          <input
            type="text"
            placeholder={
              activeService === "telegram" 
                ? "Search by name or phone number..." 
                : "Search by phone number..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="account-selector__search-input"
          />
        </div>

        <div className="account-selector__list">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className={`account-selector__item ${
                selectedAccounts.includes(account.id)
                  ? "account-selector__item--selected"
                  : ""
              }`}
              onClick={() => toggleAccount(account.id)}
            >
              <div className="account-selector__avatar">
                {account.profilePicUrl ? (
                  <img
                    src={account.profilePicUrl}
                    alt={account.phoneNumber}
                    className="account-selector__avatar-img"
                  />
                ) : (
                  <div className="account-selector__avatar-fallback">
                    {activeService === "telegram" && account.name
                      ? account.name.charAt(0).toUpperCase()
                      : account.phoneNumber.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="account-selector__details">
                {/* Show name for Telegram accounts */}
                {activeService === "telegram" && account.name && (
                  <span className="account-selector__name">
                    {account.name}
                  </span>
                )}
                <span className="account-selector__phone">
                  {account.phoneNumber}
                </span>
                <span
                  className={`account-selector__platform account-selector__platform--${
                    account.__type || account.platform
                  }`}
                >
                  {account.__type || account.platform}
                </span>
              </div>
              {selectedAccounts.includes(account.id) && (
                <FiCheck className="account-selector__check-icon" />
              )}
            </div>
          ))}
        </div>

        <div className="account-selector__footer">
          <span className="account-selector__counter">
            {selectedAccounts.length} account
            {selectedAccounts.length !== 1 ? "s" : ""} selected
          </span>
          <button onClick={onClose} className="account-selector__confirm-btn">
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};

const VerificationSetupModal: React.FC<VerificationSetupModalProps> = ({
  isOpen,
  onCancel,
  onStart,
  availableAccounts = [],
  telegramActiveAccounts = [],
  activeService,
}) => {
  const [config, setConfig] = useState({
    batchSize: 25,
    delayBetweenNumbers: 300,
    delayBetweenBatches: 1500,
  });

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showSelectionNotification] = useState(false);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="verification-modal-overlay">
      <div
        className="verification-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Improved Modal Header */}
        <div className="modal-header">
          <div className="header-left">
            <div className="header-text">
              <h2 id="modal-title">Verification Settings</h2>
              <p className="header-subtitle">
                Configure your verification parameters
              </p>
            </div>
          </div>
          {(activeService === "whatsapp" || activeService === "telegram") && (
            <div className="header-rights">
              {/* Account selection badge */}
              <div
                className={`account-badges ${
                  selectedAccounts.length > 0 ? "has-selection" : ""
                }`}
                onClick={() => setShowAccountPicker(true)}
              >
                <FiUsers size={18} />
                {selectedAccounts.length > 0 && (
                  <span className="badge-count">{selectedAccounts.length}</span>
                )}
              </div>

              <button
                onClick={onCancel}
                className="close-button"
                aria-label="Close modal"
              >
                <FiX size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Selection notification */}
        {showSelectionNotification && (
          <div className="selection-notification">
            <div className="notification-content">
              <FiCheck className="notification-icon" />
              <span>
                {selectedAccounts.length} account
                {selectedAccounts.length !== 1 ? "s" : ""} selected
              </span>
            </div>
          </div>
        )}

        <div className="modal-content">
          <div className="input-group">
            <label htmlFor="batchSize">
              Numbers per Batch
              <span className="input-hint">(1-500)</span>
            </label>
            <div className="input-wrapper">
              <input
                id="batchSize"
                type="range"
                min="1"
                max="500"
                value={config.batchSize}
                onChange={(e) =>
                  setConfig({ ...config, batchSize: +e.target.value })
                }
              />
              <div className="range-labels">
                <span>1</span>
                <span className="current-value">{config.batchSize}</span>
                <span>500</span>
              </div>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="delayNumbers">
              Delay Between Numbers (ms)
              <span className="input-hint"></span>
            </label>
            <div className="input-wrapper">
              <input
                id="delayNumbers"
                type="number"
                min="0"
                value={config.delayBetweenNumbers}
                onChange={(e) =>
                  setConfig({ ...config, delayBetweenNumbers: +e.target.value })
                }
              />
              <span className="input-suffix">ms</span>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="delayBatches">
              Delay Between Batches (ms)
              <span className="input-hint"></span>
            </label>
            <div className="input-wrapper">
              <input
                id="delayBatches"
                type="number"
                min="0"
                value={config.delayBetweenBatches}
                onChange={(e) =>
                  setConfig({ ...config, delayBetweenBatches: +e.target.value })
                }
              />
              <span className="input-suffix">ms</span>
            </div>
          </div>

          <div className="info-box">
            <FiInfo className="info-icon" />
            <div className="info-content">
              <h3>Why these settings matter</h3>
              <ul>
                <li>Smaller batches reduce WhatsApp block risk</li>
                <li>Delays help avoid spam detection</li>
                <li>Defaults are optimized for safety</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="secondary-button">
            Cancel
          </button>
          <button
            onClick={() =>
              onStart({
                ...config,
                selectedAccounts,
              })
            }
            className="primary-button"
          >
            <FiPlay className="button-icon" />
            Start Verification
          </button>
        </div>
      </div>

      <AccountPickerModal
        isOpen={showAccountPicker}
        accounts={availableAccounts}
        telegramAccounts={telegramActiveAccounts}
        selectedAccounts={selectedAccounts}
        onSelect={setSelectedAccounts}
        onClose={() => setShowAccountPicker(false)}
        activeService={activeService}
      />
    </div>
  );
};

export default VerificationSetupModal;