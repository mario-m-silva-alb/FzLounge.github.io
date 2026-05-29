/* ============================================================
   FzLounge – Main JavaScript
   - Mobile nav toggle
   - Active nav link highlighting
   - Load products from data/products.json
   - Render product cards dynamically (products page & featured section)
   - Populate game dropdowns from JSON (filter bar)
   - Products page filtering
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
  'sealed': 'Sealed',
};

const CATEGORY_LABELS = {
  'single':    'Single Card',
  'deck':      'Deck',
  'booster':   'Booster Pack',
  'accessory': 'Accessory',
};

const STATUS_LABELS = {
  'presale':     'Presale',
  'available':   'In Stock',
  'limited':     'Limited',
  'sold':        'Sold Out'
};

const STATUS_ICONS = {
  'presale':     '🎁',
  'available':   '📦',
  'limited':     '⚡',
  'sold':        '🔒'
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
  
  // Status badge
  const status        = product.status || 'available';
  const statusLabel   = STATUS_LABELS[status] || status;
  const statusIcon    = STATUS_ICONS[status] || '';
  const statusClass   = `badge-status badge-status-${status}`;
  
  // Check if product is new (added within last 30 days)
  const isNew = product.dateAdded && isProductNew(product.dateAdded);
  const newBadge = isNew ? '<span class="badge-new">✨ NEW</span>' : '';
  
  // Product ID badge
  const productId = `#${String(product.id).padStart(3, '0')}`;
  
  // Image with WebP support
  const imageSrc = product.image;
  const imageFallback = product.imageFallback || product.image;
  const imageHTML = imageSrc.endsWith('.webp') 
    ? `<picture>
         <source srcset="${imageSrc}" type="image/webp">
         <img src="${imageFallback}" alt="${product.imageAlt}" loading="lazy" />
       </picture>`
    : `<img src="${imageSrc}" alt="${product.imageAlt}" loading="lazy" />`;

  return `
    <article class="product-card"
      data-game="${product.game}"
      data-condition="${product.condition}"
      data-category="${product.category}"
      data-status="${status}"
      data-product-id="${product.id}"
      data-search-text="${escapedName.toLowerCase()} ${product.description.toLowerCase()} ${gameLabel.toLowerCase()}">
      <div class="product-card__img-wrap">
        ${imageHTML}
        <span class="product-card__badge ${condClass}">${condLabel}</span>
        <span class="product-card__game-tag">${gameLabel}</span>
        <div class="product-card__badges">
          <span class="${statusClass}">${statusIcon} ${statusLabel}</span>
          ${newBadge}
        </div>
      </div>
      <div class="product-card__body">
        <${tag} class="product-card__title">${product.name}</${tag}>
        <p class="product-card__desc">${product.description}</p>
        <div class="product-card__footer">
          <span class="product-card__category">${catLabel}</span>
          <span class="product-card__id">${productId}</span>
          <button class="btn btn-primary btn-sm btn-contact"
                  data-product="${escapedName}">Contact to Get</button>
        </div>
      </div>
    </article>`.trim();
}

/**
 * Check if a product is new (added within last 30 days)
 * @param {string} dateAdded - ISO date string
 * @returns {boolean}
 */
function isProductNew(dateAdded) {
  const added = new Date(dateAdded);
  const now = new Date();
  const daysDiff = (now - added) / (1000 * 60 * 60 * 24);
  return daysDiff <= 30;
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

  // Set up filter and search controls
  const filterGame      = document.getElementById('filter-game');
  const filterCategory  = document.getElementById('filter-category');
  const filterResetBtn  = document.getElementById('filter-reset');
  const productsCount   = document.getElementById('products-count');
  const searchInput     = document.getElementById('product-search');
  const searchClear     = document.getElementById('search-clear');

  let searchTerm = '';
  let searchTimeout = null;

  /**
   * Apply all filters and search
   */
  function applyFilters() {
    const game      = filterGame     ? filterGame.value     : 'all';
    const category  = filterCategory ? filterCategory.value : 'all';
    const search    = searchTerm.toLowerCase().trim();

    let visible = 0;

    grid.querySelectorAll('.product-card[data-game]').forEach(card => {
      const matchGame      = game     === 'all' || card.dataset.game     === game;
      const matchCategory  = category === 'all' || card.dataset.category === category;
      const matchSearch    = !search || (card.dataset.searchText && card.dataset.searchText.includes(search));

      const show = matchGame && matchCategory && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Update count
    if (productsCount) {
      const filterText = search ? ` for "${searchTerm}"` : '';
      productsCount.textContent = `${visible} product${visible !== 1 ? 's' : ''} found${filterText}`;
    }

    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (noResults) {
      noResults.style.display = visible === 0 ? 'block' : 'none';
    }
  }

  /**
   * Handle search input with debouncing
   */
  function handleSearch(value) {
    searchTerm = value;
    
    // Show/hide clear button
    if (searchClear) {
      searchClear.style.display = searchTerm ? 'flex' : 'none';
    }
    
    // Debounce the search
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
  }

  // Event listeners for filters
  if (filterGame)     filterGame.addEventListener('change', applyFilters);
  if (filterCategory) filterCategory.addEventListener('change', applyFilters);

  // Event listeners for search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    searchInput.addEventListener('search', applyFilters); // Triggered on Enter or clear
  }

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        handleSearch('');
      }
    });
  }

  // Reset button
  if (filterResetBtn) {
    filterResetBtn.addEventListener('click', () => {
      if (filterGame)     filterGame.value = 'all';
      if (filterCategory) filterCategory.value = 'all';
      if (searchInput) {
        searchInput.value = '';
        searchTerm = '';
        if (searchClear) searchClear.style.display = 'none';
      }
      applyFilters();
    });
  }

  // Initial filter application
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
   "Contact to Get" – modal with Discord & WhatsApp channels
   ============================================================ */

const DISCORD_URL   = 'https://discord.gg/MTtNkGN';
const WHATSAPP_URL  = 'https://chat.whatsapp.com/D0mnF1MreqSGaJyBYi8H9p';

function injectContactModal() {
  if (document.getElementById('contact-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'contact-modal';
  modal.className = 'modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="modal">
      <button class="modal-close" id="modal-close" aria-label="Close">✕</button>
      <h2 id="modal-title" class="modal-title">Contact to Get</h2>
      <p class="modal-desc">Interested in <strong id="modal-product-name"></strong>? Reach out on one of our community channels:</p>
      <div class="modal-channels">
        <a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary modal-channel-btn">
          💬 Discord
        </a>
        <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-outline modal-channel-btn">
          📱 WhatsApp
        </a>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('modal-close').addEventListener('click', closeContactModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeContactModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeContactModal(); });
}

function openContactModal(productName) {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  document.getElementById('modal-product-name').textContent = productName;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function initContactButtons() {
  injectContactModal();
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-contact');
    if (!btn) return;
    openContactModal(btn.dataset.product || 'this product');
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
