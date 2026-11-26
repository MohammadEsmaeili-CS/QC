(() => {
  'use strict';
  const header = document.getElementById('site-header');
  const progress = document.getElementById('reading-progress-fill');
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const scenes = Array.from(document.querySelectorAll('.story-chapter'));
  const photos = Array.from(document.querySelectorAll('.stage-photo'));
  const sceneCounter = document.getElementById('scene-counter');
  const heroPhoto = document.querySelector('.hero-photo');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let scrollTicking = false;
  let currentScene = -1;

  const localeDigits = document.documentElement.lang === 'en' ? '0123456789' : document.documentElement.lang === 'ar' ? '٠١٢٣٤٥٦٧٨٩' : '۰۱۲۳۴۵۶۷۸۹';
  const faDigits = (n) => String(n).padStart(2, '0').replace(/\d/g, d => localeDigits[Number(d)]);
  function activateScene(index) {
    if (index === currentScene || index < 0 || index >= photos.length) return;
    currentScene = index;
    photos.forEach((node, i) => node.classList.toggle('is-active', i === index));
    scenes.forEach((node, i) => node.classList.toggle('is-current', i === index));
    sceneCounter.textContent = faDigits(index + 1);
  }
  function updateScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(100, y / scrollable * 100)}%`;
    header.classList.toggle('is-scrolled', y > 28);
    if (!reducedMotion.matches && y < window.innerHeight * 1.5 && heroPhoto) {
      heroPhoto.style.transform = `scale(1.035) translateY(${Math.min(y * .095, 90)}px)`;
    }
    if (scenes.length) {
      const target = window.innerHeight * (window.innerWidth <= 900 ? .69 : .52);
      let nearest = 0, distance = Infinity;
      scenes.forEach((chapter, i) => {
        const rect = chapter.getBoundingClientRect();
        const center = rect.top + rect.height * .5;
        const delta = Math.abs(center - target);
        if (delta < distance) { distance = delta; nearest = i; }
      });
      activateScene(nearest);
    }
    scrollTicking = false;
  }
  function scheduleScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScroll);
  }
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', scheduleScroll);
  updateScroll();

  const animated = Array.from(document.querySelectorAll('.reveal:not(.hero-copy)'));
  if ('IntersectionObserver' in window) {
    const appearObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: .10, rootMargin: '0px 0px -2% 0px' });
    animated.forEach(el => appearObserver.observe(el));
  } else animated.forEach(el => el.classList.add('is-visible'));

  function setMenu(open) {
    mobileNav.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    const labels = document.documentElement.lang === 'en' ? ['Close menu','Open menu'] : document.documentElement.lang === 'ar' ? ['إغلاق القائمة','فتح القائمة'] : ['بستن فهرست','باز کردن فهرست'];
    menuToggle.setAttribute('aria-label', open ? labels[0] : labels[1]);
  }
  menuToggle.addEventListener('click', () => setMenu(mobileNav.hidden));
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
})();
