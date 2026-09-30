interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
    minimumClaim: number;
    currentBalance: number;
}

export default function Popup({ isOpen, onClose, minimumClaim, currentBalance }: PopupProps) {
    if (!isOpen) return null;

    return (
        <div
            className="cute-popup-overlay active"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="cute-popup-card">
                <button
                    type="button"
                    className="cute-popup-close-btn"
                    onClick={onClose}
                >
                    ×
                </button>

                <div className="cute-popup-icon-wrap">
                    <svg
                        className="cute-popup-coin-svg"
                        viewBox="0 0 201 193"
                        fill="none"
                    >
                        <ellipse
                            cx="100.8"
                            cy="96.3"
                            rx="100"
                            ry="96"
                            fill="url(#cutePopupTrxGrad)"
                        />

                        <path
                            d="M157.045 79.1207C151.528 74.2165 143.865 66.7452 137.658 61.4579L137.275 61.228C136.662 60.7682 135.972 60.3851 135.244 60.1169C120.225 57.4349 50.3402 44.9061 48.9992 45.0594C48.6161 45.0977 48.2329 45.251 47.9264 45.4425L47.5816 45.7107C47.1602 46.1322 46.8153 46.6303 46.6238 47.205L46.5471 47.4349V48.6992V48.8908C54.4015 69.887 85.4743 138.623 91.6046 154.791C91.9877 155.902 92.6774 157.971 93.9801 158.086H94.2866C94.9762 158.086 97.9648 154.293 97.9648 154.293C97.9648 154.293 151.336 92.3008 156.739 85.7107C157.428 84.9061 158.041 84.0249 158.578 83.1054C158.731 82.3774 158.654 81.6494 158.386 80.9598C158.118 80.2701 157.62 79.6188 157.045 79.1207ZM111.605 86.3621L134.363 68.2778L147.735 80.0786L111.605 86.3621ZM102.754 85.1743L63.5586 54.3697L127.007 65.5958L102.754 85.1743ZM106.279 93.2203L146.394 87.0134L100.532 140.002L106.279 93.2203ZM58.233 57.4732L99.4973 90.9981L93.5203 140.04L58.233 57.4732Z"
                            fill="#FFFFFF"
                        />

                        <defs>
                            <linearGradient
                                id="cutePopupTrxGrad"
                                x1="20"
                                y1="10"
                                x2="180"
                                y2="180"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#FF2A55" />
                                <stop offset="0.6" stopColor="#E11D48" />
                                <stop offset="1" stopColor="#99041E" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h4 className="cute-popup-title">
                    Minimum Claim
                </h4>

                <div className="cute-popup-amount-badge">
                    <span className="cute-popup-amount-val">
                        {minimumClaim.toFixed(2)}
                    </span>

                    <span className="cute-popup-amount-curr">
                        TRX
                    </span>
                </div>

                <p className="cute-popup-desc">
                    You can claim once your mined balance reaches minimum{' '}
                    <strong>{minimumClaim.toFixed(2)} TRX</strong>.
                </p>

                <div className="cute-popup-current-status">
                    <span>Your Mined:</span>

                    <strong id="popup-current-mined-display">
                        {currentBalance.toFixed(6)} TRX
                    </strong>
                </div>

                <button
                    type="button"
                    className="btn-cute-popup-ok"
                    onClick={onClose}
                >
                    Keep Mining
                </button>
            </div>
        </div>
    );
}