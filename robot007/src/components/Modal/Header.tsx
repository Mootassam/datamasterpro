import { FaTelegram, FaUsers, FaWhatsapp } from "react-icons/fa";
import { RiShieldKeyholeLine } from "react-icons/ri";
import {
  FiCheckCircle,
  FiLink,
  FiLoader,
  FiLogOut,
  FiMail,
  FiMenu,
  FiGlobe,
  FiChevronsDown,
} from "react-icons/fi";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "../styles/Header.css";
import { allAccounts } from "../../store/generate/generateActions";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "@reduxjs/toolkit";
import { allaccounts } from "../../store/generate/generateselectors";
import { debounce } from "lodash";
import { fetchTelegramAccounts, logoutAllTelegram, logoutTelegram } from "../../store/telegram/TelegramActions";
import { selectConnectedAccounts } from "../../store/telegram/TelegramSelectors";

type ServiceType = "whatsapp" | "telegram" | "email" | "osint";

interface HeaderModalProps {
  activeService: ServiceType;
  stateConnection: string;
  user: any;
  setActiveService: (service: ServiceType) => void;
  handleLogout: () => void;
  handleConnect: () => void;
  handleAddAccount: () => void;
  handleAccountAction: (accountId: string) => void;
  handleLogoutAll: () => void;
  handleMainConnection: () => void;
  connectionLoading: boolean;
  connectionStatus: string;
  logout: (accountId: string) => void;
  logoutAll: () => void;
  socket: any;
}

