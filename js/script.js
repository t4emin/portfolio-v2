// --- 1. Theme Toggle Logic ---
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const setDarkMode = () => {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    };

    const setLightMode = () => {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    };

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setDarkMode();
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');

        if (currentTheme === 'dark') {
            setLightMode();
            localStorage.setItem('theme', 'light');
            gsap.fromTo(themeIcon, { rotation: -180, scale: 0.5 }, { rotation: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" });
        } else {
            setDarkMode();
            localStorage.setItem('theme', 'dark');
            gsap.fromTo(themeIcon, { rotation: 180, scale: 0.5 }, { rotation: 0, scale: 1, duration: 0.5, ease: "back.out(1.5)" });
        }
    });

    // --- 2. GSAP & ScrollTrigger Initialization ---
    if (typeof gsap !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Initial Page Load Animations
        gsap.to(".panel-content", {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.2
        });

        // Horizontal Scroll Logic with Car & Dust Effect
        const horizontalSection = document.querySelector(".horizontal-section");
        const horizontalContainer = document.querySelector(".horizontal-container");
        const panels = gsap.utils.toArray(".panel");
        const progressWrapper = document.querySelector('.scroll-progress-wrapper');
        const carIcon = document.getElementById('car-icon');
        const carWrapper = document.getElementById('car-wrapper');

        let scrollTimeout;
        let lastDustTime = 0;

        function createDust(leftPercent, direction) {
            const now = Date.now();
            if (now - lastDustTime < 40) return;
            lastDustTime = now;

            const dust = document.createElement('div');
            dust.classList.add('dust-particle');

            const offset = direction === 1 ? -15 : 15;
            dust.style.left = `calc(${leftPercent}% + ${offset}px)`;

            progressWrapper.appendChild(dust);

            gsap.to(dust, {
                x: -direction * (Math.random() * 20 + 10),
                y: -(Math.random() * 20 + 10),
                scale: Math.random() * 1.5 + 1,
                opacity: 0,
                duration: 0.5 + Math.random() * 0.5,
                ease: "power1.out",
                onComplete: () => dust.remove()
            });
        }

        if (horizontalSection && horizontalContainer) {
            gsap.to(panels, {
                xPercent: -100 * (panels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: horizontalSection,
                    pin: true,
                    scrub: 1,
                    end: () => "+=" + (horizontalContainer.offsetWidth - window.innerWidth),
                    onUpdate: (self) => {
                        const currentPercent = self.progress * 100;

                        gsap.set(".scroll-progress-bar", { scaleX: self.progress });
                        gsap.set(".running-indicator", { left: currentPercent + "%" });

                        if (self.direction === 1) {
                            gsap.set(carWrapper, { scaleX: 1 });
                        } else if (self.direction === -1) {
                            gsap.set(carWrapper, { scaleX: -1 });
                        }

                        carIcon.classList.add('moving');
                        createDust(currentPercent, self.direction);

                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            carIcon.classList.remove('moving');
                        }, 150);
                    }
                }
            });
        }

        // Portfolio Section Entrance
        gsap.from(".portfolio-section", {
            y: 150,
            opacity: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".portfolio-section",
                start: "top 90%",
            }
        });

        gsap.utils.toArray('.project-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out",
                delay: i % 3 * 0.1
            });
        });

        // Mouse Parallax for Background Blobs
        const blob1 = document.getElementById('blob1');
        const blob2 = document.getElementById('blob2');

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;

            if (blob1) gsap.to(blob1, { x: x * 50, y: y * 50, duration: 1, ease: "power1.out" });
            if (blob2) gsap.to(blob2, { x: -x * 60, y: -y * 60, duration: 1.5, ease: "power1.out" });
        });
    }

    // --- 3. Navbar Scrolled State ---
    const nav = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- 4. Modal Logic (Resume) ---
    const modal = document.getElementById('resumeModal');
    const modalContent = document.getElementById('modalContent');
    const openBtn = document.getElementById('openResume');
    const closeBtn = document.getElementById('closeResume');
    const printBtn = document.getElementById('printBtn');

    function openModal(e) {
        console.log(111);
        
        if (e) e.preventDefault();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        gsap.to(modal, { opacity: 1, duration: 0.3 });
        gsap.to(modalContent, { y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" });
    }

    function closeModal() {
        gsap.to(modalContent, { y: 50, scale: 0.95, duration: 0.3, ease: "power2.in" });
        gsap.to(modal, {
            opacity: 0, duration: 0.3, onComplete: () => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});