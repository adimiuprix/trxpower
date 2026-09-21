import { init } from '@tma.js/sdk-react';
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
 * - Auto init SDK
 * - Auto mock environment di development mode
 * - Graceful error handling (tidak block rendering)
 */
export function TelegramProvider({ children }: TelegramProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        try {
            // Setup mock environment untuk testing
            setupTelegramMock();

            // Initialize SDK
            init();

            setIsInitialized(true);
            console.log('✅ Telegram SDK initialized');
        } catch (error) {
            // Jangan block rendering jika SDK gagal init
            console.warn(
                '⚠️ Telegram SDK initialization failed (non-blocking):',
                error,
            );
            setIsInitialized(true); // tetap render children
        }
    }, []);

    // Render children immediately, SDK init berjalan di background
    return <>{children}</>;
}
