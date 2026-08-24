(function() {
    class HAATSliderComponent extends HTMLElement {
        constructor() {
            super();
            this.currentIndex = 0;
            this.slideInterval = null;
            this.touchStartX = 0;
            this.touchEndX = 0;
            this._boundHandleKeyDown = this._handleKeyDown.bind(this);
            this._boundHandleTouchStart = this._handleTouchStart.bind(this);
            this._boundHandleTouchEnd = this._handleTouchEnd.bind(this);
        }

        connectedCallback() {
            this.setAttribute('role', 'region');
            this.setAttribute('aria-roledescription', 'carousel');
            this._initStructure();
            this._initEventListeners();
            
            if (this.getAttribute('autoplay') === 'true') {
                this._startAutoplay();
            }
        }

        disconnectedCallback() {
            this._stopAutoplay();
            this._removeEventListeners();
        }

        _initStructure() {
            const children = Array.from(this.children);
            if (children.length === 0) return;

            let viewport = this.querySelector('.haat-slider-viewport');
            if (!viewport) {
                viewport = document.createElement('div');
                viewport.className = 'haat-slider-viewport';
                
                children.forEach(child => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'haat-slider-slide';
                    wrapper.appendChild(child);
                    viewport.appendChild(wrapper);
                });
                this.appendChild(viewport);
            }
            this.slides = this.querySelectorAll('.haat-slider-slide');
            this._updateSlidePositions();
        }

        _initEventListeners() {
            this.addEventListener('touchstart', this._boundHandleTouchStart, { passive: true });
            this.addEventListener('touchend', this._boundHandleTouchEnd, { passive: true });
            this.addEventListener('keydown', this._boundHandleKeyDown);
            
            if (this.getAttribute('pause-on-hover') !== 'false') {
                this.addEventListener('mouseenter', () => this._stopAutoplay());
                this.addEventListener('mouseleave', () => {
                    if (this.getAttribute('autoplay') === 'true') this._startAutoplay();
                });
            }
        }

        _removeEventListeners() {
            this.removeEventListener('touchstart', this._boundHandleTouchStart);
            this.removeEventListener('touchend', this._boundHandleTouchEnd);
            this.removeEventListener('keydown', this._boundHandleKeyDown);
        }

        _handleKeyDown(event) {
            if (event.key === 'ArrowLeft') {
                this.prev();
            } else if (event.key === 'ArrowRight') {
                this.next();
            }
        }

        _handleTouchStart(event) {
            this.touchStartX = event.changedTouches[0].screenX;
        }

        _handleTouchEnd(event) {
            this.touchEndX = event.changedTouches[0].screenX;
            this._handleSwipeGesture();
        }

        _handleSwipeGesture() {
            const threshold = 50;
            if (this.touchEndX < this.touchStartX - threshold) {
                this.next();
            } else if (this.touchEndX > this.touchStartX + threshold) {
                this.prev();
            }
        }

        next() {
            if (!this.slides || this.slides.length === 0) return;
            this.currentIndex = (this.currentIndex + 1) % this.slides.length;
            this._updateSlidePositions();
            this.dispatchEvent(new CustomEvent('slidechange', { detail: { index: this.currentIndex } }));
        }

        prev() {
            if (!this.slides || this.slides.length === 0) return;
            this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
            this._updateSlidePositions();
            this.dispatchEvent(new CustomEvent('slidechange', { detail: { index: this.currentIndex } }));
        }

        goTo(index) {
            if (!this.slides || index < 0 || index >= this.slides.length) return;
            this.currentIndex = index;
            this._updateSlidePositions();
        }

        _updateSlidePositions() {
            const viewport = this.querySelector('.haat-slider-viewport');
            if (viewport) {
                viewport.style.transform = `translateX(-${this.currentIndex * 100}%)`;
            }
        }

        _startAutoplay() {
            this._stopAutoplay();
            const intervalTime = parseInt(this.getAttribute('interval'), 10) || 5000;
            this.slideInterval = setInterval(() => this.next(), intervalTime);
        }

        _stopAutoplay() {
            if (this.slideInterval) {
                clearInterval(this.slideInterval);
                this.slideInterval = null;
            }
        }
    }

    if (!customElements.get('haat-slider')) {
        customElements.define('haat-slider', HAATSliderComponent);
    }
})();