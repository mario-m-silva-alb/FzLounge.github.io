# Official Game Logos - Download Guide

**Purpose:** Replace emoji icons with official game logos  
**Directory:** `assets/game-logos/`  
**Format:** PNG with transparency (recommended) or JPG  
**Size:** Approximately 200x200px to 400x400px

---

## 🎮 Games Logo Sources

### 1. Magic: The Gathering
**Official Site:** https://magic.wizards.com/  
**Logo Location:** Look for press kit or brand assets  
**Alternative:** https://company.wizards.com/en/resources (Brand Assets)  
**Filename:** `mtg-logo.png`  
**Notes:** Use the official planeswalker symbol or "Magic: The Gathering" text logo

### 2. Pokémon TCG
**Official Site:** https://www.pokemon.com/us/pokemon-tcg/  
**Logo Location:** Look for media/press section  
**Alternative:** https://www.pokemon.com/us/about-pokemon/ (Brand Guidelines)  
**Filename:** `pokemon-logo.png`  
**Notes:** Use the official Pokémon TCG logo (not just Pokémon logo)

### 3. Yu-Gi-Oh!
**Official Site:** https://www.yugioh-card.com/  
**Logo Location:** Footer or press materials  
**Alternative:** https://www.konami.com/yugioh/  
**Filename:** `yugioh-logo.png`  
**Notes:** Use the official Yu-Gi-Oh! Trading Card Game logo

### 4. Disney Lorcana
**Official Site:** https://www.disneylorcana.com/  
**Logo Location:** Homepage or press kit  
**Alternative:** https://cdn.ravenburgermediasales.com/ (Ravensburger Press)  
**Filename:** `lorcana-logo.png`  
**Notes:** Disney Lorcana has a distinctive stylized logo

### 5. One Piece Card Game
**Official Site:** https://en.onepiece-cardgame.com/  
**Logo Location:** Homepage header  
**Filename:** `onepiece-logo.png`  
**Notes:** Bandai's One Piece Card Game official logo

### 6. Digimon Card Game
**Official Site:** https://world.digimoncard.com/  
**Logo Location:** Homepage or about section  
**Filename:** `digimon-logo.png`  
**Notes:** Bandai's Digimon Card Game logo

### 7. Gundam Card Game
**Official Site:** https://gundam-cardgame.com/ (may vary by region)  
**Alternative:** Search "Mobile Suit Gundam card game Bandai logo"  
**Filename:** `gundam-logo.png`  
**Notes:** May need to use Gundam franchise logo

### 8. Riftbound
**Official Site:** (Search for Riftbound TCG official site)  
**Filename:** `riftbound-logo.png`  
**Notes:** Custom TCG, may need to contact publisher for logo

### 9. Grand Archive
**Official Site:** https://www.gatcg.com/ (Grand Archive TCG)  
**Logo Location:** Homepage  
**Filename:** `grand-archive-logo.png`  
**Notes:** Weebs of the Shore official logo

---

## 📥 Download Instructions

### Step 1: Visit Official Websites
1. Go to each game's official website
2. Look for:
   - Press Kit / Media Kit
   - Brand Assets / Brand Guidelines
   - About Us / Resources section
   - Footer with downloadable logos

### Step 2: Download Logos
1. Download high-resolution PNG files (with transparency preferred)
2. Aim for square aspect ratio (200x200 to 400x400px)
3. If only large images available, we'll resize them

### Step 3: Save to Project
1. Save each logo to: `assets/game-logos/`
2. Use exact filenames listed above
3. Ensure PNG format with transparency

---

## 🖼️ Logo Specifications

### Required Format:
- **Format:** PNG (transparency) or JPG (white/transparent background)
- **Dimensions:** 200x200px to 400x400px (square preferred)
- **File size:** Under 50KB each (we'll optimize if larger)
- **Quality:** High resolution, not pixelated

### Naming Convention:
```
mtg-logo.png
pokemon-logo.png
yugioh-logo.png
lorcana-logo.png
onepiece-logo.png
digimon-logo.png
gundam-logo.png
riftbound-logo.png
grand-archive-logo.png
```

---

## ⚠️ Legal Considerations

### Trademark Usage:
- All logos are trademarks of their respective owners
- Using logos to identify products/games is generally acceptable (nominative fair use)
- We are not claiming ownership or affiliation
- Logos are used for informational purposes only

### Attribution:
We'll add proper attribution in the footer or about page:
```html
Game logos are trademarks of their respective owners:
- Magic: The Gathering © Wizards of the Coast
- Pokémon © The Pokémon Company
- Yu-Gi-Oh! © Konami
- Disney Lorcana © Disney/Ravensburger
- One Piece © Bandai
- Digimon © Bandai
- Gundam © Bandai/Sunrise
```

---

## 🔧 After Downloading Logos

### Option 1: You Download Manually
1. Download logos from official sites
2. Save to `assets/game-logos/` folder
3. Let me know when ready, I'll update the HTML/CSS

### Option 2: Placeholder Approach
1. I can create CSS that's ready for logos
2. You add logos later at your convenience
3. Fallback to game initials/text until logos added

### Option 3: Use SVG Icons (Alternative)
1. Use open-source game icon sets (if logos unavailable)
2. Create simple text-based badges
3. Use brand colors as backgrounds

---

## 📝 Implementation Code (Ready When You Are)

Once you have the logos in `assets/game-logos/`, I'll update the HTML to:

```html
<div class="game-badge" data-game="mtg">
  <img src="assets/game-logos/mtg-logo.png" alt="Magic: The Gathering" class="game-logo">
  <span class="game-name">Magic: The Gathering</span>
</div>
```

And CSS will be updated to:
```css
.game-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: grayscale(0.3);
  transition: all 0.3s;
}

.game-badge:hover .game-logo {
  filter: grayscale(0);
  transform: scale(1.1);
}
```

---

## 🚀 Quick Start

**Easiest approach:**
1. Visit each official website
2. Right-click logo → "Save image as..."
3. Save to `assets/game-logos/` with correct filename
4. Let me know when done, I'll update the code

**Estimated time:** 15-20 minutes to collect all logos

---

## 📞 Need Help?

If you have trouble finding logos:
1. **Search:** "[Game name] TCG press kit"
2. **Search:** "[Game name] brand guidelines"
3. **Contact:** Email the publisher for media assets
4. **Alternative:** Use high-quality screenshots from official sites

---

**Let me know when you have the logos ready, and I'll integrate them!** 🎨

Or, if you prefer, I can:
- Use text-based badges with brand colors
- Create simple icon shapes
- Use fallback designs until logos are available
