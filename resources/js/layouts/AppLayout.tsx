import { router, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'
import AppHeader from '@/components/AppHeader'

interface AppLayoutProps {
    children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { url } = usePage()

    const isActive = (href: string) => {
        return url === href
    }

    return (
        <div className="app-viewport">
            {/* Ambient Red Glow Top Background */}
            <div className="ambient-glow-top"></div>

            <AppHeader />

            {/* ==========================================================
            MAIN CONTENT AREA (MULTI-VIEW SPA)
            ========================================================== */}
            <main className="main-content">
                {children}
            </main>

            {/* ==========================================================
            BOTTOM NAVIGATION BAR (Floating Pill Capsule Dock)
            ========================================================== */}
            <div className="floating-nav-wrapper">
                <nav className="floating-nav-bar">
                    {/* Tab 1: Home */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            router.visit('/')
                        }}
                        className={`nav-tab-item ${isActive('/') ? 'active' : ''}`}
                    >
                        <div className="nav-icon-bubble">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <span className="nav-tab-label">Home</span>
                    </button>

                    {/* Tab 2: Mine */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            router.visit('/mine')
                        }}
                        className={`nav-tab-item ${isActive('/mine') ? 'active' : ''}`}
                    >
                        <div className="nav-icon-bubble">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </div>
                        <span className="nav-tab-label">Mine</span>
                    </button>

                    {/* Tab 3: Team */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            router.visit('/referral')
                        }}
                        className={`nav-tab-item ${isActive('/referral') ? 'active' : ''}`}>
                        <div className="nav-icon-bubble">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <span className="nav-tab-label">Team</span>
                    </button>

                    {/* Tab 4: Profile */}
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            router.visit('/profile')
                        }}
                        className={`nav-tab-item ${isActive('/profile') ? 'active' : ''}`}
                    >
                        <div className="nav-icon-bubble">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <span className="nav-tab-label">Profile</span>
                    </button>
                </nav>
            </div>
        </div>
    )
}