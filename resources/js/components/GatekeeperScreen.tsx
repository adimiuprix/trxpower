export default function GatekeeperScreen() {
    return (
        <div
            id="gatekeeper-overlay"
            className="gatekeeper-fullscreen-overlay"
            style={{ display: 'none' }}
        >
            <div className="gatekeeper-card">
                {/* Branding Header */}
                <div className="gatekeeper-brand">
                    <div className="gatekeeper-logo-ring">
                        <svg
                            width="36"
                            height="36"
                            viewBox="0 0 100 100"
                            fill="none"
                        >
                            <polygon
                                points="50,5 92,30 50,95 8,30"
                                stroke="#FF1E40"
                                strokeWidth="7"
                                fill="rgba(255, 30, 64, 0.15)"
                            ></polygon>
                            <polyline
                                points="50,5 50,95"
                                stroke="#FF1E40"
                                strokeWidth="5"
                            ></polyline>
                            <polyline
                                points="50,48 92,30"
                                stroke="#FF1E40"
                                strokeWidth="5"
                            ></polyline>
                            <polyline
                                points="50,48 8,30"
                                stroke="#FF1E40"
                                strokeWidth="5"
                            ></polyline>
                            <polygon
                                points="50,15 80,32 50,80 20,32"
                                fill="#FF1E40"
                                opacity="0.45"
                            ></polygon>
                        </svg>
                    </div>
                    <h3 className="gatekeeper-app-title">TRX Power Mining</h3>
                    <span className="gatekeeper-app-desc">
                        Cloud Hashrate Node Network
                    </span>
                </div>

                {/* PHASE 1: Animated 100% Progress & Security Check */}
                <div id="gatekeeper-loader-section">
                    <div className="gatekeeper-radar-box">
                        <div className="gatekeeper-pulse-ring"></div>
                        <span className="gatekeeper-pulse-icon">⚡️</span>
                    </div>

                    <div className="gatekeeper-headline-stack">
                        <h4 id="gatekeeper-status-headline">
                            Initializing Security Handshake...
                        </h4>
                        <p id="gatekeeper-status-subtext">
                            Connecting to decentralized cluster network...
                        </p>
                    </div>

                    {/* Progress Line 0% to 100% */}
                    <div className="gatekeeper-progress-track">
                        <div
                            id="gatekeeper-progress-fill"
                            className="gatekeeper-progress-fill"
                            style={{ width: '0%' }}
                        ></div>
                    </div>
                    <div className="gatekeeper-progress-meta">
                        <span id="gatekeeper-progress-stage">System Audit</span>
                        <strong id="gatekeeper-progress-pct">0%</strong>
                    </div>

                    {/* Verified Checklist Indicators */}
                    <div className="gatekeeper-checklist">
                        <div className="check-item" id="chk-sec">
                            <span className="check-icon">⏳</span>
                            <span className="check-label">
                                Security &amp; SSL Handshake
                            </span>
                        </div>
                        <div className="check-item" id="chk-age">
                            <span className="check-icon">⏳</span>
                            <span className="check-label">
                                User Age &amp; Account Integrity
                            </span>
                        </div>
                        <div className="check-item" id="chk-analytics">
                            <span className="check-icon">⏳</span>
                            <span className="check-label">
                                Device &amp; Anti-Fraud Analytics
                            </span>
                        </div>
                    </div>
                </div>

                {/* PHASE 2: Mandatory Channel Verification Cards */}
                <div
                    id="gatekeeper-channels-section"
                    style={{ display: 'none' }}
                >
                    <div className="channels-gate-header">
                        <div className="channels-tag-badge">MANDATORY STEP</div>
                        <h4 className="channels-title">
                            Join Official Channels
                        </h4>
                        <p className="channels-sub">
                            Join both official Telegram channels below and click
                            "Verify &amp; Enter Dashboard" to continue.
                        </p>
                    </div>

                    <div className="channel-cards-list">
                        {/* Channel 1 */}
                        <div className="channel-card" id="channel-card-1">
                            <div className="channel-card-left">
                                <div className="channel-icon-wrap c1">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"></path>
                                    </svg>
                                </div>
                                <div className="channel-info">
                                    <div className="channel-name">
                                        Trx Power Mining Official
                                    </div>
                                    <div className="channel-username">
                                        @trxbusinessOfficial
                                    </div>
                                </div>
                            </div>
                            <div className="channel-card-right">
                                <a
                                    href="https://t.me/trxbusinessOfficial"
                                    target="_blank"
                                    className="btn-join-channel"
                                >
                                    <span>Join</span>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line
                                            x1="10"
                                            y1="14"
                                            x2="21"
                                            y2="3"
                                        ></line>
                                    </svg>
                                </a>
                                <span
                                    className="channel-status-chip pending"
                                    id="chip-ch1"
                                >
                                    Pending
                                </span>
                            </div>
                        </div>

                        {/* Channel 2 */}
                        <div className="channel-card" id="channel-card-2">
                            <div className="channel-card-left">
                                <div className="channel-icon-wrap c2">
                                    <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
                                    </svg>
                                </div>
                                <div className="channel-info">
                                    <div className="channel-name">
                                        TRX World Work 🌎
                                    </div>
                                    <div className="channel-username">
                                        @TRX_WORLD_WORK
                                    </div>
                                </div>
                            </div>
                            <div className="channel-card-right">
                                <a
                                    href="https://t.me/TRX_WORLD_WORK"
                                    target="_blank"
                                    className="btn-join-channel"
                                >
                                    <span>Join</span>
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                        <polyline points="15 3 21 3 21 9"></polyline>
                                        <line
                                            x1="10"
                                            y1="14"
                                            x2="21"
                                            y2="3"
                                        ></line>
                                    </svg>
                                </a>
                                <span
                                    className="channel-status-chip pending"
                                    id="chip-ch2"
                                >
                                    Pending
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Channel error notice */}
                    <div
                        id="gatekeeper-channel-alert"
                        className="gatekeeper-channel-alert"
                        style={{ display: 'none' }}
                    >
                        <span className="alert-icon">⚠️</span>
                        <span id="gatekeeper-channel-alert-text">
                            Please join both channels to continue!
                        </span>
                    </div>

                    <button
                        type="button"
                        className="btn-gatekeeper-verify"
                        id="btn-verify-channels"
                    >
                        <span
                            id="btn-verify-channels-spinner"
                            className="btn-spinner"
                            style={{ display: 'none' }}
                        ></span>
                        <span id="btn-verify-channels-label">
                            Verify &amp; Enter Dashboard
                        </span>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
