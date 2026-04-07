// Advanced User Settings System
class UserSettingsSystem {
    private static instance: UserSettingsSystem;
    private settings: UserSettings;
    private storageKey: string = 'userSettings';
    private isInitialized: boolean = false;
    private syncInterval: number | null = null;
    private syncEndpoint: string = '/api/user/settings';

    private constructor() {
        this.settings = this.getDefaultSettings();
        this.init();
    }

    public static getInstance(): UserSettingsSystem {
        if (!UserSettingsSystem.instance) {
            UserSettingsSystem.instance = new UserSettingsSystem();
        }
        return UserSettingsSystem.instance;
    }

    private async init(): Promise<void> {
        if (this.isInitialized) return;

        // Load settings from localStorage
        this.loadSettings();

        // Sync with server if user is logged in
        if (this.isUserLoggedIn()) {
            await this.syncWithServer();
        }

        // Setup periodic sync
        this.setupPeriodicSync();

        // Listen for setting changes
        this.setupChangeListeners();

        this.isInitialized = true;
    }

    private getDefaultSettings(): UserSettings {
        return {
            language: 'ar',
            theme: 'light',
            notifications: {
                enabled: true,
                types: {
                    email: true,
                    push: false,
                    inApp: true
                }
            },
            preferences: {
                autoPlay: false,
                highQuality: false,
                reducedMotion: false,
                fontSize: 'medium'
            },
            filters: {
                favorites: [],
                recent: [],
                custom: {}
            },
            accessibility: {
                highContrast: false,
                screenReader: false,
                keyboardNavigation: true
            },
            privacy: {
                analytics: true,
                personalization: true,
                cookies: 'necessary'
            }
        };
    }

