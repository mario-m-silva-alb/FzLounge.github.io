/**
 * Events Page JavaScript
 * Loads and displays events from events.json
 */

let eventsData = null;
let allEvents = [];

// Status configurations
const STATUS_CONFIG = {
  open: { label: 'Open', icon: '🟢', class: 'status-open' },
  almost_full: { label: 'Almost Full', icon: '🟡', class: 'status-almost-full' },
  full: { label: 'Full', icon: '🔴', class: 'status-full' },
  past: { label: 'Past Event', icon: '⚫', class: 'status-past' }
};

/**
 * Initialize events page
 */
document.addEventListener('DOMContentLoaded', () => {
  loadEventsData();
  initNavToggle();
});

/**
 * Load events data from JSON
 */
async function loadEventsData() {
  try {
    // Load events data
    const eventsResponse = await fetch('data/events.json');
    if (!eventsResponse.ok) {
      throw new Error('Failed to load events data');
    }
    eventsData = await eventsResponse.json();
    
    // Load products data for games list
    const productsResponse = await fetch('data/products.json');
    if (!productsResponse.ok) {
      throw new Error('Failed to load products data');
    }
    const productsData = await productsResponse.json();
    
    // Populate filters
    populateEventTypeFilter();
    populateGamesFilter(productsData.games);
    
    // Calculate status for each event
    allEvents = eventsData.events.map(calculateEventStatus);
    
    // Sort events by date (upcoming first)
    allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Render events
    renderEvents(allEvents);
    updateEventsCount(allEvents.length);
    
    // Setup filter handlers
    setupFilters();
    
  } catch (error) {
    console.error('Error loading events:', error);
    showErrorMessage();
  }
}

/**
 * Calculate event status based on capacity and date
 */
function calculateEventStatus(event) {
  const eventDate = new Date(event.date + 'T' + event.endTime);
  const now = new Date();
  
  // Check if event is in the past
  if (eventDate < now) {
    return { ...event, calculatedStatus: 'past' };
  }
  
  // Check capacity
  if (event.registered >= event.capacity) {
    return { ...event, calculatedStatus: 'full' };
  }
  
  const fillPercentage = (event.registered / event.capacity) * 100;
  if (fillPercentage >= 75) {
    return { ...event, calculatedStatus: 'almost_full' };
  }
  
  return { ...event, calculatedStatus: 'open' };
}

/**
 * Populate event type filter
 */
function populateEventTypeFilter() {
  const select = document.getElementById('filter-event-type');
  if (!select || !eventsData) return;
  
  eventsData.eventTypes.forEach(type => {
    const option = document.createElement('option');
    option.value = type.value;
    option.textContent = `${type.icon} ${type.label}`;
    select.appendChild(option);
  });
}

/**
 * Populate games filter
 */
function populateGamesFilter(games) {
  const select = document.getElementById('filter-event-game');
  if (!select || !games) return;
  
  games.forEach(game => {
    const option = document.createElement('option');
    option.value = game.value;
    option.textContent = game.label;
    select.appendChild(option);
  });
  
  // Add "Other" option
  const otherOption = document.createElement('option');
  otherOption.value = 'other';
  otherOption.textContent = 'Board Games / Other';
  select.appendChild(otherOption);
}

/**
 * Setup filter handlers
 */
function setupFilters() {
  const typeFilter = document.getElementById('filter-event-type');
  const gameFilter = document.getElementById('filter-event-game');
  const statusFilter = document.getElementById('filter-event-status');
  const resetBtn = document.getElementById('filter-reset-events');
  
  if (typeFilter) typeFilter.addEventListener('change', applyFilters);
  if (gameFilter) gameFilter.addEventListener('change', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeFilter) typeFilter.value = 'all';
      if (gameFilter) gameFilter.value = 'all';
      if (statusFilter) statusFilter.value = 'all';
      applyFilters();
    });
  }
}

/**
 * Apply filters to events
 */
function applyFilters() {
  const typeFilter = document.getElementById('filter-event-type');
  const gameFilter = document.getElementById('filter-event-game');
  const statusFilter = document.getElementById('filter-event-status');
  
  const type = typeFilter ? typeFilter.value : 'all';
  const game = gameFilter ? gameFilter.value : 'all';
  const status = statusFilter ? statusFilter.value : 'all';
  
  let filtered = allEvents.filter(event => {
    const matchType = type === 'all' || event.type === type;
    const matchGame = game === 'all' || event.game === game;
    const matchStatus = status === 'all' || event.calculatedStatus === status;
    
    return matchType && matchGame && matchStatus;
  });
  
  renderEvents(filtered);
  updateEventsCount(filtered.length);
}

/**
 * Render events grid
 */
function renderEvents(events) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  
  if (events.length === 0) {
    grid.innerHTML = '<div class="no-results"><div class="icon">📅</div><p>No events match your filters. Try resetting them!</p></div>';
    return;
  }
  
  grid.innerHTML = events.map(event => buildEventCard(event)).join('');
}

/**
 * Build event card HTML
 */
function buildEventCard(event) {
  const eventType = eventsData.eventTypes.find(t => t.value === event.type);
  const typeIcon = eventType ? eventType.icon : '📅';
  const typeLabel = eventType ? eventType.label : event.type;
  
  const status = STATUS_CONFIG[event.calculatedStatus] || STATUS_CONFIG.open;
  
  // Format date
  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const day = eventDate.getDate();
  const year = eventDate.getFullYear();
  
  // Format time
  const startTime = event.time.substring(0, 5);
  const endTime = event.endTime.substring(0, 5);
  
  // Capacity info
  const spotsLeft = event.capacity - event.registered;
  const capacityText = event.calculatedStatus === 'full' 
    ? 'Full' 
    : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`;
  
  return `
    <article class="event-card">
      <div class="event-card__date-badge">
        <div class="date-month">${month}</div>
        <div class="date-day">${day}</div>
        <div class="date-year">${year}</div>
      </div>
      
      <div class="event-card__content">
        <div class="event-card__header">
          <h2 class="event-card__title">
            ${typeIcon} ${event.title}
          </h2>
          <span class="event-status ${status.class}">
            ${status.icon} ${status.label}
          </span>
        </div>
        
        <div class="event-card__meta">
          <span class="event-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${dayName}, ${startTime} - ${endTime}
          </span>
          <span class="event-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            ${event.registered}/${event.capacity} registered
          </span>
          <span class="event-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${typeLabel}
          </span>
        </div>
        
        <p class="event-card__description">${event.description}</p>
        
        ${event.format ? `
          <div class="event-card__details">
            <span class="detail-badge">Format: ${event.format}</span>
            ${event.prizes ? `<span class="detail-badge">🎁 ${event.prizes}</span>` : ''}
          </div>
        ` : ''}
        
        <div class="event-card__footer">
          <span class="capacity-indicator">
            ${capacityText}
          </span>
          <a href="${event.rsvpLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm ${event.calculatedStatus === 'full' || event.calculatedStatus === 'past' ? 'btn-disabled' : ''}">
            ${event.calculatedStatus === 'full' ? 'Waitlist' : event.calculatedStatus === 'past' ? 'Past Event' : 'RSVP Now'}
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Update events count display
 */
function updateEventsCount(count) {
  const counter = document.getElementById('events-count');
  if (!counter) return;
  
  counter.textContent = `${count} event${count !== 1 ? 's' : ''} found`;
}

/**
 * Show error message
 */
function showErrorMessage() {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  
  grid.innerHTML = `
    <div class="error-message">
      <h3>Unable to Load Events</h3>
      <p>We're having trouble loading event information. Please try refreshing the page.</p>
    </div>
  `;
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
