export interface TelegramAuthData {
    initData: string; // Raw initData from Telegram WebApp
}

export interface MiningHistory {
    id: number;
    plan_id: number;
    status: 'active' | 'inactive';
    last_sum: number;
    expire_date: number;
    created_at: string;
    plan: {
        earning_rate: number;
        daily_profit: number;
        hashrate: string;
    };
}

export interface Referrals {
    id: number;
    username: string | null; 
    photo_url: string | null;
}

export interface Transaction {
    id: number;
    type: 'deposit' | 'withdraw' | 'mining';
    amount: string;
    address: string | null;
    tx_hash: string | null;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
}

export interface DbUser { 
    id: number; 
    telegram_id: number; 
    first_name: string; 
    last_name: string | null; 
    username: string | null; 
    language_code: string | null; 
    is_premium: boolean; 
    photo_url: string | null; 
    balance: number; 
    earning: number;
    wallet_balance: number; 
    referral_code: string;
    referral_total: number;
    referrals: Referrals[];
    payout_address: string;
    mining_histories?: MiningHistory[];
    transactions?: Transaction[];
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: DbUser & {
            is_new_user: boolean;
            token: string;
        };
    errors?: Record<string, string[]>;
    error?: string;
}

export interface UserResponse {
    success: boolean;
    data?: DbUser & {
        last_active_at: string | null;
    };
    message?: string;
}

class TelegramAuthService {
    private token: string | null = null;
    private readonly TOKEN_KEY = 'telegram_auth_token';
    private getBaseURL(): string {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const match = path.match(/^(\/[^\/]+\/public)/);
            if (match) {
                return `${match[1]}/api/telegram`;
            }
        }
        return '/api/telegram';
    }

    constructor() {
        // Load token from localStorage on init
        this.token = localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get headers with token
     */
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Handle fetch response
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                success: false,
                message: `HTTP error! status: ${response.status}`,
            }));
            return errorData as T;
        }
        return response.json();
    }

    /**
     * Authenticate user dengan Telegram data
     */
    async authenticate(DbUser: TelegramAuthData): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.getBaseURL()}/auth`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(DbUser),
            });

            const data = await this.handleResponse<AuthResponse>(response);

            if (data.success && data.data?.token) {
                // Save token to localStorage
                this.token = data.data.token;
                localStorage.setItem(this.TOKEN_KEY, this.token);

                console.log('✅ User authenticated successfully', {
                    telegram_id: data.data.telegram_id,
                    is_new_user: data.data.is_new_user,
                });
            }

            return data;
        } catch (error) {
            console.error('❌ Authentication failed:', error);

            return {
                success: false,
                message: 'Network error or server unavailable',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get current authenticated user data
     */
    async me(): Promise<UserResponse> {
        try {
            if (!this.token) {
                return {
                    success: false,
                    message: 'No authentication token found',
                };
            }

            const response = await fetch(`${this.getBaseURL()}/me`, {
                method: 'GET',
                headers: this.getHeaders(),
            });

            const data = await this.handleResponse<UserResponse>(response);

            // If 401, clear token
            if (!response.ok && response.status === 401) {
                this.clearToken();
            }

            return data;
        } catch (error) {
            console.error('❌ Failed to get user data:', error);

            return {
                success: false,
                message: 'Failed to fetch user data',
            };
        }
    }

    /**
     * Logout dan hapus token
     */
    async logout(): Promise<void> {
        try {
            if (this.token) {
                await fetch(`${this.getBaseURL()}/logout`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                });
            }
        } catch (error) {
            console.error('❌ Logout failed:', error);
        } finally {
            this.clearToken();
        }
    }

    /**
     * Clear token from memory and storage
     */
    private clearToken(): void {
        this.token = null;
        localStorage.removeItem(this.TOKEN_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.token;
    }

    /**
     * Get current token
     */
    getToken(): string | null {
        return this.token;
    }
}

// Export singleton instance
export const telegramAuthService = new TelegramAuthService();
