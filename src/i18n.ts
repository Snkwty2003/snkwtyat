// TypeScript Types for I18n System
interface TranslationData {
    [key: string]: string | TranslationData;
}

interface I18nOptions {
    defaultLanguage?: string;
    availableLanguages?: string[];
    storageKey?: string;
}

// Internationalization (i18n) System with TypeScript
class I18n {
    private currentLanguage: string;
    private translations: Record<string, TranslationData> = {};
    private readonly rtlLanguages: string[] = ['ar', 'he', 'fa'];
    private readonly options: Required<I18nOptions>;

    constructor(options: I18nOptions = {}) {
        this.options = {
            defaultLanguage: 'ar',
            availableLanguages: ['ar', 'en'],
            storageKey: 'snkwtyat_language',
            ...options
        };

        this.currentLanguage = this.getCurrentLanguage();
        this.init();
    }

    private async init(): Promise<void> {
        // Load translations
        await this.loadTranslations();

        // Apply current language
        this.applyLanguage(this.currentLanguage);

        // Add language switcher listener
        this.initLanguageSwitcher();

        // Listen for language change events
        document.addEventListener('languageChange', (e) => {
            const event = e as CustomEvent<{ language: string }>;
            this.applyLanguage(event.detail.language);
        });
    }

    private getCurrentLanguage(): string {
        // Check localStorage first
        const storedLanguage = localStorage.getItem(this.options.storageKey);
        if (storedLanguage && this.options.availableLanguages.includes(storedLanguage)) {
            return storedLanguage;
        }

        // Check browser language
        const browserLanguage = navigator.language.split('-')[0];
        if (this.options.availableLanguages.includes(browserLanguage)) {
            return browserLanguage;
        }

        // Return default language
        return this.options.defaultLanguage;
    }

    private async loadTranslations(): Promise<void> {
        // Load translations for all available languages
        for (const lang of this.options.availableLanguages) {
            try {
                const response = await fetch(`locales/${lang}.json`);
                this.translations[lang] = await response.json();
            } catch (error) {
                console.error(`Failed to load translations for ${lang}:`, error);
                this.translations[lang] = {};
            }
        }
    }

    public applyLanguage(language: string): void {
        if (!this.options.availableLanguages.includes(language)) {
            console.warn(`Language ${language} is not available`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem(this.options.storageKey, language);

        // Update document direction
        document.documentElement.dir = this.isRTL(language) ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Update all translatable elements
        this.updateTranslatableElements();

        // Update language switcher
        this.updateLanguageSwitcher();

        // Trigger language change event
        const event = new CustomEvent('languageChanged', {
            detail: { language }
        });
        document.dispatchEvent(event);
    }

    private updateTranslatableElements(): void {
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (!key) return;

            const translation = this.translate(key);

            if (translation) {
                // Update text content or placeholder
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    (element as HTMLInputElement).placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update elements with data-i18n-attr
        const attrElements = document.querySelectorAll('[data-i18n-attr]');

        attrElements.forEach(element => {
            const attrs = element.getAttribute('data-i18n-attr')?.split(',');
            if (!attrs) return;

            attrs.forEach(attr => {
                const key = `${attr}_i18n`;
                const translation = this.translate(element.getAttribute(key) || '');

                if (translation) {
                    element.setAttribute(attr, translation);
                }
            });
        });
    }

    public translate(key: string, params: Record<string, string | number> = {}): string {
        const keys = key.split('.');
        let translation: string | TranslationData = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (translation && typeof translation === 'object' && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback to default language
                translation = this.translations[this.options.defaultLanguage];
                for (const k of keys) {
                    if (translation && typeof translation === 'object' && translation[k]) {
                        translation = translation[k];
                    } else {
                        return key; // Return key if translation not found
                    }
                }
                break;
            }
        }

        // Replace parameters in translation
        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            return this.replaceParams(translation, params);
        }

        return typeof translation === 'string' ? translation : key;
    }

    private replaceParams(text: string, params: Record<string, string | number>): string {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        });
    }

    public isRTL(language: string): boolean {
        return this.rtlLanguages.includes(language);
    }

    private initLanguageSwitcher(): void {
        const switcher = document.querySelector('.language-switcher') as HTMLSelectElement | null;
        if (!switcher) return;

        switcher.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.applyLanguage(target.value);
        });
    }

    private updateLanguageSwitcher(): void {
        const switcher = document.querySelector('.language-switcher') as HTMLSelectElement | null;
        if (!switcher) return;

        switcher.value = this.currentLanguage;
    }

    public getAvailableLanguages(): string[] {
        return this.options.availableLanguages;
    }

    public getCurrentLanguage(): string {
        return this.currentLanguage;
    }
}

// Initialize i18n system
const i18n = new I18n({
    defaultLanguage: 'ar',
    availableLanguages: ['ar', 'en']
});

// Helper function for translation
function t(key: string, params?: Record<string, string | number>): string {
    return i18n.translate(key, params);
}

export { i18n, t, I18n, I18nOptions, TranslationData };
