/* ============================================================
   FzLounge – Main JavaScript
   - Mobile nav toggle
   - Active nav link highlighting
   - Load products from data/products.json
   - Render product cards dynamically (products page & featured section)
   - Populate game dropdowns from JSON (filter bar & share form)
   - Products page filtering
   - Share form validation + simulated submission
   ============================================================ */

/* ============================================================
   DATA – load products.json
   All pages share one JSON file at data/products.json.
   We resolve the path relative to the site root so it works
   regardless of which page is loaded.
   ============================================================ */

/** Return the base URL of the site (everything up to the last `/`). */
function basePath() {
  const loc = window.location.pathname;
  return loc.substring(0, loc.lastIndexOf('/') + 1);
}

/** Fetch and return the parsed JSON data. Throws on network/parse errors. */
async function loadData() {
  const url = basePath() + 'data/products.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load products.json (${res.status})`);
  return res.json();
}

/* ============================================================
   CARD RENDERER
   ============================================================ */

const CONDITION_LABELS = {
  'mint':           'Mint',
  'near-mint':      'Near Mint',
  'lightly-played': 'Lightly Played',
  'played':         'Played',
};

const CATEGORY_LABELS = {
  'single':    'Single Card',
  'deck':      'Deck',
  'booster':   'Booster Pack',
  'accessory': 'Accessory',
};

/**
 * Build the HTML for a single product card.
 * @param {object} product  – entry from products.json
 * @param {object[]} games  – games array from products.json
 * @param {string} titleTag – heading element to use ('h2' or 'h3')
 */
