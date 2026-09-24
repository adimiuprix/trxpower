import AppLayout from '@/layouts/AppLayout';
import { useTelegramContext, useTelegramUser } from '@/providers/TelegramProvider';
import { usePage } from '@inertiajs/react';
import { createToaster } from "@codenhub/toaster";
import { useEffect, useRef, useState } from 'react'

const toaster = createToaster({
    position: "top-center",
    duration: 3000,
});

interface Transaction {
    id: number;
    type: 'deposit' | 'withdraw' | 'mining';
    amount: string;
    address: string | null;
    tx_hash: string | null;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

interface PageProps {
    transactions: {
        data: Transaction[];
    };
    [key: string]: unknown;
}

export default function HomePage() {
    const user = useTelegramUser();
    const { dbUser, haptic, refreshDbUser } = useTelegramContext();
    const { transactions } = usePage<PageProps>().props;

    // Balance dari database
    const serverBalance = dbUser?.balance ?? 0;
    const walletBalance = dbUser?.wallet_balance ?? 0;
    const miningHistories = dbUser?.mining_histories ?? [];

    // Real-time mining balance state
    const [liveBalance, setLiveBalance] = useState<number>(serverBalance);
    const [isClaiming, setIsClaiming] = useState(false);
    // Flag untuk pause RAF tick saat claim — pakai ref agar tidak trigger re-render
    const isPausedRef = useRef(false);

    // Calculate live balance with sub-second precision using floating-point timestamp
    const calculateCurrentBalance = (): number => {
        const nowMs = Date.now() / 1000; // float seconds untuk presisi sub-detik

        return (miningHistories ?? []).reduce((balance, history) => {
            if (history.status !== 'active') return balance;
            const startSec = history.last_sum
                ?? Math.floor(new Date(history.created_at).getTime() / 1000);
            const earned = (nowMs - startSec) * (history.plan.earning_rate / 60);
            return balance + earned;
        }, serverBalance);
    };

    // Update live balance setiap frame (~60fps) untuk animasi smooth
    useEffect(() => {
        if (!miningHistories || miningHistories.length === 0) {
            setLiveBalance(serverBalance);
            return;
        }

        let rafId: number;

        const tick = () => {
            if (!isPausedRef.current) {
                setLiveBalance(calculateCurrentBalance());
            }
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(rafId);
    }, [serverBalance, miningHistories]);

    const handleClaim = async () => {
        if (isClaiming) return;

        setIsClaiming(true);
        try {
            // take token from telegramAuthService
            const token = localStorage.getItem('telegram_auth_token');

            if (!token) {
                toaster.semantic.error('Please login again to continue');
                return;
            }

            // Send request to api
            const response = await fetch('/api/telegram/claim', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    telegram_id: user?.id,
                }),
            });

            const data = await response.json();

            // handle response
            if (data.success) {
                toaster.semantic.success(data.message || 'Claim successful!');
                // Pause RAF tick & set balance ke 0 agar user melihat angka 0 selama 3 detik
                isPausedRef.current = true;
                setLiveBalance(0);
                await new Promise(resolve => setTimeout(resolve, 3000));
                await refreshDbUser();
                isPausedRef.current = false;
            } else {
                toaster.semantic.error(data.message || 'Unable to connect to server. Please check your connection.');
            }
        } catch (error: any) {
            console.error('Error claiming mining:', error);
            toaster.semantic.error('Unable to connect to server. Please check your connection.');
        } finally {
            setIsClaiming(false);
        }
    }

    return (
        <AppLayout>
            <section
                id="view-home"
                className="view-container"
                style={{ display: 'flex' }}
            >
                {/* TOTAL BALANCE CARD (PREMIUM CRYPTO VIP CARD) */}
                <div className="balance-card crypto-vip-card">
                    {/* Glossy Specular Light Reflection & Texture */}
                    <div className="card-glass-sheen"></div>
                    <div className="card-circuit-bg"></div>

                    {/* CARD TOP ROW: GOLD CHIP + NFC + VIP BRANDING */}
                    <div className="card-top-row">
                        <div className="card-user-info-pill">
                            <div className="card-user-avatar" id="card-user-avatar">
                                <img src={user?.photoUrl} alt="avatar" />
                            </div>
                            <span className="card-username-text">
                                {user?.username ? `@${user.username}` : user?.firstName || 'Guest'}
                            </span>
                        </div>

                        <div className="card-brand-pill">
                            <span className="card-tier-indicator"></span>
                            <span className="card-tier-text">
                                TRX PLATINUM VIP
                            </span>
                        </div>
                    </div>

                    {/* CARD MIDDLE CONTENT: BALANCE & 3D TRON COIN */}
                    <div className="card-middle-content">
                        <div className="balance-info">
                            <div className="balance-header">
                                <span className="balance-label">
                                    Total Balance
                                    <button
                                        className="eye-toggle-btn"
                                        aria-label="Toggle Balance Visibility"
                                        title="Hide/Show Balance"
                                    >
                                        <svg
                                            id="eye-icon-svg"
                                            width="15"
                                            height="15"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="3"
                                            ></circle>
                                        </svg>
                                    </button>
                                </span>
                            </div>

                            <div className="balance-amount-row">
                                <span className="balance-number">
                                    {walletBalance.toFixed(4)}
                                </span>
                                <span className="balance-symbol">TRX</span>
                            </div>

                            <div className="balance-sub-row">
                                <span className="balance-fiat-equiv">≈ $0.00 USDT</span>
                                <span className="card-network-badge">{' '} <span className="net-dot"></span>TRC-20{' '}
                                </span>
                            </div>
                        </div>

                        {/* LIVE TRON MINING REACTOR SYSTEM */}
                        <div
                            className="card-mining-system"
                            id="card-mining-system"
                            title="Active TRX Cloud Mining Node"
                        >
                            {/* Ambient Energy Halo */}
                            <div className="reactor-glow-halo"></div>

                            {/* Outer Rotating Laser Orbital Rings */}
                            <div className="reactor-orbit-ring outer-orbit">
                                <div className="orbit-spark spark-1"></div>
                                <div className="orbit-spark spark-2"></div>
                            </div>
                            <div className="reactor-orbit-ring inner-orbit"></div>

                            {/* Central Official TRON (TRX) Logo Core */}
                            <div className="tron-official-core">
                                <svg
                                    className="tron-official-svg"
                                    viewBox="0 0 201 193"
                                    fill="none"
                                >
                                    <ellipse
                                        cx="100.8"
                                        cy="96.3"
                                        rx="100"
                                        ry="96"
                                        fill="url(#tronCoreGrad)"
                                        filter="drop-shadow(0 0 10px rgba(255, 6, 10, 0.6))"
                                    ></ellipse>
                                    <path
                                        d="M157.045 79.1207C151.528 74.2165 143.865 66.7452 137.658 61.4579L137.275 61.228C136.662 60.7682 135.972 60.3851 135.244 60.1169C120.225 57.4349 50.3402 44.9061 48.9992 45.0594C48.6161 45.0977 48.2329 45.251 47.9264 45.4425L47.5816 45.7107C47.1602 46.1322 46.8153 46.6303 46.6238 47.205L46.5471 47.4349V48.6992V48.8908C54.4015 69.887 85.4743 138.623 91.6046 154.791C91.9877 155.902 92.6774 157.971 93.9801 158.086H94.2866C94.9762 158.086 97.9648 154.293 97.9648 154.293C97.9648 154.293 151.336 92.3008 156.739 85.7107C157.428 84.9061 158.041 84.0249 158.578 83.1054C158.731 82.3774 158.654 81.6494 158.386 80.9598C158.118 80.2701 157.62 79.6188 157.045 79.1207ZM111.605 86.3621L134.363 68.2778L147.735 80.0786L111.605 86.3621ZM102.754 85.1743L63.5586 54.3697L127.007 65.5958L102.754 85.1743ZM106.279 93.2203L146.394 87.0134L100.532 140.002L106.279 93.2203ZM58.233 57.4732L99.4973 90.9981L93.5203 140.04L58.233 57.4732Z"
                                        fill="#FFFFFF"
                                    ></path>
                                    <defs>
                                        <linearGradient
                                            id="tronCoreGrad"
                                            x1="20"
                                            y1="10"
                                            x2="180"
                                            y2="180"
                                            gradientUnits="userSpaceOnUse"
                                        >
                                            <stop stopColor="#FF2A55"></stop>
                                            <stop
                                                offset="0.6"
                                                stopColor="#E11D48"
                                            ></stop>
                                            <stop
                                                offset="1"
                                                stopColor="#88041B"
                                            ></stop>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Live Hashrate / Mining Status Tag */}
                            <div
                                className="mining-status-badge"
                                style={{ cursor: 'pointer' }}
                                title="Buy Mining Packages"
                            >
                                <span className="mining-live-beacon"></span>
                                <span
                                    className="mining-hash-label"
                                    id="card-mining-rate"
                                >
                                    10 GH/s
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DUAL QUICK ACTIONS (WITHDRAW & DEPOSIT) */}
                <div className="quick-actions-row">
                    {/* Withdraw Button (Red Gradient) */}
                    <button
                        className="action-btn btn-withdraw"
                        id="btn-home-withdraw"
                    >
                        <div className="action-btn-left">
                            <div className="action-btn-icon">
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="2.2"
                                >
                                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                                    <circle cx="18" cy="12" r="2"></circle>
                                </svg>
                            </div>
                            <span>Withdraw</span>
                        </div>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                        >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>

                    {/* Deposit Button (Opens Full Page Deposit) */}
                    <button
                        type="button"
                        className="action-btn btn-deposit"
                        id="btn-home-deposit"
                    >
                        <div className="action-btn-left">
                            <div className="action-btn-icon">
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
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </div>
                            <span className="deposit-btn-text">Deposit</span>
                        </div>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </button>
                </div>

                {/* LIVE MINING STATUS CARD */}
                <div
                    className="mining-status-live-card"
                    id="home-mining-status-card"
                    style={{ cursor: 'pointer' }}
                    title="Buy Mining Packages"
                >
                    <div className="mining-status-top-row">
                        {/* Left Official TRON (TRX) logo badge with glowing aura */}
                        <div
                            className="mining-trx-logo-badge"
                            title="TRX Cloud Mining Node"
                        >
                            <svg
                                className="mining-trx-svg"
                                viewBox="0 0 201 193"
                                fill="none"
                            >
                                <ellipse
                                    cx="100.8"
                                    cy="96.3"
                                    rx="100"
                                    ry="96"
                                    fill="url(#miningTrxGrad)"
                                ></ellipse>
                                <path
                                    d="M157.045 79.1207C151.528 74.2165 143.865 66.7452 137.658 61.4579L137.275 61.228C136.662 60.7682 135.972 60.3851 135.244 60.1169C120.225 57.4349 50.3402 44.9061 48.9992 45.0594C48.6161 45.0977 48.2329 45.251 47.9264 45.4425L47.5816 45.7107C47.1602 46.1322 46.8153 46.6303 46.6238 47.205L46.5471 47.4349V48.6992V48.8908C54.4015 69.887 85.4743 138.623 91.6046 154.791C91.9877 155.902 92.6774 157.971 93.9801 158.086H94.2866C94.9762 158.086 97.9648 154.293 97.9648 154.293C97.9648 154.293 151.336 92.3008 156.739 85.7107C157.428 84.9061 158.041 84.0249 158.578 83.1054C158.731 82.3774 158.654 81.6494 158.386 80.9598C158.118 80.2701 157.62 79.6188 157.045 79.1207ZM111.605 86.3621L134.363 68.2778L147.735 80.0786L111.605 86.3621ZM102.754 85.1743L63.5586 54.3697L127.007 65.5958L102.754 85.1743ZM106.279 93.2203L146.394 87.0134L100.532 140.002L106.279 93.2203ZM58.233 57.4732L99.4973 90.9981L93.5203 140.04L58.233 57.4732Z"
                                    fill="#FFFFFF"
                                ></path>
                                <defs>
                                    <linearGradient
                                        id="miningTrxGrad"
                                        x1="20"
                                        y1="10"
                                        x2="180"
                                        y2="180"
                                        gradientUnits="userSpaceOnUse"
                                    >
                                        <stop stopColor="#FF2A55"></stop>
                                        <stop
                                            offset="0.6"
                                            stopColor="#E11D48"
                                        ></stop>
                                        <stop
                                            offset="1"
                                            stopColor="#99041E"
                                        ></stop>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Middle: Mining Status, Live Ticking TRX Amount */}
                        <div className="mining-status-center-info">
                            <div className="mining-status-header-line">
                                <span className="mining-status-label">
                                    Mining Status
                                </span>
                                <span
                                    className="mining-status-pill active"
                                    id="home-mining-status-pill"
                                >
                                    <span
                                        className="status-live-dot"
                                        id="home-mining-status-dot"
                                    ></span>
                                    <span id="home-mining-status-text">
                                        Active
                                    </span>
                                </span>
                            </div>
                            <div className="mining-live-counter-line">
                                <span
                                    className="mining-ticking-number"
                                    id="home-live-mined-amount"
                                >
                                    {liveBalance.toFixed(8)}
                                </span>
                                <span className="mining-ticking-symbol">
                                    TRX
                                </span>
                            </div>
                            <span
                                className="mining-daily-subtitle"
                                id="home-mining-daily-rate"
                            >
                                Daily: 0.10 TRX
                            </span>
                        </div>

                        {/* Right Action Button: Start / Claim */}
                        <button
                            type="button"
                            onClick={handleClaim}
                            disabled={isClaiming}
                            className="btn-mining-action btn-mining-claim"
                        >
                            <span id="mining-action-btn-icon">
                                {isClaiming ? (
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        style={{ animation: 'spin 1s linear infinite' }}
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 2a10 10 0 0 1 10 10"></path>
                                    </svg>
                                ) : (
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                )}
                            </span>
                            <span>{isClaiming ? 'Claiming...' : 'Claim'}</span>
                        </button>
                    </div>
                </div>

                {/* FEATURE GRID CARDS (Task Center & Support) */}
                <div className="feature-grid-2x2">
                    {/* 3. Mining Active (Emerald Badge) */}
                    <div
                        className="grid-card"
                        id="home-card-mining-active"
                        style={{ cursor: 'pointer' }}
                        title="Buy Mining Packages"
                    >
                        <div className="grid-card-badge badge-mining-active">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M14.5 2.5L21.5 9.5L19 12L12 5L14.5 2.5Z"></path>
                                <path d="M13 6L3 16L5 21L10 19L20 9"></path>
                                <circle cx="12" cy="12" r="1"></circle>
                            </svg>
                        </div>
                        <div className="grid-card-content">
                            <h4>
                                <span>Mining Active</span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </h4>
                            <p>View active rigs &amp; yield</p>
                        </div>
                    </div>

                    {/* 4. Customer Support (Cyan Badge) */}
                    <div className="grid-card" id="card-customer-support">
                        <div className="grid-card-badge badge-support">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#FFFFFF"
                                strokeWidth="2.2"
                            >
                                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                            </svg>
                        </div>
                        <div className="grid-card-content">
                            <h4>
                                <span>Customer Support</span>
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </h4>
                            <p>We are here to help</p>
                        </div>
                    </div>
                </div>

                {/* TELEGRAM CHANNEL PROMO BANNER */}
                <div
                    className="channel-promo-banner"
                    id="home-channel-promo-card"
                >
                    <div className="channel-banner-left">
                        <div className="tg-plane-badge">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M21.5 2.5L2.5 10.5L9.5 13.5L18.5 6.5L11.5 14.5L11 20.5L15.5 16.5L19.5 19.5L21.5 2.5Z"
                                    fill="#FFFFFF"
                                ></path>
                            </svg>
                        </div>
                        <div className="channel-banner-text">
                            <h4>Join Our Telegram Channel</h4>
                            <p id="channel-banner-subtitle">
                                Join channel &amp; get 0.1 TRX bonus
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn-join-channel"
                        id="btn-join-channel-action"
                    >
                        <span id="channel-action-label">Join Now</span>
                        <svg
                            id="channel-action-icon"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                        >
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                </div>

                {/* ==========================================================
                    LAST DEPOSIT & WITHDRAW TRANSACTIONS (LIVE PROOF FEED)
                    ========================================================== */}
                <div className="tx-feed-section">
                    <div className="tx-feed-header">
                        <div className="tx-feed-title-col">
                            <h3 className="tx-feed-title">
                                Last Deposit &amp; Withdraw Transactions
                            </h3>
                            <span className="tx-feed-subtitle">
                                Live real-time TronScan blockchain proofs
                            </span>
                        </div>

                        <div className="tx-live-status-indicator">
                            <span className="pulse-dot"></span>
                            <span>Live</span>
                        </div>
                    </div>

                    <div className="tx-feed-card">
                        {/* Column Header Sub-bar */}
                        <div className="tx-feed-subbar">
                            <span>Type &amp; Address</span>
                            <span>Amount &amp; Time</span>
                        </div>

                        {/* Dynamic List of Transactions */}
                        <div className="tx-items-list">
                            {transactions?.data?.length === 0 && (
                                <div className="tx-item" style={{ justifyContent: 'center', opacity: 0.5 }}>
                                    <span>No transactions yet</span>
                                </div>
                            )}
                            {transactions?.data?.map((tx) => (
                                <div
                                    key={tx.id}
                                    className={`tx-item tx-item-pop-in ${tx.type}`}
                                    id={`tx-${tx.id}`}
                                >
                                    <div className="tx-item-left">
                                        <div className={`tx-type-badge ${tx.type}`}>
                                            {tx.type === 'withdraw' ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                                                    <polyline points="17 14 12 9 7 14"></polyline>
                                                    <line x1="12" y1="9" x2="12" y2="21"></line>
                                                </svg>
                                            ) : (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                            )}
                                            <span style={{ textTransform: 'capitalize' }}>{tx.type}</span>
                                        </div>
                                        <div className="tx-details-col">
                                            <span className="tx-address">
                                                {tx.address}
                                            </span>
                                            {tx.tx_hash && (
                                                <div
                                                    className="tx-hash-badge"
                                                    title={`TronScan TX: ${tx.tx_hash}`}
                                                    onClick={() => navigator.clipboard?.writeText(tx.tx_hash!)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                                    </svg>
                                                    <span>
                                                        TronScan: {tx.tx_hash}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="tx-item-right">
                                        <span className={`tx-amount ${tx.type}`}>
                                            {tx.type === 'withdraw' ? '-' : '+'}{tx.amount} TRX
                                        </span>
                                        <span className="tx-time-ago">
                                            {tx.created_at}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
