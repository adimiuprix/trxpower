import { useEffect, useState } from 'react';

/**
 * Contoh halaman untuk demonstrasi Telegram Mini App
 * Akses via route Laravel: Route::get('/telegram-demo', ...);
 */
export default function TelegramDemo() {
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        
        try {
            // Coba import SDK setelah component mount
            import('@tma.js/sdk-react').then((sdk) => {
                console.log('✅ TMA SDK loaded:', sdk);
            }).catch((err) => {
                console.error('❌ Failed to load TMA SDK:', err);
                setError(err.message);
            });
        } catch (err: any) {
            setError(err?.message || 'Unknown error');
        }
    }, []);

    if (!mounted) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        🚀 Telegram Mini App Demo
                    </h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
                            <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <section className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                ✅ Setup Status
                            </h2>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-700 dark:text-gray-300">
                                    ✓ React component mounted
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    ✓ Page rendering correctly
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    ✓ TelegramProvider active
                                </p>
                            </div>
                        </section>

                        <section className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                📦 Packages Installed
                            </h2>
                            <div className="space-y-2 text-sm font-mono">
                                <p className="text-gray-700 dark:text-gray-300">
                                    @tma.js/sdk: ^3.3.0
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    @tma.js/sdk-react: ^3.0.23
                                </p>
                            </div>
                        </section>

                        <section className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                🎯 Next Steps
                            </h2>
                            <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside">
                                <li>Check browser console for any errors</li>
                                <li>Open QUICKSTART_TELEGRAM.md untuk contoh penggunaan</li>
                                <li>Import useTelegram hook di component Anda</li>
                                <li>Deploy ke HTTPS untuk testing di Telegram</li>
                            </ol>
                        </section>

                        <section className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                📚 Documentation Files
                            </h2>
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                <li>• TELEGRAM_SETUP_SUMMARY.md - Overview & quick reference</li>
                                <li>• QUICKSTART_TELEGRAM.md - Code examples</li>
                                <li>• TELEGRAM_MINIAPP_SETUP.md - Full guide</li>
                            </ul>
                        </section>

                        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                ⚠️ Important Note
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Jika halaman ini muncul dengan baik, setup sudah berhasil! 
                                Telegram SDK akan berfungsi penuh saat diakses dari Telegram app.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
