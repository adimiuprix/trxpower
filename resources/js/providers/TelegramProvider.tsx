import { init, initData } from '@tma.js/sdk-react';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { setupTelegramMock } from '@/utils/telegram-mock';
import { useTelegram } from '@/hooks/useTelegram';
import type { TelegramUser } from '@/hooks/useTelegram';
import type { TelegramWebAppThemeParams } from '@/types/telegram';
import { telegramAuthService, type AuthResponse, type DbUser } from '@/services/telegramAuthService';

// Data user dari database (includes balance, wallet, etc.)
export interface UserResponse extends DbUser {
    last_active_at?: string | null;
}

interface TelegramProviderProps {
    children: ReactNode;
}

// Context untuk menyimpan Telegram data
interface TelegramContextValue {
    user: TelegramUser | undefined;
    dbUser: UserResponse | null; // Data user dari database (termasuk balance)
    initData: string;
    initDataRaw: string;
    startParam: string | undefined;
    platform: string;
    version: string;
    isDark: boolean;
    isTMA: boolean;
    themeParams: TelegramWebAppThemeParams;
    viewportHeight: number;
    isExpanded: boolean;
    mainButton: ReturnType<typeof useTelegram>['mainButton'];
    backButton: ReturnType<typeof useTelegram>['backButton'];
    ready: () => void;
    expand: () => void;
    close: () => void;
    showAlert: (message: string, callback?: () => void) => void;
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
    openLink: (url: string, options?: { tryInstantView?: boolean }) => void;
    openTelegramLink: (url: string) => void;
    haptic: ReturnType<typeof useTelegram>['haptic'];
    raw: ReturnType<typeof useTelegram>['raw'];
    isAuthenticating: boolean;
    isAuthenticated: boolean;
    refreshDbUser: () => Promise<void>;
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined);

/**
 * Provider untuk Telegram Mini App SDK
 * Wrap aplikasi Anda dengan provider ini untuk mengakses TMA features
 *
 * Features:
 * - Auto init native Telegram WebApp & @tma.js SDK
 * - Restores initData safely
 * - Auto mock environment di development mode
 * - Graceful error handling (tidak block rendering)
 * - Menyediakan Telegram data via Context untuk semua children
 * - Auto-authentication: Check dan simpan user ke database
 */
export function TelegramProvider({ children }: TelegramProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [dbUser, setDbUser] = useState<UserResponse | null>(null);

    const refreshDbUser = async () => {
        try {
            const meResult = await telegramAuthService.me();
            if (meResult.success && meResult.data) {
                setDbUser(meResult.data);
            }
        } catch (e) {
            console.warn('⚠️ Failed to refresh user data:', e);
        }
    };

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

    // Dapatkan semua Telegram data dari hook
    const telegram = useTelegram();

    // Auto-authentication saat user data tersedia
    useEffect(() => {
        async function authenticateUser() {
            // Skip jika tidak ada user data atau sudah authenticated
            if (!telegram.user || isAuthenticated || isAuthenticating) {
                return;
            }

            // Skip jika sudah ada token di localStorage - langsung fetch /me
            if (telegramAuthService.isAuthenticated()) {
                setIsAuthenticated(true);
                console.log('✅ User already authenticated (token found)');
                // Fetch user data from DB to get balance
                try {
                    const meResult = await telegramAuthService.me();
                    if (meResult.success && meResult.data) {
                        setDbUser(meResult.data);
                    }
                } catch (e) {
                    console.warn('⚠️ Failed to fetch /me data:', e);
                }
                return;
            }

            setIsAuthenticating(true);
            console.log('🔐 Authenticating user with Telegram initData...', {
                telegram_id: telegram.user.id,
                username: telegram.user.username,
            });

            try {
                // Get initData from Telegram WebApp
                const initData = telegram.initDataRaw;

                if (!initData) {
                    console.error('❌ No initData available from Telegram');
                    setIsAuthenticating(false);
                    return;
                }

                // Authenticate with initData (secure)
                const result: AuthResponse = await telegramAuthService.authenticate({
                    initData,
                });

                if (result.success) {
                    setIsAuthenticated(true);

                    // Simpan data user dari DB (termasuk balance)
                    if (result.data) {
                        // Extract only DbUser fields (exclude token & is_new_user)
                        const { token, is_new_user, ...userData } = result.data;
                        setDbUser(userData);
                    }

                    if (result.data?.is_new_user) {
                        console.log('🎉 New user created in database!');
                        telegram.haptic.notification('success');
                    } else {
                        console.log('👋 Welcome back!');
                    }
                } else {
                    console.error('❌ Authentication failed:', result.message);
                }
            } catch (error) {
                console.error('❌ Authentication error:', error);
            } finally {
                setIsAuthenticating(false);
            }
        }

        authenticateUser();
    }, [telegram.user, isAuthenticated, isAuthenticating]);

    return (
        <TelegramContext.Provider
            value={{
                ...telegram,
                dbUser,
                isAuthenticating,
                isAuthenticated,
                refreshDbUser,
            }}
        >
            {children}
        </TelegramContext.Provider>
    );
}

/**
 * Hook untuk mengakses Telegram data di halaman manapun
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   const { user, isDark, showAlert } = useTelegramContext();
 *   
 *   return (
 *     <div>
 *       <h1>Hello {user?.firstName}!</h1>
 *       <button onClick={() => showAlert('Hello!')}>Alert</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTelegramContext() {
    const context = useContext(TelegramContext);
    
    if (context === undefined) {
        throw new Error('useTelegramContext must be used within TelegramProvider');
    }
    
    return context;
}

/**
 * Hook untuk mengakses Telegram user data secara langsung
 * 
 * @example
 * ```tsx
 * function UserProfile() {
 *   const user = useTelegramUser();
 *   
 *   if (!user) {
 *     return <div>Loading user data...</div>;
 *   }
 *   
 *   return <div><h2>{user.firstName}</h2></div>;
 * }
 * ```
 */
export function useTelegramUser(): TelegramUser | undefined {
    const { user } = useTelegramContext();
    return user;
}
