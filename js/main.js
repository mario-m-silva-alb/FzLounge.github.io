/* ============================================================
   FzLounge – Main JavaScript
   - Mobile nav toggle
   - Active nav link highlighting
   - Load products from data/products.json
   - Render product cards dynamically (products page & featured section)
   - Populate game dropdowns from JSON (filter bar)
   - Products page filtering
   - Google Analytics 4 event tracking
   ============================================================ */

/* ============================================================
   GOOGLE ANALYTICS 4 EVENT TRACKING
   Helper function to track custom events
   ============================================================ */

function trackEvent(eventName, parameters = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, parameters);
  }
}

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
  
  // Pricing display
  let pricingHTML = '';
  if (product.prices) {
    const minPrice = Math.min(
      product.prices.wood || Infinity,
      product.prices.bronze || Infinity,
      product.prices.silver || Infinity,
      product.prices.gold || Infinity,
      product.prices.platinum || Infinity
    );
    pricingHTML = `
      <div class="product-card__pricing">
        <span class="price-from">From €${minPrice.toFixed(2)}</span>
        <span class="price-tiers">Member pricing</span>
      </div>
    `;
  }

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
        ${pricingHTML}
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
   STRUCTURED DATA (JSON-LD) GENERATION
   ============================================================ */

/**
 * Generate Product structured data for better SEO
 * @param {object[]} products - Array of product objects
 */
function generateProductStructuredData(products) {
  // Only generate if we're on products page
  if (!document.getElementById('products-grid')) return;
  
  // Check if structured data already exists
  const existingScript = document.querySelector('script[data-product-schema]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Generate ItemList schema with all products
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "image": product.image,
        "description": product.description || `${product.name} - ${product.game} trading card product`,
        "category": product.category,
        "brand": {
          "@type": "Brand",
          "name": getBrandName(product.game)
        },
        "offers": {
          "@type": "Offer",
          "availability": getSchemaAvailability(product.status || 'available'),
          "itemCondition": "https://schema.org/NewCondition",
          "url": `https://mario-m-silva-alb.github.io/FzLounge.github.io/products.html#product-${product.id}`
        }
      }
    }))
  };
  
  // Insert into page
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-product-schema', 'true');
  script.textContent = JSON.stringify(itemListSchema, null, 2);
  document.head.appendChild(script);
}

/**
 * Get brand name from game abbreviation
 */
function getBrandName(game) {
  const brandMap = {
    'mtg': 'Wizards of the Coast',
    'pokemon': 'The Pokémon Company',
    'yugioh': 'Konami',
    'lorcana': 'Ravensburger',
    'onepiece': 'Bandai',
    'digimon': 'Bandai',
    'unionarena': 'Bushiroad',
    'weissschwarz': 'Bushiroad',
    'dragonball': 'Bandai',
    'gundam': 'Bandai',
    'riftbound': 'Riftbound Games',
    'starwars': 'Fantasy Flight Games',
    'fleshandblood': 'Legend Story Studios'
  };
  return brandMap[game] || 'FzLounge';
}

/**
 * Convert internal status to Schema.org availability
 */
function getSchemaAvailability(status) {
  const availabilityMap = {
    'available': 'https://schema.org/InStock',
    'presale': 'https://schema.org/PreOrder',
    'limited': 'https://schema.org/LimitedAvailability',
    'sold': 'https://schema.org/OutOfStock'
  };
  return availabilityMap[status] || 'https://schema.org/InStock';
}

/* ============================================================
   PRODUCTS PAGE
   ============================================================ */

