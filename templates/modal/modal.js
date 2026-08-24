(function() {
    class HAATModalComponent extends HTMLElement {
        constructor() {
            super();
            this._boundHandleKeyDown = this._handleKeyDown.bind(this);
            this._boundHandleBackdropClick = this._handleBackdropClick.bind(this);
        }

        static get observedAttributes() {
            return ['open'];
        }

        connectedCallback() {
            this.setAttribute('role', 'dialog');
            this.setAttribute('aria-modal', 'true');
            this._initStructure();
            this._initEventListeners();

            if (this.hasAttribute('open')) {
                this._onOpen();
            }
        }

        disconnectedCallback() {
            this._removeEventListeners();
            document.body.style.overflow = '';
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'open') {
                if (newValue !== null) {
                    this._onOpen();
                } else {
                    this._onClose();
                }
            }
        }

        _initStructure() {
            if (!this.querySelector('.haat-modal-backdrop')) {
                const backdrop = document.createElement('div');
                backdrop.className = 'haat-modal-backdrop';
                backdrop.addEventListener('click', this._boundHandleBackdropClick);
                this.prepend(backdrop);
            }
        }

        _initEventListeners() {
            document.addEventListener('keydown', this._boundHandleKeyDown);
            const closeButtons = this.querySelectorAll('[data-haat-dismiss]');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.close());
            });
        }

        _removeEventListeners() {
            document.removeEventListener('keydown', this._boundHandleKeyDown);
        }

        _handleKeyDown(event) {
            if (event.key === 'Escape' && this.hasAttribute('open')) {
                if (this.getAttribute('disable-esc') !== 'true') {
                    this.close();
                }
            } else if (event.key === 'Tab' && this.hasAttribute('open')) {
                this._trapFocus(event);
            }
        }

        _handleBackdropClick(event) {
            if (this.getAttribute('disable-backdrop-click') === 'true') return;
            const dialog = this.querySelector('.haat-modal-dialog');
            if (dialog && !dialog.contains(event.target)) {
                this.close();
            }
        }

        _trapFocus(event) {
            const focusableElements = this.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }

        _onOpen() {
            document.body.style.overflow = 'hidden';
            this.previousActiveElement = document.activeElement;
            
            requestAnimationFrame(() => {
                const focusTarget = this.querySelector('[autofocus]') || this.querySelector('button, [href], input');
                if (focusTarget) {
                    focusTarget.focus();
                }
            });

            this.dispatchEvent(new CustomEvent('modalopen', { bubbles: true, composed: true }));
        }

        _onClose() {
            document.body.style.overflow = '';
            if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
                this.previousActiveElement.focus();
            }

            this.dispatchEvent(new CustomEvent('modalclose', { bubbles: true, composed: true }));
        }

        open() {
            this.setAttribute('open', '');
        }

        close() {
            this.removeAttribute('open');
        }

        toggle() {
            if (this.hasAttribute('open')) {
                this.close();
            } else {
                this.open();
            }
        }
    }

    if (!customElements.get('haat-modal')) {
        customElements.define('haat-modal', HAATModalComponent);
    }
})();