# Assets Folder

All media assets for the FzLounge website.

## Structure

### `products/`
Product images for the catalogue.

- **`originals/`** - Original images from distributors (backup, not served to visitors)
- **`optimized/`** - Web-optimized WebP + JPEG images (used on the site)

### `events/`
Event promotion images and banners.

### `game-logos/`
Official game logos for the Games We Play section.

## Naming Conventions

**Products:**
- Format: `product-[ID]-[slug].[ext]`
- Example: `product-001-dominaria-booster.webp`
- ID: zero-padded 3 digits (001, 002, etc.)

**Events:**
- Format: `event-[YYYY-MM-DD]-[slug].[ext]`
- Example: `event-2025-02-07-fnm.webp`

## File Formats

- **WebP** - Primary format for modern browsers (smaller file size)
- **JPEG** - Fallback for older browsers

## Workflow

1. Place distributor images in `products/originals/`
2. Run `scripts/optimize-images.ps1`
3. Optimized images appear in `products/optimized/`
4. Update `data/products.json` with image paths

See `IMAGE_WORKFLOW.md` in the root folder for full instructions.
