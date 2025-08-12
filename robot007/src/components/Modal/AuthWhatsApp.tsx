import { FaPowerOff, FaWhatsapp, FaSpinner } from "react-icons/fa";

const AuthWhatsApp = ({ stateConnetion, handleConnect, connectionLoading }) => {
    return (
        <div className="wa-auth-container">
     

            <button
                className={`wa-connect-btn ${stateConnetion}`}
                onClick={handleConnect}
                disabled={connectionLoading}
            >
                <div className="wa-btn-content">
                    {connectionLoading ? (
                        <FaSpinner className="wa-spin" />
                    ) : stateConnetion === 'connected' ? (
                        <div className="wa-connected-indicator">
                            <FaWhatsapp className="wa-icon" />
                            <div className="wa-pulse-ring"></div>
                        </div>
                    ) : (
                        <FaPowerOff className="wa-power-icon" />
                    )}

                    <span className="wa-btn-text">
                        {connectionLoading
                            ? "Connecting..."
                            : stateConnetion === 'connected'
                                ? 'Disconnect WhatsApp'
                                : 'Connect WhatsApp'}
                    </span>
                </div>

                {stateConnetion === 'connected' && (
                    <div className="wa-active-wave"></div>
                )}
            </button>
        </div>
    );
};

export default AuthWhatsApp;