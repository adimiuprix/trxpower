import AppLayout from '@/layouts/AppLayout';
import Modal from '@/components/Modal';
import PopUp from '@/components/PopUp';
import { useTelegramContext, useTelegramUser } from '@/providers/TelegramProvider';
import { router } from '@inertiajs/react';
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
    tx_hash_full?: string | null;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

interface HomePageProps {
    transactions: { data: Transaction[] };
    minimumClaim: number;
    [key: string]: unknown;
}

export default function HomePage({ transactions, minimumClaim }: HomePageProps) {
    const user = useTelegramUser();
    const { dbUser, refreshDbUser } = useTelegramContext();

    // Balance dari database
    const serverBalance = dbUser?.balance ?? 0;
    const miningHistories = dbUser?.mining_histories ?? [];
    const totalHashrate = dbUser?.total_hashrate;

    // Real-time mining balance state
    const [liveBalance, setLiveBalance] = useState<number>(serverBalance);
    const [walletBalance, setWalletBalance] = useState<number>(dbUser?.wallet_balance ?? 0);
    const [isClaiming, setIsClaiming] = useState(false);
    // Flag untuk pause RAF tick saat claim — pakai ref agar tidak trigger re-render
    const isPausedRef = useRef(false);
    
    // Modal state
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isMinimumClaimPopupOpen, setIsMinimumClaimPopupOpen] = useState(false);
    
    // Balance visibility state
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    
    // Selected provider state
    const [selectedProvider, setSelectedProvider] = useState<string>('Binance');
    
    // Withdraw form state
    const [withdrawAddress, setWithdrawAddress] = useState<string>('');
    const [withdrawAmount, setWithdrawAmount] = useState<string>('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // Auto-fill withdraw address from payout_address when modal opens
    useEffect(() => {
        if (isWithdrawModalOpen) {
            // Always refresh from latest dbUser when modal opens
            const latestPayoutAddress = dbUser?.payout_address || '';
            setWithdrawAddress(latestPayoutAddress);
        }
    }, [isWithdrawModalOpen, dbUser?.payout_address]);

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

    // Sync walletBalance dengan dbUser
    useEffect(() => {
        setWalletBalance(dbUser?.wallet_balance ?? 0);
    }, [dbUser?.wallet_balance]);

    useEffect(() => {
        const cards = document.querySelectorAll<HTMLElement>('.provider-card');

        const handleClick = (e: Event) => {
            const card = e.currentTarget as HTMLElement;
            const provider = card.dataset.provider;

            if (!provider) return;

            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            setSelectedProvider(provider);

            const ripple = document.createElement('div');
            ripple.className = 'provider-card-ripple';
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        };

        cards.forEach(card => card.addEventListener('click', handleClick));

        return () => cards.forEach(card => {
            card.removeEventListener('click', handleClick);
        });
    }, [isWithdrawModalOpen]);

    // Update live balance setiap frame (~60fps) untuk animasi smooth
    useEffect(() => {
        if (!miningHistories?.length) return setLiveBalance(serverBalance);

        let rafId: number;
        const tick = () => {
            if (!isPausedRef.current) setLiveBalance(calculateCurrentBalance());
            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [serverBalance, miningHistories]);

    const handleClaim = async () => {
        if (isClaiming) return;

        // Validasi minimum claim
        if (liveBalance < minimumClaim) {
            setIsMinimumClaimPopupOpen(true);
            return;
        }

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
                // Update walletBalance setelah refresh
                setWalletBalance(data.new_wallet_balance ?? (dbUser?.wallet_balance ?? 0));
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

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isWithdrawing) return;

        const address = withdrawAddress.trim();
        const amount = parseFloat(withdrawAmount);

        if (!address)
            return toaster.semantic.error('Please enter a valid TRC20 address');

        if (!withdrawAmount || amount <= 0)
            return toaster.semantic.error('Please enter a valid withdrawal amount');

        if (amount < 1)
            return toaster.semantic.error('Minimum withdrawal is 1.0 TRX');

        if (amount > walletBalance)
            return toaster.semantic.error('Insufficient balance');

        if (!address.startsWith('T') || address.length !== 34)
            return toaster.semantic.error('Invalid TRC20 address format');

        setIsWithdrawing(true);

        try {
            const token = localStorage.getItem('telegram_auth_token');

            if (!token)
                return toaster.semantic.error('Please login again to continue');

            const response = await fetch('/api/telegram/withdraw', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    telegram_id: user?.id,
                    address,
                    amount,
                    provider: selectedProvider,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Handle validation errors
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat().join(', ');
                    return toaster.semantic.error(errorMessages);
                }
                return toaster.semantic.error(
                    data.message || 'Unable to process withdrawal. Please try again.'
                );
            }

            toaster.semantic.success(
                data.message || 'Withdrawal request submitted successfully!'
            );

            setWithdrawAddress('');
            setWithdrawAmount('');

            await refreshDbUser();

            setTimeout(() => setIsWithdrawModalOpen(false), 2000);
        } catch (error) {
            console.error('Error processing withdrawal:', error);
            toaster.semantic.error(
                'Unable to connect to server. Please check your connection.'
            );
        } finally {
            setIsWithdrawing(false);
        }
    };

    const handlePasteAddress = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setWithdrawAddress(text);
            toaster.semantic.success('Address pasted!');
        } catch (error) {
            toaster.semantic.error('Failed to paste from clipboard');
        }
    }

    const handleMaxAmount = () => {
        setWithdrawAmount(walletBalance.toString());
    }

    // Reset form when modal closes
    const handleCloseWithdrawModal = () => {
        setIsWithdrawModalOpen(false);
        setWithdrawAddress('');
        setWithdrawAmount('');
        setSelectedProvider('Binance');
    }

    const handleJoin = () => {
        window.open(import.meta.env.VITE_TELEGRAM_CHANNEL, 'noopener,noreferrer');
    };

    return (
        <>
        <AppLayout>
            <section
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
                                        onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                        aria-label="Toggle Balance Visibility"
                                        title="Hide/Show Balance"
                                    >
                                        {isBalanceVisible ? (
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
                                                <circle cx="12" cy="12" r="3"></circle>
                                            </svg>
                                        ) : (
                                            <svg
                                                id="eye-icon-svg"
                                                width="15"
                                                height="15"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                <line x1="1" y1="1" x2="23" y2="23"></line>
                                            </svg>
                                        )}
                                    </button>
                                </span>
                            </div>

                            <div className="balance-amount-row">
                                <span className="balance-number">
                                    {isBalanceVisible ? walletBalance.toFixed(4) : '••••••'}
                                </span>
                                <span className="balance-symbol">TRX</span>
                            </div>

                            <div className="balance-sub-row">
                                <span className="balance-fiat-equiv">
                                    {isBalanceVisible ? '≈ $0.00 USDT' : '≈ $••••'}
                                </span>
                                <span className="card-network-badge">{' '} <span className="net-dot"></span>TRC-20{' '}
                                </span>
                            </div>
                        </div>

                        {/* LIVE TRON MINING REACTOR SYSTEM */}
                        <div
                            className="card-mining-system"
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

                            {/* Central Official TRON (TRX) */}
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
                                >
                                    {totalHashrate ?? '0 GH/s'}
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
                        onClick={() => setIsWithdrawModalOpen(true)}
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
                        onClick={(e) => {
                            e.preventDefault();
                            router.visit('/deposit');
                        }}
                        className="action-btn btn-deposit"
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
                                    {isBalanceVisible ? liveBalance.toFixed(8) : '••••••••'}
                                </span>
                                <span className="mining-ticking-symbol">
                                    TRX
                                </span>
                            </div>
                            <span
                                className="mining-daily-subtitle"
                                id="home-mining-daily-rate"
                            >
                                {isBalanceVisible ? 'Daily: 0.10 TRX' : 'Daily: •••• TRX'}
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
                    {/* 3. Task center */}
                    <div
                        className="grid-card"
                        onClick={() => router.visit('/task')}
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
                                <path d="M9 11L12 14L20 6" />
                                <path d="M20 12V19C20 20.1 19.1 21 18 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H14" />
                                <circle cx="19" cy="19" r="3" />
                            </svg>
                        </div>
                        <div className="grid-card-content">
                            <h4>
                                <span>Bonus Tasks</span>
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
                            <p>Complete Tasks & Earn TRX</p>
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
                        onClick={handleJoin}
                        className="btn-join-channel"
                    >
                        <span>Join Now</span>
                        <svg
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
                                                    title={`TronScan TX: ${tx.tx_hash_full || tx.tx_hash}`}
                                                    onClick={() => navigator.clipboard?.writeText(tx.tx_hash_full || tx.tx_hash!)}
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

            {/* Withdraw Modal */}
            <Modal 
                isOpen={isWithdrawModalOpen} 
                onClose={handleCloseWithdrawModal}
                title="Withdraw TRX"
            >
                {/* VIEW 1: WITHDRAW FORM */}
                <div style={{ display: 'block' }}>

                    {/* Withdrawable Balance Display */}
                    <div className="withdraw-balance-banner">
                        <div className="withdraw-balance-info">
                            <span className="withdraw-balance-label">Withdrawable Balance</span>
                            <span className="withdraw-balance-sub">Claimed Mining Rewards</span>
                        </div>
                        <div className="withdraw-balance-value">{Number(walletBalance).toFixed(4)} TRX</div>
                    </div>

                    {/* Step 1: Select Wallet / Exchange Destination */}
                    <div className="withdraw-section-title">
                        <span>1. Select Destination Platform</span>
                    </div>
                    <div className="wallet-provider-grid" id="wallet-provider-selector">
                        
                        {/* <div className="provider-card active" data-provider="Binance">
                            <div className="provider-logo-wrap binance-wrap">
                                <img
                                    src="/wallets/binance.svg"
                                    alt="Binance"
                                    width="24"
                                    height="24"
                                    className="provider-logo-img"
                                />
                            </div>
                            <span className="provider-name">Binance</span>
                            <div className="provider-badge-check">✓</div>
                        </div> */}

                        <div className="provider-card" data-provider="Trust Wallet">
                            <div className="provider-logo-wrap trust-wrap">
                                <img
                                    src="/wallets/trustwallet.svg"
                                    alt="Trust Wallet"
                                    width="24"
                                    height="24"
                                    className="provider-logo-img"
                                />
                            </div>
                            <span className="provider-name">Trust Wallet</span>
                            <div className="provider-badge-check">✓</div>
                        </div>

                        <div className="provider-card" data-provider="MetaMask">
                            <div className="provider-logo-wrap metamask-wrap">
                                <img
                                    src="/wallets/metamask.svg"
                                    alt="MetaMask"
                                    width="24"
                                    height="24"
                                    className="provider-logo-img"
                                />
                            </div>
                            <span className="provider-name">MetaMask</span>
                            <div className="provider-badge-check">✓</div>
                        </div>

                        <div className="provider-card" data-provider="TronLink">
                            <div className="provider-logo-wrap tronlink-wrap">
                                <img
                                    src="/wallets/tronlink.svg"
                                    alt="TronLink"
                                    width="24"
                                    height="24"
                                    className="provider-logo-img"
                                />
                            </div>
                            <span className="provider-name">TronLink</span>
                            <div className="provider-badge-check">✓</div>
                        </div>

                        <div className="provider-card" data-provider="Other Wallet">
                            <div className="provider-logo-wrap other-wrap">
                                <img
                                    src="/wallets/other.svg"
                                    alt="Other Wallet"
                                    width="24"
                                    height="24"
                                    className="provider-logo-img"
                                />
                            </div>
                            <span className="provider-name">Other</span>
                            <div className="provider-badge-check">✓</div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleWithdraw}
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}
                    >
                        {/* Info banner for users without saved address */}
                        {!dbUser?.payout_address && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'rgba(255, 193, 7, 0.1)',
                                border: '1px solid rgba(255, 193, 7, 0.3)',
                                fontSize: '12px',
                                color: '#ffc107',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="16" x2="12" y2="12"/>
                                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                                </svg>
                                <div>
                                    <strong>Tip:</strong> Save your withdrawal address in your profile to auto-fill it next time!
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>TRON (TRC20) Destination Address</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {dbUser?.payout_address && (
                                        <button 
                                            type="button" 
                                            className="input-action-link"
                                            onClick={() => setWithdrawAddress(dbUser.payout_address || '')}
                                            style={{ color: 'var(--trx-red)' }}
                                        >
                                            Use Saved
                                        </button>
                                    )}
                                    <button 
                                        type="button" 
                                        id="btn-paste-withdraw-addr" 
                                        className="input-action-link"
                                        onClick={handlePasteAddress}
                                    >
                                        Paste
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={dbUser?.payout_address ? "Using your saved address..." : "Enter TRC20 address (starts with T...)"}
                                value={withdrawAddress}
                                onChange={(e) => setWithdrawAddress(e.target.value)}
                                required
                            />
                            {dbUser?.payout_address && withdrawAddress === dbUser.payout_address && (
                                <div style={{ 
                                    fontSize: '11px', 
                                    color: '#00e599', 
                                    marginTop: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                        <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    <span>Using your saved withdrawal address</span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Withdrawal Amount (TRX)</label>
                                <button
                                    type="button"
                                    className="input-action-link"
                                    style={{ color: 'var(--trx-red)', fontWeight: 800 }}
                                    onClick={handleMaxAmount}
                                >
                                    MAX
                                </button>
                            </div>
                            <div className="input-with-symbol">
                                <input
                                    type="number"
                                    step="any"
                                    min="1"
                                    className="form-input"
                                    placeholder="Min. 1 TRX"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    required
                                />
                                <span className="input-suffix-symbol">TRX</span>
                            </div>
                        </div>

                        {/* Highlights & Policies */}
                        <div className="withdraw-specs-grid">
                            <div className="spec-pill">
                                <span className="spec-k">Min. Withdraw:</span>
                                <span className="spec-v">1.0 TRX</span>
                            </div>
                            <div className="spec-pill spec-highlight">
                                <span className="spec-k">Network Fee:</span>
                                <span className="spec-v green-val">0.00 TRX (Free)</span>
                            </div>
                        </div>

                        <div className="withdraw-notes-box">
                            <span>• Only <strong>claimed mining rewards</strong> can be withdrawn.</span>
                            <span>• Deposited balances are dedicated for mining rig contracts.</span>
                            <span>• Admin review ensures safe &amp; fast payment dispatch.</span>
                        </div>

                        <button
                            type="submit"
                            className="btn-submit-action"
                            disabled={isWithdrawing}
                            style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '6px',
                                opacity: isWithdrawing ? 0.7 : 1,
                                cursor: isWithdrawing ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isWithdrawing ? (
                                <>
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        style={{ animation: 'spin 1s linear infinite' }}
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 2a10 10 0 0 1 10 10"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
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
                                        <line x1="7" y1="17" x2="17" y2="7" />
                                        <polyline points="7 7 17 7 17 17" />
                                    </svg>
                                    <span>Submit Withdrawal</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* VIEW 2: TELEGRAM EMOJI ANIMATION & SUCCESS CARD */}
                <div style={{ display: 'none' }}>
                    <div className="tg-emoji-celebration-container">
                        <div className="tg-flying-particle p1">💸</div>
                        <div className="tg-flying-particle p2">💰</div>
                        <div className="tg-flying-particle p3">🪙</div>
                        <div className="tg-flying-particle p4">✨</div>
                        <div className="tg-flying-particle p5">💵</div>
                        <div className="tg-main-money-emoji">💸</div>
                    </div>

                    <div className="withdraw-success-content">
                        <div className="status-pill-pulse pending">
                            <span className="pulse-dot"></span>
                            <span>Status: Pending Approval</span>
                        </div>

                        <h4 className="withdraw-success-title">Withdrawal Request Submitted!</h4>
                        <p className="withdraw-success-desc">
                            Your withdrawal has been registered and is pending administrator confirmation.
                        </p>

                        <div className="withdraw-receipt-card">
                            <div className="receipt-row">
                                <span>Amount</span>
                                <strong className="receipt-amount">0.00 TRX</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Destination</span>
                                <strong>Binance</strong>
                            </div>
                            <div className="receipt-row">
                                <span>Address</span>
                                <span className="receipt-addr">T...</span>
                            </div>
                            <div className="receipt-row">
                                <span>Network Fee</span>
                                <strong style={{ color: '#00e599' }}>0.00 TRX (Free)</strong>
                            </div>
                        </div>

                        <div className="withdraw-success-actions">
                            <button
                                type="button"
                                className="btn-secondary-action"
                            >
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                >
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                <span>Notifications (1)</span>
                            </button>
                            <button
                                type="button"
                                className="btn-submit-action"
                            >
                                <span>View in History</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AppLayout>

        {/* Minimum Claim PopUp - Rendered outside AppLayout to avoid z-index stacking context issues */}
        <PopUp 
            isOpen={isMinimumClaimPopupOpen}
            onClose={() => setIsMinimumClaimPopupOpen(false)}
            minimumClaim={minimumClaim}
            currentBalance={liveBalance}
        />
        </>
    );
}
