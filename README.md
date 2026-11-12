# DooSumThng

DooSumThng is a Trinidad and Tobago clothing brand. Tagline: **Doosumthng With A Difference**. Instagram [@doosumthng](https://www.instagram.com/doosumthng/).

`public/logo.png` is the official mark on its black square (used for the browser icon and link previews). `public/logo-mark.png` is the same mark with that square removed, so the header, footer, and product cards stay clear on light and dark.

The shop lists tees, tanks, sweaters, caps, slippers, and accessories in TT$. Orders go out on WhatsApp. Custom jerseys, t-shirts, and mugs use the form on `/custom`. The owner manages products and those orders at `/admin`.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase, the site uses the sample catalog in `lib/catalog.ts`. Copy `.env.example` to `.env.local` when you connect a project. The tables are in `supabase/schema.sql`, and `supabase/seed.sql` loads the same sample products.

## Product photos

Cards draw a garment silhouette until a real photo exists. Two ways to add one:

1. **Drop a file in the repo.** Save it as `public/products/<slug>.jpg` (`.jpeg`, `.png`, `.webp`, and `.avif` work too). The slug is the product link, for example `public/products/ds-logo-tank-top.jpg`. Push the file (or redeploy) and the shop uses it. A file named like this is shown before any URL saved in admin.

   Current slugs:

   - `ds-logo-tank-top`
   - `ds-glitter-logo-tee`
   - `ds-swirl-logo-tee`
   - `ds-crewneck-sweater`
   - `ds-dad-cap`
   - `ds-camo-beach-slippers`
   - `ds-designer-watch`

2. **Use the owner desk.** Sign in at `/admin`, open a product, and either paste a direct image URL (one per line) or upload a photo. Uploads need the Supabase `product-images` bucket from `supabase/schema.sql`.

Sample prices in the catalog are placeholders, not final selling prices.

## Home page photo

The home hero is type until you add a lifestyle photo. Save it as one of:

- `public/hero.jpg`
- `public/hero.jpeg`
- `public/hero.png`
- `public/hero.webp`
- `public/hero.avif`

Redeploy and it fills the hero.

## About copy

The about story is a placeholder. Edit `app/about/page.tsx` when the real story is ready.

## Contact

- doosumthng@gmail.com
- (868) 356-3722
- (868) 345-8301
- Instagram @doosumthng

Payment on the site is cash on delivery or bank transfer. Card payments are not set up yet.