    private loadSettings(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const loadedSettings = JSON.parse(stored);
                // Merge with defaults to ensure all settings exist
                this.settings = this.mergeSettings(this.getDefaultSettings(), loadedSettings);
            }
        } catch (error) {
            console.error('Failed to load user settings:', error);
        }
    }

    private saveSettings(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));

            // Trigger settings change event
            const event = new CustomEvent('settingsChanged', {
                detail: { settings: this.settings }
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Failed to save user settings:', error);
        }
    }

    private mergeSettings(defaults: UserSettings, loaded: any): UserSettings {
        return {
            language: loaded.language || defaults.language,
            theme: loaded.theme || defaults.theme,
            notifications: {
                enabled: loaded.notifications?.enabled ?? defaults.notifications.enabled,
                types: {
                    email: loaded.notifications?.types?.email ?? defaults.notifications.types.email,
                    push: loaded.notifications?.types?.push ?? defaults.notifications.types.push,
                    inApp: loaded.notifications?.types?.inApp ?? defaults.notifications.types.inApp
                }
            },
            preferences: {
                autoPlay: loaded.preferences?.autoPlay ?? defaults.preferences.autoPlay,
                highQuality: loaded.preferences?.highQuality ?? defaults.preferences.highQuality,
                reducedMotion: loaded.preferences?.reducedMotion ?? defaults.preferences.reducedMotion,
                fontSize: loaded.preferences?.fontSize || defaults.preferences.fontSize
            },
            filters: {
                favorites: loaded.filters?.favorites || defaults.filters.favorites,
                recent: loaded.filters?.recent || defaults.filters.recent,
                custom: loaded.filters?.custom || defaults.filters.custom
            },
            accessibility: {
                highContrast: loaded.accessibility?.highContrast ?? defaults.accessibility.highContrast,
                screenReader: loaded.accessibility?.screenReader ?? defaults.accessibility.screenReader,
                keyboardNavigation: loaded.accessibility?.keyboardNavigation ?? defaults.accessibility.keyboardNavigation
            },
            privacy: {
                analytics: loaded.privacy?.analytics ?? defaults.privacy.analytics,
                personalization: loaded.privacy?.personalization ?? defaults.privacy.personalization,
                cookies: loaded.privacy?.cookies || defaults.privacy.cookies
            }
        };
    }

    private isUserLoggedIn(): boolean {
        return !!localStorage.getItem('authToken');
    }

    private async syncWithServer(): Promise<void> {
        try {
            const response = await fetch(this.syncEndpoint, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const serverSettings = await response.json();
                this.settings = this.mergeSettings(this.settings, serverSettings);
                this.saveSettings();
            }
        } catch (error) {
            console.error('Failed to sync settings with server:', error);
        }
    }

    private async pushToServer(): Promise<void> {
        if (!this.isUserLoggedIn()) return;

        try {
            await fetch(this.syncEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(this.settings)
            });
        } catch (error) {
            console.error('Failed to push settings to server:', error);
        }
    }

    private setupPeriodicSync(): void {
        // Sync every 5 minutes
        this.syncInterval = window.setInterval(() => {
            this.pushToServer();
        }, 5 * 60 * 1000);
    }

    private setupChangeListeners(): void {
        // Listen for language changes
        document.addEventListener('languageChanged', (e: any) => {
            this.setSetting('language', e.detail.language);
        });

        // Listen for theme changes
        document.addEventListener('themeChange', (e: any) => {
            this.setSetting('theme', e.detail.theme);
        });
    }

    // Public API
    public getSetting<K extends keyof UserSettings>(key: K): UserSettings[K] {
        return this.settings[key];
    }

    public setSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]): void {
        this.settings[key] = value;
        this.saveSettings();
        this.pushToServer();
    }

    public updateSettings(updates: Partial<UserSettings>): void {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
        this.pushToServer();
    }

    public resetSettings(): void {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        this.pushToServer();
    }

    public getSettings(): UserSettings {
        return { ...this.settings };
    }

    // Convenience methods for common settings
    public getLanguage(): string {
        return this.settings.language;
    }

    public setLanguage(language: string): void {
        this.setSetting('language', language);
    }

    public getTheme(): 'light' | 'dark' {
        return this.settings.theme;
    }

    public setTheme(theme: 'light' | 'dark'): void {
        this.setSetting('theme', theme);
    }

    public toggleTheme(): void {
        this.setTheme(this.settings.theme === 'light' ? 'dark' : 'light');
    }

    public areNotificationsEnabled(): boolean {
        return this.settings.notifications.enabled;
    }

    public setNotificationsEnabled(enabled: boolean): void {
        this.settings.notifications.enabled = enabled;
        this.saveSettings();
        this.pushToServer();
    }

    public addToFavorites(itemId: string): void {
        if (!this.settings.filters.favorites.includes(itemId)) {
            this.settings.filters.favorites.push(itemId);
            this.saveSettings();
            this.pushToServer();
        }
    }

    public removeFromFavorites(itemId: string): void {
        this.settings.filters.favorites = this.settings.filters.favorites.filter(id => id !== itemId);
        this.saveSettings();
        this.pushToServer();
    }

    public isFavorite(itemId: string): boolean {
        return this.settings.filters.favorites.includes(itemId);
    }

    public addToRecent(itemId: string): void {
        // Remove if already exists
        this.settings.filters.recent = this.settings.filters.recent.filter(id => id !== itemId);

        // Add to beginning
        this.settings.filters.recent.unshift(itemId);

        // Keep only last 20
        if (this.settings.filters.recent.length > 20) {
            this.settings.filters.recent = this.settings.filters.recent.slice(0, 20);
        }

        this.saveSettings();
        this.pushToServer();
    }

    public getRecentItems(): string[] {
        return [...this.settings.filters.recent];
    }

    public destroy(): void {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Type definitions
interface UserSettings {
    language: string;
    theme: 'light' | 'dark';
    notifications: {
        enabled: boolean;
        types: {
            email: boolean;
            push: boolean;
            inApp: boolean;
        };
    };
    preferences: {
        autoPlay: boolean;
        highQuality: boolean;
        reducedMotion: boolean;
        fontSize: 'small' | 'medium' | 'large';
    };
    filters: {
        favorites: string[];
        recent: string[];
        custom: Record<string, any>;
    };
    accessibility: {
        highContrast: boolean;
        screenReader: boolean;
        keyboardNavigation: boolean;
    };
    privacy: {
        analytics: boolean;
        personalization: boolean;
        cookies: 'necessary' | 'functional' | 'all';
    };
}

// Export singleton instance
export const userSettingsSystem = UserSettingsSystem.getInstance();
export { UserSettingsSystem, UserSettings };
