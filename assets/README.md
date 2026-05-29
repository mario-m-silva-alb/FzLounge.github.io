# Assets Folder Structure

This folder contains all media assets for the FzLounge website.

## Folder Organization

### `products/`
Product images for the catalog.

- **`originals/`** - Original high-resolution images from distributors (backup, not used directly on site)
- **`optimized/`** - Web-optimized images in WebP + JPEG formats (used on the website)

### `events/`
Event promotion images and banners.

## Image Naming Convention

**Products:**
- Format: `product-[ID]-[slug].[ext]`
- Example: `product-001-dominaria-booster.webp`
- ID should be zero-padded 3 digits (001, 002, etc.)

**Events:**
- Format: `event-[YYYY-MM-DD]-[slug].[ext]`
- Example: `event-2025-02-07-fnm.webp`

## File Formats

- **WebP** - Primary format for modern browsers (smaller file size)
- **JPEG** - Fallback for older browsers

## Processing Workflow

1. Place distributor images in `products/originals/`
2. Run `scripts/optimize-images.ps1`
3. Optimized images appear in `products/optimized/`
4. Update `data/products.json` with image paths

See `IMAGE_WORKFLOW.md` in the root folder for detailed instructions.
