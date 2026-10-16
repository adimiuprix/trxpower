import AppLayout from '@/layouts/AppLayout';
import { useTelegramContext } from '@/providers/TelegramProvider';
import { useState } from 'react'
import { createToaster } from "@codenhub/toaster";

const toaster = createToaster({
    position: "top-center",
    duration: 3000,
});

export default function ReferralPage() {
    const [copySuccess, setCopySuccess] = useState(false);
    const { dbUser } = useTelegramContext();
    const reffCode = dbUser?.referral_code
    const totReff = dbUser?.referral_total
    const referrals = dbUser?.referrals
    const earning = dbUser?.earning

    // Validasi referral code - jangan buat link jika undefined/null
    const referralLink = reffCode 
        ? `${import.meta.env.VITE_TELEGRAM_BOT_APP}?startapp=ref_${reffCode}`
        : '';

    const handleCopy = async () => {
        if (!reffCode) {
            toaster.semantic.error('Referral code not available. Please refresh the page.');
            return;
        }

        try {
            await navigator.clipboard.writeText(referralLink);
            setCopySuccess(true);
            toaster.semantic.success('Referral link copied!');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            toaster.semantic.error('Failed to copy link');
        }
    }

    return (
        <AppLayout>
            <section
                className="view-container"
                style={{ display: 'flex' }}
            >
                {/* Header Banner with Picture */}
                <div
                    className="referral-banner-card"
                    style={{
                        width: '100%',
                        marginBottom: '12px',
                        padding: 0,
                        overflow: 'hidden',
                        cursor: 'pointer',
                    }}
                >
                    <img
                        src="/referral-banner.png"
                        alt="Invite Friends & Earn More TRX"
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                        }}
                    />
                </div>

                {/* COLORFUL STATS BOXES (Total Referrals & Total Referral Earning) */}
                <div className="referral-stats-grid">
                    {/* Box 1: Total Referrals */}
                    <div className="ref-stat-card ref-card-count">
                        <div className="ref-stat-top">
                            <div className="ref-stat-icon-badge">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="2.3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                            </div>
                            <span className="ref-stat-tag">Team</span>
                        </div>
                        <div className="ref-stat-body">
                            <div
                                className="ref-stat-value"
                                id="referral-total-count-box"
                            >
                                {totReff}
                            </div>
                            <span className="ref-stat-label">
                                Total Referrals
                            </span>
                            <span className="ref-stat-sub">
                                Active direct downlines
                            </span>
                        </div>
                    </div>

                    {/* Box 2: Total Referral Earning */}
                    <div className="ref-stat-card ref-card-earnings">
                        <div className="ref-stat-top">
                            <div className="ref-stat-icon-badge">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#FFFFFF"
                                    strokeWidth="2.3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 14 14"></polyline>
                                    <path d="M12 2a10 10 0 1 0 10 10"></path>
                                </svg>
                            </div>
                            <span className="ref-stat-tag">Yield</span>
                        </div>
                        <div className="ref-stat-body">
                            <div className="ref-stat-value">
                                <span id="referral-total-earned-box">
                                    {Number(earning || 0).toFixed(4)}
                                </span>{' '}
                                <small>TRX</small>
                            </div>
                            <span className="ref-stat-label">
                                Total Earnings
                            </span>
                            <span className="ref-stat-sub">
                                Paid instantly to balance
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3-Tier Multi-Level Commission Cards */}
                <div className="tier-cards-row">
                    <div className="tier-card tier-1">
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                opacity: 0.8,
                            }}
                        >
                            Tier 1
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '19px',
                                fontWeight: 900,
                            }}
                        >
                            10%
                        </span>
                        <span
                            style={{
                                fontSize: '10px',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                            }}
                        >
                            Direct Friends
                        </span>
                    </div>
                    <div className="tier-card tier-2">
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                opacity: 0.8,
                            }}
                        >
                            Tier 2
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '19px',
                                fontWeight: 900,
                            }}
                        >
                            5%
                        </span>
                        <span
                            style={{
                                fontSize: '10px',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                            }}
                        >
                            2nd Gen
                        </span>
                    </div>
                    <div className="tier-card tier-3">
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                opacity: 0.8,
                            }}
                        >
                            Tier 3
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '19px',
                                fontWeight: 900,
                            }}
                        >
                            2%
                        </span>
                        <span
                            style={{
                                fontSize: '10px',
                                color: 'var(--text-muted)',
                                fontWeight: 600,
                            }}
                        >
                            3rd Gen
                        </span>
                    </div>
                </div>

                {/* Referral Direct Link & Share Box */}
                <div className="referral-link-card">
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '8px',
                        }}
                    >
                        <span className="form-label" style={{ margin: 0 }}>
                            Direct Mini App Invite Link
                        </span>
                        <span
                            style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Code:
                            <strong
                                style={{
                                    color: reffCode ? 'var(--trx-red)' : '#F59E0B',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '12px',
                                }}
                                id="referral-code-badge"
                            >
                                {reffCode || 'Loading...'}
                            </strong>
                        </span>
                    </div>

                    <div className="copy-input-row">
                        <input
                            type="text"
                            id="referral-link"
                            readOnly
                            value={referralLink}
                            placeholder={reffCode ? referralLink : 'Loading referral link...'}
                        />
                        <button 
                            className="btn-copy" 
                            onClick={handleCopy}
                            disabled={!reffCode}
                            style={{ opacity: reffCode ? 1 : 0.5, cursor: reffCode ? 'pointer' : 'not-allowed' }}
                        >
                            {copySuccess ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    {/* Direct Launch Telegram Share Button */}
                    <button type="button" className="btn-telegram-direct-share">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M21.5 2.5L2.5 10.5L9.5 13.5L18.5 6.5L11.5 14.5L11 20.5L15.5 16.5L19.5 19.5L21.5 2.5Z"
                                fill="#FFFFFF"
                            ></path>
                        </svg>
                        <span>Invite Friends on Telegram</span>
                        <span className="direct-app-badge">
                            Direct Mini App
                        </span>
                    </button>

                    {/* Hidden element to maintain backwards compatibility with any other script */}
                    <span
                        style={{ display: 'none' }}
                    >
                        0.0000 TRX
                    </span>
                </div>

                {/* Referred Downlines Section */}
                <div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                        }}
                    >
                        <h4
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '15px',
                                fontWeight: 700,
                                margin: 0,
                            }}
                        >
                            Referred Downlines (
                            <span>0</span>)
                        </h4>
                        <span
                            style={{
                                fontSize: '11px',
                                color: 'var(--text-muted)',
                            }}
                        >
                            Live Network
                        </span>
                    </div>

                    {referrals?.length ? (
                        referrals.map((referral) => (
                        <div
                            key={referral?.id}
                            className="task-item-card"
                            style={{
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 10,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    minWidth: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #FF1E40, #99041E)',
                                        color: '#fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: 13,
                                        flexShrink: 0,
                                    }}
                                >
                                    V
                                </div>

                                <div className="task-info-group" style={{ minWidth: 0 }}>
                                    <span
                                        className="task-title"
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        @{referral?.username}
                                    </span>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 2,
                                        }}
                                    >
                                        <span
                                            className="task-desc"
                                            style={{
                                                color: 'var(--emerald-green)',
                                                fontWeight: 600,
                                                fontSize: 11,
                                            }}
                                        >
                                            Dep: 0.00 TRX
                                        </span>

                                        <span
                                            style={{
                                                fontSize: 10,
                                                color: 'var(--text-muted)',
                                            }}
                                        >
                                            24/09/2026
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flexShrink: 0 }}>
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: '#F59E0B',
                                        background: 'rgba(245, 158, 11, 0.12)',
                                        padding: '3px 8px',
                                        borderRadius: 6,
                                        border: '1px solid rgba(245, 158, 11, 0.25)',
                                    }}
                                >
                                    ⏳ Pending
                                </span>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '28px 16px',
                                    color: 'var(--text-muted)',
                                    fontSize: '13px',
                                    background: 'var(--bg-card)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px dashed var(--border-card)',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '24px',
                                        marginBottom: '6px',
                                    }}
                                >
                                    👥
                                </div>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: 'var(--text-main)',
                                        marginBottom: '2px',
                                    }}
                                >
                                    No downlines yet
                                </div>
                                <span>
                                    Share your invite link above to earn 5% instant
                                    TRX commissions!
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AppLayout>
    );
}
