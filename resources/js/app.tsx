import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';
import { TelegramProvider } from './providers/TelegramProvider';
import { setupTelegramMock } from './utils/telegram-mock';

// Siapkan mock environment lebih awal di dev mode agar data langsung tersedia saat initial render
setupTelegramMock();

void createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>(
            './pages/**/*.tsx',
            { eager: true },
        );
        return pages[`./pages/${name}.tsx`];
    },
    title: (title) => title,
    setup({ el, App, props }) {
        // Wrap dengan TelegramProvider untuk akses TMA SDK
        createRoot(el).render(
            <TelegramProvider>
                <App {...props} />
            </TelegramProvider>,
        );
    },
});
