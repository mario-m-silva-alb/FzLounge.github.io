# Phase 4.5 Changes: Google Analytics 4 Setup

**Date:** May 30, 2026  
**Status:** ✅ COMPLETED  
**Branch:** phase-1

---

## Overview

Phase 4.5 implements Google Analytics 4 (GA4) tracking across all pages with custom event tracking to monitor user behavior, engagement, and conversion metrics.

---

## 🎯 Changes Implemented

### 1. Google Analytics 4 Base Tracking Code ✅

Added GA4 tracking code to all 5 HTML pages:

**Pages Updated:**
- ✅ `index.html`
- ✅ `products.html`
- ✅ `about.html`
- ✅ `events.html`
- ✅ `tiers.html`

**Tracking Code Added:**
```html
<!-- Google Analytics 4 -->
<!-- Replace G-XXXXXXXXXX with your actual Google Analytics 4 Measurement ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Location:** Added in `<head>` section after stylesheet link on all pages

**Note:** The placeholder `G-XXXXXXXXXX` must be replaced with your actual Google Analytics 4 Measurement ID.

---

### 2. Custom Event Tracking Helper Function ✅

Added GA4 event tracking helper function in `js/main.js`:

**Helper Function:**
```javascript
/* ============================================================
   GOOGLE ANALYTICS 4 EVENT TRACKING
   Helper function to track custom events
   ============================================================ */

function trackEvent(eventName, parameters = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, parameters);
  }
}
```

**Features:**
- Safe execution (checks if gtag exists)
- Accepts event name and parameters
- Easy to use throughout codebase
- No errors if GA4 not configured

---

### 3. Product View Tracking ✅

Track when users view product details in the modal:

**Implementation:**
```javascript
// Track product view
trackEvent('view_item', {
  'items': [{
    'item_id': product.id,
    'item_name': product.name,
    'item_category': product.game,
    'item_category2': product.category
  }]
});
```

**Triggered When:**
- User clicks on a product card
- Product detail modal opens

**Data Captured:**
- Product ID
- Product name
- Game type (MTG, Pokémon, etc.)
- Product category (booster, deck, single, etc.)

**File:** `js/main.js` (in `openProductDetail()` function)

---

### 4. Contact Modal Tracking ✅

Track when users open the contact modal and which platform they choose:

**Modal Open Tracking:**
```javascript
// Track contact modal open
trackEvent('contact_modal_open', {
  'product_name': productName
});
```

**Triggered When:**
- User clicks "Contact to Get" button
- Modal opens with Discord/WhatsApp options

**Platform Click Tracking:**
```javascript
// Track Discord button click
trackEvent('contact_click', {
  'platform': 'discord',
  'product_name': productName
});

