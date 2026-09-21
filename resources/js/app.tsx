import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';

void createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx', { eager: true });
        return pages[`./pages/${name}.tsx`];
    },
    title: (title) => title,
});
