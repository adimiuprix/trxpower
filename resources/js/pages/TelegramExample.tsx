import { useTelegram } from '@/hooks/useTelegram';
import { useSignal, themeParams as themeParamsComponent } from '@tma.js/sdk-react';
import { useEffect, useState } from 'react';

/**
 * Contoh halaman dengan full TMA SDK integration
 * Akses via route: Route::get('/telegram-example', ...);
 */
export default function TelegramExample() {
    const telegram = useTelegram();
    const [isReady, setIsReady] = useState(false);
    
    // Gunakan useSignal untuk reactive values dari Computed
    const isDark = useSignal(telegram.isDark);
    const bgColor = useSignal(themeParamsComponent.bgColor);
    const textColor = useSignal(themeParamsComponent.textColor);
    const buttonColor = useSignal(themeParamsComponent.buttonColor);

    useEffect(() => {
        try {
            // Mount components
            telegram.miniApp.mount();
            telegram.mainButton.mount();
            telegram.backButton.mount();
            
            // Set ready state
            telegram.miniApp.ready();

            // Konfigurasi Main Button
            telegram.mainButton.setText('Kirim Data');
            telegram.mainButton.show();
            
            const offMain = telegram.mainButton.onClick(() => {
                alert('✅ Main Button clicked!');
            });

            // Konfigurasi Back Button
            telegram.backButton.show();
            const offBack = telegram.backButton.onClick(() => {
                window.history.back();
            });

            setIsReady(true);

            // Cleanup
            return () => {
                offMain();
                offBack();
                telegram.mainButton.hide();
                telegram.backButton.hide();
            };
        } catch (error) {
            console.error('TMA SDK error:', error);
        }
    }, []);

    return (
        <div
            style={{
                backgroundColor: bgColor || '#ffffff',
                color: textColor || '#000000',
                minHeight: telegram.viewport ? `${telegram.viewport.height}px` : '100vh',
                padding: '20px',
            }}
        >
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    🚀 Telegram Mini App
                </h1>

                <div className="space-y-4">
                    {/* Status */}
                    <section className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4">Status</h2>
                        <div className="space-y-2 text-sm">
                            <p>✅ SDK Ready: {isReady ? 'Yes' : 'No'}</p>
                            <p>🎨 Theme: {isDark ? 'Dark' : 'Light'}</p>
                            <p>📱 Platform: {telegram.platform}</p>
                            <p>🔢 Version: {telegram.version}</p>
                        </div>
                    </section>

                    {/* User Info */}
                    <section className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4">User Info</h2>
                        {telegram.user ? (
                            <div className="space-y-2 text-sm">
                                <p><strong>ID:</strong> {telegram.user.id}</p>
                                <p><strong>Name:</strong> {telegram.user.firstName} {telegram.user.lastName}</p>
                                {telegram.user.username && (
                                    <p><strong>Username:</strong> @{telegram.user.username}</p>
                                )}
                                <p><strong>Language:</strong> {telegram.user.languageCode}</p>
                                <p><strong>Premium:</strong> {telegram.user.isPremium ? 'Yes ⭐' : 'No'}</p>
                            </div>
                        ) : (
                            <p className="text-sm opacity-70">
                                User data akan muncul saat diakses dari Telegram
                            </p>
                        )}
                    </section>

                    {/* Theme Colors */}
                    <section className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4">Theme Colors</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-12 h-12 rounded-lg border-2 border-white/20"
                                    style={{ backgroundColor: bgColor || '#ccc' }}
                                />
                                <div className="text-sm">
                                    <p className="font-semibold">Background</p>
                                    <p className="opacity-70 font-mono">{bgColor || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-12 h-12 rounded-lg border-2 border-white/20"
                                    style={{ backgroundColor: textColor || '#ccc' }}
                                />
                                <div className="text-sm">
                                    <p className="font-semibold">Text</p>
                                    <p className="opacity-70 font-mono">{textColor || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-12 h-12 rounded-lg border-2 border-white/20"
                                    style={{ backgroundColor: buttonColor || '#ccc' }}
                                />
                                <div className="text-sm">
                                    <p className="font-semibold">Button</p>
                                    <p className="opacity-70 font-mono">{buttonColor || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
                        <div className="grid gap-3">
                            <button
                                onClick={() => alert('Hello from Mini App!')}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Show Alert
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure?')) {
                                        alert('Confirmed! ✅');
                                    }
                                }}
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Show Confirm
                            </button>
                            <button
                                onClick={() => {
                                    telegram.openLink('https://t.me', {
                                        tryInstantView: true,
                                    });
                                }}
                                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Open Telegram Link
                            </button>
                        </div>
                    </section>

                    {/* Info Box */}
                    <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 p-6 rounded-xl">
                        <p className="text-sm">
                            💡 <strong>Tip:</strong> Main button dan back button sudah aktif. 
                            Coba klik main button di bottom Telegram untuk test!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
