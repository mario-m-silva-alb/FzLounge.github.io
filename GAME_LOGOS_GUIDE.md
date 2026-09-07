# Game Logos - Download Guide

**Purpose:** Replace emoji placeholders with official game logos  
**Directory:** `assets/game-logos/`  
**Format:** PNG with transparency (recommended) or JPG  
**Size:** 200x200px to 400x400px

---

## Logo Sources

### 1. Magic: The Gathering
**Official Site:** https://magic.wizards.com/  
**Brand Assets:** https://company.wizards.com/en/resources  
**Filename:** `mtg-logo.png`  
**Notes:** Use the planeswalker symbol or "Magic: The Gathering" text logo

### 2. Pokemon TCG
**Official Site:** https://www.pokemon.com/us/pokemon-tcg/  
**Brand Guidelines:** https://www.pokemon.com/us/about-pokemon/  
**Filename:** `pokemon-logo.png`  
**Notes:** Use the Pokemon TCG logo specifically, not the general Pokemon logo

### 3. Yu-Gi-Oh!
**Official Site:** https://www.yugioh-card.com/  
**Alternative:** https://www.konami.com/yugioh/  
**Filename:** `yugioh-logo.png`  
**Notes:** Use the official Yu-Gi-Oh! Trading Card Game logo

### 4. Disney Lorcana
**Official Site:** https://www.disneylorcana.com/  
**Filename:** `lorcana-logo.png`  
**Notes:** Disney Lorcana has a distinctive stylized wordmark

### 5. One Piece Card Game
**Official Site:** https://en.onepiece-cardgame.com/  
**Filename:** `onepiece-logo.png`  
**Notes:** Bandai's One Piece Card Game official logo

### 6. Digimon Card Game
**Official Site:** https://world.digimoncard.com/  
**Filename:** `digimon-logo.png`  
**Notes:** Bandai's Digimon Card Game logo

### 7. Gundam Card Game
**Official Site:** https://gundam-cardgame.com/  
**Filename:** `gundam-logo.png`  
**Notes:** May need to use the Gundam franchise logo

### 8. Riftbound
**Official Site:** (Search for Riftbound TCG official site)  
**Filename:** `riftbound-logo.png`  
**Notes:** Contact publisher for logo if not publicly available

### 9. Grand Archive
**Official Site:** https://www.gatcg.com/  
**Filename:** `grand-archive-logo.png`  
**Notes:** Weebs of the Shore official logo

---

## Download Instructions

### Step 1: Visit Official Websites
1. Go to each game's official website
2. Look for: Press Kit, Brand Assets, Media section, or footer downloads

### Step 2: Download Logos
1. Download high-resolution PNG files (transparency preferred)
2. Aim for a square aspect ratio (200x200 to 400x400px)
3. Larger images will be resized automatically

### Step 3: Save to Project
1. Save each logo to `assets/game-logos/`
2. Use the exact filenames listed above
3. PNG format with transparency preferred

---

## Logo Specifications

| Property | Requirement |
|----------|-------------|
| Format | PNG (transparent) or JPG |
| Dimensions | 200x200px to 400x400px (square) |
| File size | Under 50KB each |
| Quality | High resolution, not pixelated |

### Filenames
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

## Legal Considerations

All logos are trademarks of their respective owners. Usage here falls under nominative fair use for identifying products and games. FzLounge does not claim ownership or affiliation with these brands.

### Attribution
```
- Magic: The Gathering - Wizards of the Coast
- Pokemon - The Pokemon Company
- Yu-Gi-Oh! - Konami
- Disney Lorcana - Disney/Ravensburger
- One Piece - Bandai
- Digimon - Bandai
- Gundam - Bandai/Sunrise
```

---

## Integration

Once logos are in `assets/game-logos/`, the HTML uses:

```html
<div class="game-badge" data-game="mtg">
  <img src="assets/game-logos/mtg-logo.png" alt="Magic: The Gathering" class="game-logo">
  <span class="game-name">Magic: The Gathering</span>
</div>
```

The CSS handles hover effects and sizing:
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

## Troubleshooting

If you cannot find a logo through official channels:
1. Search "[Game name] TCG press kit"
2. Search "[Game name] brand guidelines"
3. Email the publisher requesting media assets
4. Use high-quality screenshots from official sites as a last resort
