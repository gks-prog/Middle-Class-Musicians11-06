document.addEventListener("DOMContentLoaded", () => {
    // 1. Loading Screen
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.style.display = 'none', 1200);
        }, 800);
    });

    // 2. Hide Header on Scroll Down
    let lastScroll = 0;
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100 && currentScroll > lastScroll) {
            header.classList.add('hide');
        } else {
            header.classList.remove('hide');
        }
        lastScroll = currentScroll;
    });

    // 3. Audio Visualizer (Web Audio API)
    const playBtn = document.getElementById('demo-play-btn');
    const audioEl = document.getElementById('demo-audio');
    const canvas = document.getElementById('global-visualizer');
    const ctx = canvas.getContext('2d');
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
    window.addEventListener('resize', resizeCanvas);

    const initAudio = () => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.85;
        
        source = audioContext.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        bufferLength = analyser.frequencyBinCount / 2;
        dataArray = new Uint8Array(bufferLength);
        resizeCanvas();
        isInitialized = true;
    };

    const draw = () => {
        animationId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        
        const rect = visualizerContainer.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        
        const barSpacing = 3;
        const barWidth = (rect.width / bufferLength) - barSpacing;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const percent = dataArray[i] / 255;
            const barHeight = rect.height * percent;
            
            // Premium cinematic grading (Soft whites, vibrant accent on peaks)
            ctx.fillStyle = percent > 0.75 ? `rgba(217, 28, 53, ${percent * 0.6})` : `rgba(255, 255, 255, ${percent * 0.2})`;
            
            ctx.beginPath();
            ctx.roundRect(x, rect.height - barHeight, barWidth, barHeight, [2, 2, 0, 0]);
            ctx.fill();
            x += barWidth + barSpacing;
        }
    };

    playBtn.addEventListener('click', () => {
        if (!isInitialized) initAudio();
        if (audioContext.state === 'suspended') audioContext.resume();

        if (audioEl.paused) {
            audioEl.play();
            draw();
            visualizerContainer.classList.add('is-active');
            iconPlay.classList.add('hidden');
            iconPause.classList.remove('hidden');
        } else {
            audioEl.pause();
            cancelAnimationFrame(animationId);
            visualizerContainer.classList.remove('is-active');
            iconPause.classList.add('hidden');
            iconPlay.classList.remove('hidden');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

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
});
