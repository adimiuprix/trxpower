import { mockTelegramEnv, isTMA } from '@tma.js/sdk';

/**
 * Check apakah aplikasi berjalan di dalam Telegram Mini App
 */
export function isTelegramEnvironment(): boolean {
    if (typeof window === 'undefined') return false;

    // Cek window.Telegram.WebApp (official CDN)
    if (window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 0) {
        return true;
    }

    // Cek URL params / hash
    if (
        window.location.hash.includes('tgWebAppData') ||
        window.location.search.includes('tgWebAppData')
    ) {
        return true;
    }

    // Cek TMA bridge
    try {
        return isTMA();
    } catch {
        return false;
    }
}

/**
 * Setup mock Telegram environment untuk testing di browser biasa
 * Mengisi window.Telegram.WebApp dan @tma.js launchParams dengan data profil realistis
 */
export function setupTelegramMock() {
    if (typeof window === 'undefined') return;

    // Jika sudah di environment Telegram asli, jangan ditimpa mock
    if (isTelegramEnvironment()) {
        return;
    }

    // Hanya aktif di environment non-production atau saat force dev
    if (import.meta.env.DEV) {
        console.log('🔧 Initializing Telegram mock environment for local development');

        const mockUser = {
            id: 99281932,
            first_name: 'Adimi',
            last_name: 'Developer',
            username: 'VestingSTX',
            language_code: 'en',
            is_premium: true,
            photo_url: 'https://t.me/i/userpic/320/uYvCe8GaVfT3ZQRpvN-T_qxJYr5vGf-VLLfxlY09fBk0Q6G8Zjoxf-nyppRdq_tg.svg',
        };

        const mockTheme = {
            bg_color: '#0f172a',
            text_color: '#f8fafc',
            hint_color: '#94a3b8',
            link_color: '#38bdf8',
            button_color: '#0284c7',
            button_text_color: '#ffffff',
            secondary_bg_color: '#1e293b',
            header_bg_color: '#0f172a',
            bottom_bar_bg_color: '#0f172a',
        };

        const mockInitDataRaw =
            `query_id=mock_query_99281932&user=${encodeURIComponent(JSON.stringify(mockUser))}` +
            `&auth_date=${Math.floor(Date.now() / 1000)}&hash=mock_hash_developer&signature=mock_sig_developer`;

        // 1. Mock window.Telegram.WebApp (Official SDK CDN)
        window.Telegram = window.Telegram || {};
        window.Telegram.WebApp = {
            initData: mockInitDataRaw,
            initDataUnsafe: {
                query_id: 'mock_query_99281932',
                user: mockUser,
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'mock_hash_developer',
                start_param: 'ref_VestingSTX',
            },
            version: '7.10',
            platform: 'tdesktop',
            colorScheme: 'dark',
            themeParams: mockTheme,
            isExpanded: true,
            viewportHeight: window.innerHeight || 800,
            viewportStableHeight: window.innerHeight || 800,
            headerColor: '#0f172a',
            backgroundColor: '#0f172a',
            BackButton: {
                isVisible: false,
                show() {
                    this.isVisible = true;
                    console.log('🔙 BackButton.show()');
                },
                hide() {
                    this.isVisible = false;
                    console.log('🔙 BackButton.hide()');
                },
                onClick(cb: () => void) {
                    console.log('🔙 BackButton.onClick registered');
                },
                offClick(cb: () => void) {
                    console.log('🔙 BackButton.offClick removed');
                },
            },
            MainButton: {
                text: 'CONTINUE',
                color: '#0284c7',
                textColor: '#ffffff',
                isVisible: false,
                isActive: true,
                isProgressVisible: false,
                setText(t: string) {
                    this.text = t;
                    console.log(`🔘 MainButton.setText("${t}")`);
                },
                show() {
                    this.isVisible = true;
                    console.log('🔘 MainButton.show()');
                },
                hide() {
                    this.isVisible = false;
                    console.log('🔘 MainButton.hide()');
                },
                enable() {
                    this.isActive = true;
                },
                disable() {
                    this.isActive = false;
                },
                showProgress(leaveActive?: boolean) {
                    this.isProgressVisible = true;
                },
                hideProgress() {
                    this.isProgressVisible = false;
                },
                onClick(cb: () => void) {
                    console.log('🔘 MainButton.onClick registered');
                },
                offClick(cb: () => void) {
                    console.log('🔘 MainButton.offClick removed');
                },
                setParams(params: Record<string, any>) {
                    Object.assign(this, params);
                },
            },
            ready() {
                console.log('✅ Telegram.WebApp.ready()');
            },
            expand() {
                console.log('✅ Telegram.WebApp.expand()');
            },
            close() {
                console.log('🚪 Telegram.WebApp.close()');
            },
            showAlert(message: string, cb?: () => void) {
                alert(message);
                cb?.();
            },
            showConfirm(message: string, cb?: (confirmed: boolean) => void) {
                const res = confirm(message);
                cb?.(res);
            },
            openLink(url: string) {
                window.open(url, '_blank');
            },
            openTelegramLink(url: string) {
                window.open(url, '_blank');
            },
            sendData(data: string) {
                console.log('📤 Telegram.WebApp.sendData:', data);
            },
        };

        // 2. Mock @tma.js environment
        try {
            mockTelegramEnv({
                launchParams: new URLSearchParams({
                    tgWebAppData: mockInitDataRaw,
                    tgWebAppPlatform: 'tdesktop',
                    tgWebAppVersion: '7.10',
                    tgWebAppThemeParams: JSON.stringify(mockTheme),
                }),
            });
        } catch (e) {
            console.warn('⚠️ Could not set @tma.js mock env:', e);
        }
    }
}
