/**
 * Telegram Mini App Type Definitions
 * Auto-completion untuk Telegram SDK
 */

declare module '@/hooks/useTelegram' {
    import type {
        InitData,
        LaunchParams,
        MiniApp,
        ThemeParams,
        Viewport,
        MainButton,
        BackButton,
        ClosingBehavior,
        Popup,
    } from '@tma.js/sdk';
    import type { Computed } from '@tma.js/signals';

    export interface UseTelegramReturn {
        // User data
        user: InitData['user'] | undefined;
        initData: InitData | undefined;
        startParam: string | undefined;

        // App info
        platform: LaunchParams['platform'];
        version: LaunchParams['version'];

        // UI Controls
        miniApp: MiniApp;
        mainButton: MainButton;
        backButton: BackButton;
        closingBehavior: ClosingBehavior;
        popup: Popup;
        openLink: (
            url: string,
            options?: {
                tryBrowser?: string | boolean;
                tryInstantView?: boolean;
            },
        ) => void;

        // UI State
        mainButtonIsVisible: boolean;
        backButtonIsVisible: boolean;

        // Theme & Layout
        themeParams: ThemeParams | undefined;
        viewport: Viewport | undefined;

        // Helpers
        isDark: Computed<boolean>;
    }

    export function useTelegram(): UseTelegramReturn;
}
