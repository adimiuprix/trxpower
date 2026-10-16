/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string;
    readonly VITE_TELEGRAM_BOT_APP: string;
    readonly VITE_TELEGRAM_CHANNEL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
