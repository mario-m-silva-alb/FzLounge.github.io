/**
 * Tiers Page JavaScript
 * Loads and displays membership tier information
 */

let tiersData = null;

/**
 * Initialize tiers page
 */
document.addEventListener('DOMContentLoaded', () => {
  loadTiersData();
  initNavToggle();
  updateLastUpdatedDate();
});

/**
 * Load tiers data from JSON
 */
async function loadTiersData() {
  try {
    const response = await fetch('data/tiers.json');
    if (!response.ok) {
      throw new Error('Failed to load tiers data');
    }
    tiersData = await response.json();
    
    renderTierCards();
    renderComparisonTable();
  } catch (error) {
    console.error('Error loading tiers:', error);
    showErrorMessage();
  }
}

/**
 * Render tier cards
 */
function renderTierCards() {
  if (!tiersData) return;
  
  const container = document.getElementById('tiers-container');
  if (!container) return;
  
  container.innerHTML = tiersData.tiers.map(tier => {
    const isPopular = tier.id === 'silver'; // Highlight Silver as popular choice
    const savingsText = tier.level > 0 ? `Save up to €${tier.productDiscounts.rangeAbove10.toFixed(2)}` : 'Base tier';
    
    return `
      <div class="tier-card tier-card--${tier.id} ${isPopular ? 'tier-card--popular' : ''}">
        ${isPopular ? '<div class="tier-card__badge">Most Popular</div>' : ''}
        
        <div class="tier-card__header">
          <div class="tier-card__icon">${tier.icon}</div>
          <h3 class="tier-card__name">${tier.name}</h3>
          <div class="tier-card__price">
            <span class="price-large">€${tier.price.monthly}</span>
            <span class="price-period">/month</span>
          </div>
          <div class="tier-card__yearly">€${tier.price.yearly}/year</div>
          <div class="tier-card__savings">${savingsText}</div>
        </div>
        
        <div class="tier-card__body">
          <h4>Key Benefits</h4>
          <ul class="benefits-list">
            ${tier.benefits.map(benefit => `
              <li><span class="benefit-icon">✓</span> ${benefit}</li>
            `).join('')}
          </ul>
          
          ${tier.barCredit > 0 ? `
            <div class="tier-card__credit">
              <strong>Monthly Credit:</strong> €${tier.barCredit}
            </div>
          ` : ''}
        </div>
        
        <div class="tier-card__footer">
          <a href="https://discord.gg/MTtNkGN" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block">
            Select ${tier.name}
          </a>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render comparison table
 */
function renderComparisonTable() {
  if (!tiersData) return;
  
  const table = document.getElementById('comparison-table');
  if (!table) return;
  
  // Table header
  const headerRow = `
    <thead>
      <tr>
        <th>Feature</th>
        ${tiersData.tiers.map(tier => `
          <th class="tier-col tier-col--${tier.id}">
            <div class="tier-header">
              <span class="tier-icon">${tier.icon}</span>
              <span class="tier-name">${tier.name}</span>
              <span class="tier-price">€${tier.price.monthly}/mo</span>
            </div>
          </th>
        `).join('')}
      </tr>
    </thead>
  `;
  
  // Table body - compare key features
  const features = [
    {
      label: 'Monthly Price',
      getValue: (tier) => tier.price.monthly === 0 ? 'Free' : `€${tier.price.monthly}`
    },
    {
      label: 'Yearly Price',
      getValue: (tier) => tier.price.yearly === 0 ? 'Free' : `€${tier.price.yearly}`
    },
    {
      label: 'Monthly Credit',
      getValue: (tier) => tier.barCredit === 0 ? '-' : `€${tier.barCredit}`
    },
    {
      label: 'Product Discount (€5-€10)',
      getValue: (tier) => tier.productDiscounts.range5to10 === 0 ? '-' : `-€${tier.productDiscounts.range5to10.toFixed(2)}`
    },
    {
      label: 'Product Discount (>€10)',
      getValue: (tier) => tier.productDiscounts.rangeAbove10 === 0 ? '-' : `-€${tier.productDiscounts.rangeAbove10.toFixed(2)}`
    },
    {
      label: 'Access to Space',
      getValue: (tier) => '✓'
    },
    {
      label: 'Preorder Access',
      getValue: (tier) => tier.level >= 1 ? '✓' : '-'
    },
    {
      label: 'Singles Discount',
      getValue: (tier) => tier.level >= 3 ? '5%' : '-'
    },
    {
      label: 'Free Table Reservation',
      getValue: (tier) => tier.level >= 3 ? '✓' : '-'
    },
    {
      label: 'D&D Table Reservations',
      getValue: (tier) => tier.level >= 4 ? '4/month' : '-'
    },
    {
      label: 'Priority Level',
      getValue: (tier) => tier.priority
    }
  ];
  
  const bodyRows = features.map(feature => `
    <tr>
      <td class="feature-label"><strong>${feature.label}</strong></td>
      ${tiersData.tiers.map(tier => `
        <td class="tier-col tier-col--${tier.id}">${feature.getValue(tier)}</td>
      `).join('')}
    </tr>
  `).join('');
  
  table.innerHTML = headerRow + '<tbody>' + bodyRows + '</tbody>';
}

/**
 * Update last updated date
 */
function updateLastUpdatedDate() {
  if (!tiersData) return;
  
  const dateElement = document.getElementById('last-updated');
  if (!dateElement) return;
  
  const date = new Date(tiersData.lastUpdated);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = date.toLocaleDateString('en-US', options);
  dateElement.setAttribute('datetime', tiersData.lastUpdated);
}

/**
 * Show error message if data fails to load
 */
function showErrorMessage() {
  const container = document.getElementById('tiers-container');
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <h3>Unable to Load Tiers</h3>
        <p>We're having trouble loading tier information. Please try refreshing the page.</p>
      </div>
    `;
  }
}

/**
 * Initialize navigation toggle for mobile
 */
function initNavToggle() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  
  if (!navToggle || !navLinks) return;
  
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
  });
}
