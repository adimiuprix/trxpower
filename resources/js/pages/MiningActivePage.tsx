export default function MiningActivePage()
{
    return(
            <section className="view-container" style={{ display: 'flex' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', marginBottom: '12px' }}>
                    <button
                        type="button"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1.5px solid var(--border-card)',
                            borderRadius: '12px',
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                            boxShadow: 'var(--card-shadow)'
                        }}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7"></path>
                        </svg>
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--font-heading)',
                                fontSize: '16px',
                                fontWeight: 800,
                                color: 'var(--text-main)',
                                lineHeight: 1.2
                            }}
                        >
                            Mining Station
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Mining Hardware</span>
                    </div>
                </div>
                <div className="mining-dashboard-card">
                    <div className="mining-pulse-ring">
                        <div className="mining-center-icon">
                            {/* Pickaxe icon */}
                            <svg
                                width="30"
                                height="30"
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
                    </div>

                    <div>
                        <span
                            style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 700
                            }}
                            >Uncollected Mining Yield</span
                        >
                        <div className="unclaimed-amount-display" id="mining-live-counter">0.000000 TRX</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                            >Yield generates in real time based on active rigs</span
                        >
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-around',
                            width: '100%',
                            padding: '10px 0',
                            borderTop: '1px solid var(--border-subtle)',
                            borderBottom: '1px solid var(--border-subtle)'
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active Rigs</div>
                            <div
                                style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700 }}
                                id="mining-active-count"
                            >
                                1
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Hash Power</div>
                            <div
                                style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, color: '#00e599' }}
                                id="mining-total-hashrate"
                            >
                                50 GH/s
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn-claim-rewards"
                        id="btn-claim-mining"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                        <span>Claim Rewards</span>
                    </button>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                        Active Mining Hardware
                    </h3>
                    <div id="active-rigs-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Dynamically populated */}
                    </div>
                </div>
            </section>
    )
}