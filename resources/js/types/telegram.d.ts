/**
 * Telegram Mini App Type Definitions
 */

export interface TelegramWebAppData {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    allows_write_to_pm?: boolean;
    photo_url?: string;
}

export interface TelegramWebAppInitDataUnsafe {
    query_id?: string;
    user?: TelegramWebAppData;
    receiver?: TelegramWebAppData;
    start_param?: string;
    auth_date?: number;
    hash?: string;
    chat_type?: string;
    chat_instance?: string;
}

export interface TelegramWebAppThemeParams {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    header_bg_color?: string;
    bottom_bar_bg_color?: string;
    accent_text_color?: string;
    section_bg_color?: string;
    section_header_text_color?: string;
    subtitle_text_color?: string;
    destructive_text_color?: string;
    [key: string]: string | undefined;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: TelegramWebAppInitDataUnsafe;
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: TelegramWebAppThemeParams;
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    BackButton: {
        isVisible: boolean;
        onClick(cb: () => void): void;
        offClick(cb: () => void): void;
        show(): void;
        hide(): void;
    };
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText(text: string): void;
        onClick(cb: () => void): void;
        offClick(cb: () => void): void;
        show(): void;
        hide(): void;
        enable(): void;
        disable(): void;
        showProgress(leaveActive?: boolean): void;
        hideProgress(): void;
        setParams(params: Record<string, any>): void;
    };
    HapticFeedback?: {
        impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
        notificationOccurred(type: 'error' | 'success' | 'warning'): void;
        selectionChanged(): void;
    };
    ready(): void;
    expand(): void;
    close(): void;
    showAlert(message: string, callback?: () => void): void;
    showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
    openLink(url: string, options?: { try_instant_view?: boolean }): void;
    openTelegramLink(url: string): void;
    sendData(data: string): void;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp?: TelegramWebApp;
        };
    }
}
