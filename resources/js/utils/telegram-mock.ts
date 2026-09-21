import { mockTelegramEnv, isTMA } from '@tma.js/sdk';

/**
 * Setup mock Telegram environment untuk testing di browser
 * Berguna saat development tanpa perlu Telegram
 */
export function setupTelegramMock() {
    if (!isTMA() && import.meta.env.DEV) {
        console.log('🔧 Running in mock Telegram environment');

        // Mock dengan launch params minimal
        mockTelegramEnv({
            launchParams: new URLSearchParams({
                tgWebAppPlatform: 'web',
                tgWebAppVersion: '7.0',
            }),
        });
    }
}

/**
 * Check apakah aplikasi berjalan di Telegram
 */
export function isTelegramEnvironment(): boolean {
    return isTMA();
}
