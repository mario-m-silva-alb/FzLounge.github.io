# Image Workflow Guide

How to process and add product images to the FzLounge website.

---

## Overview

1. **Collect** - Gather distributor images
2. **Process** - Optimize for web using the automated script
3. **Deploy** - Update JSON and push to GitHub

---

## Image Requirements

### Source Images
- **Format:** JPG, PNG, GIF, or BMP
- **Quality:** Mixed-quality screenshots from distributors are acceptable
- **Resolution:** Any (will be resized automatically)

### Output Specifications
- **Format:** WebP (primary) + JPEG (fallback)
- **Card Size:** 600x600px (product grid)
- **Detail Size:** 1200x1200px (product detail view)
- **Target File Size:** Under 100KB per image
- **Quality:** 85%

---

## Prerequisites

### Install ImageMagick

**Windows:**
1. Download from: https://imagemagick.org/script/download.php#windows
2. Run installer with default options
3. Check "Add application directory to your system path" during installation
4. Restart your terminal after installation

**Verify:**
```powershell
magick --version
```

---

## Folder Structure

```
FzLounge.github.io/
├── assets/
│   └── products/
│       ├── originals/          # Distributor images go here
│       └── optimized/          # Processed images (generated)
│           ├── *.webp          # Modern format
│           ├── *.jpg           # Fallback format
│           └── detail/         # High-res versions (optional)
├── scripts/
│   └── optimize-images.ps1     # Processing script
└── data/
    └── products.json           # Product database
```

---

## Step-by-Step Workflow

### Step 1: Collect Images

1. Download product images from the distributor
2. Rename using this convention:
   ```
   product-[ID]-[slug].jpg

   Examples:
   product-016-pokemon-booster.jpg
   product-017-mtg-single-card.jpg
   product-018-yugioh-deck.jpg
   ```
   - **ID:** Next available number (001, 002, 003...)
   - **Slug:** Short descriptive name (lowercase, hyphens)
3. Place all images in `assets/products/originals/`

---

### Step 2: Process Images

Open PowerShell in the repository root and run:

```powershell
.\scripts\optimize-images.ps1
```

The script will:
- Resize all images to 600x600px
- Create WebP versions (smaller files)
- Create JPEG fallbacks (browser compatibility)
- Optimize to under 100KB each
- Maintain aspect ratio with padding

---

### Step 3: Update products.json

Add a new entry to `data/products.json`:

```json
{
  "id": 16,
  "name": "Pokemon Scarlet & Violet Booster",
  "game": "pokemon",
  "condition": "sealed",
  "category": "booster",
  "description": "Sealed booster pack from Scarlet & Violet set.",
  "image": "assets/products/optimized/product-016-pokemon-booster.webp",
  "imageFallback": "assets/products/optimized/product-016-pokemon-booster.jpg",
  "imageAlt": "Pokemon Scarlet & Violet booster pack",
  "featured": false,
  "dateAdded": "2025-01-29",
  "status": "presale",
  "releaseDate": "2025-02-15"
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique number (increment from last) |
| `name` | Yes | Product name |
| `game` | Yes | Game code (see below) |
| `condition` | Yes | `"sealed"` or `"used"` |
| `category` | Yes | `"booster"`, `"box"`, `"deck"`, etc. |
| `description` | Yes | Short description (1-2 sentences) |
| `image` | Yes | Path to WebP image |
| `imageFallback` | Yes | Path to JPEG image |
| `imageAlt` | Yes | Accessibility text |
| `featured` | Yes | Show on homepage (`true`/`false`) |
| `dateAdded` | Yes | Date added (YYYY-MM-DD) |
| `status` | Yes | Availability status |
| `releaseDate` | If presale | Release date (YYYY-MM-DD) |

### Game Codes
`mtg` | `pokemon` | `yugioh` | `lorcana` | `riftbound` | `grandarchive` | `digimon` | `gundam` | `onepiece` | `other`

### Status Options
- `presale` - Not yet released (red badge)
- `available` - In stock (green badge)
- `limited` - Limited availability (orange badge)
- `sold` - Sold out (grey badge)

---

### Step 4: Commit and Push

```powershell
git add assets/products/ data/products.json
git commit -m "Add new products: [list product names]"
git push origin phase-1
```

---

### Step 5: Verify

1. Wait 1-2 minutes for GitHub Pages to rebuild
2. Visit the Products page
3. Check that new products appear, images load, status badges display, and search finds them

---

## Advanced Options

```powershell
# Card size only (600x600)
.\scripts\optimize-images.ps1 -Size card

# Detail size only (1200x1200)
.\scripts\optimize-images.ps1 -Size detail

# Adjust quality (1-100, default 85)
.\scripts\optimize-images.ps1 -Quality 90

# Skip WebP generation (JPEG only)
.\scripts\optimize-images.ps1 -SkipWebP
```

---

## Troubleshooting

### ImageMagick Not Found
Install from the link above, ensure PATH is set, restart PowerShell.

### Script Execution Policy Error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Images Not Appearing on Website
1. Check image paths in `products.json`
2. Verify images exist in `assets/products/optimized/`
3. Confirm changes are committed and pushed
4. Wait for GitHub Pages rebuild (2 minutes)
5. Hard refresh browser (Ctrl+Shift+R)

### Image Too Large (>100KB)
Lower quality: `.\scripts\optimize-images.ps1 -Quality 80`  
Or compress manually at https://squoosh.app/

---

## Image Size Reference

| Type | Size | Quality | Typical File Size |
|------|------|---------|-------------------|
| Card (WebP) | 600x600 | 85% | 50-70 KB |
| Card (JPEG) | 600x600 | 85% | 80-100 KB |
| Detail (WebP) | 1200x1200 | 85% | 100-150 KB |
| Detail (JPEG) | 1200x1200 | 85% | 180-250 KB |

---

## Naming Conventions

**Good:**
- `product-016-pokemon-sv-booster.jpg`
- `product-017-mtg-dominaria-box.jpg`
- `product-018-yugioh-starter-deck.jpg`

**Avoid:**
- `IMG_20250129_153045.jpg`
- `photo-1.jpg`
- `NEW PRODUCT!!!.jpg`

---

## Weekly Routine (15 minutes)

1. Collect new distributor images (5 min)
2. Run processing script (2 min)
3. Update products.json (5 min)
4. Commit and push (2 min)
5. Verify on live site (1 min)
