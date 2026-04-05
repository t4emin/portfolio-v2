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

        // Initial Page Load Animations (Atom nucleaus & panels)
        gsap.to(".panel-content", {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.2
        });

        // Horizontal Scroll Logic with Rocket & Smoke Effect
        const horizontalSection = document.querySelector(".horizontal-section");
        const horizontalContainer = document.querySelector(".horizontal-container");
        const panels = gsap.utils.toArray(".panel");
        const progressWrapper = document.querySelector('.scroll-progress-wrapper');

        // UpdatedSelectors for Rocket
        const rocketIcon = document.getElementById('rocket-icon'); // Target updated ID
        const vehicleWrapper = document.getElementById('vehicle-wrapper'); // Wrapper remains same ID

        let scrollTimeout;
        let lastSmokeTime = 0;

        // Semantic renaming from Dust to Smoke
        function createSmoke(leftPercent, direction) {
            const now = Date.now();
            if (now - lastSmokeTime < 40) return;
            lastSmokeTime = now;

            const smoke = document.createElement('div');
            smoke.classList.add('smoke-particle');

            // 1. แกน X: ปรับให้ควันออกมาจากด้านหลังจรวด
            const offset = direction === 1 ? -20 : 10;
            smoke.style.left = `calc(${leftPercent}% + ${offset}px)`;

            // 👇 2. แกน Y: ปรับความสูงให้ออกมาจาก "ตูดจรวด" (เพิ่มบรรทัดนี้) 👇
            smoke.style.bottom = '25px'; // ลองแก้ตัวเลข 12px ให้มาก/น้อยลง เพื่อขยับควันขึ้น/ลงให้ตรงตูดจรวดพอดีครับ

            progressWrapper.appendChild(smoke);

            gsap.to(smoke, {
                x: -direction * (Math.random() * 20 + 10),
                y: -(Math.random() * 20 + 10), // ลอยขึ้นไปด้านบน
                scale: Math.random() * 1.5 + 1,
                opacity: 0,
                duration: 0.5 + Math.random() * 0.5,
                ease: "power1.out",
                onComplete: () => smoke.remove()
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

                        // 👇 1. ให้ GSAP คำนวณสีตามระยะทาง (เริ่มจาก ฟ้า -> เหลือง -> ส้ม -> แดง)
                        const progressColor = gsap.utils.interpolate([
                            "#00c6ff", // สีตอนเริ่ม (ฟ้า)
                            "#facc15", // สีตอนกลาง (เหลือง)
                            "#f97316", // สีตอนค่อนข้างปลาย (ส้ม)
                            "#ef4444"  // สีตอนใกล้เสร็จ (แดง)
                        ], self.progress);

                        // 👇 2. อัปเดตสีพื้นหลังเข้าไปพร้อมกับขนาดความกว้าง
                        gsap.set(".scroll-progress-bar", { 
                            scaleX: self.progress,
                            // เปลี่ยนสีไล่ระดับ โดยหางเป็นสีหลัก (Primary) และหัวจรวดเป็นสีที่เฟดเปลี่ยนไปเรื่อยๆ
                            background: `linear-gradient(90deg, var(--primary), ${progressColor})`
                        });

                        gsap.set(".running-indicator", { left: currentPercent + "%" });

                        // Rocket logic for direction
                        if (self.direction === 1) {
                            gsap.set(vehicleWrapper, { scaleX: 1 }); // Face Right
                        } else if (self.direction === -1) {
                            gsap.set(vehicleWrapper, { scaleX: -1 }); // Face Left
                        }

                        // Add moving class to rocket for bounce animation
                        rocketIcon.classList.add('moving');
                        createSmoke(currentPercent, self.direction);

                        // Remove moving class after scroll stops
                        clearTimeout(scrollTimeout);
                        scrollTimeout = setTimeout(() => {
                            rocketIcon.classList.remove('moving');
                        }, 150);

                        // ดักว่าถ้าเลื่อนมาถึง 99% ให้เปิด Modal
                        // if (self.progress >= 0.99) {
                        //     const resumeModal = document.getElementById('resumeModal');
                        //     if (resumeModal && resumeModal.style.display !== 'flex') {
                        //         openModal();
                        //     }
                        // }
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