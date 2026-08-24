(function() {
    class HAATToastComponent extends HTMLElement {
        connectedCallback() {
            this.setAttribute('role', 'status');
            if (this.getAttribute('dismissible') === 'true' && !this.querySelector('button')) {
                const button = document.createElement('button');
                button.type = 'button';
                button.setAttribute('aria-label', 'Dismiss notification');
                button.textContent = '×';
                button.addEventListener('click', () => this.close());
                this.appendChild(button);
            }
            if (this.hasAttribute('open')) this._scheduleClose();
        }

        open() {
            this.setAttribute('open', '');
            this._scheduleClose();
        }

        close() { this.removeAttribute('open'); }

        _scheduleClose() {
            const duration = parseInt(this.getAttribute('duration'), 10);
            if (duration > 0) {
                clearTimeout(this._timer);
                this._timer = setTimeout(() => this.close(), duration);
            }
        }
    }

    if (!customElements.get('haat-toast')) customElements.define('haat-toast', HAATToastComponent);
})();