/* ============================================================
   KDB INTERIORS — main.js
   All interactivity: cursor, particles, scroll reveal,
   3D tilt, nav behaviour, mobile menu, form handling
   ============================================================ */

'use strict';

/* ── Utilities ──────────────────────────────────────────────── */

/**
 * Query selector shorthand
 * @param {string} sel
 * @param {Element} [ctx=document]
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Custom Cursor ──────────────────────────────────────────── */

(function initCursor() {
  const cursor   = $('#cursor');
  const follower = $('#cursorFollower');

  if (!cursor || !follower) return;

  let mx = 0, my = 0;
  let fx = 0, fy = 0;

  // Dot follows mouse immediately
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  // Follower ring lerps behind
  function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.transform = `translate(${fx - 16}px, ${fy - 16}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Expand on interactive elements
  const interactiveSelectors = 'a, button, .service-card, .price-item, .process-step, .btn-submit, .showcase-control, .dot, input, textarea, select, .project-card, .showcase-back';
  $$( interactiveSelectors).forEach((el) => {
    el.addEventListener('mouseenter', () => follower.classList.add('hovered'));
    el.addEventListener('mouseleave', () => follower.classList.remove('hovered'));
  });

  // Hide cursor when it leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
})();

/* ── Navigation ─────────────────────────────────────────────── */

(function initNav() {
  const nav     = $('#nav');
  const toggle  = $('#navToggle');
  const menu    = $('#mobileMenu');

  if (!nav) return;

  // Scroll state
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Mobile hamburger
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      menu.classList.toggle('open', isOpen);
      menu.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    $$('a', menu).forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }
})();

/* ── Particle Field ──────────────────────────────────────────── */

(function initParticles() {
  const field = $('#particleField');
  if (!field) return;

  const COUNT = 55;

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = 1 + Math.random() * 2.5;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${8 + Math.random() * 14}s;
      animation-delay: ${Math.random() * 14}s;
      opacity: ${0.15 + Math.random() * 0.45};
    `;
    field.appendChild(p);
  }
})();

/* ── Scroll Reveal ───────────────────────────────────────────── */

(function initScrollReveal() {
  const reveals = $$('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve once revealed (performance)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
})();

/* ── 3D Card Tilt ────────────────────────────────────────────── */

(function initTilt() {
  const cards = $$('.tilt-card');
  if (!cards.length) return;

  // Disable on touch devices
  if ('ontouchstart' in window) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        perspective(900px)
        rotateY(${x * 7}deg)
        rotateX(${-y * 7}deg)
        translateZ(6px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    });
  });
})();

/* ── Contact Form ────────────────────────────────────────────── */

(function initForm() {
  const form = $('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn  = form.querySelector('.btn-submit span');
    const data = new FormData(form);
    const name = data.get('name')?.trim() || '';
    const email = data.get('email')?.trim() || '';
    const phone = data.get('phone')?.trim() || '';
    const projectType = data.get('project-type') || '';
    const message = data.get('message')?.trim() || '';

    const subject = encodeURIComponent(`New Website Enquiry from ${name || 'Client'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nProject Type: ${projectType}\n\nMessage:\n${message}`);
    
    window.location.href = `mailto:kdb.interiordesign@gmail.com?subject=${subject}&body=${body}`;

    if (btn) {
      const displayName = name ? name.split(' ')[0] : 'there';
      btn.textContent = `Thank you, ${displayName}!`;
      setTimeout(() => { btn.textContent = 'Send Enquiry'; }, 3500);
    }
  });

  // Float label effect
  $$('input, textarea', form).forEach((field) => {
    const label = field.nextElementSibling;
    if (!label || label.tagName !== 'LABEL') return;

    const update = () => {
      label.style.color = field.value ? 'var(--accent)' : 'transparent';
      label.style.bottom = field.value ? '100%' : '14px';
      label.style.fontSize = field.value ? '0.58rem' : '0.68rem';
    };

    field.addEventListener('input', update);
    field.addEventListener('blur', update);
  });
})();

/* ── Portfolio Carousel (with category tabs) ─────────────────── */

