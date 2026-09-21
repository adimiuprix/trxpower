import { useCallback, useMemo } from 'react';
import {
    backButton as tmaBackButton,
    initData as tmaInitData,
    mainButton as tmaMainButton,
    miniApp as tmaMiniApp,
    themeParams as tmaThemeParams,
    viewport as tmaViewport,
    useSignal,
} from '@tma.js/sdk-react';
import type { TelegramWebAppData, TelegramWebAppThemeParams } from '@/types/telegram';

export interface TelegramUser {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isPremium?: boolean;
    photoUrl?: string;
}

export function useTelegram() {
    // 1. Dapatkan objek resmi Telegram WebApp dari window (jika tersedia)
    const tgWebApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

    // 2. Dapatkan reactive state dari @tma.js jika terinisialisasi
    const tmaInitDataState = useSignal(tmaInitData.state);
    const tmaIsDark = useSignal(tmaMiniApp.isDark);
    const tmaTheme = useSignal(tmaThemeParams.state);

    // 3. Ekstrak data user (prioritaskan tgWebApp.initDataUnsafe karena paling reliable di Mini App asli)
    const user: TelegramUser | undefined = useMemo(() => {
        // Prioritas A: Window.Telegram.WebApp (official Telegram client)
        const tgUser: TelegramWebAppData | undefined = tgWebApp?.initDataUnsafe?.user;
        if (tgUser && tgUser.id) {
            return {
                id: tgUser.id,
                firstName: tgUser.first_name,
                lastName: tgUser.last_name,
                username: tgUser.username,
                languageCode: tgUser.language_code,
                isPremium: Boolean(tgUser.is_premium),
                photoUrl: tgUser.photo_url,
            };
        }

        // Prioritas B: @tma.js SDK initData
        if (tmaInitDataState?.user) {
            const u = tmaInitDataState.user;
            return {
                id: u.id,
                firstName: u.first_name,
                lastName: u.last_name,
                username: u.username,
                languageCode: u.language_code,
                isPremium: Boolean(u.is_premium),
                photoUrl: u.photo_url,
            };
        }

        return undefined;
    }, [tgWebApp?.initDataUnsafe?.user, tmaInitDataState?.user]);

    // 4. Raw InitData & StartParam
    const initDataRaw = tgWebApp?.initData || (tmaInitDataState ? JSON.stringify(tmaInitDataState) : '');
    const startParam = tgWebApp?.initDataUnsafe?.start_param;

    // 5. Environment & Platform
    const platform = tgWebApp?.platform || 'unknown';
    const version = tgWebApp?.version || 'unknown';
    const isTMA = Boolean(
        (tgWebApp?.initData && tgWebApp.initData.length > 0) ||
        (typeof window !== 'undefined' && window.location.hash.includes('tgWebAppData'))
    );

    // 6. Theme & Colors
    const isDark = tgWebApp?.colorScheme === 'dark' || Boolean(tmaIsDark);
    const themeParams: TelegramWebAppThemeParams = useMemo(() => {
        return {
            bg_color: tgWebApp?.themeParams?.bg_color || tmaTheme?.bgColor,
            text_color: tgWebApp?.themeParams?.text_color || tmaTheme?.textColor,
            hint_color: tgWebApp?.themeParams?.hint_color || tmaTheme?.hintColor,
            link_color: tgWebApp?.themeParams?.link_color || tmaTheme?.linkColor,
            button_color: tgWebApp?.themeParams?.button_color || tmaTheme?.buttonColor,
            button_text_color: tgWebApp?.themeParams?.button_text_color || tmaTheme?.buttonTextColor,
            secondary_bg_color: tgWebApp?.themeParams?.secondary_bg_color || tmaTheme?.secondaryBgColor,
            header_bg_color: tgWebApp?.themeParams?.header_bg_color || tmaTheme?.headerBgColor,
            bottom_bar_bg_color: tgWebApp?.themeParams?.bottom_bar_bg_color || tmaTheme?.bottomBarBgColor,
            accent_text_color: tgWebApp?.themeParams?.accent_text_color || tmaTheme?.accentTextColor,
        };
    }, [tgWebApp?.themeParams, tmaTheme]);

    // 7. Viewport
    const viewportHeight = tgWebApp?.viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 0);
    const isExpanded = tgWebApp?.isExpanded ?? true;

    // 8. MainButton Controller (Unified)
    const mainButton = useMemo(() => ({
        setText(text: string) {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.setText(text);
            try { tmaMainButton.setText(text); } catch {}
        },
        show() {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.show();
            try { tmaMainButton.show(); } catch {}
        },
        hide() {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.hide();
            try { tmaMainButton.hide(); } catch {}
        },
        enable() {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.enable();
            try { tmaMainButton.enable(); } catch {}
        },
        disable() {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.disable();
            try { tmaMainButton.disable(); } catch {}
        },
        showProgress(leaveActive?: boolean) {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.showProgress(leaveActive);
            try { tmaMainButton.showLoader(); } catch {}
        },
        hideProgress() {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.hideProgress();
            try { tmaMainButton.hideLoader(); } catch {}
        },
        onClick(callback: () => void) {
            if (tgWebApp?.MainButton) tgWebApp.MainButton.onClick(callback);
            let offTma: (() => void) | undefined;
            try { offTma = tmaMainButton.onClick(callback); } catch {}
            return () => {
                if (tgWebApp?.MainButton) tgWebApp.MainButton.offClick(callback);
                offTma?.();
            };
        },
        mount() {
            try { tmaMainButton.mount(); } catch {}
        },
    }), [tgWebApp]);

    // 9. BackButton Controller (Unified)
    const backButton = useMemo(() => ({
        show() {
            if (tgWebApp?.BackButton) tgWebApp.BackButton.show();
            try { tmaBackButton.show(); } catch {}
        },
        hide() {
            if (tgWebApp?.BackButton) tgWebApp.BackButton.hide();
            try { tmaBackButton.hide(); } catch {}
        },
        onClick(callback: () => void) {
            if (tgWebApp?.BackButton) tgWebApp.BackButton.onClick(callback);
            let offTma: (() => void) | undefined;
            try { offTma = tmaBackButton.onClick(callback); } catch {}
            return () => {
                if (tgWebApp?.BackButton) tgWebApp.BackButton.offClick(callback);
                offTma?.();
            };
        },
        mount() {
            try { tmaBackButton.mount(); } catch {}
        },
    }), [tgWebApp]);

    // 10. Core App Actions
    const ready = useCallback(() => {
        if (tgWebApp?.ready) tgWebApp.ready();
        try { tmaMiniApp.ready(); } catch {}
    }, [tgWebApp]);

    const expand = useCallback(() => {
        if (tgWebApp?.expand) tgWebApp.expand();
    }, [tgWebApp]);

    const close = useCallback(() => {
        if (tgWebApp?.close) tgWebApp.close();
        try { tmaMiniApp.close(); } catch {}
    }, [tgWebApp]);

    const showAlert = useCallback((message: string, callback?: () => void) => {
        if (tgWebApp?.showAlert) {
            tgWebApp.showAlert(message, callback);
        } else {
            alert(message);
            callback?.();
        }
    }, [tgWebApp]);

    const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
        if (tgWebApp?.showConfirm) {
            tgWebApp.showConfirm(message, callback);
        } else {
            const result = confirm(message);
            callback?.(result);
        }
    }, [tgWebApp]);

    const openLink = useCallback((url: string, options?: { tryInstantView?: boolean }) => {
        if (tgWebApp?.openLink) {
            tgWebApp.openLink(url, { try_instant_view: options?.tryInstantView });
        } else {
            window.open(url, '_blank');
        }
    }, [tgWebApp]);

    const openTelegramLink = useCallback((url: string) => {
        if (tgWebApp?.openTelegramLink) {
            tgWebApp.openTelegramLink(url);
        } else {
            window.open(url, '_blank');
        }
    }, [tgWebApp]);

    const haptic = useMemo(() => ({
        impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') {
            tgWebApp?.HapticFeedback?.impactOccurred(style);
        },
        notification(type: 'error' | 'success' | 'warning') {
            tgWebApp?.HapticFeedback?.notificationOccurred(type);
        },
        selection() {
            tgWebApp?.HapticFeedback?.selectionChanged();
        },
    }), [tgWebApp]);

    return {
        user,
        initData: initDataRaw,
        initDataRaw,
        startParam,
        platform,
        version,
        isDark,
        isTMA,
        themeParams,
        viewportHeight,
        isExpanded,
        mainButton,
        backButton,
        ready,
        expand,
        close,
        showAlert,
        showConfirm,
        openLink,
        openTelegramLink,
        haptic,
        // Akses langsung ke raw instances jika diperlukan
        raw: {
            tgWebApp,
            tma: {
                miniApp: tmaMiniApp,
                mainButton: tmaMainButton,
                backButton: tmaBackButton,
                themeParams: tmaThemeParams,
                viewport: tmaViewport,
                initData: tmaInitData,
            },
        },
    };
}
