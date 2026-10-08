import AppLayout from '@/layouts/AppLayout';
import { useTelegramContext, useTelegramUser } from '@/providers/TelegramProvider';
import { useState, useEffect } from 'react';
import { createToaster } from "@codenhub/toaster";

// Initialize toaster outside component (singleton pattern)
const toaster = createToaster({
    position: "top-center",
    duration: 3000,
});

export default function ProfilePage() {
    // Akses data user dari Telegram Context
    const user = useTelegramUser();
    const { showAlert, haptic, dbUser, refreshDbUser } = useTelegramContext();

    const [payoutAddress, setPayoutAddress] = useState(dbUser?.payout_address || '')
    const [isSaving, setIsSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdraw' | 'mining'>('all')

    // Financial statistics
    const depositBalance = dbUser?.deposit_balance
    const withdrawable = dbUser?.wallet_balance
    const totalMining = dbUser?.mined
    const totalWithdraw = dbUser?.total_withdraw

    // ambil transactions dari dbUser lalu filter
    const filteredTransactions = (dbUser?.transactions ?? []).filter(tx => activeTab === 'all' || tx.type === activeTab);

    // Handler untuk ganti tab dengan haptic feedback
    const handleTabChange = (tab: 'all' | 'deposit' | 'withdraw' | 'mining') => {
        setActiveTab(tab);
        haptic.selection(); // Haptic feedback saat tab berganti
    };

    // Function untuk mendapatkan title transaksi
    const getTransactionTitle = (type: string, amount: string) =>
    ({
        mining: `Claimed mining yield (${amount} TRX) from active mining rigs`,
        deposit: 'Deposit to mining balance via TRC20 transfer',
        withdraw: 'Withdrawal request to TRON wallet',
    })[type] ?? 'Transaction';

    // Function untuk render icon berdasarkan tipe transaksi
    const renderTransactionIcon = (type: string) => {
        switch (type) {
            case 'mining':
                return (
                    <div className="tx-card-icon tx-mining">
                        <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                        >
                            <path d="M14.5 2.5L21.5 9.5L19 12L12 5L14.5 2.5Z"></path>
                            <path d="M13 6L3 16L5 21L10 19L20 9"></path>
                            <circle cx="12" cy="12" r="1"></circle>
                        </svg>
                    </div>
                );
            case 'deposit':
                return (
                    <div className="tx-card-icon tx-deposit">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <polyline points="19 12 12 19 5 12"></polyline>
                        </svg>
                    </div>
                );
            case 'withdraw':
                return (
                    <div className="tx-card-icon tx-withdraw">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                    </div>
                );
            default:
                return null;
        }
    };

    // Update payoutAddress ketika dbUser berubah (data dari database sudah load)
    useEffect(() => {
        if (dbUser?.payout_address) {
            setPayoutAddress(dbUser.payout_address);
        }
    }, [dbUser?.payout_address])

    // Handler untuk copy user ID
    const handleCopyUserId = () => {
        if (user?.id) {
            navigator.clipboard.writeText(user.id.toString());
            haptic.notification('success');
            showAlert('User ID copied to clipboard!');
        }
    };

    // Handler untuk save address
    const handleSaveAddress = async () => {
        // Validasi: address tidak boleh kosong
        if (!payoutAddress?.trim()) {
            haptic.notification('error');
            toaster.semantic.error('Please enter a TRON address');
            return;
        }

        // Validasi: address harus dimulai dengan 'T'
        if (!payoutAddress.startsWith('T')) {
            haptic.notification('error');
            toaster.semantic.error('TRON address must start with T');
            return;
        }

        // Validasi: panjang address TRON = 34 karakter
        if (payoutAddress.length !== 34) {
            haptic.notification('error');
            toaster.semantic.error('TRON address must be exactly 34 characters');
            return;
        }

        setIsSaving(true);

        try {
            // take token from telegramAuthService
            const token = localStorage.getItem('telegram_auth_token');

            if (!token) {
                toaster.semantic.error('Please login again to continue');
                return;
            }

            // Send request to api
            const response = await fetch('/api/telegram/payout-address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    payout_address: payoutAddress,
                }),
            });

            const data = await response.json();

            if (data.success) {
                haptic.notification('success');
                toaster.semantic.success('Your payout address has been updated successfully');
                
                // Refresh dbUser to get latest data
                await refreshDbUser();
            } else {
                haptic.notification('error');
                toaster.semantic.error(data.message || 'Failed to save address. Please try again.');
            }
        } catch (error) {
            console.error('Error saving payout address:', error);
            haptic.notification('error');
            toaster.semantic.error('Unable to connect to server. Please check your connection.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <AppLayout>
            <section className="view-container" style={{ display: 'flex' }}>
                {/* 1. Top Profile Header Card */}
                <div className="profile-header-card">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar-circle" id="profile-avatar-container">
                            <img
                                src={user?.photoUrl}
                                alt="User Avatar"
                                className="profile-avatar-img"
                            />
                        </div>
                        <span className="profile-online-badge" title="Active on Tron Network"></span>
                    </div>

                    <div className="profile-info-wrap">
                        <div className="profile-name-row">
                            <h3 className="profile-name-text" id="profile-name">
                                {user?.firstName} {user?.lastName || ''}
                            </h3>
                            {user?.isPremium && (
                                <span className="profile-verified-badge" title="Telegram Premium User">
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="#0284c7">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                                    </svg>
                                </span>
                            )}
                        </div>
                        <span id="profile-username" style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {user?.username ? `@${user.username}` : 'No username'}
                        </span>

                        <div className="profile-id-chips-row">
                            <div
                                className="profile-chip profile-uid-btn"
                                title="Click to copy User ID"
                                onClick={handleCopyUserId}
                                style={{ cursor: 'pointer' }}
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                <span>UID:
                                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{user?.id || 'N/A'}</strong>
                                </span>
                            </div>
                            <span className="profile-tier-badge" id="profile-vip-badge">
                                {user?.isPremium ? 'Premium User' : 'Verified Miner'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Financial Stats 2x2 Grid (Deposit Balance, Withdrawable Balance, Total Withdrawn, Total Mined) */}
                <div className="profile-stats-grid">
                    {/* Stat 1: Deposit Balance */}
                    <div className="profile-stat-box">
                        <div className="profile-stat-top">
                            <div className="profile-stat-icon-wrap stat-icon-deposit">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <polyline points="19 12 12 19 5 12"></polyline>
                                </svg>
                            </div>
                            <span className="profile-stat-tag" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>Deposits</span>
                        </div>
                        <div>
                            <span className="profile-stat-label">Deposit Balance</span>
                            <div className="profile-stat-val">{Number(depositBalance).toFixed(4)} TRX</div>
                            <span className="profile-stat-sub">For mining activation</span>
                        </div>
                    </div>

                    {/* Stat 2: Withdrawable Balance (Claimed Mining Earnings) */}
                    <div className="profile-stat-box">
                        <div className="profile-stat-top">
                            <div className="profile-stat-icon-wrap" style={{ background: 'rgba(225, 29, 72, 0.12)', color: 'var(--trx-red)' }}>
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                >
                                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                                    <circle cx="18" cy="12" r="2"></circle>
                                </svg>
                            </div>
                            <span className="profile-stat-tag" style={{ color: 'var(--trx-red)', background: 'rgba(225, 29, 72, 0.1)' }}>Claimed</span>
                        </div>
                        <div>
                            <span className="profile-stat-label">Withdrawable Balance</span>
                            <div className="profile-stat-val" style={{ color: 'var(--trx-red)' }}>{Number(withdrawable).toFixed(4)} TRX</div>
                            <span className="profile-stat-sub">Ready for payout</span>
                        </div>
                    </div>

                    {/* Stat 3: Total Withdrawn */}
                    <div className="profile-stat-box">
                        <div className="profile-stat-top">
                            <div className="profile-stat-icon-wrap stat-icon-withdraw">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <line x1="12" y1="19" x2="12" y2="5"></line>
                                    <polyline points="5 12 12 5 19 12"></polyline>
                                </svg>
                            </div>
                            <span className="profile-stat-tag" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>Payouts</span>
                        </div>
                        <div>
                            <span className="profile-stat-label">Total Withdrawn</span>
                            <div className="profile-stat-val">{Number(totalWithdraw).toFixed(4)} TRX</div>
                            <span className="profile-stat-sub">Paid out to wallet</span>
                        </div>
                    </div>

                    {/* Stat 4: Total Mined */}
                    <div className="profile-stat-box">
                        <div className="profile-stat-top">
                            <div className="profile-stat-icon-wrap stat-icon-mined">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                >
                                    <path d="M14.5 2.5L21.5 9.5L19 12L12 5L14.5 2.5Z"></path>
                                    <path d="M13 6L3 16L5 21L10 19L20 9"></path>
                                    <circle cx="12" cy="12" r="1"></circle>
                                </svg>
                            </div>
                            <span className="profile-stat-tag" style={{ color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)' }}>Mined</span>
                        </div>
                        <div>
                            <span className="profile-stat-label">Total Mined</span>
                            <div className="profile-stat-val">{Number(totalMining).toFixed(4)} TRX</div>
                            <span className="profile-stat-sub">Lifetime passive rewards</span>
                        </div>
                    </div>
                </div>

                {/* 3. Bind TRON Address Form */}
                <div className="wallet-bind-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="form-label" style={{ margin: 0 }}>TRON (TRC20) Payout Address</span>
                        <span
                            id="wallet-bind-status"
                            style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                color: 'rgb(245, 158, 11)',
                                background: 'rgba(245, 158, 11, 0.12)',
                                padding: '2px 7px',
                                borderRadius: '4px',
                            }}>
                            Not Bound</span>
                    </div>
                    <div className="copy-input-row">

                        <input
                            type="text"
                            placeholder="Enter TRON address starting with T..."
                            value={payoutAddress}
                            onChange={(e) => setPayoutAddress(e.target.value)}
                            disabled={isSaving}
                        />

                        <button
                            onClick={handleSaveAddress}
                            className="btn-copy"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Payouts are sent automatically to this TRON address upon withdrawal request.</span>
                </div>

                {/* 4. Transaction Ledger History Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '16px',
                                fontWeight: 800,
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <span>Transaction History</span>
                            <span
                                id="profile-tx-badge"
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: 'var(--trx-red)',
                                    background: 'rgba(255, 30, 64, 0.12)',
                                    padding: '1px 7px',
                                    borderRadius: '999px',
                                }}
                            >{filteredTransactions.length}
                            </span>
                        </h4>
                        <button
                            type="button"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M23 4v6h-6"></path>
                                <path d="M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            <span>Refresh</span>
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="history-filter-bar">
                        <button
                            type="button"
                            className={`history-filter-chip ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => handleTabChange('all')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`history-filter-chip ${activeTab === 'deposit' ? 'active' : ''}`}
                            onClick={() => handleTabChange('deposit')}
                        >
                            Deposits
                        </button>
                        <button
                            type="button"
                            className={`history-filter-chip ${activeTab === 'withdraw' ? 'active' : ''}`}
                            onClick={() => handleTabChange('withdraw')}
                        >
                            Withdrawals
                        </button>
                        <button
                            type="button"
                            className={`history-filter-chip ${activeTab === 'mining' ? 'active' : ''}`}
                            onClick={() => handleTabChange('mining')}
                        >
                            Mining Yield
                        </button>
                    </div>

                    {/* Transactions List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx) => (
                                <div key={tx.id} className="tx-item-card">
                                    <div className="tx-card-left">
                                        {renderTransactionIcon(tx.type)}
                                        <div className="tx-card-details">
                                            <span className="tx-card-title">
                                                {getTransactionTitle(tx.type, tx.amount)}
                                            </span>
                                            <span className="tx-card-meta">{tx.created_at}</span>
                                        </div>
                                    </div>
                                    <div className="tx-card-right">
                                        <span className={`tx-card-amount ${tx.type === 'withdraw' ? 'tx-negative' : 'tx-positive'}`}>
                                            {tx.type === 'withdraw' ? '-' : '+'}{tx.amount} TRX
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '32px 14px',
                                    background: 'var(--bg-card)',
                                    border: '1px dashed var(--border-card)',
                                    borderRadius: '14px',
                                }}
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--text-muted)"
                                    strokeWidth="1.8"
                                    style={{
                                        marginBottom: '8px',
                                        opacity: 0.6,
                                    }}
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>

                                <div
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: 'var(--text-main)',
                                        marginBottom: '2px',
                                    }}
                                >
                                    No Transactions Found
                                </div>

                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    No records match this filter.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
