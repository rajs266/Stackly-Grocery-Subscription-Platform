/* 
   Stackly - Grocery Subscription Platform
   Main Interactive Script with Delayed High-Impact Scroll Entrance Animation Engine,
   Rolling Count-Up Numbers, Progress Bar Fills, PillNav Indicator,
   React Bits Infinite Looping CircularGallery Engine,
   Form Submit Validation & Toast System
*/

// Product Catalog Default Assets Lookup
const PRODUCT_CATALOG_IMAGES = {
  'native_heirloom_tomatoes': {
    image: 'assets/tomatoes.webp',
    unit: '1 kg'
  },
  'native_a2_country_milk': {
    image: 'assets/milk.webp',
    unit: '1 Liter Bottle'
  },
  'native_a2_milk__1l_': {
    image: 'assets/milk.webp',
    unit: '1 Liter Bottle'
  },
  'a2_country_cow_ghee': {
    image: 'assets/ghee.webp',
    unit: '500g Glass Jar'
  },
  'country_cow_ghee__500g_': {
    image: 'assets/ghee.webp',
    unit: '500g Glass Jar'
  },
  'yercaud_raw_wild_honey': {
    image: 'assets/honey.webp',
    unit: '500g Glass Jar'
  },
  'yercaud_raw_honey__500g_': {
    image: 'assets/honey.webp',
    unit: '500g Glass Jar'
  },
  'organic_farm_spinach': {
    image: 'assets/spinach.webp',
    unit: '250g Bunch'
  },
  'organic_bell_peppers': {
    image: 'assets/bell_peppers.webp',
    unit: '500g Pack'
  },
  'cold_pressed_sesame_oil': {
    image: 'assets/sesame_oil.webp',
    unit: '1 Liter Bottle'
  },
  'chekku_groundnut_oil__1l_': {
    image: 'assets/sesame_oil.webp',
    unit: '1 Liter Bottle'
  },
  'soil_plucked_farm_carrots': {
    image: 'assets/carrots.webp',
    unit: '1 kg'
  },
  'native_salem_shallots': {
    image: 'assets/shallots.webp',
    unit: '1 kg'
  },
  'organic_farm_cucumber': {
    image: 'assets/cucumber.webp',
    unit: '1 kg'
  },
  'seeraga_samba_rice': {
    image: 'assets/rice.webp',
    unit: '5 kg Pack'
  },
  'country_free_range_eggs': {
    image: 'assets/eggs.webp',
    unit: '6 pcs Pack'
  }
};

// Cart State Manager
const StacklyCart = {
  items: JSON.parse(localStorage.getItem('stackly_cart')) || [],
  
  save() {
    localStorage.setItem('stackly_cart', JSON.stringify(this.items));
    this.updateUI(true);
  },

  addItem(nameOrProduct, priceVal = 45, imgVal = '', unitVal = '') {
    let product;
    if (typeof nameOrProduct === 'string') {
      const id = nameOrProduct.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const catalogInfo = PRODUCT_CATALOG_IMAGES[id] || {};
      product = {
        id: id,
        name: nameOrProduct,
        price: Number(priceVal) || 45,
        qty: 1,
        image: imgVal || catalogInfo.image || 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80',
        unit: unitVal || catalogInfo.unit || '1 Pack'
      };
    } else {
      product = nameOrProduct || {};
      if (!product.id && product.name) {
        product.id = product.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      }
    }

    if (!product.id) return;

    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        qty: product.qty || 1,
        image: product.image || 'assets/logo.webp',
        unit: product.unit || '1 Pack'
      });
    }
    this.save();
    showToast(`Added "${product.name}" to your subscription basket!`);
  },

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    showToast('Item removed from cart');
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  getCount() {
    return this.items.reduce((sum, item) => sum + item.qty, 0);
  },

  updateUI(triggerBump = false) {
    const badges = document.querySelectorAll('.badge-cart-count');
    badges.forEach(b => {
      b.textContent = this.getCount();
      if (triggerBump) {
        b.classList.remove('bump');
        void b.offsetWidth;
        b.classList.add('bump');
      }
    });

    const cartList = document.getElementById('cart-modal-list');
    const totalEl = document.getElementById('cart-modal-total');

    if (cartList) {
      if (this.items.length === 0) {
        cartList.innerHTML = '<div class="text-center py-4 text-muted"><i class="fa-solid fa-basket-shopping fa-3x mb-3 text-emerald-400"></i><p class="mb-0">Your subscription box is empty</p><small class="text-muted">Add items from Shop to get started!</small></div>';
      } else {
        cartList.innerHTML = this.items.map(item => `
          <div class="d-flex align-items-center justify-content-between p-2 border-bottom">
            <div class="d-flex align-items-center gap-3">
              <img src="${item.image}" alt="${item.name}" class="rounded" style="width: 44px; height: 44px; object-fit: cover;">
              <div>
                <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.9rem;">${item.name}</h6>
                <small class="text-muted">₹${item.price} × ${item.qty} (${item.unit})</small>
              </div>
            </div>
            <button class="btn btn-sm text-danger" onclick="StacklyCart.removeItem('${item.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        `).join('');
      }
    }

    if (totalEl) {
      totalEl.textContent = `₹${this.getTotal()}`;
    }
  }
};

