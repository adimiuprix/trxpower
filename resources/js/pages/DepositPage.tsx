import AppLayout from '@/layouts/AppLayout';

export default function DepositPage() {
    return (
        <AppLayout>
            <section
                id="view-deposit"
                className="view-container"
                style={{ display: 'flex' }}
            >
                {/* 1. Top Header with Back to Home */}
                <div className="deposit-view-header">
                    <button type="button" className="btn-deposit-back">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span>Back</span>
                    </button>
                    <div className="deposit-header-title-box">
                        <h3 className="deposit-header-title">Deposit USDT</h3>
                        <span className="deposit-network-tag">
                            BEP-20 (BSC)
                        </span>
                    </div>
                    <div className="deposit-rate-pill">
                        <span>1 USDT = 3 TRX</span>
                    </div>
                </div>

                {/* Top Cute Mini Loading Banner (5 Seconds Countdown) */}
                <div
                    className="deposit-top-loading-bar"
                    id="deposit-top-loading"
                    style={{ display: 'none' }}
                >
                    <div className="top-loading-inner">
                        <div className="top-loading-spinner-ring"></div>
                        <div className="top-loading-text-stack">
                            <span className="top-loading-headline">
                                Verifying Blockchain Network...
                            </span>
                            <span
                                className="top-loading-subtext"
                                id="top-loading-status-text"
                            >
                                Scanning BSC / BEP-20 mempool...
                            </span>
                        </div>
                        <span
                            className="top-loading-countdown-tag"
                            id="top-loading-countdown-num"
                        >
                            5s
                        </span>
                    </div>
                    <div className="top-loading-track">
                        <div
                            className="top-loading-progress"
                            id="top-loading-progress-bar"
                        ></div>
                    </div>
                </div>

                {/* 2. QR Code Card */}
                <div className="deposit-qr-card">
                    <div className="deposit-qr-inner">
                        <img
                            id="deposit-full-qr-img"
                            src="data:image/png;base64,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"
                            alt="USDT Deposit QR Code"
                            className="deposit-qr-image"
                        />
                    </div>
                    <div className="deposit-qr-caption">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="2.5"
                        >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>
                            Scan QR with TrustWallet, Binance, or TronLink
                        </span>
                    </div>
                </div>

                {/* 3. Deposit Address Card */}
                <div className="deposit-address-card">
                    <div className="deposit-addr-header">
                        <span className="deposit-field-label">
                            Official Deposit Address
                        </span>
                        <span className="deposit-net-badge">BSC / BEP-20</span>
                    </div>
                    <div className="deposit-addr-row">
                        <span
                            className="deposit-addr-text"
                            id="deposit-full-address-val"
                        >
                            0x65CD568D7068F20de91547E80A1A7212226AFF86
                        </span>
                        <button type="button" className="btn-copy-addr">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                            >
                                <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                ></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copy</span>
                        </button>
                    </div>
                </div>

                {/* 4. Amount Selection Presets (3, 5, 10, 15, 20, 50, 100) */}
                <div className="deposit-amount-section">
                    <div className="deposit-section-label-row">
                        <span className="deposit-field-label">
                            Select Deposit Amount (USDT)
                        </span>
                        <span className="deposit-min-tag">Min. $3</span>
                    </div>
                    <div className="amount-presets-grid">
                        <button
                            type="button"
                            className="amount-preset-chip active"
                            data-amount="3"
                        >
                            <span className="chip-val">$3</span>
                            <span className="chip-sub">3 USDT</span>
                        </button>
                        <button
                            type="button"
                            className="amount-preset-chip"
                            data-amount="5"
                        >
                            <span className="chip-val">$5</span>
                            <span className="chip-sub">5 USDT</span>
                        </button>
                        <button
                            type="button"
                            className="amount-preset-chip"
                            data-amount="10"
                        >
                            <span className="chip-val">$10</span>
                            <span className="chip-sub">10 USDT</span>
                        </button>
                        <button
                            type="button"
                            className="amount-preset-chip"
                            data-amount="15"
                        >
                            <span className="chip-val">$15</span>
                            <span className="chip-sub">15 USDT</span>
                        </button>
                        <button
                            type="button"
                            className="amount-preset-chip"
                            data-amount="20"
                        >
                            <span className="chip-val">$20</span>
                            <span className="chip-sub">20 USDT</span>
                        </button>
                        <button
                            type="button"
                            className="amount-preset-chip"
                            data-amount="50"
                        >
                            <span className="chip-val">$50</span>
                            <span className="chip-sub">50 USDT</span>
                        </button>
                        <button
                            type="button"
                            className="amount-preset-chip"
                            data-amount="100"
                        >
                            <span className="chip-val">$100</span>
                            <span className="chip-sub">100 USDT</span>
                        </button>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="custom-amount-row">
                        <span className="custom-amount-label">Custom:</span>
                        <input
                            type="number"
                            step="1"
                            min="3"
                            className="custom-amount-input"
                            id="deposit-custom-amount-input"
                            placeholder="Amount"
                        />
                        <span className="custom-amount-suffix">USDT</span>
                    </div>
                </div>

                {/* 5. Exact Amount to Send Box (e.g. 3.015 USDT) */}
                <div className="exact-amount-card">
                    <div className="exact-amount-badge-row">
                        <span className="exact-badge">
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: '4px',
                                }}
                            >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            Send Exact Amount
                        </span>
                        <span className="exact-receive-badge">
                            You Get:{' '}
                            <strong id="deposit-credited-trx-display">
                                +9.00 TRX
                            </strong>
                        </span>
                    </div>
                    <div className="exact-amount-main-row">
                        <div className="exact-num-col">
                            <span
                                className="exact-amount-val"
                                id="deposit-exact-amount-display"
                            >
                                3.015 USDT
                            </span>
                            <span className="exact-amount-sub">
                                Send this exact amount to identify your
                                transaction
                            </span>
                        </div>
                        <button type="button" className="btn-copy-exact">
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                            >
                                <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                ></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copy</span>
                        </button>
                    </div>
                </div>

                {/* 6. Must-Be Notice: Minimum $3 */}
                <div className="deposit-notice-card">
                    <div className="notice-icon">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div className="notice-content">
                        <strong>
                            Important Notice: Minimum Deposit ~3 USDT (min 2.90
                            USDT)
                        </strong>
                        <p>
                            Send only official <strong>BEP-20 USDT</strong>{' '}
                            (Binance-Peg BSC-USD). Verified automatically on
                            <strong>BscScan &amp; BSC RPC</strong>. Fake or
                            unverified tokens will be automatically rejected.
                        </p>
                    </div>
                </div>

                {/* 7. Verify Payment Action Button */}
                <div className="deposit-action-section">
                    <button
                        type="button"
                        className="btn-verify-payment-main"
                        id="btn-verify-payment-main"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            style={{ marginRight: '6px' }}
                        >
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>Verify Payment</span>
                    </button>
                    <span className="deposit-action-tip">
                        Balance is credited to your account immediately upon
                        entering TXID
                    </span>
                </div>
            </section>
        </AppLayout>
    );
}
