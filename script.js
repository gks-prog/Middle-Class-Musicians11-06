document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Lenis Smooth Scroll (Optimized for Mobile/Touch)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true,
        smoothTouch: false, // CRITICAL: Disabled to prevent scroll hijacking on mobile
    });

    lenis.stop();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    gsap.registerPlugin(ScrollTrigger);

    // 2. Custom Cursor Logic (Degrades Gracefully)
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    let mouseX = 0, mouseY = 0, posX = 0, posY = 0;

    // Only run if touch is not detected to save battery
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        gsap.ticker.add(() => {
            posX += (mouseX - posX) * 0.15;
            posY += (mouseY - posY) * 0.15;
            
            gsap.set(cursor, { x: mouseX, y: mouseY });
            gsap.set(follower, { x: posX, y: posY });
        });

        document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 0, duration: 0.3 });
                gsap.to(follower, { scale: 1.5, backgroundColor: 'rgba(194, 122, 66, 0.1)', borderColor: 'transparent', duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, duration: 0.3 });
                gsap.to(follower, { scale: 1, backgroundColor: 'transparent', borderColor: 'rgba(194, 122, 66, 0.4)', duration: 0.3 });
            });
        });
    }

    // 3. Cinematic Loader
    const loaderTl = gsap.timeline({
        onComplete: () => {
            document.querySelector('.loader').style.display = 'none';
            lenis.start();
        }
    });

    loaderTl.to(".loader-progress", { scaleX: 1, duration: 1.5, ease: "power3.inOut" })
            .to(".loader-text", { opacity: 0, y: -20, duration: 0.8, ease: "power2.in" }, "+=0.2")
            .to(".loader", { yPercent: -100, duration: 1.2, ease: "expo.inOut" });

    // 4. Parallax & Triggers
    gsap.from(".hero-word", {
        y: "115%", duration: 1.8, ease: "expo.out", stagger: 0.1, delay: 2.8
    });

    gsap.to(".hero-image", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    // 5. MAGIC BTN INTERACTIVE LOGIC (Strict Functionality Preservation)
    const magicBtn = document.querySelector('.magic-btn');
    const magicText = document.querySelector('.magic-text');
    const burstContainer = document.getElementById('burst-container');
    
    let physicsNodes = [];
    let isPhysicsRunning = false;

    // Node Factory
    function createNode(x, y) {
        const node = document.createElement('div');
        node.classList.add('physics-node');
        
        // Random elliptical dimensions
        const rx = 10 + Math.random() * 20; 
        const ry = 10 + Math.random() * 30;
        
        node.style.width = `${rx * 2}px`;
        node.style.height = `${ry * 2}px`;
        node.style.background = Math.random() > 0.5 ? 'var(--accent-copper)' : 'var(--text-primary)';
        
        burstContainer.appendChild(node);

        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 15;

        return {
            el: node,
            x: x, y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.max(rx, ry), // Using bounding circle for faster collision math
            life: 1.0
        };
    }

    // Physics Engine Loop
    function updatePhysics() {
        if (physicsNodes.length === 0) {
            isPhysicsRunning = false;
            return;
        }

        for (let i = 0; i < physicsNodes.length; i++) {
            let p1 = physicsNodes[i];

            // Apply Velocity & Friction
            p1.x += p1.vx;
            p1.y += p1.vy;
            p1.vx *= 0.92;
            p1.vy *= 0.92;
            p1.life -= 0.015; // Fade out

            // Anti-Overlap Collision Resolution (O(N^2) simplified)
            for (let j = i + 1; j < physicsNodes.length; j++) {
                let p2 = physicsNodes[j];
                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let min_dist = p1.radius + p2.radius;

                if (dist < min_dist) {
                    let angle = Math.atan2(dy, dx);
                    let targetX = p1.x + Math.cos(angle) * min_dist;
                    let targetY = p1.y + Math.sin(angle) * min_dist;
                    let ax = (targetX - p2.x) * 0.1;
                    let ay = (targetY - p2.y) * 0.1;
                    
                    p1.vx -= ax;
                    p1.vy -= ay;
                    p2.vx += ax;
                    p2.vy += ay;
                }
            }

            // Render
            p1.el.style.transform = `translate3d(${p1.x}px, ${p1.y}px, 0) scale(${p1.life})`;
            p1.el.style.opacity = p1.life;
        }

        // Cleanup dead nodes
        physicsNodes = physicsNodes.filter(p => {
            if (p.life <= 0) {
                p.el.remove();
                return false;
            }
            return true;
        });

        requestAnimationFrame(updatePhysics);
    }

    // Event Triggers mapping to exact requirements
    magicBtn.addEventListener('mouseenter', () => {
        magicText.textContent = "One Stop Solution for artists";
    });

    magicBtn.addEventListener('mouseleave', () => {
        magicText.textContent = "don't touch it";
    });

    magicBtn.addEventListener('click', (e) => {
        const rect = magicBtn.getBoundingClientRect();
        const containerRect = burstContainer.getBoundingClientRect();
        const centerX = (rect.left - containerRect.left) + rect.width / 2;
        const centerY = (rect.top - containerRect.top) + rect.height / 2;

        // Generate 35 nodes per burst
        for(let i = 0; i < 35; i++) {
            physicsNodes.push(createNode(centerX, centerY));
        }

        if (!isPhysicsRunning) {
            isPhysicsRunning = true;
            updatePhysics();
        }
    });

});