// Toast Notifications Helper
function showToast(message, title = 'Stackly Update') {
  const existing = document.querySelector('.stackly-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'stackly-toast';
  toast.innerHTML = `
    <div class="bg-success text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
      <i class="fa-solid fa-check"></i>
    </div>
    <div>
      <h6 class="mb-0 fw-bold text-dark" style="font-size: 0.85rem;">${title}</h6>
      <small class="text-muted" style="font-size: 0.78rem;">${message}</small>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.4s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// 1. HIGH-IMPACT SCROLL ENTRANCE ANIMATION OBSERVER
function initScrollEntranceObserver() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-from-left, .reveal-from-right');

  // IntersectionObserver for hardware acceleration
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Performance fix: stop observing once revealed
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.15
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if not supported
    revealElements.forEach(el => el.classList.add('revealed'));
  }
}

// 2. Count-Up Rolling Number & Progress Fill Engine
function animateCountUp(targetEl, finalVal, suffix = '', duration = 2000) {
  let startTime = null;
  const startVal = 0;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.floor(easeProgress * (finalVal - startVal) + startVal);
    
    targetEl.textContent = currentVal.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      targetEl.textContent = finalVal.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(step);
}

function initRollingCounters() {
  const counterElements = [
    { id: 'counter-subscribers', val: 10000, suffix: '+', fillId: 'fill-subscribers', fillPct: '95%' },
    { id: 'counter-farms', val: 45, suffix: '+', fillId: 'fill-farms', fillPct: '88%' },
    { id: 'counter-plastic', val: 150000, suffix: '+', fillId: 'fill-plastic', fillPct: '98%' },
    { id: 'counter-delivery', val: 100, suffix: '%', fillId: 'fill-delivery', fillPct: '100%' }
  ];

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        counterElements.forEach(item => {
          const el = document.getElementById(item.id);
          const fillEl = document.getElementById(item.fillId);
          if (el) animateCountUp(el, item.val, item.suffix);
          if (fillEl) fillEl.style.width = item.fillPct;
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const communitySection = document.querySelector('.community-impact-section');
  if (communitySection) observer.observe(communitySection);
}

// 3. Sleek Laser Beam GlowCursor 2D Canvas Engine
function initGlowCursor() {
  if (window.innerWidth < 768) return;

  let canvas = document.getElementById('glow-cursor-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'glow-cursor-canvas';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = (canvas.width = document.documentElement.clientWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = document.documentElement.clientWidth;
    height = canvas.height = window.innerHeight;
  });

  const config = {
    colorHead: '#67e8f9',
    colorCore: '#22c55e',
    colorTail: '#16a34a',
    trailLength: 32,
    maxWidth: 5.5,
    minWidth: 0.4,
    followSpeed: 0.28,
    idleTimeout: 600,
    fadeDuration: 800
  };

  let targetX = width / 2;
  let targetY = height / 2;
  let currentX = targetX;
  let currentY = targetY;
  let trail = [];
  let lastMoveTime = performance.now();

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    lastMoveTime = performance.now();
  });

  for (let i = 0; i < config.trailLength; i++) {
    trail.push({ x: targetX, y: targetY });
  }

  function render(timestamp) {
    ctx.clearRect(0, 0, width, height);

    currentX += (targetX - currentX) * config.followSpeed;
    currentY += (targetY - currentY) * config.followSpeed;

    trail.pop();
    trail.unshift({ x: currentX, y: currentY });

    const timeSinceMove = timestamp - lastMoveTime;
    let opacity = 1;
    if (timeSinceMove > config.idleTimeout) {
      opacity = Math.max(0, 1 - (timeSinceMove - config.idleTimeout) / config.fadeDuration);
    }

    if (opacity > 0 && trail.length > 2) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = opacity;

      for (let i = 0; i < trail.length - 1; i++) {
        const p1 = trail[i];
        const p2 = trail[i + 1];
        const progress = i / trail.length;

        const segmentWidth = (config.maxWidth - config.minWidth) * Math.pow(1 - progress, 1.4) + config.minWidth;
        const segmentAlpha = Math.pow(1 - progress, 0.7);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        ctx.strokeStyle = progress < 0.2 ? config.colorHead : (progress < 0.6 ? config.colorCore : config.colorTail);
        ctx.lineWidth = segmentWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = config.colorCore;
        ctx.shadowBlur = (8 * (1 - progress)) + 2;
        ctx.globalAlpha = opacity * segmentAlpha;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(currentX, currentY, config.maxWidth * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = config.colorHead;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = opacity;
      ctx.fill();

      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// 4. PillNav Indicator Component Logic
function initPillNav() {
  const container = document.querySelector('.pill-nav-container');
  if (!container) return;

  const links = container.querySelectorAll('.pill-nav-link');
  let indicator = container.querySelector('.pill-nav-indicator');

  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'pill-nav-indicator';
    container.appendChild(indicator);
  }

  function moveIndicator(targetEl) {
    if (!targetEl || window.innerWidth < 992) {
      indicator.style.opacity = '0';
      return;
    }
    const navRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    indicator.style.width = `${targetRect.width}px`;
    indicator.style.left = `${targetRect.left - navRect.left}px`;
    indicator.style.top = `${targetRect.top - navRect.top}px`;
    indicator.style.height = `${targetRect.height}px`;
    indicator.style.opacity = '1';
  }

  function refreshIndicator() {
    if (window.innerWidth < 992) {
      indicator.style.opacity = '0';
    } else {
      const active = container.querySelector('.pill-nav-link.active') || links[0];
      moveIndicator(active);
    }
  }

  const activeLink = container.querySelector('.pill-nav-link.active') || links[0];
  if (activeLink) {
    setTimeout(() => refreshIndicator(), 150);
  }

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
  });

  container.addEventListener('mouseleave', () => refreshIndicator());
  window.addEventListener('resize', () => refreshIndicator());
}

// 5. React Bits Infinite Looping CircularGallery Engine
function initCircularGallery() {
  const container = document.getElementById('circular-gallery');
  if (!container) return;

  const itemsData = [
    { image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80', label: 'Organic Veggie Box' },
    { image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80', label: 'Salem Native A2 Milk' },
    { image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80', label: 'Exotic Fruit Basket' },
    { image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', label: 'Artisanal Sourdough' },
    { image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80', label: 'Cold Pressed Juice' },
    { image: 'assets/eggs.webp', label: 'Farm Fresh Eggs' },
    { image: 'assets/honey.webp', label: 'Organic Wild Honey' },
    { image: 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?auto=format&fit=crop&w=800&q=80', label: 'Microgreens & Herbs' },
    { image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', label: 'Cold Pressed Oil' },
    { image: 'assets/ghee.webp', label: 'Country Cow Ghee' }
  ];

  let viewport = container.querySelector('.circular-gallery-viewport');
  if (!viewport) {
    viewport = document.createElement('div');
    viewport.className = 'circular-gallery-viewport';
    container.appendChild(viewport);
  }
  viewport.innerHTML = '';

  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  const bend = 3;
  const numSlots = 7;

  for (let i = 0; i < numSlots; i++) {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'circular-card-wrapper';
    cardWrapper.innerHTML = `
      <img src="" alt="" class="circular-card-img" draggable="false">
      <div class="circular-card-text"></div>
    `;
    viewport.appendChild(cardWrapper);
  }

  const cards = viewport.querySelectorAll('.circular-card-wrapper');
  
  // CACHE DOM queries to prevent layout thrashing inside animation loop
  const cachedCards = Array.from(cards).map(card => ({
    card: card,
    imgEl: card.querySelector('.circular-card-img'),
    textEl: card.querySelector('.circular-card-text')
  }));

  let currentScroll = 0;
  let targetScroll = 0;
  let isMouseDown = false;
  let startX = 0;
  let previousScroll = 0;

  function render3DArc() {
    const cardWidth = window.innerWidth < 768 ? 170 : 220;
    const spacing = cardWidth * 1.15;
    const totalItems = itemsData.length;

    const baseIndex = Math.floor(currentScroll);
    const frac = currentScroll - baseIndex;

    cachedCards.forEach((cached, slotIdx) => {
      const { card, imgEl, textEl } = cached;
      const slotOffset = slotIdx - 3 - frac;
      const itemIndex = ((baseIndex + slotIdx - 3) % totalItems + totalItems) % totalItems;
      const item = itemsData[itemIndex];

      if (imgEl.getAttribute('src') !== item.image) {
        imgEl.src = item.image;
        imgEl.alt = item.label;
      }
      if (textEl.textContent !== item.label) {
        textEl.textContent = item.label;
      }

      const x = slotOffset * spacing;
      const normOffset = slotOffset / 2.2;

      const y = Math.pow(Math.abs(normOffset), 1.8) * 16 * (bend / 3);
      const z = -Math.pow(Math.abs(normOffset), 1.8) * 90;
      const rotY = normOffset * 18 * (bend / 3);

      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg)`;
      const opacity = Math.max(0.15, 1 - Math.abs(normOffset) * 0.35);
      card.style.opacity = opacity;
    });
  }

  function animate() {
    // Only render and recalculate if actually moving
    if (Math.abs(targetScroll - currentScroll) > 0.001) {
      currentScroll += (targetScroll - currentScroll) * 0.08;
      render3DArc();
    } else if (currentScroll !== targetScroll) {
      currentScroll = targetScroll;
      render3DArc();
    }
    requestAnimationFrame(animate);
  }
  animate();

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isMouseDown = true;
    startX = e.clientX;
    previousScroll = targetScroll;
    viewport.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown || (e.buttons & 1) !== 1) {
      if (isMouseDown) {
        isMouseDown = false;
        viewport.style.cursor = 'grab';
      }
      return;
    }
    const deltaX = e.clientX - startX;
    targetScroll = previousScroll - (deltaX / 250);
  });

  window.addEventListener('mouseup', () => {
    if (isMouseDown) {
      isMouseDown = false;
      viewport.style.cursor = 'grab';
    }
  });

  window.addEventListener('mouseleave', () => {
    if (isMouseDown) {
      isMouseDown = false;
      viewport.style.cursor = 'grab';
    }
  });

  viewport.addEventListener('touchstart', (e) => {
    isMouseDown = true;
    startX = e.touches[0].clientX;
    previousScroll = targetScroll;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isMouseDown) return;
    const deltaX = e.touches[0].clientX - startX;
    targetScroll = previousScroll - (deltaX / 250);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isMouseDown = false;
  });
}