function initProductsPage(data) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Store original products for sorting
  let currentProducts = [...data.products];

  // Render all product cards
  function renderProducts(products) {
    const cards = products
      .map(p => buildCardHTML(p, data.games, 'h2'))
      .join('\n');
    grid.innerHTML = '<div id="no-results" class="no-results" style="display:none;" role="status"><div class="icon" aria-hidden="true">🔍</div><p>No products match your filters. Try resetting them!</p></div>' + cards;
    
    // Re-attach click handlers for product cards
    attachProductCardHandlers(data);
  }

  renderProducts(currentProducts);
  
  // Generate Product structured data (JSON-LD) for SEO
  generateProductStructuredData(data.products);

  // Set up filter and search controls
  const filterGame      = document.getElementById('filter-game');
  const filterCategory  = document.getElementById('filter-category');
  const filterStatus    = document.getElementById('filter-status');
  const sortSelect      = document.getElementById('sort-products');
  const filterResetBtn  = document.getElementById('filter-reset');
  const productsCount   = document.getElementById('products-count');
  const searchInput     = document.getElementById('product-search');
  const searchClear     = document.getElementById('search-clear');
  const activeFiltersDiv = document.getElementById('active-filters');
  const filterChipsDiv   = document.getElementById('filter-chips');

  let searchTerm = '';
  let searchTimeout = null;

  /**
   * Update active filter chips display
   */
  function updateFilterChips() {
    if (!filterChipsDiv || !activeFiltersDiv) return;

    const chips = [];
    const game = filterGame?.value;
    const category = filterCategory?.value;
    const status = filterStatus?.value;

    if (game && game !== 'all') {
      const gameLabel = data.games.find(g => g.value === game)?.label || game;
      chips.push({ type: 'game', label: `Game: ${gameLabel}`, value: game });
    }
    if (category && category !== 'all') {
      const catLabel = CATEGORY_LABELS[category] || category;
      chips.push({ type: 'category', label: `Category: ${catLabel}`, value: category });
    }
    if (status && status !== 'all') {
      const statusLabel = STATUS_LABELS[status] || status;
      chips.push({ type: 'status', label: `Status: ${statusLabel}`, value: status });
    }
    if (searchTerm) {
      chips.push({ type: 'search', label: `Search: "${searchTerm}"`, value: searchTerm });
    }

    if (chips.length === 0) {
      activeFiltersDiv.style.display = 'none';
      return;
    }

    activeFiltersDiv.style.display = 'flex';
    filterChipsDiv.innerHTML = chips.map(chip => 
      `<button class="filter-chip" data-filter-type="${chip.type}" data-filter-value="${chip.value}">
        ${chip.label}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>`
    ).join('');

    // Add click handlers for chip removal
    filterChipsDiv.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.dataset.filterType;
        if (type === 'game' && filterGame) filterGame.value = 'all';
        if (type === 'category' && filterCategory) filterCategory.value = 'all';
        if (type === 'status' && filterStatus) filterStatus.value = 'all';
        if (type === 'search' && searchInput) {
          searchInput.value = '';
          searchTerm = '';
          if (searchClear) searchClear.style.display = 'none';
        }
        applyFilters();
      });
    });
  }

  /**
   * Sort products based on selected option
   */
  function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = new Date(a.dateAdded || '2000-01-01');
          const dateB = new Date(b.dateAdded || '2000-01-01');
          return dateB - dateA;
        });
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'game':
        sorted.sort((a, b) => {
          const gameA = data.games.find(g => g.value === a.game)?.label || a.game;
          const gameB = data.games.find(g => g.value === b.game)?.label || b.game;
          return gameA.localeCompare(gameB);
        });
        break;
      case 'featured':
      default:
        // Featured first, then by date added
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          const dateA = new Date(a.dateAdded || '2000-01-01');
          const dateB = new Date(b.dateAdded || '2000-01-01');
          return dateB - dateA;
        });
        break;
    }
    
    return sorted;
  }

  /**
   * Apply all filters and search
   */
  function applyFilters() {
    const game      = filterGame     ? filterGame.value     : 'all';
    const category  = filterCategory ? filterCategory.value : 'all';
    const status    = filterStatus   ? filterStatus.value   : 'all';
    const sortBy    = sortSelect     ? sortSelect.value     : 'featured';
    const search    = searchTerm.toLowerCase().trim();

    // Filter products
    let filteredProducts = currentProducts.filter(product => {
      const matchGame     = game     === 'all' || product.game     === game;
      const matchCategory = category === 'all' || product.category === category;
      const matchStatus   = status   === 'all' || (product.status || 'available') === status;
      const searchText = `${product.name} ${product.description} ${data.games.find(g => g.value === product.game)?.label || ''}`.toLowerCase();
      const matchSearch   = !search || searchText.includes(search);

      return matchGame && matchCategory && matchStatus && matchSearch;
    });

    // Sort products
    filteredProducts = sortProducts(filteredProducts, sortBy);

    // Render sorted and filtered products
    renderProducts(filteredProducts);

    // Update visible count display
    // Update visible count display
    let visible = 0;

    grid.querySelectorAll('.product-card[data-game]').forEach(card => {
      if (card.style.display !== 'none') visible++;
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

    // Update filter chips
    updateFilterChips();
    
    // Track search event
    if (search) {
      trackEvent('search', {
        'search_term': searchTerm
      });
    }
    
    // Track filter usage
    if (game !== 'all' || category !== 'all' || status !== 'all') {
      trackEvent('filter_products', {
        'game': game,
        'category': category,
        'status': status
      });
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
  if (filterStatus)   filterStatus.addEventListener('change', applyFilters);
  if (sortSelect)     sortSelect.addEventListener('change', applyFilters);

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
      if (filterStatus)   filterStatus.value = 'all';
      if (sortSelect)     sortSelect.value = 'featured';
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
  
  // Attach click handlers for product detail modal
  attachProductCardHandlers(data);
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
        <a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-primary modal-channel-btn" id="contact-discord">
          💬 Discord
        </a>
        <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-outline modal-channel-btn" id="contact-whatsapp">
          📱 WhatsApp
        </a>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('modal-close').addEventListener('click', closeContactModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeContactModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeContactModal(); });
  
  // Track contact button clicks
  document.getElementById('contact-discord').addEventListener('click', () => {
    const productName = document.getElementById('modal-product-name').textContent;
    trackEvent('contact_click', {
      'platform': 'discord',
      'product_name': productName
    });
  });
  
  document.getElementById('contact-whatsapp').addEventListener('click', () => {
    const productName = document.getElementById('modal-product-name').textContent;
    trackEvent('contact_click', {
      'platform': 'whatsapp',
      'product_name': productName
    });
  });
}

function openContactModal(productName) {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  document.getElementById('modal-product-name').textContent = productName;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').focus();
  
  // Track contact modal open
  trackEvent('contact_modal_open', {
    'product_name': productName
  });
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
   PRODUCT DETAIL MODAL
   ============================================================ */

let productsData = null; // Global reference to products data
let currentProductIndex = -1;

/**
 * Attach click handlers to product cards
 */
function attachProductCardHandlers(data) {
  productsData = data;
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the contact button
      if (e.target.closest('.btn-contact')) return;
      
      const productId = parseInt(card.dataset.productId);
      openProductDetail(productId);
    });
  });
}

