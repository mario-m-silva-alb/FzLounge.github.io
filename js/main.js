/* ============================================================
   FzLounge – Main JavaScript
   - Mobile nav toggle
   - Active nav link highlighting
   - Products page filtering
   - Share form validation + simulated submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------
     Mobile Navigation Toggle
  -------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.textContent = isOpen ? '✕' : '☰';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      }
    });
  }

  /* --------------------------------------------------------
     Active Nav Link
  -------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --------------------------------------------------------
     Products Page – Filtering
  -------------------------------------------------------- */
  const filterGame      = document.getElementById('filter-game');
  const filterCondition = document.getElementById('filter-condition');
  const filterCategory  = document.getElementById('filter-category');
  const filterResetBtn  = document.getElementById('filter-reset');
  const productsCount   = document.getElementById('products-count');
  const productCards    = document.querySelectorAll('.product-card[data-game]');

  function applyFilters() {
    if (!productCards.length) return;

    const game      = filterGame      ? filterGame.value      : 'all';
    const condition = filterCondition ? filterCondition.value : 'all';
    const category  = filterCategory  ? filterCategory.value  : 'all';

    let visible = 0;

    productCards.forEach(card => {
      const cardGame      = card.dataset.game      || '';
      const cardCondition = card.dataset.condition || '';
      const cardCategory  = card.dataset.category  || '';

      const matchGame      = game === 'all'      || cardGame === game;
      const matchCondition = condition === 'all' || cardCondition === condition;
      const matchCategory  = category === 'all'  || cardCategory === category;

      if (matchGame && matchCondition && matchCategory) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    if (productsCount) {
      productsCount.textContent = `${visible} product${visible !== 1 ? 's' : ''} found`;
    }

    // Show/hide no-results message
    const noResults = document.getElementById('no-results');
    if (noResults) {
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  if (filterGame)      filterGame.addEventListener('change', applyFilters);
  if (filterCondition) filterCondition.addEventListener('change', applyFilters);
  if (filterCategory)  filterCategory.addEventListener('change', applyFilters);

  if (filterResetBtn) {
    filterResetBtn.addEventListener('click', () => {
      if (filterGame)      filterGame.value = 'all';
      if (filterCondition) filterCondition.value = 'all';
      if (filterCategory)  filterCategory.value = 'all';
      applyFilters();
    });
  }

  // Initialize count
  applyFilters();

  /* --------------------------------------------------------
     Share Form – Validation & Submission
  -------------------------------------------------------- */
  const shareForm  = document.getElementById('share-form');
  const thankYou   = document.getElementById('thankyou');

  if (shareForm) {
    const VALIDATORS = {
      'product-name':  { test: v => v.trim().length >= 2,   msg: 'Please enter a product name (at least 2 characters).' },
      'game-type':     { test: v => v !== '',               msg: 'Please select a game type.' },
      'condition':     { test: v => v !== '',               msg: 'Please select a condition.' },
      'description':   { test: v => v.trim().length >= 10,  msg: 'Please write a short description (at least 10 characters).' },
      'contact-email': { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
    };

    // Validate a single field and show/clear its error
    function validateField(id) {
      const validator = VALIDATORS[id];
      if (!validator) return true;

      const field = document.getElementById(id);
      const group = field ? field.closest('.form-group') : null;
      const errorEl = group ? group.querySelector('.field-error') : null;

      if (!field || !group) return true;

      const valid = validator.test(field.value);
      group.classList.toggle('has-error', !valid);
      if (errorEl) errorEl.textContent = valid ? '' : validator.msg;
      return valid;
    }

    // Real-time validation on blur
    Object.keys(VALIDATORS).forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener('blur', () => validateField(id));
        field.addEventListener('input', () => {
          if (field.closest('.form-group').classList.contains('has-error')) {
            validateField(id);
          }
        });
      }
    });

    shareForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validate all fields
      const allValid = Object.keys(VALIDATORS).map(id => validateField(id)).every(Boolean);

      if (!allValid) {
        // Focus first error field
        const firstError = shareForm.querySelector('.has-error input, .has-error select, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate submission
      const submitBtn = shareForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }

      setTimeout(() => {
        shareForm.style.display = 'none';
        if (thankYou) {
          thankYou.classList.add('visible');
          thankYou.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 900);
    });
  }

  /* --------------------------------------------------------
     "Contact to Get" button – simple mailto placeholder
  -------------------------------------------------------- */
  document.querySelectorAll('.btn-contact').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.dataset.product || 'this product';
      const subject = encodeURIComponent(`Interest in: ${product}`);
      window.location.href = `mailto:fzlounge@example.com?subject=${subject}`;
    });
  });

});
