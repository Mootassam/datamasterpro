import { FaTelegram } from "react-icons/fa";

const AuthTelegram = ({ setShowModal }) => {
    return (
        <div className="wa-auth-container">
            <button
                className={`tg-connect-btn`}
                onClick={() => setShowModal(true)}

            >
                <div className="tg-btn-content">

                    <>
                        <FaTelegram className="tg-icon" />

                    </>


                    <span className="tg-btn-text">

                        Connect Telegram
                    </span>
                </div>


            </button>
        </div>
    );
};

export default AuthTelegram;