// 6. Form Submit Validation & Newsletter 404 Redirect
function initFormSubmitWobble() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      let hasError = false;
      const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          hasError = true;
          input.classList.add('submit-wobble-error');
          setTimeout(() => input.classList.remove('submit-wobble-error'), 600);
        }
      });

      if (hasError) {
        e.preventDefault();
        showToast('Please fill out all required fields marked in red.', 'Validation Error');
        return;
      }

      if (form.id === 'newsletter-form' || form.classList.contains('newsletter-input-group')) {
        e.preventDefault();
        window.location.href = '404.html';
      }
    });
  });
}

// Countdown Timer Handler
function initCountdownTimer() {
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  if (!hoursEl || !minsEl || !secsEl) return;

  let targetTime = new Date().getTime() + (22 * 3600 * 1000 + 48 * 60 * 1000 + 35 * 1000);

  setInterval(() => {
    const now = new Date().getTime();
    const diff = targetTime - now;

    if (diff <= 0) return;

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

// Mobile Full Screen Menu Auto Close Helper
function initMobileMenuAutoClose() {
  const navCollapse = document.getElementById('stacklyNav');
  if (!navCollapse) return;

  const links = navCollapse.querySelectorAll('a.pill-nav-link, a.btn');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 992 && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse) || new bootstrap.Collapse(navCollapse);
        bsCollapse.hide();
      }
    });
  });
}