/**
 * Build product detail HTML
 */
function buildProductDetailHTML(product, games) {
  const gameLabel = (games.find(g => g.value === product.game) || {}).label || product.game;
  const condLabel = CONDITION_LABELS[product.condition] || product.condition;
  const catLabel = CATEGORY_LABELS[product.category] || product.category;
  const status = product.status || 'available';
  const statusLabel = STATUS_LABELS[status] || status;
  const statusIcon = STATUS_ICONS[status] || '';
  
  const isNew = product.dateAdded && isProductNew(product.dateAdded);
  const productId = `#${String(product.id).padStart(3, '0')}`;
  
  // Preorder date for presale items
  let preorderDateHTML = '';
  if (status === 'presale' && product.preorderDate) {
    const preorderDate = new Date(product.preorderDate).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    preorderDateHTML = `<div class="spec-item"><span class="spec-label">Preorder Opened:</span> <span class="spec-value">${preorderDate}</span></div>`;
  }
  
  // Release date for presale items
  let releaseDateHTML = '';
  if (status === 'presale' && product.releaseDate) {
    const releaseDate = new Date(product.releaseDate).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    releaseDateHTML = `<div class="spec-item"><span class="spec-label">Release Date:</span> <span class="spec-value">${releaseDate}</span></div>`;
  }
  
  // Date added
  const dateAdded = product.dateAdded ? new Date(product.dateAdded).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'Unknown';
  
  // Related products (same game or category, exclude current product)
  const relatedProducts = productsData.products
    .filter(p => p.id !== product.id && (p.game === product.game || p.category === product.category))
    .slice(0, 4);
  
  const relatedHTML = relatedProducts.length > 0 ? `
    <div class="modal-related">
      <h3>Related Products</h3>
      <div class="related-products-grid">
        ${relatedProducts.map(p => {
          const relGameLabel = (games.find(g => g.value === p.game) || {}).label || p.game;
          return `
            <div class="related-product" data-product-id="${p.id}">
              <img src="${p.image}" alt="${p.imageAlt}" loading="lazy" />
              <div class="related-product__info">
                <h4>${p.name}</h4>
                <span class="related-product__game">${relGameLabel}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';
  
  return `
    <div class="modal-product-detail">
      <div class="modal-product-image">
        <img src="${product.image}" alt="${product.imageAlt}" />
        ${isNew ? '<span class="badge-new modal-badge">✨ NEW</span>' : ''}
      </div>
      <div class="modal-product-info">
        <h2 id="modal-product-title">${product.name}</h2>
        <div class="modal-product-meta">
          <span class="badge-status badge-status-${status}">${statusIcon} ${statusLabel}</span>
          <span class="product-id">${productId}</span>
        </div>
        <p class="modal-product-description">${product.description}</p>
        
        <div class="modal-product-specs">
          <h3>Specifications</h3>
          <div class="spec-item">
            <span class="spec-label">Game:</span>
            <span class="spec-value">${gameLabel}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Category:</span>
            <span class="spec-value">${catLabel}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Condition:</span>
            <span class="spec-value">${condLabel}</span>
          </div>
          ${preorderDateHTML}
          ${releaseDateHTML}
          <div class="spec-item">
            <span class="spec-label">Added:</span>
            <span class="spec-value">${dateAdded}</span>
          </div>
        </div>
        
        ${buildTierPricingHTML(product)}
        
        <div class="modal-product-actions">
          <button class="btn btn-primary btn-lg btn-contact" data-product="${product.name}">
            Contact to Get
          </button>
          <button class="btn btn-outline btn-share" id="btn-share-product">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Name
          </button>
        </div>
      </div>
    </div>
    ${relatedHTML}
  `;
}

