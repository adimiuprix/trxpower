import { init, initData } from '@tma.js/sdk-react';
import { ReactNode, useEffect, useState } from 'react';
import { setupTelegramMock } from '@/utils/telegram-mock';

interface TelegramProviderProps {
    children: ReactNode;
}

/**
 * Provider untuk Telegram Mini App SDK
 * Wrap aplikasi Anda dengan provider ini untuk mengakses TMA features
 *
 * Features:
 * - Auto init native Telegram WebApp & @tma.js SDK
 * - Restores initData safely
 * - Auto mock environment di development mode
 * - Graceful error handling (tidak block rendering)
 */
export function TelegramProvider({ children }: TelegramProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            // 1. Setup mock environment untuk testing di browser lokal
            setupTelegramMock();

            // 2. Inisialisasi official Telegram WebApp SDK (jika diakses via Telegram)
            if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
            }

            // 3. Inisialisasi @tma.js SDK
            try {
                init();
            } catch (error) {
                console.warn('⚠️ @tma.js init notice:', error);
            }

            // 4. Restore initData agar state sinyal terisi
            try {
                initData.restore();
            } catch (error) {
                console.warn('⚠️ @tma.js initData.restore notice:', error);
            }

            setIsInitialized(true);
            console.log('✅ Telegram Mini App environment ready');
        } catch (error) {
            console.warn(
                '⚠️ Telegram SDK initialization warning (non-blocking):',
                error,
            );
            setIsInitialized(true);
        }
    }, []);

    return <>{children}</>;
}
