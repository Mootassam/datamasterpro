interface ContactModalProps {
  onClose: () => void;
  detailsphone: any;
  activeService: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose, detailsphone, activeService }) => {
  // Safely get profile picture URL
  const getProfilePic = () => {
    if (activeService === "whatsapp") {
      return detailsphone?.profilePicUrl;
    }
    return detailsphone?.photo || detailsphone?.profilePicUrl;
  };

  // Safely format last seen date
  const formatLastSeen = (date: any) => {
    try {
      if (!date) return "Not available";
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid date";
    }
  };

  // Safely render status (handles objects)
  const renderStatus = () => {
    if (!detailsphone?.status) return "Not available";
    if (typeof detailsphone.status === 'string') return detailsphone.status;
    if (typeof detailsphone.status === 'object') {
      return JSON.stringify(detailsphone.status); // or access specific property
    }
    return "Not available";
  };

  return (
    <div className="contact-modal-overlay">
      <div className="contact-modal">
        <div className="contact-header">
          <h3>Contact Details</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {activeService === "whatsapp" ? (
          <>
            <div className="contact-body">
              {detailsphone && (
                <>
                  <div className="contact-avatar">
                    {getProfilePic() ? (
                      <img
                        src={getProfilePic()}
                        alt="Profile"
                        className="profile-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('profile-placeholder');
                        }}
                      />
                    ) : (
                      <div className="profile-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div className="contact-details">
                    <div className="detail-row">
                      <span className="detail-label">Phone Number:</span>
                      <span className="detail-value">
                        {detailsphone.sanitizedNumber || "Not available"}
                      </span>
                    </div>
                    {/* Other WhatsApp-specific fields */}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="contact-body">
              {detailsphone && (
                <>
                  <div className="contact-avatar">
                    {getProfilePic() ? (
                      <img
                        src={getProfilePic()}
                        alt="Profile"
                        className="profile-image"
                      />
                    ) : (
                      <div className="profile-placeholder">
                        <i className="fas fa-user"></i>
                      </div>
                    )}
                  </div>
                  <div className="contact-details">
                    <div className="detail-row">
                      <span className="detail-label">Phone Number:</span>
                      <span className="detail-value">
                        {detailsphone.phone || "Not available"}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">
                        {renderStatus()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">lastSeen:</span>
                      <span className="detail-value">
                        {formatLastSeen(detailsphone.lastSeen)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <div className="contact-footer">
          <button className="close-buttons" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;