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

        this.init();
    }

    init() {
        // Load translations
        this.loadTranslations();

        // Apply current language
        this.applyLanguage(this.currentLanguage);

        // Add language switcher listener
        this.initLanguageSwitcher();

        // Listen for language change events
        document.addEventListener("languageChange", (e) => {
            this.applyLanguage(e.detail.language);
        });
    }

    getCurrentLanguage() {
        // Check localStorage first
        const storedLanguage = localStorage.getItem(this.options.storageKey);
        if (storedLanguage && this.options.availableLanguages.includes(storedLanguage)) {
            return storedLanguage;
        }

        // Check browser language
        const browserLanguage = navigator.language.split("-")[0];
        if (this.options.availableLanguages.includes(browserLanguage)) {
            return browserLanguage;
        }

        // Return default language
        return this.options.defaultLanguage;
    }

    async loadTranslations() {
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

    applyLanguage(language) {
        // Handle undefined language
        if (!language || !this.options.availableLanguages.includes(language)) {
            console.warn(`Language ${language || 'undefined'} is not available, using default`);
            language = this.options.defaultLanguage;
        }

        this.currentLanguage = language;
        localStorage.setItem(this.options.storageKey, language);

        // Update document direction
        document.documentElement.dir = this.isRTL(language) ? "rtl" : "ltr";
        document.documentElement.lang = language;

        // Update all translatable elements
        this.updateTranslatableElements();

        // Update language switcher
        this.updateLanguageSwitcher();

        // Trigger language change event
        const event = new CustomEvent("languageChanged", {
            detail: { language }
        });
        document.dispatchEvent(event);
    }

    updateTranslatableElements() {
        const elements = document.querySelectorAll("[data-i18n]");

        elements.forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.translate(key);

            if (translation) {
                // Update text content or placeholder
                if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Update elements with data-i18n-attr
        const attrElements = document.querySelectorAll("[data-i18n-attr]");

        attrElements.forEach(element => {
            const attrs = element.dataset.i18nAttr.split(",");

            attrs.forEach(attr => {
                const key = `${attr}_i18n`;
                const translation = this.translate(element.dataset[key]);

                if (translation) {
                    element.setAttribute(attr, translation);
                }
            });
        });
    }

    translate(key, params = {}) {
        const keys = key.split(".");
        let translation = this.translations[this.currentLanguage];

        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback to default language
                translation = this.translations[this.options.defaultLanguage];
                for (const k of keys) {
                    if (translation && translation[k]) {
                        translation = translation[k];
                    } else {
                        return key; // Return key if translation not found
                    }
                }
                break;
            }
        }

        // Replace parameters in translation
        if (typeof translation === "string" && Object.keys(params).length > 0) {
            return this.replaceParams(translation, params);
        }

        return translation;
    }

    replaceParams(text, params) {
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    isRTL(language) {
        return this.rtlLanguages.includes(language);
    }

    initLanguageSwitcher() {
        const switcher = document.querySelector(".language-switcher");
        if (!switcher) return;

        switcher.addEventListener("change", (e) => {
            this.applyLanguage(e.target.value);
        });
    }

    updateLanguageSwitcher() {
        const switcher = document.querySelector(".language-switcher");
        if (!switcher) return;

        switcher.value = this.currentLanguage;
    }

    getAvailableLanguages() {
        return this.options.availableLanguages;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }
}

// Initialize i18n system
const i18n = new I18n({
    defaultLanguage: "ar",
    availableLanguages: ["ar", "en"]
});

// Helper function for translation
function t(key, params = {}) {
    return i18n.translate(key, params);
}