const HeaderModal: React.FC<HeaderModalProps> = ({
  activeService,
  setActiveService,
  handleMainConnection,
  connectionLoading,
  connectionStatus,
  logout,
  logoutAll,
  socket
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const dispatch: ThunkDispatch<any, void, AnyAction> = useDispatch();
  
  // Separate account selectors
  const whatsappAccounts = useSelector(allaccounts);
  const telegramAccounts = useSelector(selectConnectedAccounts);
  
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  // Memoized count of connected accounts
  const connectedAccountsCount = useMemo(() => {
    if (activeService === 'telegram') {
      return telegramAccounts.length;
    } else {
      return whatsappAccounts.filter(a => a.connected === true).length;
    }
  }, [whatsappAccounts, telegramAccounts, activeService]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when resizing to desktop
  const handleResize = useCallback(
    debounce(() => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    }, 100),
    []
  );

  useEffect(() => {
    const resizeHandler = () => handleResize();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      handleResize.cancel();
    };
  }, [dispatch]);

  // Load accounts on mount and when active service changes
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        if (activeService === 'whatsapp') {
          await dispatch(allAccounts());
        } else if (activeService === 'telegram') {
          await dispatch(fetchTelegramAccounts());
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
      }
    };

    loadAccounts();
  }, [activeService, dispatch]);

  // Real-time account updates
  useEffect(() => {
    if (!socket) return;
    
    const handleAccountUpdate = () => {
      if (activeService === 'whatsapp') {
        dispatch(allAccounts());
      } else if (activeService === 'telegram') {
        dispatch(fetchTelegramAccounts());
      }
    };

    socket.on("client-connect", handleAccountUpdate);
    socket.on("client-disconnect", handleAccountUpdate);
    socket.on("connection-cancelled", handleAccountUpdate);

    return () => {
      socket.off("client-connect", handleAccountUpdate);
      socket.off("client-disconnect", handleAccountUpdate);
      socket.off("connection-cancelled", handleAccountUpdate);
    };
  }, [socket, dispatch, activeService]);

  // Handle Telegram-specific logout
  const handleTelegramLogout = async (accountId: string) => {
    try {
      await dispatch(logoutTelegram(accountId));
      await dispatch(fetchTelegramAccounts());
    } catch (error) {
      console.error('Telegram logout failed:', error);
    }
  };

  // Handle Telegram-specific logout all
  const handleTelegramLogoutAll = async () => {
    try {
      await dispatch(logoutAllTelegram());
      await dispatch(fetchTelegramAccounts());
      setIsAccountDropdownOpen(false);
    } catch (error) {
      console.error('Telegram logout all failed:', error);
    }
  };

  const getServiceColor = (service: ServiceType): string => {
    const colors = {
      whatsapp: "#25D366",
      telegram: "#0088cc",
      email: "#DB4437",
      osint: "#6e40c9",
    };
    return colors[service] || "#25D366";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen((prev) => !prev);
    setIsMobileMenuOpen(false);
  };

  const handleServiceClick = (service: ServiceType) => {
    setActiveService(service);
    setIsMobileMenuOpen(false);
  };

  const getPlaceholderImage = (name: string): string => {
    const colors = [
      "#25D366",
      "#0088cc",
      "#DB4437",
      "#6e40c9",
      "#FF9500",
      "#4CD964",
    ];
    const color = colors[name.length % colors.length];
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=${color.replace("#", "")}&color=fff&rounded=true&size=128`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsAccountDropdownOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const ServiceIcon = ({ service }: { service: ServiceType }) => {
    switch (service) {
      case "whatsapp":
        return <FaWhatsapp className="dm-service-icon" />;
      case "telegram":
        return <FaTelegram className="dm-service-icon" />;
      case "email":
        return <FiMail className="dm-service-icon" />;
      case "osint":
        return <FiGlobe className="dm-service-icon" />;
      default:
        return <FaWhatsapp className="dm-service-icon" />;
    }
  };

  return (
    <header className="dm-header" onKeyDown={handleKeyDown} ref={headerRef}>
      {/* Mobile Menu Button */}
      <button
        className="dm-mobile-menu-btn"
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
      >
        <FiMenu className="dm-menu-icon" />
      </button>

      {/* Logo */}
      <div 
        className="dm-logo" 
        onClick={() => {
          setIsMobileMenuOpen(false);
          setIsServicesModalOpen(true);
        }}
        style={{ cursor: "pointer" }}
      >
        <RiShieldKeyholeLine className="dm-logo-icon" />
        <span className="dm-logo-text">CYBER007</span>
      </div>

      {/* Service Navigation */}
      <nav
        className={`dm-service-nav ${isMobileMenuOpen ? "dm-nav-open" : ""}`}
      >
        <div className="dm-service-tabs">
          {(["whatsapp", "email", 'telegram'] as ServiceType[]).map((service) => (
            <button
              key={service}
              className={`dm-service-tab ${
                activeService === service ? "dm-tab-active" : ""
              }`}
              onClick={() => handleServiceClick(service)}
              style={{
                backgroundColor:
                  activeService === service ? getServiceColor(service) : "",
                borderColor:
                  activeService === service ? getServiceColor(service) : "",
              }}
              aria-label={`Switch to ${service} service`}
            >
              <ServiceIcon service={service} />
              <span className="dm-tab-label">
                {service.charAt(0).toUpperCase() + service.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Account & Connection Controls */}
      {activeService !== "osint" && activeService !== "email" && (
        <div className="dm-header-controls">
          {/* Account Dropdown */}
          <div className="dm-account-dropdown">
            <button
              className="dm-account-trigger"
              onClick={toggleAccountDropdown}
              aria-expanded={isAccountDropdownOpen}
              aria-label="Account management"
            >
              <div className="dm-account-badge">
                <FaUsers className="dm-users-icon" />
                <span className="dm-account-count">
                  {connectedAccountsCount} Connected
                </span>
              </div>
              <FiChevronsDown
                className={`dm-dropdown-arrow ${
                  isAccountDropdownOpen ? "dm-arrow-rotate" : ""
                }`}
              />
            </button>

            {/* Account Dropdown Menu */}
            {isAccountDropdownOpen && (
              <div className="dm-account-dropdown-menu">
                <div className="dm-dropdown-header">
                  <h4 className="dm-dropdown-title">
                    {activeService.charAt(0).toUpperCase() +
                      activeService.slice(1)}{" "}
                    Accounts
                  </h4>
                </div>

                <div className="dm-account-list">
                  {/* WhatsApp Accounts */}
                  {activeService === 'whatsapp' && (
                    whatsappAccounts.length > 0 ? (
                      whatsappAccounts.map((account) => (
                        <div key={account.id} className="dm-account-item">
                          <img
                            src={
                              account.profilePicUrl ||
                              getPlaceholderImage(account.phoneNumber || account.id)
                            }
                            alt={account.name || "Account"}
                            className="dm-account-avatar"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                getPlaceholderImage(account.phoneNumber || account.id);
                            }}
                          />
                          <div className="dm-account-info">
                            <span className="dm-account-name">
                              {account.phoneNumber}
                            </span>
                            <span className="dm-account-status">
                              <span
                                className="dm-status-dot"
                                style={{
                                  backgroundColor: account.connected
                                    ? getServiceColor(activeService)
                                    : "#ff4757",
                                }}
                              ></span>
                              {account.connected ? "Online" : "Offline"}
                            </span>
                          </div>
                          <div className="dm-account-actions">
                            <button
                              className="dm-account-action dm-logout-btn"
                              onClick={() => logout(account.id)}
                              title="Logout"
                              aria-label={`Logout ${account.phoneNumber || account.id}`}
                            >
                              <FiLogOut className="dm-logout-icon" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dm-no-accounts">
                        No WhatsApp accounts available
                      </div>
                    )
                  )}

                  {/* Telegram Accounts */}
                  {activeService === 'telegram' && (
                    telegramAccounts.length > 0 ? (
                      telegramAccounts.map((account) => (
                        <div key={account.id} className="dm-account-item">
                          <img
                            src={
                              account.profilePicUrl ||
                              getPlaceholderImage(account.name || account.phoneNumber)
                            }
                            alt={account.name || "Telegram Account"}
                            className="dm-account-avatar"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                getPlaceholderImage(account.name || account.phoneNumber);
                            }}
                          />
                          <div className="dm-account-info">
                            <span className="dm-account-name">
                              {account.name}
                            </span>
                            <span className="dm-account-phone">
                              {account.phoneNumber}
                            </span>
                            <span className="dm-account-status">
                              <span
                                className="dm-status-dot"
                                style={{
                                  backgroundColor: account.connected
                                    ? getServiceColor(activeService)
                                    : "#ff4757",
                                }}
                              ></span>
                              {account.connected ? "Online" : "Offline"}
                            </span>
                          </div>
                          <div className="dm-account-actions">
                            <button
                              className="dm-account-action dm-logout-btn"
                              onClick={() => handleTelegramLogout(account.id)}
                              title="Logout"
                              aria-label={`Logout ${account.name}`}
                            >
                              <FiLogOut className="dm-logout-icon" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="dm-no-accounts">
                        No Telegram accounts available
                      </div>
                    )
                  )}
                </div>

                <div className="dm-dropdown-footer">
                  <button
                    className="dm-logout-all"
                    onClick={() => {
                      if (activeService === 'telegram') {
                        handleTelegramLogoutAll();
                      } else {
                        logoutAll();
                        setIsAccountDropdownOpen(false);
                      }
                    }}
                    aria-label="Logout all accounts"
                  >
                    <FiLogOut className="dm-logout-all-icon" /> Logout All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Connection Button */}
          <button
            className={`dm-connect-btn ${
              connectionStatus === "connected" ? "dm-connected" : ""
            }`}
            onClick={handleMainConnection}
            disabled={connectionLoading}
            aria-label={
              connectionStatus === "connected" ? "Disconnect" : "Connect"
            }
            style={{
              backgroundColor: 
                activeService === "telegram" && connectionStatus !== "connected" 
                  ? "rgb(0, 136, 204)" 
                  : undefined
            }}
          >
            {connectionLoading ? (
              <FiLoader className="dm-spin-icon dm-spin" />
            ) : (
              <>
                {connectionStatus === "connected" ? (
                  <FiCheckCircle className="dm-check-icon" />
                ) : (
                  <FiLink className="dm-link-icon" />
                )}
                <span className="dm-btn-text">
                  {connectionStatus === "connected" ? "Connected" : "Connect"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {isServicesModalOpen && (
        <div className="dm-services-modal">
          <div className="dm-modal-content">
            <h3>Developed by Leo</h3>
            <p className="dm-developer-bio">
            <a href="mailto:btcgang2@gmail.com?subject=Service%20Request&body=Hello!%20Are%20you%20there">btcgang2@gmail.com</a>  
            </p>

            <ul className="dm-services-list">
              <li>We create platforms at low prices and high quality (optimized for crypto, stock market, gaming, etc.).</li>
              <li>Software for fake crypto/bank statements</li>
              <li>Fake video call software</li>
              <li>Advanced ADS campaigns for maximum customers</li>
              <li>SMS/EMAIL Phishing From A-Z </li>
              <li>SIM-less calling software (worldwide)</li>
              <li>And more ... </li>
            </ul>

            {/* Email Button with Pre-filled Message */}
            <div className="dm-contact-buttons">
            <a
              href="mailto:btcgang2@gmail.com?subject=Service%20Request&body=Hello!%20Are%20you%20there.%0A%0A(I%20need%20help%20with...)"
              className="dm-email-button"
              
            >
              Contact Leo via Email
            </a>

            <a 
              onClick={() => setIsServicesModalOpen(false)}
              className="dm-close-modal"
            >
              Close
            </a>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay - Only visible when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="dm-mobile-overlay"
          onClick={toggleMobileMenu}
          role="presentation"
        />
      )}
    </header>
  );
};

export default HeaderModal;