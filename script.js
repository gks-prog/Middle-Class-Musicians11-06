document.addEventListener("DOMContentLoaded", () => {
    // 1. Loading Screen (Optimized)
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => {
                if (loader) loader.style.display = 'none';
            }, 1200);
        }, 800);
    });

    // 2. Anti-Lag Header Scroll (Using requestAnimationFrame throttling)
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (lastScrollY > 100) {
                    header.classList.add('hide');
                } else {
                    header.classList.remove('hide');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true }); // Passive listener dramatically improves scroll performance

    // 3. Audio Visualizer (Error Handled & Optimized)
    const playBtn = document.getElementById('demo-play-btn');
    const audioEl = document.getElementById('demo-audio');
    const canvas = document.getElementById('global-visualizer');
    
    if (playBtn && audioEl && canvas) {
        const ctx = canvas.getContext('2d', { alpha: false }); // Alpha false optimizes canvas rendering
        const visualizerContainer = document.querySelector('.audio-visualizer-container');
        const iconPlay = document.querySelector('.icon-play');
        const iconPause = document.querySelector('.icon-pause');

        let audioContext, analyser, source, dataArray, bufferLength, animationId;
        let isInitialized = false;

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = visualizerContainer.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', resizeCanvas, { passive: true });

        const initAudio = () => {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 512; // Lower FFT size reduces CPU load for anti-lag
                analyser.smoothingTimeConstant = 0.85;
                
                source = audioContext.createMediaElementSource(audioEl);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                
                bufferLength = analyser.frequencyBinCount / 2;
                dataArray = new Uint8Array(bufferLength);
                resizeCanvas();
                isInitialized = true;
            } catch (e) {
                console.warn("Audio Context blocked or not supported:", e);
            }
        };

        const draw = () => {
            animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            
            const rect = visualizerContainer.getBoundingClientRect();
            
            // Fill background with black to optimize instead of clearRect
            ctx.fillStyle = '#030303'; 
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            const barSpacing = 3;
            const barWidth = (rect.width / bufferLength) - barSpacing;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const percent = dataArray[i] / 255;
                const barHeight = rect.height * percent;
                
                ctx.fillStyle = percent > 0.75 ? `rgba(217, 28, 53, ${percent * 0.6})` : `rgba(255, 255, 255, ${percent * 0.2})`;
                
                ctx.beginPath();
                ctx.roundRect(x, rect.height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
                ctx.fill();
                x += barWidth + barSpacing;
            }
        };

        playBtn.addEventListener('click', () => {
            if (!isInitialized) initAudio();
            
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }

            if (audioEl.paused) {
                audioEl.play().then(() => {
                    draw();
                    visualizerContainer.classList.add('is-active');
                    iconPlay.classList.add('hidden');
                    iconPause.classList.remove('hidden');
                }).catch(e => console.log("Playback prevented:", e));
            } else {
                audioEl.pause();
                cancelAnimationFrame(animationId);
                visualizerContainer.classList.remove('is-active');
                iconPause.classList.add('hidden');
                iconPlay.classList.remove('hidden');
                ctx.fillStyle = '#030303';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        });
    }

    // 4. Portfolio Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                const categories = item.getAttribute('data-category').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    item.classList.remove('is-hidden');
                } else {
                    item.classList.add('is-hidden');
                }
            });
        });
    });

    // 5. WhatsApp Form Routing
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevents page reload
            
            // Get values
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const ig = document.getElementById('ig').value;
            const query = document.getElementById('query').value;

            // IMPORTANT: Replace this with your actual studio WhatsApp number (Include Country Code, no '+' or spaces)
            const targetWhatsAppNumber = '910000000000'; 
            
            // Format the message
            const message = `*New Studio Inquiry*%0A%0A*Phone:* ${phone}%0A*Email:* ${email}%0A*Instagram:* ${ig}%0A*Query:* ${query}`;
            
            // Open WhatsApp in a new tab
            window.open(`https://wa.me/${targetWhatsAppNumber}?text=${message}`, '_blank');
            
            // Optional: Clear form after sending
            bookingForm.reset();
        });
    }
});
