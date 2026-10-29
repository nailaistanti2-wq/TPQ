'use strict';

/* =========================================================
  script.js : JavaScript murni (tanpa library)
  Isi:
  1. Menu untuk HP (tombol ☰)
  2. Menu besar (mega menu): hover, keyboard, sentuh
  3. Bayangan header saat halaman digulir
  4. Animasi muncul saat digulir
  5. Penanda menu aktif sesuai bagian halaman
  6. Lightbox galeri foto
   ========================================================= */

// Tandai bahwa JavaScript aktif (dipakai CSS untuk animasi)
document.documentElement.classList.add('js');

const header = document.querySelector('.site-header');
const nav = document.getElementById('main-nav');
const menuButton = document.getElementById('menu-button');
const subItems = document.querySelectorAll('.has-sub');
const desktop = window.matchMedia('(min-width: 901px)');

/* ---------------------------------------------------------
  1. MENU UNTUK HP
   --------------------------------------------------------- */
function setMobileMenu(open) {
  nav.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
  menuButton.innerHTML = open ? '&times;' : '&#9776;';
}

menuButton.addEventListener('click', () => {
  setMobileMenu(!nav.classList.contains('is-open'));
});

// menu tertutup otomatis setelah salah satu tautan ditekan
nav.addEventListener('click', (e) => {
  if (e.target.closest('a') && !desktop.matches) {
    setMobileMenu(false);
  }
});

/* ---------------------------------------------------------
  2. MENU BESAR (MEGA MENU)
   --------------------------------------------------------- */
let closeTimer;
let usingTouch = false;

function openItem(li) {
  subItems.forEach((other) => {
    if (other !== li) closeItem(other);
  });
  li.classList.add('is-open');
  li.firstElementChild.setAttribute('aria-expanded', 'true');
}

function closeItem(li) {
  li.classList.remove('is-open');
  li.firstElementChild.setAttribute('aria-expanded', 'false');
}

function closeAll() {
  subItems.forEach(closeItem);
}

// catat apakah pengguna sedang memakai layar sentuh
document.addEventListener('pointerdown', (e) => {
  usingTouch = e.pointerType === 'touch';
}, true);

subItems.forEach((li) => {
  const link = li.firstElementChild;
  link.setAttribute('aria-haspopup', 'true');
  link.setAttribute('aria-expanded', 'false');

  // mouse: buka saat kursor masuk, tutup (dengan jeda singkat) saat keluar
  li.addEventListener('pointerenter', (e) => {
    if (!desktop.matches || e.pointerType !== 'mouse') return;
    clearTimeout(closeTimer);
    openItem(li);
  });

  li.addEventListener('pointerleave', (e) => {
    if (!desktop.matches || e.pointerType !== 'mouse') return;
    closeTimer = setTimeout(() => closeItem(li), 120);
  });

  // keyboard: buka saat menu mendapat fokus (Tab)
  li.addEventListener('focusin', () => {
    if (desktop.matches && !usingTouch) openItem(li);
  });

  li.addEventListener('focusout', (e) => {
    if (desktop.matches && !li.contains(e.relatedTarget)) closeItem(li);
  });

  // layar sentuh: ketukan pertama membuka panel, ketukan kedua membuka tautan
  link.addEventListener('click', (e) => {
    if (desktop.matches && !li.classList.contains('is-open')) {
      e.preventDefault();
      openItem(li);
    }
  });
});

// klik di luar menu menutup panel
document.addEventListener('click', (e) => {
  if (!e.target.closest('.has-sub')) closeAll();
});

// pindah ukuran layar: reset semua menu
desktop.addEventListener('change', () => {
  setMobileMenu(false);
  closeAll();
});

/* ---------------------------------------------------------
  3. BAYANGAN HEADER SAAT DIGULIR
   --------------------------------------------------------- */
function onScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------------------------------------------------------
  4. ANIMASI MUNCUL SAAT DIGULIR
   --------------------------------------------------------- */
const revealTargets = document.querySelectorAll(
  '.section-title, .program-card, .galeri-item, .footer-brand, .footer-col'
);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el) => {
    // jeda bertahap supaya kartu muncul satu per satu
    const index = Array.from(el.parentElement.children).indexOf(el);
    el.style.transitionDelay = (index % 4) * 80 + 'ms';
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}

/* ---------------------------------------------------------
  5. PENANDA MENU AKTIF
   --------------------------------------------------------- */
const sectionLinks = Array.from(nav.querySelectorAll('a[href^="#"]'))
  .filter((a) => a.getAttribute('href').length > 1);

if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      sectionLinks.forEach((a) => {
        const active = a.getAttribute('href') === id;
        a.classList.toggle('active', active);
        if (active) {
          a.setAttribute('aria-current', 'true');
        } else {
          a.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  document.querySelectorAll('section[id], footer[id]').forEach((s) => spy.observe(s));
}

/* ---------------------------------------------------------
  6. LIGHTBOX GALERI
   --------------------------------------------------------- */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbClose = lightbox.querySelector('.lb-close');
const lbPrev = lightbox.querySelector('.lb-prev');
const lbNext = lightbox.querySelector('.lb-next');
const galleryItems = Array.from(document.querySelectorAll('.galeri-item'));

let current = 0;
let opener = null;

function showPhoto(index) {
  current = (index + galleryItems.length) % galleryItems.length;
  const img = galleryItems[current].querySelector('img');
  lbImg.src = img.currentSrc || img.src;
  lbImg.alt = img.alt;
  lbCaption.textContent = img.alt + ' (' + (current + 1) + ' / ' + galleryItems.length + ')';
}

function openLightbox(index) {
  opener = galleryItems[index];
  showPhoto(index);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';   // halaman di belakang tidak ikut menggulir
  lbClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
  if (opener) opener.focus();
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => showPhoto(current - 1));
lbNext.addEventListener('click', () => showPhoto(current + 1));

// klik area gelap di luar foto menutup lightbox
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// geser jari kiri/kanan di layar sentuh
let touchStartX = null;
lightbox.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) showPhoto(current + (dx < 0 ? 1 : -1));
  touchStartX = null;
});

/* ---------------------------------------------------------
  KEYBOARD (Escape, panah, Tab)
   --------------------------------------------------------- */
document.addEventListener('keydown', (e) => {
  // saat lightbox terbuka
  if (!lightbox.hidden) {
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showPhoto(current - 1);
    } else if (e.key === 'ArrowRight') {
      showPhoto(current + 1);
    } else if (e.key === 'Tab') {
      // fokus berputar di dalam lightbox saja
      const buttons = [lbClose, lbPrev, lbNext];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return;
  }

  // saat menu terbuka
  if (e.key === 'Escape') {
    closeAll();
    setMobileMenu(false);
    if (document.activeElement && header.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }
});