/**
 * Attach product card click handlers
 */
function attachProductCardHandlers(data) {
  productsData = data;
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the contact button
      if (e.target.closest('.btn-contact')) return;
      
      const productId = parseInt(card.dataset.productId);
      openProductDetail(productId);
    });
  });
}

/**
 * Build tier pricing table HTML
 */
function buildTierPricingHTML(product) {
  if (!product.prices) return '';
  
  const tiers = [
    { id: 'wood', name: 'Wood', icon: '🌳' },
    { id: 'bronze', name: 'Bronze', icon: '🥉' },
    { id: 'silver', name: 'Silver', icon: '🥈' },
    { id: 'gold', name: 'Gold', icon: '🥇' },
    { id: 'platinum', name: 'Platinum', icon: '💎' }
  ];
  
  const basePrice = product.prices.wood;
  
  return `
    <div class="modal-product-pricing">
      <h3>Membership Pricing</h3>
      <div class="pricing-table">
        ${tiers.map(tier => {
          const price = product.prices[tier.id];
          if (price === undefined) return '';
          
          const savings = basePrice - price;
          const savingsText = savings > 0 ? `<span class="savings-badge">Save €${savings.toFixed(2)}</span>` : '';
          
          return `
            <div class="pricing-row tier-${tier.id}">
              <span class="tier-info">
                <span class="tier-icon">${tier.icon}</span>
                <span class="tier-name">${tier.name}</span>
              </span>
              <span class="tier-price-group">
                <span class="tier-price">€${price.toFixed(2)}</span>
                ${savingsText}
              </span>
            </div>
          `;
        }).join('')}
      </div>
      <a href="tiers.html" class="tier-info-link">Learn about membership tiers →</a>
    </div>
  `;
}

