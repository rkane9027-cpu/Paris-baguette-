/* ============================================================
   PARIS BAGUETTES — script.js
   Vanilla JavaScript — toutes les interactions du site
   ============================================================ */

'use strict';

/* ============================================================
   1. NAVBAR — scroll + hamburger menu
   ============================================================ */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const links     = navLinks ? navLinks.querySelectorAll('a') : [];

  /* Rend la navbar opaque après 80px de scroll */
  function onScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 80);

    /* Met en surbrillance le lien de la section visible */
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // état initial

  /* Hamburger — ouvre / ferme le menu mobile */
  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !navLinks.classList.contains('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    navLinks.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  if (hamburger) hamburger.addEventListener('click', () => toggleMenu());

  /* Ferme le menu au clic sur un lien */
  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  /* Ferme le menu si on clique en dehors */
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('open')
        && !navLinks.contains(e.target)
        && !hamburger.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();


/* ============================================================
   2. ANIMATIONS AU SCROLL — Intersection Observer
   ============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // n'anime qu'une fois
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. COMPTEURS ANIMÉS — compteurs hero + section compteurs
   ============================================================ */
(function initCounters() {
  /**
   * Anime un compteur de 0 jusqu'à `target` en `duration` ms
   * @param {HTMLElement} el   — élément DOM contenant le chiffre
   * @param {number}      target
   * @param {number}      duration en millisecondes
   */
  function animateCounter(el, target, duration = 1800) {
    const startTime = performance.now();
    const startVal  = 0;

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubique */
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current.toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Sélectionne tous les éléments à animer */
  const counterEls = document.querySelectorAll('[data-target]');
  if (!counterEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseInt(entry.target.dataset.target, 10);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   4. CARROUSEL AUTOMATIQUE — produits phares
   ============================================================ */
(function initCarousel() {
  const carousel  = document.getElementById('carousel');
  const prevBtn   = document.getElementById('prevBtn');
  const nextBtn   = document.getElementById('nextBtn');
  const dotsWrap  = document.getElementById('carouselDots');

  if (!carousel) return;

  const cards       = carousel.querySelectorAll('.product-card');
  const cardCount   = cards.length;
  let   currentIdx  = 0;
  let   autoTimer   = null;

  /* Calcule la largeur d'une carte (avec le gap) */
  function cardWidth() {
    const card = cards[0];
    if (!card) return 300;
    const gap  = 24;
    return card.getBoundingClientRect().width + gap;
  }

  /* Nombre de cartes visibles */
  function visibleCount() {
    return Math.max(1, Math.floor(carousel.offsetWidth / cardWidth()));
  }

  /* Nombre max d'index */
  function maxIndex() {
    return Math.max(0, cardCount - visibleCount());
  }

  /* Déplace le carrousel vers l'index `idx` */
  function goTo(idx) {
    currentIdx = Math.max(0, Math.min(idx, maxIndex()));
    carousel.scrollTo({ left: currentIdx * cardWidth(), behavior: 'smooth' });
    updateDots();
  }

  /* Crée les points indicateurs */
  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    const total = maxIndex() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    }
  }

  /* Met à jour les points actifs */
  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIdx);
    });
  }

  /* Avance automatiquement toutes les 3,5s */
  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(currentIdx >= maxIndex() ? 0 : currentIdx + 1);
    }, 3500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  /* Boutons flèches */
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(currentIdx - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(currentIdx + 1); resetAuto(); });

  /* Swipe tactile */
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(dx < 0 ? currentIdx + 1 : currentIdx - 1); resetAuto(); }
  }, { passive: true });

  /* Pause au survol */
  carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel.addEventListener('mouseleave', startAuto);

  /* Bouton favori (toggle cœur) */
  carousel.querySelectorAll('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      this.textContent = this.classList.contains('active') ? '♥' : '♡';
    });
  });

  /* Bouton "Ajouter au panier" — feedback visuel */
  carousel.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', function() {
      const original = this.textContent;
      this.textContent = '✓ Ajouté !';
      this.style.background = '#1a6b3c';
      this.style.color = '#4ade80';
      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
        this.style.color = '';
      }, 1800);
    });
  });

  /* Init */
  buildDots();
  startAuto();

  /* Reconstruction au redimensionnement */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 200);
  });
})();


/* ============================================================
   5. FAQ ACCORDÉON
   ============================================================ */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Ferme tous les autres */
      faqItems.forEach(other => {
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.classList.remove('open');
        }
      });

      /* Bascule l'élément courant */
      const next = !isOpen;
      btn.setAttribute('aria-expanded', String(next));
      answer.classList.toggle('open', next);
    });
  });
})();


/* ============================================================
   6. FORMULAIRE DE RÉSERVATION — validation + soumission
   ============================================================ */
