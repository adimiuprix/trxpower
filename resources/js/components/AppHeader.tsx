import { useEffect, useState } from 'react';

export default function AppHeader() {
    const [isDark, setIsDark] = useState(() => {
        const theme = localStorage.getItem('theme');
        return theme
            ? theme === 'dark'
            : matchMedia('(prefers-color-scheme: dark)').matches;
    });
    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.dataset.theme = theme;
        document.body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
    }, [isDark]);

    const toggleTheme = () => setIsDark((current) => !current);

    return (
        <header className="app-header">
            <div className="brand-wrapper">
                <div className="brand-icon">
                    {/* Tron Diamond Logo */}
                    <svg
                        width="34"
                        height="34"
                        viewBox="0 0 100 100"
                        fill="none"
                    >
                        <polygon
                            points="50,5 92,30 50,95 8,30"
                            stroke="#FF1E40"
                            strokeWidth="6"
                            fill="rgba(255, 30, 64, 0.08)"
                        ></polygon>
                        <polyline
                            points="50,5 50,95"
                            stroke="#FF1E40"
                            strokeWidth="4"
                        ></polyline>
                        <polyline
                            points="50,48 92,30"
                            stroke="#FF1E40"
                            strokeWidth="4"
                        ></polyline>
                        <polyline
                            points="50,48 8,30"
                            stroke="#FF1E40"
                            strokeWidth="4"
                        ></polyline>
                        <polygon
                            points="50,15 80,32 50,80 20,32"
                            fill="#FF1E40"
                            opacity="0.35"
                        ></polygon>
                    </svg>
                </div>
                <div className="brand-title-group">
                    <h1>
                        <span className="trx-highlight">Tron</span> Gram
                    </h1>
                    <span className="brand-subtitle">
                        Earn TRX • Fast • Secure
                    </span>
                </div>
            </div>

            <div className="header-actions">
                {/* Theme Toggle (White / Dark) */}
                <button
                    className="icon-btn-pill"
                    id="btn-theme-toggle"
                    aria-label="Toggle Theme"
                    onClick={toggleTheme}
                >
                    <span
                        id="theme-toggle-icon"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {isDark ? (
                            // Moon icon - showing when dark mode is active
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        ) : (
                            // Sun icon - showing when light mode is active
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line
                                    x1="4.22"
                                    y1="4.22"
                                    x2="5.64"
                                    y2="5.64"
                                ></line>
                                <line
                                    x1="18.36"
                                    y1="18.36"
                                    x2="19.78"
                                    y2="19.78"
                                ></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line
                                    x1="4.22"
                                    y1="19.78"
                                    x2="5.64"
                                    y2="18.36"
                                ></line>
                                <line
                                    x1="18.36"
                                    y1="5.64"
                                    x2="19.78"
                                    y2="4.22"
                                ></line>
                            </svg>
                        )}
                    </span>
                </button>

                {/* Notification Bell */}
                <button
                    className="icon-btn-pill"
                    id="btn-notifications"
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span
                        className="notification-badge-counter"
                        id="header-unread-badge"
                        style={{ display: 'none' }}
                    >
                        0
                    </span>
                </button>

                {/* Language Selector */}
                <div className="lang-selector-pill">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>EN</span>
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.6 }}
                    >
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </header>
    );
}
