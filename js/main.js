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

const CATEGORY_LABELS = {
  'single':    'Single Card',
  'deck':      'Deck',
  'booster':   'Booster Pack',
  'accessory': 'Accessory',
};

/* ============================================================
   PAGINATION CONFIGURATION
   ============================================================ */

const PRODUCTS_PER_PAGE = 12;

/**
 * Build the HTML for a single product card.
 * @param {object} product  – entry from products.json
 * @param {object[]} games  – games array from products.json
 * @param {string} titleTag – heading element to use ('h2' or 'h3')
 */
function buildCardHTML(product, games, titleTag) {
  const tag           = titleTag || 'h2';
  const gameLabel     = (games.find(g => g.value === product.game) || {}).label || product.game;
  const catLabel      = CATEGORY_LABELS[product.category]  || product.category;
  const escapedName   = product.name.replace(/"/g, '&quot;');

  return `
    <article class="product-card"
      data-game="${product.game}"
      data-category="${product.category}">
      <div class="product-card__img-wrap">
        <img src="${product.image}" alt="${product.imageAlt}" loading="lazy" />
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

// Pagination state
let currentPage = 1;
let filteredProducts = [];
let allProducts = [];
let gamesData = [];

function initProductsPage(data) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Store all products and games for filtering/pagination
  allProducts = data.products;
  gamesData = data.games;
  filteredProducts = [...allProducts];

  // Set up filter controls
  const filterGame      = document.getElementById('filter-game');
  const filterCategory  = document.getElementById('filter-category');
  const filterResetBtn  = document.getElementById('filter-reset');

  function applyFilters() {
    const game      = filterGame     ? filterGame.value     : 'all';
    const category  = filterCategory ? filterCategory.value : 'all';

    // Filter products
    filteredProducts = allProducts.filter(product => {
      const matchGame      = game     === 'all' || product.game     === game;
      const matchCategory  = category === 'all' || product.category === category;
      return matchGame && matchCategory;
    });

    // Reset to page 1 when filters change
    currentPage = 1;
    renderProducts();
  }

  if (filterGame)     filterGame.addEventListener('change', applyFilters);
  if (filterCategory) filterCategory.addEventListener('change', applyFilters);

  if (filterResetBtn) {
    filterResetBtn.addEventListener('click', () => {
      if (filterGame)     filterGame.value = 'all';
      if (filterCategory) filterCategory.value = 'all';
      applyFilters();
    });
  }

  // Initial render
  renderProducts();
}

/**
 * Render products for the current page with pagination.
 */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const productsCount = document.getElementById('products-count');
  const noResults = document.getElementById('no-results');

  if (!grid) return;

  // Calculate pagination
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  // Clear grid (except no-results element)
  const noResultsEl = document.getElementById('no-results');
  grid.innerHTML = '';
  if (noResultsEl) grid.appendChild(noResultsEl);

  // Update products count
  if (productsCount) {
    if (totalProducts === 0) {
      productsCount.textContent = '';
    } else {
      productsCount.textContent = `${startIndex + 1}-${Math.min(endIndex, totalProducts)} of ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`;
    }
  }

  // Show/hide no results message
  if (noResults) {
    noResults.style.display = totalProducts === 0 ? 'block' : 'none';
  }

  if (totalProducts === 0) return;

  // Render product cards
  const cards = productsToShow
    .map(p => buildCardHTML(p, gamesData, 'h2'))
    .join('\n');
  grid.insertAdjacentHTML('afterbegin', cards);

  // Render pagination controls
  renderPagination(totalPages);
}

/**
 * Render pagination controls.
 * @param {number} totalPages – total number of pages
 */
function renderPagination(totalPages) {
  const grid = document.getElementById('products-grid');
  if (!grid || totalPages <= 1) return;

  // Remove existing pagination
  const existingPagination = document.getElementById('pagination');
  if (existingPagination) existingPagination.remove();

  const pagination = document.createElement('nav');
  pagination.id = 'pagination';
  pagination.className = 'pagination';
  pagination.setAttribute('aria-label', 'Products pagination');
  pagination.setAttribute('role', 'navigation');

  let paginationHTML = '';

  // Previous button
  paginationHTML += `
    <button class="pagination__btn pagination__btn--prev ${currentPage === 1 ? 'pagination__btn--disabled' : ''}"
            ${currentPage === 1 ? 'disabled' : ''}
            data-page="${currentPage - 1}"
            aria-label="Previous page">
      ← Prev
    </button>
  `;

  // Page numbers
  paginationHTML += '<div class="pagination__pages">';

  // Calculate which page numbers to show
  const pagesToShow = getPagesToShow(currentPage, totalPages);

  pagesToShow.forEach((page, index) => {
    if (page === '...') {
      paginationHTML += `<span class="pagination__ellipsis">...</span>`;
    } else {
      const isActive = page === currentPage;
      paginationHTML += `
        <button class="pagination__btn pagination__btn--page ${isActive ? 'pagination__btn--active' : ''}"
                data-page="${page}"
                ${isActive ? 'aria-current="page"' : ''}
                aria-label="Page ${page}">
          ${page}
        </button>
      `;
    }
  });

  paginationHTML += '</div>';

  // Next button
  paginationHTML += `
    <button class="pagination__btn pagination__btn--next ${currentPage === totalPages ? 'pagination__btn--disabled' : ''}"
            ${currentPage === totalPages ? 'disabled' : ''}
            data-page="${currentPage + 1}"
            aria-label="Next page">
      Next →
    </button>
  `;

  pagination.innerHTML = paginationHTML;

  // Add event listeners
  pagination.querySelectorAll('.pagination__btn[data-page]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const page = parseInt(btn.dataset.page, 10);
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        renderProducts();
        // Scroll to top of products grid
        document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Insert pagination after the grid
  grid.parentNode.insertBefore(pagination, grid.nextSibling);
}

/**
 * Calculate which page numbers to show in pagination.
 * @param {number} current – current page
 * @param {number} total   – total pages
 * @returns {(number|string)[]} – array of page numbers and '...'
 */
function getPagesToShow(current, total) {
  const pages = [];
  const delta = 2; // Pages to show on each side of current

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }

  // Always show first page
  pages.push(1);

  // Calculate start and end of range around current page
  const start = Math.max(2, current - delta);
  const end = Math.min(total - 1, current + delta);

  // Add ellipsis if there's a gap after page 1
  if (start > 2) pages.push('...');

  // Add pages in range
  for (let i = start; i <= end; i++) pages.push(i);

  // Add ellipsis if there's a gap before last page
  if (end < total - 1) pages.push('...');

  // Always show last page
  pages.push(total);

  return pages;
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