/**
 * Build product detail HTML
 */
function openProductDetail(productId) {
  if (!productsData) return;
  
  const product = productsData.products.find(p => p.id === productId);
  if (!product) return;
  
  currentProductIndex = productsData.products.findIndex(p => p.id === productId);
  
  const modal = document.getElementById('product-detail-modal');
  const modalBody = document.getElementById('modal-detail-body');
  
  if (!modal || !modalBody) return;
  
  // Render product details
  modalBody.innerHTML = buildProductDetailHTML(product, productsData.games);
  
  // Show modal
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Update URL hash
  window.location.hash = `product-${productId}`;
  
  // Track product view
  trackEvent('view_item', {
    'items': [{
      'item_id': product.id,
      'item_name': product.name,
      'item_category': product.game,
      'item_category2': product.category
    }]
  });
  
  // Attach share button handler
  const shareBtn = document.getElementById('btn-share-product');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => shareProduct(productId));
  }
  
  // Attach related product click handlers
  modalBody.querySelectorAll('.related-product').forEach(relCard => {
    relCard.style.cursor = 'pointer';
    relCard.addEventListener('click', () => {
      const relProductId = parseInt(relCard.dataset.productId);
      openProductDetail(relProductId);
    });
  });
  
  // Update prev/next button states
  updateModalNavButtons();
}

/**
 * Close product detail modal
 */
function closeProductDetail() {
  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  document.body.style.overflow = '';
  
  // Remove hash from URL
  if (window.location.hash.startsWith('#product-')) {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }
}

/**
 * Navigate to previous/next product
 */
function navigateProduct(direction) {
  if (!productsData || currentProductIndex < 0) return;
  
  const newIndex = direction === 'prev' 
    ? (currentProductIndex - 1 + productsData.products.length) % productsData.products.length
    : (currentProductIndex + 1) % productsData.products.length;
  
  const newProduct = productsData.products[newIndex];
  if (newProduct) {
    openProductDetail(newProduct.id);
  }
}

/**
 * Update prev/next button states
 */
function updateModalNavButtons() {
  const prevBtn = document.getElementById('modal-nav-prev');
  const nextBtn = document.getElementById('modal-nav-next');
  
  if (!productsData || !prevBtn || !nextBtn) return;
  
  // Always enable buttons (circular navigation)
  prevBtn.disabled = false;
  nextBtn.disabled = false;
}

/**
 * Share product (copy product name to clipboard)
 */
function shareProduct(productId) {
  if (!productsData) return;
  
  const product = productsData.products.find(p => p.id === productId);
  if (!product) return;
  
  const productName = product.name;
  const productIdFormatted = `#${String(product.id).padStart(3, '0')}`;
  const textToCopy = `${productName} (${productIdFormatted})`;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Show success feedback
      const shareBtn = document.getElementById('btn-share-product');
      if (shareBtn) {
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        shareBtn.style.pointerEvents = 'none';
        setTimeout(() => {
          shareBtn.innerHTML = originalText;
          shareBtn.style.pointerEvents = '';
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy product name:', err);
      alert('Could not copy to clipboard');
    });
  } else {
    // Fallback for browsers without clipboard API
    alert(`Product name: ${textToCopy}\n\nCopy this and send to us!`);
  }
}

/**
 * Initialize product detail modal
 */
function initProductDetailModal() {
  const modal = document.getElementById('product-detail-modal');
  if (!modal) return;
  
  // Close button
  const closeBtn = document.getElementById('modal-detail-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductDetail);
  }
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProductDetail();
    }
  });
  
  // Previous/Next buttons
  const prevBtn = document.getElementById('modal-nav-prev');
  const nextBtn = document.getElementById('modal-nav-next');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => navigateProduct('prev'));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => navigateProduct('next'));
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modal.style.display !== 'flex') return;
    
    switch(e.key) {
      case 'Escape':
        closeProductDetail();
        break;
      case 'ArrowLeft':
        navigateProduct('prev');
        break;
      case 'ArrowRight':
        navigateProduct('next');
        break;
    }
  });
  
  // Check for hash on page load
  if (window.location.hash.startsWith('#product-')) {
    const productId = parseInt(window.location.hash.replace('#product-', ''));
    if (!isNaN(productId)) {
      // Delay opening until data is loaded
      setTimeout(() => openProductDetail(productId), 100);
    }
  }
}

