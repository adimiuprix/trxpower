import { useTelegramContext } from '@/providers/TelegramProvider';

/**
 * Loading screen yang ditampilkan saat authentication
 */
export default function AuthLoadingScreen() {
    const { themeParams } = useTelegramContext();

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: themeParams.bg_color || '#000000',
                color: themeParams.text_color || '#ffffff',
                zIndex: 9999,
            }}
        >
            {/* Spinner */}
            <div
                style={{
                    width: '60px',
                    height: '60px',
                    border: `4px solid ${themeParams.hint_color || 'rgba(255,255,255,0.2)'}`,
                    borderTop: `4px solid ${themeParams.button_color || '#e11d48'}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }}
            />

            {/* Text */}
            <p
                style={{
                    marginTop: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: themeParams.hint_color || 'rgba(255,255,255,0.6)',
                }}
            >
                Authenticating...
            </p>

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