function buildCardHTML(product, games, titleTag) {
  const tag           = titleTag || 'h2';
  const gameLabel     = (games.find(g => g.value === product.game) || {}).label || product.game;
  const condLabel     = CONDITION_LABELS[product.condition] || product.condition;
  const condClass     = `badge-${product.condition}`;
  const catLabel      = CATEGORY_LABELS[product.category]  || product.category;
  const escapedName   = product.name.replace(/"/g, '&quot;');

  return `
    <article class="product-card"
      data-game="${product.game}"
      data-condition="${product.condition}"
      data-category="${product.category}">
      <div class="product-card__img-wrap">
        <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" />
        <span class="product-card__badge ${condClass}">${condLabel}</span>
        <span class="product-card__game-tag">${gameLabel}</span>
      </div>
      <div class="product-card__body">
        <${tag} class="product-card__title">${product.name}</${tag}>
        <p class="product-card__desc">${product.description}</p>
        <div class="product-card__footer">
          <span class="product-card__category">${catLabel}</span>
          <button class="btn btn-primary btn-sm btn-contact"
                  data-product="${escapedName}">Contact to Get</button>
        </div>
      </div>
    </article>`.trim();
}

/* ============================================================
   GAME DROPDOWN POPULATION
   Fills any <select> that has data-game-select with <option>
   entries built from the games array in products.json.
   ============================================================ */

function populateGameSelects(games) {
  document.querySelectorAll('[data-game-select]').forEach(select => {
    const type = select.dataset.gameSelect; // 'filter' or 'form'
    games.forEach(game => {
      const opt = document.createElement('option');
      opt.value       = game.value;
      opt.textContent = game.label;
      select.appendChild(opt);
    });
    if (type === 'filter') {
      // prepend an "All Games" option
      const all = document.createElement('option');
      all.value       = 'all';
      all.textContent = 'All Games';
      select.insertBefore(all, select.firstChild);
    }
  });
}

/* ============================================================
   PRODUCTS PAGE
   ============================================================ */

function initProductsPage(data) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Render all product cards
  const cards = data.products
    .map(p => buildCardHTML(p, data.games, 'h2'))
    .join('\n');
  grid.insertAdjacentHTML('afterbegin', cards);

  // Set up filter controls
  const filterGame      = document.getElementById('filter-game');
  const filterCondition = document.getElementById('filter-condition');
  const filterCategory  = document.getElementById('filter-category');
  const filterResetBtn  = document.getElementById('filter-reset');
  const productsCount   = document.getElementById('products-count');

  function applyFilters() {
    const game      = filterGame      ? filterGame.value      : 'all';
    const condition = filterCondition ? filterCondition.value : 'all';
    const category  = filterCategory  ? filterCategory.value  : 'all';

    let visible = 0;

    grid.querySelectorAll('.product-card[data-game]').forEach(card => {
      const matchGame      = game      === 'all' || card.dataset.game      === game;
      const matchCondition = condition === 'all' || card.dataset.condition === condition;
      const matchCategory  = category  === 'all' || card.dataset.category  === category;

      const show = matchGame && matchCondition && matchCategory;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    if (productsCount) {
      productsCount.textContent = `${visible} product${visible !== 1 ? 's' : ''} found`;
    }

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

  applyFilters();
}

/* ============================================================
   INDEX PAGE – featured products
   ============================================================ */

function initIndexPage(data) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const featured = data.products.filter(p => p.featured);
  grid.innerHTML = featured.map(p => buildCardHTML(p, data.games, 'h3')).join('\n');
}

/* ============================================================
   SHARE FORM – Validation & Submission
   ============================================================ */

function initShareForm() {
  const shareForm = document.getElementById('share-form');
  const thankYou  = document.getElementById('thankyou');
  if (!shareForm) return;

  const VALIDATORS = {
    'product-name':  { test: v => v.trim().length >= 2,   msg: 'Please enter a product name (at least 2 characters).' },
    'game-type':     { test: v => v !== '',               msg: 'Please select a game type.' },
    'condition':     { test: v => v !== '',               msg: 'Please select a condition.' },
    'description':   { test: v => v.trim().length >= 10,  msg: 'Please write a short description (at least 10 characters).' },
    'contact-email': { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Please enter a valid email address.' },
  };

  function validateField(id) {
    const validator = VALIDATORS[id];
    if (!validator) return true;
    const field   = document.getElementById(id);
    const group   = field ? field.closest('.form-group') : null;
    const errorEl = group ? group.querySelector('.field-error') : null;
    if (!field || !group) return true;
    const valid = validator.test(field.value);
    group.classList.toggle('has-error', !valid);
    if (errorEl) errorEl.textContent = valid ? '' : validator.msg;
    return valid;
  }

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
    const allValid = Object.keys(VALIDATORS).map(id => validateField(id)).every(Boolean);
    if (!allValid) {
      const firstError = shareForm.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      return;
    }
    const submitBtn = shareForm.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled    = true;
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

/* ============================================================
   "Contact to Get" – event delegation on document
   ============================================================ */

function initContactButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-contact');
    if (!btn) return;
    const product = btn.dataset.product || 'this product';
    const subject = encodeURIComponent(`Interest in: ${product}`);
    window.location.href = `mailto:fzlounge@example.com?subject=${subject}`;
  });
}

/* ============================================================
   BOOT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Mobile Navigation Toggle */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.textContent = isOpen ? '✕' : '☰';
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.textContent = '☰';
      }
    });
  }

  /* Active Nav Link */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* Contact button delegation (works for both static and dynamic cards) */
  initContactButtons();

  /* Share form validation (no data needed) */
  initShareForm();

  /* Load JSON then initialise data-driven features */
  const needsData = document.getElementById('products-grid') ||
                    document.getElementById('featured-grid')  ||
                    document.querySelector('[data-game-select]');

  if (needsData) {
    loadData()
      .then(data => {
        populateGameSelects(data.games);
        initProductsPage(data);
        initIndexPage(data);
      })
      .catch(err => {
        console.error('FzLounge: could not load products.json –', err);
        const grid = document.getElementById('products-grid') ||
                     document.getElementById('featured-grid');
        if (grid) {
          grid.innerHTML = '<p class="no-results" style="grid-column:1/-1;text-align:center;padding:2rem;">Unable to load products. Please try again later.</p>';
        }
      });
  }

});
