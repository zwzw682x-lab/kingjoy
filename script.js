document.addEventListener('DOMContentLoaded', () => {

    // ===== 1. SCROLL-DRIVEN STICKY STORIES =====
    const stories = document.querySelectorAll('.scroll-story');
    function updateStories() {
        stories.forEach(story => {
            const rect = story.getBoundingClientRect();
            const h = story.offsetHeight;
            const vh = window.innerHeight;
            const scrolled = -rect.top;
            const progress = Math.max(0, Math.min(1, scrolled / (h - vh)));
            const steps = story.querySelectorAll('.scroll-text-item');
            const n = steps.length;
            const size = 1 / n;
            steps.forEach((step, i) => {
                const start = i * size, end = (i + 1) * size, mid = (start + end) / 2;
                let opacity = 0, y = 30;
                if (progress >= start && progress < mid) {
                    const t = (progress - start) / (mid - start);
                    opacity = t; y = 30 * (1 - t);
                } else if (progress >= mid && progress < end) {
                    const t = (progress - mid) / (end - mid);
                    opacity = 1 - t; y = -30 * t;
                }
                if (i === n - 1 && progress >= mid) {
                    const t = (progress - mid) / (1 - mid);
                    opacity = 1 - t; y = -30 * t;
                }
                step.style.opacity = Math.max(0, Math.min(1, opacity));
                step.style.transform = `translate(-50%,-50%) translateY(${y}px)`;
                step.classList.toggle('active', opacity > 0.3);
            });
            const bg = story.querySelector('.scroll-bg');
            if (bg) bg.style.transform = `scale(${1 + progress * .12})`;
        });
    }

    // ===== 2. ZOOM REVEAL =====
    const zooms = document.querySelectorAll('.zoom-section');
    function updateZoom() {
        zooms.forEach(s => {
            const rect = s.getBoundingClientRect();
            const h = s.offsetHeight, vh = window.innerHeight;
            const scrolled = -rect.top;
            const p = Math.max(0, Math.min(1, scrolled / (h - vh)));
            const img = s.querySelector('.zoom-img-wrap img');
            const txt = s.querySelector('.zoom-text');
            if (img) {
                img.style.transform = `scale(${.5 + p * .5})`;
                img.style.filter = `blur(${(1 - p) * 8}px) brightness(${.3 + p * .35})`;
            }
            if (txt) txt.classList.toggle('visible', p > .5);
        });
    }

    // ===== 3. HERO PARALLAX =====
    const hero = document.querySelector('.hero');
    const hContent = document.querySelector('.hero-content');
    function heroParallax() {
        if (!hero || !hContent) return;
        const y = window.scrollY, h = hero.offsetHeight;
        if (y < h) { hContent.style.transform = `translateY(${y * .3}px)`; hContent.style.opacity = 1 - (y / h) * 1.4; }
    }

    // ===== 4. COMBINED SCROLL =====
    let ticking = false;
    function onScroll() {
        if (!ticking) { requestAnimationFrame(() => { updateStories(); updateZoom(); heroParallax(); ticking = false; }); ticking = true; }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ===== 5. FADE-UP OBSERVER =====
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

    // ===== 6. COUNTER ANIMATION =====
    const cObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target;
            if (el.dataset.counted) return;
            el.dataset.counted = '1';
            const target = +el.dataset.target, dur = 1500, start = performance.now();
            (function tick(now) {
                const p = Math.min((now - start) / dur, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            })(start);
        });
    }, { threshold: .5 });
    document.querySelectorAll('.num[data-target]').forEach(el => cObs.observe(el));

    // ===== 7. CATEGORY TAB SWITCHING =====
    const tabs = document.querySelectorAll('.cat-tab');
    const panels = document.querySelectorAll('.cat-panel');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const t = document.getElementById('tab-' + tab.dataset.tab);
            if (t) t.classList.add('active');
        });
    });

    // ===== 8. HERO PARTICLES =====
    const canvas = document.getElementById('heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles = [];
        function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
        resize(); window.addEventListener('resize', resize);
        class P {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * w; this.y = Math.random() * h;
                this.r = Math.random() * 1.6 + .3;
                this.vx = (Math.random() - .5) * .25; this.vy = (Math.random() - .5) * .25;
                this.a = Math.random() * .35 + .08;
                this.hue = [210, 220, 30, 0][Math.floor(Math.random() * 4)];
            }
            update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset(); }
            draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = `hsla(${this.hue},70%,60%,${this.a})`; ctx.fill(); }
        }
        const n = Math.min(Math.floor(w * h / 7000), 120);
        for (let i = 0; i < n; i++) particles.push(new P());
        function drawLines() {
            for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy);
                if (d < 110) { ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(0,113,227,${.05 * (1 - d / 110)})`; ctx.lineWidth = .5; ctx.stroke(); }
            }
        }
        (function loop() { ctx.clearRect(0, 0, w, h); particles.forEach(p => { p.update(); p.draw(); }); drawLines(); requestAnimationFrame(loop); })();
    }

    // ===== 9. MOBILE NAV =====
    const toggle = document.getElementById('navToggle'), links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

    // ===== 10. GALLERY DUPLICATE =====
    const track = document.querySelector('.gallery-track');
    if (track) track.innerHTML += track.innerHTML;
});