// Track WhatsApp button click
trackEvent('contact_click', {
  'platform': 'whatsapp',
  'product_name': productName
});
```

**Triggered When:**
- User clicks Discord button
- User clicks WhatsApp button

**Data Captured:**
- Product name they're interested in
- Contact platform chosen (Discord/WhatsApp)

**File:** `js/main.js` (in `openContactModal()` and `injectContactModal()` functions)

---

### 5. Search Tracking ✅

Track search queries to understand what users are looking for:

**Implementation:**
```javascript
// Track search event
if (search) {
  trackEvent('search', {
    'search_term': searchTerm
  });
}
```

**Triggered When:**
- User types in search box
- Search is executed (after debounce)

**Data Captured:**
- Exact search term entered
- Search results count (via other metrics)

**File:** `js/main.js` (in `applyFilters()` function)

---

### 6. Filter Usage Tracking ✅

Track how users filter products to improve UX:

**Implementation:**
```javascript
// Track filter usage
if (game !== 'all' || category !== 'all' || status !== 'all') {
  trackEvent('filter_products', {
    'game': game,
    'category': category,
    'status': status
  });
}
```

**Triggered When:**
- User changes filter dropdown
- Filters are applied

**Data Captured:**
- Game filter selected (MTG, Pokémon, etc.)
- Category filter (booster, deck, single, etc.)
- Status filter (presale, in stock, limited, etc.)

**File:** `js/main.js` (in `applyFilters()` function)

---

## 📊 Events Being Tracked

### Summary of All Tracked Events:

| Event Name | Description | Parameters | Frequency |
|-----------|-------------|------------|-----------|
| `view_item` | Product detail viewed | item_id, item_name, item_category | Per product view |
| `contact_modal_open` | Contact modal opened | product_name | Per modal open |
| `contact_click` | Contact button clicked | platform, product_name | Per click |
| `search` | Search performed | search_term | Per search |
| `filter_products` | Filters applied | game, category, status | Per filter change |

### Standard GA4 Events (Automatically Tracked):

- `page_view` - Page loads
- `first_visit` - New user visits
- `session_start` - Session begins
- `user_engagement` - User active on page
- `scroll` - User scrolls page

---

## 📂 Files Modified

### Modified Files (6):
```
index.html              - Added GA4 tracking code
products.html           - Added GA4 tracking code
about.html              - Added GA4 tracking code
events.html             - Added GA4 tracking code
tiers.html              - Added GA4 tracking code
js/main.js              - Added trackEvent() helper and event tracking
```

### Regenerated Files (1):
```
js/main.min.js          - Regenerated with GA4 tracking code
```

**Total Lines Added:**
- HTML files: 11 lines each × 5 pages = 55 lines
- JavaScript: ~60 lines for tracking implementation
- Total: ~115 lines

---

## 🚀 Setup Instructions

### 1. Create Google Analytics 4 Property

**Step-by-Step:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Click **Create Property**
4. Fill in details:
   - **Property name:** FzLounge
   - **Time zone:** Your timezone
   - **Currency:** EUR (Euro)
5. Click **Next**
6. Fill in business details:
   - **Industry:** Retail
   - **Business size:** Small
7. Click **Create**
8. Accept Terms of Service

---

### 2. Get Your Measurement ID

1. In Admin → Property Settings
2. Look for **Measurement ID** (format: `G-XXXXXXXXXX`)
3. Copy the Measurement ID

**Example:** `G-ABC123XYZ`

---

### 3. Update All HTML Files

**Find and Replace:**

In all 5 HTML files (`index.html`, `products.html`, `about.html`, `events.html`, `tiers.html`):

**Replace:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**With your actual Measurement ID:**
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-ABC123XYZ');
</script>
```

**Important:** Replace `G-XXXXXXXXXX` with **YOUR** Measurement ID in **BOTH** places (the `src` URL and the `gtag('config')` call).

---

### 4. Deploy to GitHub

1. Commit changes:
   ```bash
   git add .
   git commit -m "Phase 4.5: Add Google Analytics 4 tracking"
   git push origin phase-1
   ```

2. Wait for GitHub Pages to deploy (~1-2 minutes)

3. Visit your live site

---

### 5. Verify Tracking is Working

**Real-Time Reports:**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your **FzLounge** property
3. Go to **Reports** → **Realtime**
4. Open your website in another tab
5. Navigate around the site
6. In GA4 Realtime:
   - ✅ You should see 1 active user (you)
   - ✅ Page views should increment
   - ✅ Events should appear

**Test Each Event:**
- Navigate pages → `page_view` events
- Click product card → `view_item` event
- Click "Contact to Get" → `contact_modal_open` event
- Click Discord/WhatsApp → `contact_click` event
- Search for a product → `search` event
- Change filters → `filter_products` event

---

## 🧪 Testing Instructions

### 1. **Browser Console Testing**

**Check if GA4 is Loaded:**
1. Open DevTools (F12)
2. Go to Console tab
3. Type: `typeof gtag`
4. Expected: `"function"`
5. If `"undefined"`, GA4 is not loading

**Check dataLayer:**
```javascript
console.log(window.dataLayer);
```
Expected: Array with events

---

### 2. **Network Tab Testing**

**Verify GA4 Requests:**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by: `google-analytics` or `gtag`
4. Navigate the site
5. Look for requests to:
   - `https://www.googletagmanager.com/gtag/js?id=G-...`
   - `https://www.google-analytics.com/g/collect?...`

