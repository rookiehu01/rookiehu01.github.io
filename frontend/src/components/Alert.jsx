import { useState } from "react";

function Alert({ title, message, onClose, color }) {
    const [visible, setVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            if (onClose) {
                onClose();
            } else {
                setVisible(false);
            }
        }, 300);
    };

    if (!visible) return null;

    return (
        <div className="alert-overlay" onClick={handleClose}>
            <div className={`alert-container ${isClosing ? "closing" : ""}`}>
                <button className="alert-close" onClick={handleClose}>×</button>

                <div className="alert-content">
                    <h2 className="alert-title" style={{ color: color || "white" }}>{title}</h2>
                    <div className="alert-message">{message}</div>
                </div>
            </div>
        </div>
    );
}

export default Alert;