(function initPortfolioCarousel() {
  const carousel = $('.showcase-carousel');
  if (!carousel) return;

  const allImages = $$('.showcase-image', carousel);
  const prevBtn = $('.showcase-prev', carousel);
  const nextBtn = $('.showcase-next', carousel);
  const dotsContainer = $('.showcase-dots', carousel);
  const counterCurrent = $('.counter-current', carousel);
  const counterTotal = $('.counter-total', carousel);
  const tabs = $$('.portfolio-tab');
  const projectGrids = $$('.project-grid');
  const projectCards = $$('.project-card');
  const showcaseWrap = $('#portfolioShowcase');
  const backBtn = $('#showcaseBack');

  if (allImages.length === 0) return;

  let currentCategory = 'hospitality';
  let currentIndex = 0;
  let projectImages = [];

  const buildDots = (count) => {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      dot.dataset.index = i;
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        updateCarousel(parseInt(dot.dataset.index, 10));
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateCarousel = (index) => {
    currentIndex = (index + projectImages.length) % projectImages.length;

    // Update images
    projectImages.forEach((img, i) => {
      img.classList.toggle('active', i === currentIndex);
    });

    // Update dots
    const dots = $$('.dot', dotsContainer);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    // Update counter
    if (counterCurrent) counterCurrent.textContent = currentIndex + 1;
  };

  const loadProject = (projectId) => {
    currentIndex = 0;

    // Filter images by project
    allImages.forEach(img => img.classList.remove('active'));
    projectImages = allImages.filter(img => img.dataset.project === projectId);

    if (projectImages.length === 0) return;

    // Update counter total
    if (counterTotal) counterTotal.textContent = projectImages.length;

    // Build dots
    buildDots(projectImages.length);

    // Show first
    updateCarousel(0);
  };

  // Show the project-card grid for a given category, hide the gallery
  const showCategoryGrid = (category) => {
    currentCategory = category;
    projectGrids.forEach((grid) => {
      grid.hidden = grid.dataset.categoryGrid !== category;
      grid.classList.toggle('active', grid.dataset.categoryGrid === category);
    });
    if (showcaseWrap) showcaseWrap.hidden = true;
  };

  // Open a project's gallery, hide the card grid
  const openProjectGallery = (projectId) => {
    projectGrids.forEach((grid) => { grid.hidden = true; });
    if (showcaseWrap) showcaseWrap.hidden = false;
    loadProject(projectId);
    showcaseWrap?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Tab switching (category level)
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      showCategoryGrid(tab.dataset.category);
    });
  });

  // Project card clicks (open that project's gallery)
  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      openProjectGallery(card.dataset.project);
    });
  });

  // Back to projects
  backBtn?.addEventListener('click', () => {
    if (showcaseWrap) showcaseWrap.hidden = true;
    showCategoryGrid(currentCategory);
  });

  // Carousel button event listeners
  prevBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateCarousel(currentIndex - 1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    updateCarousel(currentIndex + 1);
  });

  // Initialize showing the Hospitality project grid
  showCategoryGrid('hospitality');
})();

/* ── Smooth anchor scroll (polyfill fallback) ────────────────── */

(function initSmoothScroll() {
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ── Image Fullscreen Modal ─────────────────────────────────── */
(function initImageModal() {
  const modal = $('#imageModal');
  const modalImg = $('.image-modal-img', modal);
  const closeBtn = $('.image-modal-close', modal);
  const prevBtn = $('.image-modal-prev', modal);
  const nextBtn = $('.image-modal-next', modal);
  
  if (!modal) return;

  let allImages = [];
  let currentIndex = 0;

  // Collect only the images belonging to the same project as the clicked image
  function collectImages(clickedImg) {
    const project = clickedImg.closest('.showcase-image')?.dataset.project;
    allImages = $$('.showcase-image img').filter(
      (img) => img.closest('.showcase-image')?.dataset.project === project
    );
  }

  function openModal(clickedImg) {
    collectImages(clickedImg);
    currentIndex = allImages.indexOf(clickedImg);
    const img = allImages[currentIndex];
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function goToPrevious() {
    currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    const img = allImages[currentIndex];
    modalImg.src = img.src;
    modalImg.alt = img.alt;
  }

  function goToNext() {
    currentIndex = (currentIndex + 1) % allImages.length;
    const img = allImages[currentIndex];
    modalImg.src = img.src;
    modalImg.alt = img.alt;
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Add click handler to all showcase images
  $$('.showcase-image img').forEach((img) => {
    img.addEventListener('click', () => openModal(img));
  });

  // Navigation buttons
  prevBtn.addEventListener('click', goToPrevious);
  nextBtn.addEventListener('click', goToNext);

  // Close modal on close button click
  closeBtn.addEventListener('click', closeModal);

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Arrow key navigation
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  });
})();
