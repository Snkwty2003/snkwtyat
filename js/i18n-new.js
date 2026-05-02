// Internationalization (i18n) System
class I18n {
    constructor(options = {}) {
        this.options = {
            defaultLanguage: "ar",
            availableLanguages: ["ar", "en"],
            storageKey: "snkwtyat_language",
            ...options
        };

        this.currentLanguage = this.getCurrentLanguage();
        this.translations = {};
        this.rtlLanguages = ["ar", "he", "fa"];
        this.isLoading = false;

        this.init();
    }

    init() {
        try {
            this.loadTranslations();
            this.applyLanguage(this.currentLanguage);
            this.initLanguageSwitcher();

            if (document) {
                document.addEventListener("languageChange", (e) => {
                    if (e && e.detail && e.detail.language) {
                        this.applyLanguage(e.detail.language);
                    }
                });
            }
        } catch (error) {
            console.debug("Error initializing i18n system:", error);
        }
    }

    getCurrentLanguage() {
        try {
            const storedLanguage = localStorage.getItem(this.options.storageKey);
            if (storedLanguage && this.options.availableLanguages.includes(storedLanguage)) {
                return storedLanguage;
            }

            const browserLanguage = navigator?.language?.split("-")[0];
            if (browserLanguage && this.options.availableLanguages.includes(browserLanguage)) {
                return browserLanguage;
            }

            return this.options.defaultLanguage;
        } catch (error) {
            console.debug("Error getting current language:", error);
            return this.options.defaultLanguage;
        }
    }

    async loadTranslations() {
        try {
            // Prevent multiple simultaneous loads
            if (this.isLoading) return;
            this.isLoading = true;

            if (!this.options || !this.options.availableLanguages || !Array.isArray(this.options.availableLanguages)) {
                console.debug("Invalid available languages configuration");
                this.isLoading = false;
                return;
            }

            for (const lang of this.options.availableLanguages) {
                if (!lang) continue;
                
                // Skip if already loaded
                if (this.translations[lang] && Object.keys(this.translations[lang]).length > 0) {
                    continue;
                }

                try {
                    const response = await fetch(`locales/${lang}.json`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    this.translations[lang] = data || {};
                } catch (error) {
                    console.debug(`Failed to load translations for ${lang}:`, error);
                    // Use empty object as fallback to prevent crashes
                    this.translations[lang] = {};

                    // If default language failed to load, use minimal fallback translations
                    if (lang === this.options.defaultLanguage) {
                        this.translations[lang] = this.getFallbackTranslations();
                    }
                }
            }
        } catch (error) {
            console.debug("Error in loadTranslations:", error);
        } finally {
            this.isLoading = false;
        }
    }

    getFallbackTranslations() {
        return {
            nav: {
                home: "الرئيسية",
                about: "من نحن",
                contact: "اتصل بنا"
            },
            common: {
                loading: "جاري التحميل...",
                error: "حدث خطأ"
            }
        };
    }

    applyLanguage(language) {
        try {
            // Validate language parameter
            if (!language || typeof language !== 'string') {
                console.debug("Invalid language provided, using default");
                language = this.options.defaultLanguage;
            }

            // Check if language is available
            if (!this.options.availableLanguages || !this.options.availableLanguages.includes(language)) {
                console.debug(`Language "${language}" is not available, using default`);
                language = this.options.defaultLanguage;
            }

            this.currentLanguage = language;

            // Safely store in localStorage
            try {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(this.options.storageKey, language);
                }
            } catch (e) {
                console.debug("Failed to store language preference:", e);
            }

            // Update document direction and language
            if (typeof document !== 'undefined' && document.documentElement) {
                document.documentElement.dir = this.isRTL(language) ? "rtl" : "ltr";
                document.documentElement.lang = language;
            }

            this.updateTranslatableElements();
            this.updateLanguageSwitcher();

            if (typeof document !== 'undefined') {
                document.dispatchEvent(new CustomEvent("languageChanged", {
                    detail: { language }
                }));
            }
        } catch (error) {
            console.debug("Error applying language:", error);
            // Ensure fallback to default language on error
            if (this.currentLanguage !== this.options.defaultLanguage) {
                this.applyLanguage(this.options.defaultLanguage);
            }
        }
    }

    updateTranslatableElements() {
        if (typeof document === 'undefined') return;

        const elements = document.querySelectorAll("[data-i18n]");

        elements.forEach(element => {
            if (!element || !element.dataset) return;

            const key = element.dataset.i18n;
            const translation = this.translate(key);

            if (translation) {
                if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    translate(key, params = {}) {
        try {
            if (!key) return "";

            const keys = key.split(".");

            // Try current language first, then default language, then fallback
            let translation = this.translations[this.currentLanguage] || 
                            this.translations[this.options.defaultLanguage] || 
                            this.getFallbackTranslations();

            for (const k of keys) {
                if (translation && typeof translation === 'object' && translation[k] !== undefined) {
                    translation = translation[k];
                } else {
                    // Try to get from fallback translations
                    const fallback = this.getFallbackTranslations();
                    let fallbackValue = fallback;
                    for (const fallbackKey of keys) {
                        if (fallbackValue && typeof fallbackValue === 'object' && fallbackValue[fallbackKey] !== undefined) {
                            fallbackValue = fallbackValue[fallbackKey];
                        } else {
                            return key;
                        }
                    }
                    translation = fallbackValue;
                    break;
                }
            }

            if (typeof translation === "string") {
                return this.replaceParams(translation, params);
            }

            return key;
        } catch (error) {
            console.debug("Error translating key:", key, error);
            return key;
        }
    }

    replaceParams(text, params) {
        if (typeof text !== 'string') return text;

        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params && params[key] !== undefined ? params[key] : match;
        });
    }

    isRTL(language) {
        return this.rtlLanguages.includes(language);
    }

    initLanguageSwitcher() {
        if (typeof document === 'undefined') return;

        const switcher = document.querySelector(".language-switcher");
        if (!switcher) return;

        switcher.addEventListener("change", (e) => {
            if (e && e.target && e.target.value) {
                this.applyLanguage(e.target.value);
            }
        });
    }

    updateLanguageSwitcher() {
        if (typeof document === 'undefined') return;

        const switcher = document.querySelector(".language-switcher");
        if (switcher) {
            switcher.value = this.currentLanguage;
        }
    }

    getAvailableLanguages() {
        return this.options.availableLanguages;
    }
}

// Initialize
let i18n = null;
if (typeof document !== 'undefined') {
    i18n = new I18n({
        defaultLanguage: "ar",
        availableLanguages: ["ar", "en"]
    });
}

function t(key, params = {}) {
    return i18n ? i18n.translate(key, params) : key;
}
