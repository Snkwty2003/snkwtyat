// Advanced Dark/Light Mode System
class ThemeSystem {
    private currentTheme: 'light' | 'dark' = 'light';
    private prefersDark: boolean = false;
    private themeTransition: boolean = true;

    constructor() {
        this.init();
    }

    private init(): void {
        // Check for saved theme preference
        this.loadSavedTheme();

        // Check system preference
        this.checkSystemPreference();

        // Apply initial theme
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        this.setupSystemThemeListener();

        // Setup theme toggle buttons
        this.setupThemeToggles();
    }

    private loadSavedTheme(): void {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                this.currentTheme = savedTheme;
            }
        } catch (error) {
            console.error('Failed to load saved theme:', error);
        }
    }

    private saveTheme(): void {
        try {
            localStorage.setItem('theme', this.currentTheme);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    }

    private checkSystemPreference(): void {
        // Check if user prefers dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.prefersDark = true;

            // Use system preference if no saved preference
            if (!localStorage.getItem('theme')) {
                this.currentTheme = 'dark';
            }
        }
    }

    private setupSystemThemeListener(): void {
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Listen for changes
            darkModeQuery.addEventListener('change', (e) => {
                this.prefersDark = e.matches;

                // Only switch if user hasn't explicitly set a preference
                if (!localStorage.getItem('theme')) {
                    this.currentTheme = this.prefersDark ? 'dark' : 'light';
                    this.applyTheme(this.currentTheme);
                }
            });
        }
    }

    private setupThemeToggles(): void {
        // Find all theme toggle buttons
        const toggleButtons = document.querySelectorAll('[data-theme-toggle]');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.toggleTheme();
            });
        });
    }

    public toggleTheme(): void {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        this.saveTheme();
    }

    public setTheme(theme: 'light' | 'dark'): void {
        if (theme !== this.currentTheme) {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme();
        }
    }

    private applyTheme(theme: 'light' | 'dark'): void {
        // Add transition class
        if (this.themeTransition) {
            document.documentElement.classList.add('theme-transition');
        }

        // Set data-theme attribute
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color
        this.updateMetaThemeColor(theme);

        // Update theme toggle buttons
        this.updateThemeToggles(theme);

        // Trigger custom event
        const event = new CustomEvent('themeChange', {
            detail: { theme }
        });
        document.dispatchEvent(event);

        // Remove transition class after animation
        if (this.themeTransition) {
            setTimeout(() => {
                document.documentElement.classList.remove('theme-transition');
            }, 300);
        }
    }

    private updateMetaThemeColor(theme: 'light' | 'dark'): void {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');

        if (metaThemeColor) {
            const colors = {
                light: '#ffffff',
                dark: '#1f2937'
            };
            metaThemeColor.setAttribute('content', colors[theme]);
        }
    }

    private updateThemeToggles(theme: 'light' | 'dark'): void {
        const toggleButtons = document.querySelectorAll('[data-theme-toggle]');

        toggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                if (theme === 'dark') {
                    icon.className = 'fas fa-sun';
                } else {
                    icon.className = 'fas fa-moon';
                }
            }
        });
    }

    public getCurrentTheme(): 'light' | 'dark' {
        return this.currentTheme;
    }

    public isDarkMode(): boolean {
        return this.currentTheme === 'dark';
    }

    public isLightMode(): boolean {
        return this.currentTheme === 'light';
    }

    public setTransition(enabled: boolean): void {
        this.themeTransition = enabled;
    }

    public getSystemPreference(): boolean {
        return this.prefersDark;
    }

    public resetToSystemPreference(): void {
        this.currentTheme = this.prefersDark ? 'dark' : 'light';
        this.applyTheme(this.currentTheme);
        localStorage.removeItem('theme');
    }
}

// Initialize Theme System
const themeSystem = new ThemeSystem();

// Export for use in other modules
export { themeSystem, ThemeSystem };
