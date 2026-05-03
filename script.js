document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Loading Screen
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.classList.add('hidden');
                setTimeout(() => { loader.style.display = 'none'; }, 1200);
            }, 800);
        });
    }

    // 2. Header Scroll Performance Optimized
    const header = document.getElementById('header');
    if (header) {
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
        }, { passive: true });
    }

    // 3. Audio & Visualizer Engine
    const audioEl = document.getElementById('global-audio');
    const canvas = document.getElementById('global-visualizer');
    const visualizerContainer = document.getElementById('visualizer-container');
    const heroPlayBtn = document.getElementById('hero-play-btn');

    if (audioEl && canvas && visualizerContainer && heroPlayBtn) {
        const ctx = canvas.getContext('2d', { alpha: false });
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
                analyser.fftSize = 256; 
                analyser.smoothingTimeConstant = 0.85;
                source = audioContext.createMediaElementSource(audioEl);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                bufferLength = analyser.frequencyBinCount / 2;
                dataArray = new Uint8Array(bufferLength);
                resizeCanvas();
                isInitialized = true;
            } catch (e) { 
                console.warn("Audio Context blocked:", e); 
            }
        };

        const drawVisualizer = () => {
            animationId = requestAnimationFrame(drawVisualizer);
            analyser.getByteFrequencyData(dataArray);
            const rect = visualizerContainer.getBoundingClientRect();
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

        const stopAudio = () => {
            audioEl.pause();
            cancelAnimationFrame(animationId);
            visualizerContainer.classList.remove('is-active');
            ctx.fillStyle = '#030303';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            document.querySelectorAll('.icon-pause').forEach(i => i.classList.add('hidden'));
            document.querySelectorAll('.icon-play').forEach(i => i.classList.remove('hidden'));
        };

        const playTrack = (url) => {
            if (!isInitialized) initAudio();
            if (audioContext && audioContext.state === 'suspended') audioContext.resume();
            
            audioEl.src = url;
            audioEl.play().then(() => {
                drawVisualizer();
                visualizerContainer.classList.add('is-active');
            }).catch(e => console.log("Playback prevented by browser auto-play policy."));
        };

        heroPlayBtn.addEventListener('click', () => {
            const iconPlay = heroPlayBtn.querySelector('.icon-play');
            const iconPause = heroPlayBtn.querySelector('.icon-pause');
            
            if (audioEl.paused || audioEl.src !== heroPlayBtn.dataset.audioSrc) {
                playTrack(heroPlayBtn.dataset.audioSrc);
                if (iconPlay) iconPlay.classList.add('hidden'); 
                if (iconPause) iconPause.classList.remove('hidden');
            } else {
                stopAudio();
            }
        });

        // 4. Portfolio Click / Pop-out Logic (Tied to Audio)
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        const zoomedOverlay = document.getElementById('zoomed-overlay');
        const closeZoomedBtn = document.getElementById('close-zoomed');
        const track = document.getElementById('portfolio-track');

        if (zoomedOverlay && closeZoomedBtn && track) {
            portfolioItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    // Ignore if dragging
                    if (window.isDraggingCarousel) return;

                    const imgSrc = item.querySelector('.portfolio-item__image')?.src;
                    const title = item.querySelector('.portfolio-item__title')?.innerText;
                    const artist = item.querySelector('.portfolio-item__artist')?.innerText;
                    const audioUrl = item.getAttribute('data-audio-src');

                    if (imgSrc) document.getElementById('zoomed-img').src = imgSrc;
                    if (title) document.getElementById('zoomed-title').innerText = title;
                    if (artist) document.getElementById('zoomed-artist').innerText = artist;

                    zoomedOverlay.classList.add('is-active');
                    track.classList.add('is-dimmed');
                    
                    stopAudio();
                    if (audioUrl) playTrack(audioUrl);
                });
            });

            closeZoomedBtn.addEventListener('click', () => {
                zoomedOverlay.classList.remove('is-active');
                track.classList.remove('is-dimmed');
                stopAudio(); 
            });
        }
    }

    // 5. Portfolio Carousel Logic
    const track = document.getElementById('portfolio-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const wrapper = document.getElementById('portfolio-wrapper');
    
    if (track && prevBtn && nextBtn && wrapper && track.children.length > 0) {
        let carouselInterval;
        let slideIntervalTime = 3000;
        let hasInteracted = false;
        let isAnimating = false;
        window.isDraggingCarousel = false; // Global flag for click prevention

        const handleInteraction = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                slideIntervalTime = 5500;
            }
            resetCarousel();
        };

        const moveNext = () => {
            if(isAnimating || !track.firstElementChild) return;
            isAnimating = true;
            const firstItem = track.firstElementChild;
            const itemWidth = firstItem.offsetWidth;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 32; 
            const moveDistance = itemWidth + gap;
            
            track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            track.style.transform = `translateX(-${moveDistance}px)`;
            
            setTimeout(() => {
                track.style.transition = 'none';
                track.appendChild(firstItem); 
                track.style.transform = 'translateX(0)';
                isAnimating = false;
            }, 600);
        };

        const movePrev = () => {
            if(isAnimating || !track.lastElementChild) return;
            isAnimating = true;
            const lastItem = track.lastElementChild;
            const itemWidth = lastItem.offsetWidth;
            const gap = parseFloat(window.getComputedStyle(track).gap) || 32; 
            const moveDistance = itemWidth + gap;

            track.style.transition = 'none';
            track.insertBefore(lastItem, track.firstElementChild);
            track.style.transform = `translateX(-${moveDistance}px)`;

            void track.offsetWidth; // Force layout reflow

            track.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            track.style.transform = 'translateX(0)';

            setTimeout(() => {
                isAnimating = false;
            }, 600);
        };

        const startCarousel = () => {
            carouselInterval = setInterval(moveNext, slideIntervalTime); 
        };

        const resetCarousel = () => {
            clearInterval(carouselInterval);
            startCarousel();
        };

        nextBtn.addEventListener('click', () => { handleInteraction(); moveNext(); });
        prevBtn.addEventListener('click', () => { handleInteraction(); movePrev(); });

        let startX = 0;
        wrapper.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            window.isDraggingCarousel = false;
        }, { passive: true });

        wrapper.addEventListener('touchmove', () => {
            window.isDraggingCarousel = true;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            let endX = e.changedTouches[0].clientX;
            let diffX = startX - endX;

            if (diffX > 50) {
                handleInteraction();
                moveNext();
            } else if (diffX < -50) {
                handleInteraction();
                movePrev();
            }
            
            setTimeout(() => { window.isDraggingCarousel = false; }, 100);
        });

        startCarousel();
    }

    // 6. WhatsApp Routing Form
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const name = document.getElementById('name')?.value || '';
            const phone = document.getElementById('phone')?.value || '';
            const ig = document.getElementById('ig')?.value || '';
            const query = document.getElementById('query')?.value || '';

            const targetWhatsAppNumber = '919315778147';
            const rawMessage = `*New Studio Inquiry*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Instagram:* ${ig}\n*Query:* ${query}`;
            window.open(`https://wa.me/${targetWhatsAppNumber}?text=${encodeURIComponent(rawMessage)}`, '_blank');
            bookingForm.reset();
        });
    }

    // 7. Floating Musical Notes Background Effect
    const initFloatingNotes = () => {
        const container = document.getElementById('floating-notes-container');
        if (!container) return;

        const symbols = ['♪', '♫', '♩', '♬', '♭', '♮'];
        const noteCount = 20; 
        const notes = [];

        for (let i = 0; i < noteCount; i++) {
            const noteEl = document.createElement('span');
            const left = Math.random() * 100; 
            const size = Math.random() * 2 + 1; 
            const opacity = Math.random() * 0.15 + 0.05; 
            const speed = Math.random() * 0.5 + 0.2; 
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const baseY = Math.random() * 100; 

            noteEl.innerText = symbol;
            noteEl.style.position = 'absolute';
            noteEl.style.left = `${left}%`;
            noteEl.style.top = `${baseY}%`;
            noteEl.style.fontSize = `${size}rem`;
            noteEl.style.color = '#ffffff';
            noteEl.style.opacity = opacity;
            noteEl.style.willChange = 'transform';
            noteEl.style.transition = 'transform 0.1s linear';

            container.appendChild(noteEl);
            notes.push({ el: noteEl, speed });
        }

        let notesTicking = false;
        window.addEventListener('scroll', () => {
            if (!notesTicking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    notes.forEach(note => {
                        const yPos = -(scrollY * note.speed);
                        note.el.style.transform = `translate3d(0, ${yPos}px, 0)`;
                    });
                    notesTicking = false;
                });
                notesTicking = true;
            }
        }, { passive: true });
    };

    initFloatingNotes();
});