**Each action should send a request:**
- Page load → `page_view`
- Click product → `view_item`
- Search → `search`
- etc.

---

### 3. **GA4 Debug Mode**

**Enable Debug Mode:**
1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) extension
2. Enable the extension
3. Open your site
4. Open DevTools console
5. You'll see detailed GA4 event logs

**Verify Events:**
- Each tracked event appears in console
- Parameters are correct
- No errors

---

### 4. **Real-Time Report Testing**

**Test All Custom Events:**

| Action | Expected Event | Parameters |
|--------|---------------|------------|
| Click product card | `view_item` | item_id, item_name, item_category |
| Click "Contact to Get" | `contact_modal_open` | product_name |
| Click Discord button | `contact_click` | platform: discord, product_name |
| Click WhatsApp button | `contact_click` | platform: whatsapp, product_name |
| Search for "booster" | `search` | search_term: booster |
| Filter by game | `filter_products` | game, category, status |

**In GA4 Realtime:**
1. Go to **Realtime** → **Event count by Event name**
2. Perform each action above
3. Verify event appears in list
4. Click event name to see parameters

---

## 📊 GA4 Dashboard Setup

### Recommended Reports to Create:

### 1. **Product Performance Report**

**Events to Monitor:**
- `view_item` - Which products are viewed most
- `contact_modal_open` - Which products generate interest
- `contact_click` - Which products lead to contact

**Dimensions:**
- `item_name` (Product name)
- `item_category` (Game type)
- `item_category2` (Product category)

**Metrics:**
- Event count
- Users
- Conversion rate

---

### 2. **Contact Platform Report**

**Event:** `contact_click`

**Dimension:** `platform` (Discord vs WhatsApp)

**Questions to Answer:**
- Which platform do users prefer?
- Does platform choice vary by product?
- What's the contact rate per product view?

---

### 3. **Search Insights Report**

**Event:** `search`

**Dimension:** `search_term`

**Questions to Answer:**
- What are users searching for?
- Are they finding what they search for?
- What products are missing from inventory?

---

### 4. **Filter Usage Report**

**Event:** `filter_products`

**Dimensions:**
- `game` (Which games are popular?)
- `category` (What product types?)
- `status` (Presale vs in stock preference?)

**Questions to Answer:**
- Which games are most popular?
- What product categories are in demand?
- Do users prefer presales or in-stock items?

---

## 🎯 Goals to Configure in GA4

### Conversion Events:

1. **Contact Intent** - `contact_modal_open`
   - Mark as conversion
   - Indicates user interest in purchasing

2. **Contact Action** - `contact_click`
   - Mark as conversion
   - User took action to contact

3. **Product Engagement** - `view_item`
   - Count as engagement
   - Measures product interest

### Audience Segments:

1. **Engaged Users**
   - Viewed 3+ products
   - Used search or filters
   - Clicked contact button

2. **Product Browsers**
   - Viewed 1-2 products
   - No contact action
   - Target for retargeting

3. **Converters**
   - Clicked contact button
   - High engagement
   - Potential customers

---

## 📈 Key Metrics to Monitor

### Traffic Metrics:
- **Users:** Total unique visitors
- **Sessions:** Total visits
- **Page Views:** Total pages viewed
- **Avg Session Duration:** Time on site
- **Bounce Rate:** Single-page visits

### Engagement Metrics:
- **Product Views:** `view_item` count
- **Search Usage:** `search` count
- **Filter Usage:** `filter_products` count
- **Contact Modal Opens:** `contact_modal_open` count

### Conversion Metrics:
- **Contact Clicks:** `contact_click` count
- **Contact Rate:** Contacts / Product Views
- **Platform Preference:** Discord vs WhatsApp ratio
- **Top Products:** Most viewed/contacted products

---

## 🔧 Maintenance & Updates

### Adding New Events:

**Example: Track Social Media Clicks**

1. **Add Event in HTML:**
```html
<a href="https://discord.gg/..." onclick="trackEvent('social_click', {'platform': 'discord'})">
  Discord
</a>
```

