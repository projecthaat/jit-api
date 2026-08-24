(function() {
    class HAATTabsComponent extends HTMLElement {
        connectedCallback() {
            this.setAttribute('role', 'tablist-container');
            this._tabs = Array.from(this.querySelectorAll('[role="tab"]'));
            this._panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
            this._active = Math.max(0, parseInt(this.getAttribute('active'), 10) || 0);
            this._tabs.forEach((tab, index) => {
                tab.setAttribute('tabindex', index === this._active ? '0' : '-1');
                tab.addEventListener('click', () => this.select(index));
                tab.addEventListener('keydown', event => this._handleKey(event, index));
            });
            this.select(this._active);
        }

        select(index) {
            if (!this._tabs.length) return;
            this._active = Math.min(Math.max(index, 0), this._tabs.length - 1);
            this._tabs.forEach((tab, tabIndex) => {
                const selected = tabIndex === this._active;
                tab.setAttribute('aria-selected', String(selected));
                tab.setAttribute('tabindex', selected ? '0' : '-1');
                const panel = this._panels[tabIndex];
                if (panel) panel.hidden = !selected;
            });
            this.dispatchEvent(new CustomEvent('tabchange', { detail: { index: this._active } }));
        }

        _handleKey(event, index) {
            const direction = this.getAttribute('orientation') === 'vertical' ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];
            if (!direction.includes(event.key)) return;
            event.preventDefault();
            let next = event.key === direction[0] ? index - 1 : index + 1;
            if (this.getAttribute('loop') === 'true') next = (next + this._tabs.length) % this._tabs.length;
            if (next >= 0 && next < this._tabs.length) {
                this.select(next);
                this._tabs[next].focus();
            }
        }
    }

    if (!customElements.get('haat-tabs')) customElements.define('haat-tabs', HAATTabsComponent);
})();