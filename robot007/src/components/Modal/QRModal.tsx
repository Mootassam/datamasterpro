import QRCode from "qrcode.react";
import { useEffect } from "react";

interface QrModalProps {
    onClick: () => void;
    qrcode: string,
}

const QrModal: React.FC<QrModalProps> = ({ onClick, qrcode }) => {
    useEffect(() => {
        console.log("QRModal rendered with QR code length:", qrcode?.length || 0);
        if (!qrcode) {
            console.error("Empty QR code provided to QRModal");
        }
    }, [qrcode]);
    return <div className="qr-modal-overlay">
        <div className="qr-modal">
            <div className="qr-header">
                <h3>WhatsApp Connection Required</h3>
                <button
                    className="close-btn"
                    onClick={onClick}
                >
                    &times;
                </button>
            </div>
            <div className="qr-body">
                <QRCode value={qrcode} size={256} />
                <div className="instructions">
                    <p><strong>To connect:</strong></p>
                    <ol>
                        <li>Open WhatsApp on your phone</li>
                        <li>Tap <strong>Menu → Linked Devices</strong></li>
                        <li>Scan this QR code</li>
                    </ol>
                </div>
            </div>
            <div className="qr-footer">
                <button
                    className="cancel-btn"
                    onClick={onClick}
                >
                    Cancel Connection
                </button>
            </div>
        </div>
    </div>


};

export default QrModal;