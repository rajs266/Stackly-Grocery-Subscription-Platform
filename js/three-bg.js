/* 
   Stackly - DotField React Bits Background Engine (Vanilla JS + CSS)
   Features: Light Organic Emerald Theme, Interactive Cursor Bulge, Soft SVG Glow,
   Organic Wave Motion & Sparkle Effects
*/

(function () {
  const TWO_PI = Math.PI * 2;

  // DotField Config tailored for Light Organic Stackly Theme
  const config = {
    dotRadius: 1.8,
    dotSpacing: 16,
    cursorRadius: 380,
    cursorForce: 0.1,
    bulgeOnly: true,
    bulgeStrength: 65,
    glowRadius: 180,
    sparkle: true,
    waveAmplitude: 1.8,
    gradientFrom: 'rgba(34, 197, 94, 0.45)', // Fresh Organic Emerald Green
    gradientTo: 'rgba(16, 185, 129, 0.22)',   // Soft Mint Green
    glowColor: 'rgba(34, 197, 94, 0.20)'      // Soft Light Green Glow
  };

  function initDotField() {
    // 1. Ensure Canvas Exists
    let canvas = document.getElementById('three-canvas-bg');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'three-canvas-bg';
      document.body.prepend(canvas);
    }

    // 2. Ensure SVG Glow Element Exists
    let svg = document.getElementById('dotfield-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = 'dotfield-svg';
      svg.style.position = 'fixed';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100vw';
      svg.style.height = '100vh';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '-1';

      const glowId = `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`;
      svg.innerHTML = `
        <defs>
          <radialGradient id="${glowId}">
            <stop offset="0%" stop-color="${config.glowColor}" />
            <stop offset="100%" stop-color="transparent" />
          </radialGradient>
        </defs>
        <circle id="dotfield-glow-circle" cx="-9999" cy="-9999" r="${config.glowRadius}" fill="url(#${glowId})" style="opacity: 0; will-change: opacity, transform;" />
      `;
      document.body.prepend(svg);
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    const glowCircle = document.getElementById('dotfield-glow-circle');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let dots = [];
    let size = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
    let mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    let engagement = 0;
    let glowOpacity = 0;
    let frameCount = 0;
    let rafId = null;

    function buildDots(w, h) {
      const step = config.dotRadius + config.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      dots = new Array(rows * cols);
      let idx = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[idx++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
        }
      }
    }

    function doResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      size = { w, h, offsetX: 0, offsetY: 0 };
      buildDots(w, h);
    }

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 100);
    }

    function onMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function updateMouseSpeed() {
      const dx = mouse.prevX - mouse.x;
      const dy = mouse.prevY - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      mouse.speed += (dist - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    }

    const speedInterval = setInterval(updateMouseSpeed, 20);

    function tick() {
      frameCount++;
      const { w, h } = size;
      const len = dots.length;
      const t = frameCount * 0.02;

      const targetEngagement = Math.min(mouse.speed / 5, 1);
      engagement += (targetEngagement - engagement) * 0.06;
      if (engagement < 0.001) engagement = 0;

      glowOpacity += (engagement - glowOpacity) * 0.08;

      if (glowCircle) {
        glowCircle.setAttribute('cx', mouse.x);
        glowCircle.setAttribute('cy', mouse.y);
        glowCircle.style.opacity = glowOpacity;
      }

      ctx.clearRect(0, 0, w, h);

      if (w > 0 && h > 0 && len > 0) {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, config.gradientFrom);
        grad.addColorStop(1, config.gradientTo);
        ctx.fillStyle = grad;

        const cr = config.cursorRadius;
        const crSq = cr * cr;
        const rad = config.dotRadius / 2;
        const isBulge = config.bulgeOnly;

        ctx.beginPath();

        for (let i = 0; i < len; i++) {
          const d = dots[i];
          const dx = mouse.x - d.ax;
          const dy = mouse.y - d.ay;
          const distSq = dx * dx + dy * dy;

          if (distSq < crSq && engagement > 0.01) {
            const dist = Math.sqrt(distSq);
            if (isBulge) {
              const pushT = 1 - dist / cr;
              const push = pushT * pushT * config.bulgeStrength * engagement;
              const angle = Math.atan2(dy, dx);
              d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
              d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
            } else {
              const angle = Math.atan2(dy, dx);
              const move = (500 / dist) * (mouse.speed * config.cursorForce);
              d.vx += Math.cos(angle) * -move;
              d.vy += Math.sin(angle) * -move;
            }
          } else if (isBulge) {
            d.sx += (d.ax - d.sx) * 0.1;
            d.sy += (d.ay - d.sy) * 0.1;
          }

          if (!isBulge) {
            d.vx *= 0.9;
            d.vy *= 0.9;
            d.x = d.ax + d.vx;
            d.y = d.ay + d.vy;
            d.sx += (d.x - d.sx) * 0.1;
            d.sy += (d.y - d.sy) * 0.1;
          }

          let drawX = d.sx;
          let drawY = d.sy;
          if (config.waveAmplitude > 0) {
            drawY += Math.sin(d.ax * 0.03 + t) * config.waveAmplitude;
            drawX += Math.cos(d.ay * 0.03 + t * 0.7) * config.waveAmplitude * 0.5;
          }

          if (config.sparkle) {
            const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
            if ((hash % 100) < 3) {
              ctx.moveTo(drawX + rad * 1.8, drawY);
              ctx.arc(drawX, drawY, rad * 1.8, 0, TWO_PI);
            } else {
              ctx.moveTo(drawX + rad, drawY);
              ctx.arc(drawX, drawY, rad, 0, TWO_PI);
            }
          } else {
            ctx.moveTo(drawX + rad, drawY);
            ctx.arc(drawX, drawY, rad, 0, TWO_PI);
          }
        }

        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    }

    doResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafId = requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDotField);
  } else {
    initDotField();
  }
})();
