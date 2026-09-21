import {
    backButton,
    closingBehavior,
    initData,
    mainButton,
    miniApp,
    themeParams,
    viewport,
    popup,
    openLink,
    useLaunchParams,
    useSignal,
} from '@tma.js/sdk-react';

/**
 * Custom hook untuk akses mudah ke Telegram Mini App SDK
 * Components dari @tma.js/sdk sudah ter-mount dan ready untuk digunakan
 *
 * @example
 * const telegram = useTelegram();
 *
 * // Tampilkan main button
 * telegram.mainButton.setText('Submit');
 * telegram.mainButton.show();
 * telegram.mainButton.onClick(() => console.log('Clicked!'));
 */
export function useTelegram() {
    const lp = useLaunchParams();

    // Get init data state dengan useSignal
    const initDataState = useSignal(initData.state);

    return {
        // User data
        user: initDataState?.user,
        initData: initDataState,
        startParam: lp.startParam,

        // App info
        platform: lp.platform,
        version: lp.version,

        // UI Controls (components) - gunakan langsung, sudah reactive
        miniApp,
        mainButton,
        backButton,
        closingBehavior,
        popup,
        openLink,

        // Theme & Layout - return components untuk digunakan dengan useSignal
        themeParams,
        viewport: viewport.state,

        // Helpers
        isDark: miniApp.isDark,
    };
}