/* ============================================================
   STATS COUNTER ANIMATION (Homepage)
   ============================================================ */

function animateStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length === 0) return;
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
        entry.target.classList.add('animated');
        animateCounter(entry.target);
      }
    });
  }, observerOptions);
  
  statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

/* ============================================================
   UPCOMING EVENTS (Homepage)
   ============================================================ */

async function loadUpcomingEvents() {
  const grid = document.getElementById('upcoming-events-grid');
  if (!grid) return;
  
  try {
    const response = await fetch('data/events.json');
    if (!response.ok) throw new Error('Failed to load events');
    
    const data = await response.json();
    const now = new Date();
    
    // Filter upcoming events (not past, limit to 3)
    const upcoming = data.events
      .map(event => {
        const eventDate = new Date(event.date + 'T' + event.endTime);
        return { ...event, eventDate };
      })
      .filter(event => event.eventDate > now)
      .sort((a, b) => a.eventDate - b.eventDate)
      .slice(0, 3)
      .map(event => calculateEventStatus(event));
    
    if (upcoming.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);">No upcoming events scheduled. Check back soon!</p>';
      return;
    }
    
    grid.innerHTML = upcoming.map(event => buildCompactEventCard(event)).join('');
    
  } catch (error) {
    console.error('Error loading upcoming events:', error);
    grid.innerHTML = '<p style="text-align:center;color:var(--color-text-muted);">Unable to load events.</p>';
  }
}

function calculateEventStatus(event) {
  const eventDate = new Date(event.date + 'T' + event.endTime);
  const now = new Date();
  
  if (eventDate < now) {
    return { ...event, calculatedStatus: 'past' };
  }
  
  // Use the status from the data (open, almost_full, full)
  return { ...event, calculatedStatus: event.status };
}

function buildCompactEventCard(event) {
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const day = eventDate.getDate();
  const time = event.time.substring(0, 5);
  
  const statusConfig = {
    open: { label: 'Open', icon: '🟢', class: 'status-open' },
    almost_full: { label: 'Almost Full', icon: '🟡', class: 'status-almost-full' },
    full: { label: 'Full', icon: '🔴', class: 'status-full' }
  };
  
  const status = statusConfig[event.calculatedStatus] || statusConfig.open;
  
  return `
    <article class="compact-event-card">
      <div class="compact-event-date">
        <div class="compact-date-month">${month}</div>
        <div class="compact-date-day">${day}</div>
        <div class="compact-date-time">${time}</div>
      </div>
      <div class="compact-event-info">
        <h3 class="compact-event-title">${event.title}</h3>
        <div class="compact-event-meta">
          <span>📅 ${eventDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
          <span>👥 Capacity: ${event.capacity}</span>
          <span>${event.format || 'Various'}</span>
        </div>
        <p class="compact-event-description">${event.description}</p>
        <div class="compact-event-footer">
          <span class="compact-event-status ${status.class}">
            ${status.icon} ${status.label}
          </span>
          <a href="events.html" class="btn btn-sm btn-primary">Details →</a>
        </div>
      </div>
    </article>
  `;
}

/* ============================================================
   SCROLL ANIMATIONS
   ============================================================ */

function initScrollAnimations() {
  // Only run if user hasn't requested reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        // Optional: stop observing after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all elements with animate-on-scroll class
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
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

  /* Product detail modal initialization */
  initProductDetailModal();
  
  /* Stats counter animation (Homepage) */
  animateStatsCounters();
  
  /* Load upcoming events (Homepage) */
  loadUpcomingEvents();
  
  /* Initialize scroll animations */
  initScrollAnimations();

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
