import AppLayout from '@/layouts/AppLayout';

// Plan type matching backend response
interface Plan {
    id: number;
    name: string;
    price: string; // Formatted: "10.00"
    price_raw: number; // Raw: 10
    daily_profit: string; // Formatted: "2.00"
    daily_profit_raw: number; // Raw: 2
    daily_roi_percent: string; // Formatted: "20.00"
    duration: number;
    badge: string | null; // "POPULAR", etc
    image: string; // "/plans/cpu-miner.jpg"
    total_return: string; // Calculated: "60.00"
}

interface MiningPageProps {
    plans: Plan[];
}

// Color map untuk button berdasarkan index
const planColors = ['red', 'blue', 'purple', 'orange', 'cyan', 'green'];
const iconColors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4', '#10b981'];

export default function MiningPage({ plans = [] }: MiningPageProps) {
    return (
        <AppLayout>
            <section
                id="view-plans"
                className="view-container"
                style={{ display: 'flex' }}
            >
                <div id="plans-list-container" className="mining-plans-grid">
                    {/* Dynamic Plans from Database */}
                    {plans.map((plan, index) => (
                        <div key={plan.id} className="mining-card-box">
                            {/* Top section: 3D hardware miner thumbnail + Title & Daily income */}
                            <div className="mining-card-top">
                                <div className="mining-thumb-box">
                                    <img
                                        src={plan.image}
                                        alt={plan.name}
                                        className="mining-thumb-img"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="mining-info-col">
                                    <h4 className="mining-plan-title">{plan.name}</h4>
                                    {plan.badge && (
                                        <span className="plan-badge-popular">
                                            {plan.badge}
                                        </span>
                                    )}
                                    <span className="mining-daily-label">
                                        Daily income
                                    </span>
                                    <span className="mining-daily-percent">
                                        {plan.daily_roi_percent}%
                                    </span>
                                </div>
                            </div>

                            {/* Middle metrics row: Per day & Total coin */}
                            <div className="mining-metrics-pill">
                                <div className="mining-metric-col">
                                    <svg
                                        className="metric-lightning-icon"
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill={iconColors[index % iconColors.length]}
                                    >
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                    </svg>
                                    <div className="metric-text-stack">
                                        <span className="metric-label-text">
                                            Per day
                                        </span>
                                        <span className="metric-val-text">
                                            +{plan.daily_profit} TRX
                                        </span>
                                    </div>
                                </div>

                                <div className="mining-metric-col">
                                    <svg
                                        className="metric-coin-icon"
                                        width="13"
                                        height="13"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="#64748b"
                                        strokeWidth="2"
                                    >
                                        <path d="M12 2C6.48 2 2 3.79 2 6s4.48 4 10 4 10-1.79 10-4-4.48-4-10-4z"></path>
                                        <path d="M2 6v6c0 2.21 4.48 4 10 4s10-1.79 10-4V6"></path>
                                        <path d="M2 12v6c0 2.21 4.48 4 10 4s10-1.79 10-4v-6"></path>
                                    </svg>
                                    <div className="metric-text-stack">
                                        <span className="metric-label-text">
                                            Total coin
                                        </span>
                                        <span className="metric-val-text">
                                            {plan.total_return} TRX
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Action Button: Colorful Activate */}
                            <button
                                type="button"
                                className={`plan-activate-btn plan-btn-${planColors[index % planColors.length]}`}
                            >
                                <span>Activate Plan</span>
                                <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>
                    ))}

                    {/* Coming Soon Card */}
                    <div className="mining-card-box coming-soon-box">
                        <div className="coming-soon-inner">
                            <div className="coming-soon-icon">
                                <svg
                                    width="44"
                                    height="44"
                                    viewBox="0 0 100 100"
                                    fill="none"
                                >
                                    <polygon
                                        points="50,10 88,32 50,90 12,32"
                                        stroke="#cbd5e1"
                                        strokeWidth="5"
                                        fill="none"
                                        strokeLinejoin="round"
                                    ></polygon>
                                    <polyline
                                        points="50,10 50,90"
                                        stroke="#cbd5e1"
                                        strokeWidth="3"
                                        strokeDasharray="3 3"
                                    ></polyline>
                                    <polyline
                                        points="50,48 88,32"
                                        stroke="#cbd5e1"
                                        strokeWidth="3"
                                    ></polyline>
                                    <polyline
                                        points="50,48 12,32"
                                        stroke="#cbd5e1"
                                        strokeWidth="3"
                                    ></polyline>
                                    <polygon
                                        points="50,22 76,35 50,76 24,35"
                                        stroke="#e2e8f0"
                                        strokeWidth="3"
                                        fill="rgba(226, 232, 240, 0.25)"
                                    ></polygon>
                                </svg>
                            </div>
                            <h4 className="coming-soon-title">
                                More Plans
                                <br />
                                Coming Soon
                            </h4>
                            <p className="coming-soon-subtitle">
                                Stay tuned for more exciting opportunities
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