// Scroll-Triggered Animated Timeline Line & Dots Engine
function initScrollTimeline() {
  const section = document.querySelector('.scroll-timeline-section');
  if (!section) return;

  const lineFill = section.querySelector('.scroll-timeline-line-fill');
  const items = section.querySelectorAll('.scroll-timeline-item');
  if (!lineFill || !items.length) return;

  let ticking = false;

  function updateTimeline() {
    const secRect = section.getBoundingClientRect();
    const winHeight = window.innerHeight;

    const totalHeight = secRect.height;
    const scrollPos = winHeight - secRect.top;

    let progress = (scrollPos / (totalHeight + winHeight * 0.3)) * 100;
    progress = Math.max(0, Math.min(100, progress));

    // Batch DOM Reads
    const itemRects = Array.from(items).map(item => item.getBoundingClientRect().top);

    // Batch DOM Writes
    lineFill.style.height = `${progress}%`;
    items.forEach((item, index) => {
      if (itemRects[index] < winHeight * 0.75) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

// =========================================================
// SHOP REAL-TIME SEARCH & CATEGORY FILTERING ENGINE
// =========================================================
function initShopFilterAndSearch() {
  const searchInput = document.getElementById('shop-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  const filterBtns = document.querySelectorAll('.shop-filter-btn');
  const productCards = document.querySelectorAll('.shop-product-item');
  const noProducts = document.getElementById('no-products-found');
  const resetBtn = document.getElementById('reset-filter-btn');
  
  if (!searchInput && filterBtns.length === 0) return;

  let currentCategory = 'all';
  let searchQuery = '';

  function filterProducts() {
    let visibleCount = 0;
    const query = searchQuery.trim().toLowerCase();

    productCards.forEach(card => {
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const tags = (card.getAttribute('data-tags') || '').toLowerCase();
      const badgeText = (card.querySelector('.badge')?.textContent || '').toLowerCase();
      const descText = (card.querySelector('p')?.textContent || '').toLowerCase();

      // Check category match
      const catList = category.split(' ');
      const matchesCategory = (currentCategory === 'all') || 
                              catList.includes(currentCategory) ||
                              (currentCategory === 'veggies' && category.includes('vegetables')) ||
                              (currentCategory === 'veg' && category.includes('vegetables'));

      // Check search query match
      const matchesSearch = !query || 
                            title.includes(query) || 
                            tags.includes(query) || 
                            badgeText.includes(query) || 
                            descText.includes(query) ||
                            category.includes(query);

      if (matchesCategory && matchesSearch) {
        card.classList.remove('d-none');
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        card.classList.add('d-none');
      }
    });

    if (noProducts) {
      if (visibleCount === 0) {
        noProducts.classList.remove('d-none');
      } else {
        noProducts.classList.add('d-none');
      }
    }

    if (clearBtn) {
      clearBtn.classList.toggle('d-none', !query);
    }
  }

  // Live Real-Time Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      filterProducts();
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        searchQuery = '';
        filterProducts();
      }
    });
  }

  // Clear Search Input Button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchQuery = '';
      filterProducts();
    });
  }

  function updateFilterButtonsUI(activeCategory) {
    filterBtns.forEach(btn => {
      const badge = btn.querySelector('.badge');
      const isMatch = (btn.getAttribute('data-filter') === activeCategory);
      if (isMatch) {
        btn.classList.remove('btn-outline-success');
        btn.classList.add('btn-success', 'shadow-sm');
        if (badge) {
          badge.classList.remove('bg-success-subtle');
          badge.classList.add('bg-white');
        }
      } else {
        btn.classList.remove('btn-success', 'shadow-sm');
        btn.classList.add('btn-outline-success');
        if (badge) {
          badge.classList.remove('bg-white');
          badge.classList.add('bg-success-subtle');
        }
      }
    });
  }

  // Reset Filters from "No Products Found"
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      updateFilterButtonsUI('all');
      filterProducts();
    });
  }

  // Category Filter Pills
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currentCategory = btn.getAttribute('data-filter') || 'all';
      updateFilterButtonsUI(currentCategory);
      filterProducts();
    });
  });

  // Handle URL Query Params (e.g. shop.html?cat=veggies or shop.html?q=honey)
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('cat') || urlParams.get('category');
  const searchParam = urlParams.get('search') || urlParams.get('q');

  if (catParam) {
    let targetFilter = catParam.toLowerCase();
    if (targetFilter === 'veggies' || targetFilter === 'veg') targetFilter = 'vegetables';
    const targetBtn = Array.from(filterBtns).find(b => b.getAttribute('data-filter') === targetFilter);
    if (targetBtn) {
      targetBtn.click();
    }
  }

  if (searchParam && searchInput) {
    searchInput.value = searchParam;
    searchQuery = searchParam;
    filterProducts();
  }
}