2. **Or in JavaScript:**
```javascript
document.getElementById('instagram-link').addEventListener('click', () => {
  trackEvent('social_click', {
    'platform': 'instagram'
  });
});
```

3. **Regenerate minified JS**
4. **Test in GA4 Realtime**

---

### Updating Event Parameters:

**Current:**
```javascript
trackEvent('view_item', {
  'item_id': product.id,
  'item_name': product.name
});
```

**Add Price:**
```javascript
trackEvent('view_item', {
  'item_id': product.id,
  'item_name': product.name,
  'price': product.prices.wood,  // Add price
  'currency': 'EUR'                // Add currency
});
```

---

## ⚠️ Important Notes

### Privacy & GDPR:

**Current Implementation:**
- GA4 tracking is active by default
- No cookie consent banner yet
- Complies with basic tracking

**For GDPR Compliance:**
- Consider adding cookie consent banner
- Allow users to opt-out
- Update privacy policy
- Mention GA4 in Terms of Service

**Cookie Consent Banner (Future Phase):**
```html
<div id="cookie-banner">
  We use cookies to improve your experience.
  <button onclick="acceptCookies()">Accept</button>
  <button onclick="rejectCookies()">Reject</button>
</div>
```

---

### Data Retention:

**GA4 Default Settings:**
- Event data: 2 months (changeable to 14 months)
- User data: Until manually deleted

**To Change:**
1. Admin → Data Settings → Data Retention
2. Change to **14 months** (maximum)

---

### IP Anonymization:

**Already Enabled in GA4:**
- GA4 anonymizes IP addresses by default
- No additional configuration needed
- Complies with privacy regulations

---

## 🔗 Useful Resources

### Google Analytics 4:
- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Tracking Guide](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [GA4 vs Universal Analytics](https://support.google.com/analytics/answer/11583528)

### Event Tracking:
- [Recommended Events](https://support.google.com/analytics/answer/9267735)
- [Custom Events Guide](https://support.google.com/analytics/answer/10085872)
- [Event Parameters](https://support.google.com/analytics/answer/9143382)

### Testing & Debugging:
- [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
- [GA4 Debug Mode](https://support.google.com/analytics/answer/7201382)
- [Tag Assistant](https://tagassistant.google.com/)

### Privacy & GDPR:
- [GDPR Compliance](https://support.google.com/analytics/answer/9019185)
- [Cookie Consent](https://developers.google.com/tag-platform/security/guides/consent)
- [Data Retention Settings](https://support.google.com/analytics/answer/7667196)

---

## ✅ Phase 4.5 Complete!

**Estimated Time:** 1.5 hours  
**Files Modified:** 6 (5 HTML + 1 JS)  
**Events Tracked:** 5 custom events  
**Standard Events:** 5+ automatic events  
**Ready for Production:** ✅ (Replace G-XXXXXXXXXX with your ID)

All Phase 4.5 Google Analytics 4 tracking implemented and ready for deployment!

---

## 📝 Post-Deployment Checklist

### After Pushing to GitHub:
- [ ] Replace G-XXXXXXXXXX with actual Measurement ID
- [ ] Deploy to GitHub Pages
- [ ] Open site in browser
- [ ] Check GA4 Realtime report
- [ ] Verify active user appears (you)
- [ ] Test all custom events
- [ ] Verify events appear in Realtime

### Week 1 Monitoring:
- [ ] Check daily active users
- [ ] Review top pages
- [ ] Analyze top products viewed
- [ ] Check search terms
- [ ] Monitor filter usage
- [ ] Review contact click rate

### Month 1 Analysis:
- [ ] Traffic sources analysis
- [ ] User behavior flow
- [ ] Top converting products
- [ ] Platform preference (Discord/WhatsApp)
- [ ] Search intent analysis
- [ ] Filter pattern insights

---

**Deploy, replace Measurement ID, and start tracking!** 📊

**Next Step:** Replace `G-XXXXXXXXXX` with your actual Google Analytics 4 Measurement ID in all 5 HTML files.
