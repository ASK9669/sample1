// Optimize performance with requestAnimationFrame
let currentSlide = 0;
let slideAutoPlayInterval;
let isAutoPlaying = true;

// Cache DOM elements
const slides = document.querySelectorAll('.slide');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const slideshow = document.querySelector('.slideshow');
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');
const navMenu = document.querySelector('.nav-menu');
const dropdownButtons = document.querySelectorAll('.dropbtn');
const readMoreButtons = document.querySelectorAll('.read-more');

// Efficiently update slide display
function updateSlide(index) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
    });

    currentSlide = index;
}

// Show slide with smooth transition
function showSlide(index) {
    // Normalize index
    const normalizedIndex = ((index % slides.length) + slides.length) % slides.length;
    updateSlide(normalizedIndex);
}

// Navigation functions
function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

// Auto-play slides
function startAutoPlay() {
    if (slideAutoPlayInterval) clearInterval(slideAutoPlayInterval);
    slideAutoPlayInterval = setInterval(nextSlide, 4000);
    isAutoPlaying = true;
}

function stopAutoPlay() {
    if (slideAutoPlayInterval) clearInterval(slideAutoPlayInterval);
    isAutoPlaying = false;
}

// Pause on interaction, resume after 10 seconds
function pauseAutoPlay() {
    stopAutoPlay();
    setTimeout(() => {
        if (!slideshow.matches(':hover')) {
            startAutoPlay();
        }
    }, 10000);
}

// Start initial auto-play
startAutoPlay();

// Slide button listeners
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        pauseAutoPlay();
        prevSlide();
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        pauseAutoPlay();
        nextSlide();
    });
}

// Indicator navigation
indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        pauseAutoPlay();
        showSlide(index);
    });
});

// Pause/resume on slideshow hover
if (slideshow) {
    slideshow.addEventListener('mouseenter', stopAutoPlay);
    slideshow.addEventListener('mouseleave', startAutoPlay);
}

// Touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

if (slideshow) {
    slideshow.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    slideshow.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        pauseAutoPlay();
        nextSlide();
    }
    if (touchEndX > touchStartX + 50) {
        pauseAutoPlay();
        prevSlide();
    }
}

// Mobile menu toggle with event delegation
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close menu when link is clicked
if (navMenu) {
    navMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Dropdown menu handling
dropdownButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdownContent = button.nextElementSibling;

        if (!dropdownContent || !dropdownContent.classList.contains('dropdown-content')) {
            return;
        }

        const isActive = dropdownContent.classList.contains('active');

        // Close other dropdowns
        document.querySelectorAll('.dropdown-content.active').forEach((content) => {
            if (content !== dropdownContent) {
                content.classList.remove('active');
            }
        });

        // Toggle current dropdown
        dropdownContent.classList.toggle('active', !isActive);
        button.setAttribute('aria-expanded', !isActive);
    });
});

// Read More / Read Less functionality with event delegation
readMoreButtons.forEach((btn) => {
    btn.addEventListener('click', function () {
        const newsItem = this.closest('.news-item');
        if (!newsItem) return;

        const moreText = newsItem.querySelector('.more');
        const summary = newsItem.querySelector('.summary');

        if (!moreText) return;

        const isHidden = moreText.style.display === 'none' || moreText.style.display === '';

        if (isHidden) {
            moreText.style.display = 'inline';
            this.textContent = 'Read Less';
            this.setAttribute('aria-expanded', 'true');
        } else {
            moreText.style.display = 'none';
            this.textContent = 'Read More';
            this.setAttribute('aria-expanded', 'false');
        }
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-content.active').forEach((content) => {
            content.classList.remove('active');
        });
        dropdownButtons.forEach((btn) => {
            btn.setAttribute('aria-expanded', 'false');
        });
    }
});

// Keyboard navigation for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.querySelectorAll('.dropdown-content.active').forEach((content) => {
            content.classList.remove('active');
        });
    }
});

// Lazy load images on scroll for performance
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
    });
}

// Reduce motion for accessibility
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    stopAutoPlay();
}

// Performance: Clean up event listeners when needed
window.addEventListener('beforeunload', () => {
    clearInterval(slideAutoPlayInterval);
});
