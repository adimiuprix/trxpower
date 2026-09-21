export default function BannedAccountScreen() {
    return (
        <div id="banned-account-screen" className="gatekeeper-fullscreen-overlay" style={{ display: 'none' }}>
            <div className="gatekeeper-card ban-card">
                <div className="ban-icon-glow">
                    <svg
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FF1E40"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                </div>
                <div className="ban-badge-tag">ACCESS PERMANENTLY BLOCKED</div>
                <h2 className="ban-title">Account Suspended / Banned!</h2>
                <p className="ban-subtitle-en">
                    Your account has been permanently suspended by administration due to policy violations.
                </p>

                <div className="ban-reasons-box">
                    <div className="ban-reasons-title">📋 3 Account Suspension Reasons:</div>
                    <div className="ban-reason-item">
                        <span className="reason-num">1</span>
                        <div className="reason-text">
                            <strong>Abnormal Activity Mining</strong>
                            <small>Irregular mining hash patterns / unauthorized automated scripts</small>
                        </div>
                    </div>
                    <div className="ban-reason-item">
                        <span className="reason-num">2</span>
                        <div className="reason-text">
                            <strong>Fake Deposit</strong>
                            <small>Submitting unverified or invalid blockchain transaction hashes</small>
                        </div>
                    </div>
                    <div className="ban-reason-item">
                        <span className="reason-num">3</span>
                        <div className="reason-text">
                            <strong>Unlimited Withdraw</strong>
                            <small>Violating withdrawal thresholds or spamming withdrawal orders</small>
                        </div>
                    </div>
                </div>

                <div className="ban-support-contact">
                    <p>If you believe this was done in error, please contact our support team:</p>
                    <a
                        href="https://t.me/suport1245bot"
                        target="_blank"
                        className="btn-ban-support"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.34 5L2 22l5.15-1.32C8.6 21.52 10.25 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"
                            ></path>
                        </svg>
                        <span>Contact Support (@suport1245bot)</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