// =========================================================
// CUSTOM SELECT DROPDOWN (Prevents overflow on mobile)
// =========================================================
function initStacklySelects() {
  const selects = document.querySelectorAll('.js-stackly-select');
  selects.forEach(select => {
    if(select.nextElementSibling && select.nextElementSibling.classList.contains('stackly-select')) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = 'stackly-select';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    const trigger = document.createElement('div');
    trigger.className = 'stackly-select__trigger';
    trigger.innerHTML = `<span>${select.options[select.selectedIndex]?.text || 'Select...'}</span><i class="fa-solid fa-chevron-down"></i>`;
    wrapper.appendChild(trigger);

    const menu = document.createElement('div');
    menu.className = 'stackly-select__menu';
    
    Array.from(select.options).forEach((option, index) => {
      if(index === 0 && option.disabled) return;
      const item = document.createElement('div');
      item.className = 'stackly-select__item';
      if(option.selected) item.classList.add('selected');
      item.textContent = option.text;
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        select.value = option.value;
        select.dispatchEvent(new Event('change'));
        trigger.querySelector('span').textContent = option.text;
        wrapper.classList.remove('open');
        menu.querySelectorAll('.stackly-select__item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
      });
      menu.appendChild(item);
    });
    wrapper.appendChild(menu);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.stackly-select').forEach(s => {
        if(s !== wrapper) s.classList.remove('open');
      });
      wrapper.classList.toggle('open');
      if(wrapper.classList.contains('open')) {
        const rect = wrapper.getBoundingClientRect();
        menu.style.width = `${rect.width}px`;
      }
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.stackly-select').forEach(s => s.classList.remove('open'));
  });
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (!localStorage.getItem('stackly_cart')) {
    StacklyCart.items = [];
  }
  StacklyCart.updateUI();
  initCountdownTimer();
  initGlowCursor();
  initPillNav();
  initCircularGallery();
  initFormSubmitWobble();
  initScrollEntranceObserver();
  initRollingCounters();
  initMobileMenuAutoClose();
  initScrollTimeline();
  initShopFilterAndSearch();
  initStacklySelects();
});


