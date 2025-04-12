/**
 * TravelEase - Travel Planner Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize CSS variables for dynamic styling
    const root = document.documentElement;
    root.style.setProperty('--primary-color-rgb', '255, 87, 34'); // Matches #ff5722
    root.style.setProperty('--primary-dark-rgb', '230, 74, 25');  // Matches #e64a19
    
    // Initialize AOS (Animate On Scroll) if available
    if(typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.backgroundColor = '#ffffff';
            header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.innerHTML = navMenu.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }

    // Hero Carousel
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    let slideInterval;

    // Function to change slide
    function changeSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    // Next slide
    function nextSlide() {
        changeSlide(currentSlide + 1);
    }

    // Previous slide
    function prevSlide() {
        changeSlide(currentSlide - 1);
    }

    // Start automatic slideshow
    function startSlideshow() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Stop automatic slideshow
    function stopSlideshow() {
        clearInterval(slideInterval);
    }

    // Event listeners for carousel controls
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            prevSlide();
            stopSlideshow();
            startSlideshow();
        });

        nextBtn.addEventListener('click', function() {
            nextSlide();
            stopSlideshow();
            startSlideshow();
        });
    }

    // Event listeners for dots
    dots.forEach(function(dot, index) {
        dot.addEventListener('click', function() {
            changeSlide(index);
            stopSlideshow();
            startSlideshow();
        });
    });

    // Start the slideshow
    startSlideshow();

    // Trip Planner Form Validation
    const plannerForm = document.querySelector('.planner-form');
    if (plannerForm) {
        plannerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const destination = document.getElementById('destination').value;
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            const travelers = document.getElementById('travelers').value;
            const budget = document.getElementById('budget').value;

            if (!destination || !startDate || !endDate || !travelers || !budget) {
                alert('Please fill in all fields to plan your trip.');
                return;
            }

            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start < today) {
                alert('Start date cannot be in the past.');
                return;
            }

            if (end <= start) {
                alert('End date must be after start date.');
                return;
            }

            // If everything is valid, you would normally submit the form or process the data
            // For now, just show a success message
            alert('Your trip planning request has been submitted successfully! We will find the best options for you.');
            this.reset();
        });
    }

    // Initialize date inputs with today and tomorrow
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    if (startDateInput && endDateInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        startDateInput.valueAsDate = today;
        endDateInput.valueAsDate = tomorrow;
        
        // Ensure end date is always after start date
        startDateInput.addEventListener('change', function() {
            const startDate = new Date(this.value);
            const endDate = new Date(endDateInput.value);
            
            if (endDate <= startDate) {
                const newEndDate = new Date(startDate);
                newEndDate.setDate(startDate.getDate() + 1);
                endDateInput.valueAsDate = newEndDate;
            }
        });
    }

    // Back to top button
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });
    
    backToTopBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Animation for packages
    const packages = document.querySelectorAll('.package');
    
    function checkVisibility() {
        packages.forEach(function(pkg, index) {
            const rect = pkg.getBoundingClientRect();
            const isVisible = (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0
            );
            
            if (isVisible) {
                pkg.style.animationDelay = (index * 100) + 'ms';
                pkg.style.opacity = '1';
                pkg.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Check visibility on load and scroll
    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    
    // Destination cards hover effects
    const destinationCards = document.querySelectorAll('.destination-card');
    
    destinationCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            const overlay = this.querySelector('.destination-overlay');
            if (overlay) {
                overlay.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const overlay = this.querySelector('.destination-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
            }
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            
            if (!emailInput.value.trim()) {
                alert('Please enter your email address.');
                return;
            }
            
            // Validate email format
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Here you would normally send the email to the server
            alert('Thank you for subscribing to our newsletter!');
            this.reset();
        });
    }

    // Currency formatter for budget input
    const budgetInput = document.getElementById('budget');
    if (budgetInput) {
        budgetInput.addEventListener('focus', function() {
            // Remove any non-numeric characters when focused
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
        
        budgetInput.addEventListener('blur', function() {
            // Format as currency when blurred
            if (this.value) {
                const value = parseFloat(this.value);
                if (!isNaN(value)) {
                    this.value = '$' + value.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    });
                }
            }
        });
        
        budgetInput.addEventListener('input', function() {
            // Allow only numbers and decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
    }
});