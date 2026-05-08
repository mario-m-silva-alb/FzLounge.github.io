# Products Data

This folder contains the products data for the FzLounge website.

## Adding New Products

To add a new product, edit the `products.json` file and add a new entry to the `products` array. All products are sealed/closed products.

### Product Structure

Each product requires the following fields:

| Field       | Type    | Required | Description                                                                 |
|-------------|---------|----------|-----------------------------------------------------------------------------|
| `id`        | number  | Yes      | Unique identifier for the product                                          |
| `name`      | string  | Yes      | Product name (displayed as the card title)                                 |
| `game`      | string  | Yes      | Game identifier (must match one of the values in the `games` array)        |
| `category`  | string  | Yes      | Product category: `single`, `deck`, `booster`, or `accessory`              |
| `description` | string | Yes     | Short description of the product                                            |
| `image`     | string  | Yes      | URL to the product image (recommended: 600px width)                        |
| `imageAlt`  | string  | Yes      | Alt text for the image (for accessibility)                                 |
| `featured`  | boolean | No       | Set to `true` to show on the homepage featured section (default: `false`)  |

### Example Product Entry

```json
{
  "id": 16,
  "name": "Your Product Name",
  "game": "mtg",
  "category": "booster",
  "description": "A brief description of your product.",
  "image": "https://example.com/your-image.jpg",
  "imageAlt": "Description of the image",
  "featured": false
}
```

### Available Games

| Value         | Label                  |
|---------------|------------------------|
| `mtg`         | Magic: The Gathering   |
| `pokemon`     | Pokémon                |
| `yugioh`      | Yu-Gi-Oh!              |
| `lorcana`     | Lorcana                |
| `riftbound`   | Riftbound              |
| `grandarchive`| Grand Archive          |
| `digimon`     | Digimon TCG            |
| `gundam`      | Gundam TCG             |
| `onepiece`    | One Piece TCG          |
| `other`       | Other                  |

### Adding a New Game

To add a new game, add an entry to the `games` array at the top of `products.json`:

```json
{ "value": "newgame", "label": "New Game Name" }
```

### Available Categories

| Value       | Label        |
|-------------|--------------|
| `single`    | Single Card  |
| `deck`      | Deck         |
| `booster`   | Booster Pack |
| `accessory` | Accessory    |

## Pagination

Products are displayed with pagination (12 products per page by default). This setting can be changed in `js/main.js` by modifying the `PRODUCTS_PER_PAGE` constant.

## Tips

- Use high-quality images with a recommended width of 600px
- Keep descriptions concise but informative
- Use unique IDs for each product (increment from the last used ID)
- Images with a 4:3 or 16:9 aspect ratio work best
