(function() {
    class HAATAccessibilityComponent extends HTMLElement {
        connectedCallback() {
            this.setAttribute('role', 'group');
            this.setAttribute('aria-label', 'Accessibility settings');
            this._applySettings();
        }

        _applySettings() {
            const root = document.documentElement;
            const settings = ['contrast', 'large-text', 'reduced-motion', 'focus-visible'];
            settings.forEach(setting => {
                const key = `haat-a11y-${setting}`;
                const stored = this.getAttribute('storage') === 'true' ? localStorage.getItem(key) : null;
                const enabled = stored === null ? this.getAttribute(setting) === 'true' : stored === 'true';
                root.classList.toggle(`haat-a11y-${setting}`, enabled);
            });
        }

        refresh() {
            this._applySettings();
        }
    }

    if (!customElements.get('haat-accessibility')) customElements.define('haat-accessibility', HAATAccessibilityComponent);
})();