(function initReservationForm() {
  const form    = document.getElementById('reservationForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  /* Définit la date minimum à aujourd'hui */
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  /**
   * Valide un champ et affiche / efface l'erreur
   * @returns {boolean}
   */
  function validateField(inputEl, errorEl, condition, message) {
    if (!condition) {
      inputEl.classList.add('error');
      if (errorEl) errorEl.textContent = message;
      return false;
    }
    inputEl.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  function validateAll() {
    let valid = true;

    const prenom   = document.getElementById('prenom');
    const nom      = document.getElementById('nom');
    const email    = document.getElementById('email');
    const date     = document.getElementById('date');
    const heure    = document.getElementById('heure');
    const couverts = document.getElementById('couverts');

    valid = validateField(prenom,   document.getElementById('errPrenom'),   prenom && prenom.value.trim().length >= 2, 'Prénom requis (min 2 caractères)') && valid;
    valid = validateField(nom,      document.getElementById('errNom'),      nom && nom.value.trim().length >= 2,       'Nom requis (min 2 caractères)')    && valid;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    valid = validateField(email,    document.getElementById('errEmail'),    email && emailRe.test(email.value),        'Email invalide')                   && valid;

    valid = validateField(date,     document.getElementById('errDate'),     date && date.value !== '',                 'Date requise')                     && valid;
    valid = validateField(heure,    document.getElementById('errHeure'),    heure && heure.value !== '',               'Heure requise')                    && valid;
    valid = validateField(couverts, document.getElementById('errCouverts'), couverts && couverts.value !== '',         'Nombre de couverts requis')         && valid;

    return valid;
  }

  /* Validation en temps réel */
  ['prenom','nom','email','date','heure','couverts'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', validateAll);
  });

  /* Soumission du formulaire */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    /* Simule un envoi asynchrone (spinner pendant 1,2s) */
    const submitBtn  = form.querySelector('[type="submit"]');
    const btnText    = form.querySelector('.btn-text');
    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.textContent = 'Envoi en cours…';

    await new Promise(resolve => setTimeout(resolve, 1200));

    /* Succès */
    form.reset();
    if (submitBtn) submitBtn.disabled = false;
    if (btnText)   btnText.textContent = 'Confirmer la réservation';
    if (success)   success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    /* Masque le message de succès après 6s */
    setTimeout(() => { if (success) success.hidden = true; }, 6000);
  });
})();


/* ============================================================
   7. BOUTON RETOUR EN HAUT
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleBtn() {
    btn.hidden = window.scrollY < 400;
  }

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   8. SMOOTH SCROLL pour tous les liens ancres (#)
   ============================================================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      const navH   = document.getElementById('navbar')?.offsetHeight ?? 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================================================
   9. PARALLAXE légère sur le Hero
   ============================================================ */
(function initParallax() {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;

  /* Désactivé sur mobile pour éviter les problèmes de performance */
  if (window.matchMedia('(max-width: 768px)').matches) return;

  window.addEventListener('scroll', () => {
    const scrollY  = window.scrollY;
    const maxScroll = window.innerHeight;
    if (scrollY > maxScroll) return;
    heroVideo.style.transform = `translateY(${scrollY * 0.35}px)`;
  }, { passive: true });
})();


/* ============================================================
   10. LAZY LOADING des images de fond (bento + product cards)
   ============================================================ */
(function initLazyBg() {
  const lazies = document.querySelectorAll('[style*="background-image"]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* L'image est déjà dans le style inline, on déclenche juste la classe */
        entry.target.classList.add('bg-loaded');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });

  lazies.forEach(el => observer.observe(el));
})();


/* ============================================================
   11. EASTER EGG — code Konami (↑↑↓↓←→←→BA)
   ============================================================ */
(function initKonamiCode() {
  const sequence = [38,38,40,40,37,39,37,39,66,65];
  let   pos = 0;

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === sequence[pos]) {
      pos++;
      if (pos === sequence.length) {
        pos = 0;
        showToast('🥐 Félicitations ! Vous avez découvert notre secret… -20% avec le code KONAMI');
      }
    } else {
      pos = 0;
    }
  });
})();


/* ============================================================
   12. SYSTÈME DE TOAST (notification légère)
   ============================================================ */
function showToast(message, duration = 4000) {
  /* Crée le conteneur si absent */
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '80px',
      left:   '50%',
      transform: 'translateX(-50%)',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
      pointerEvents: 'none'
    });
    document.body.appendChild(container);
  }

  /* Crée le toast */
  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    background: 'rgba(13,13,13,.95)',
    color: '#fff',
    padding: '14px 24px',
    borderRadius: '100px',
    fontSize: '.875rem',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500',
    border: '1px solid rgba(201,168,76,.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,.3)',
    animation: 'toastIn .3s ease',
    pointerEvents: 'none',
    maxWidth: '90vw',
    textAlign: 'center'
  });

  /* Animation CSS inline */
  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toastIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      @keyframes toastOut { from { opacity:1; transform:translateY(0); }   to { opacity:0; transform:translateY(12px); } }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  /* Supprime le toast après `duration` ms */
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}


/* ============================================================
   13. PERFORMANCE — enregistre le Service Worker si dispo
   ============================================================ */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    /* On essaie silencieusement — pas de SW inclus dans ce projet */
  });
}


/* ============================================================
   INIT — affiche un message dans la console pour les devs
   ============================================================ */
console.log('%cParis Baguettes 🥐', 'font-family:Georgia,serif;font-size:24px;color:#c9a84c;font-weight:bold;');
console.log('%cSite conçu avec soin. Bonnes dégustations !', 'font-size:12px;color:#666;');
