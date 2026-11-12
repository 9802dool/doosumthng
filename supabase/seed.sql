-- Sample catalog. Prices are placeholders, not final selling prices.
-- Safe to run more than once.

insert into public.products (id, name, slug, category, description, price_ttd, sizes, colors, images, featured, active, created_at)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'DS Logo Tank Top',
    'ds-logo-tank-top',
    'Tanks',
    'A black tank with the red DS mark. Lightweight, made to be worn out.',
    120,
    array['XS','S','M','L','XL','2XL','3XL'],
    array['Black','White','Red'],
    array[]::text[],
    true,
    true,
    '2026-01-01T00:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'DS Glitter Logo Tee',
    'ds-glitter-logo-tee',
    'Tees',
    'A tee with a glitter DS logo. Street cut, easy to dress up or down.',
    160,
    array['XS','S','M','L','XL','2XL','3XL'],
    array['Black','White'],
    array[]::text[],
    true,
    true,
    '2026-01-02T00:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'DS Swirl Logo Tee',
    'ds-swirl-logo-tee',
    'Tees',
    'A swirl DS graphic on a heavy tee. The everyday DooSumThng shirt.',
    150,
    array['XS','S','M','L','XL','2XL','3XL'],
    array['Black','White','Red'],
    array[]::text[],
    true,
    true,
    '2026-01-03T00:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'DS Crewneck Sweater',
    'ds-crewneck-sweater',
    'Sweaters',
    'A crewneck sweater with a small DS mark. Warm, plain, and easy to layer.',
    280,
    array['XS','S','M','L','XL','2XL','3XL'],
    array['Black','Grey'],
    array[]::text[],
    true,
    true,
    '2026-01-04T00:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'DS Dad Cap',
    'ds-dad-cap',
    'Caps',
    'An unstructured dad cap with the DS mark on the front.',
    90,
    array['One size'],
    array['Black','Red'],
    array[]::text[],
    false,
    true,
    '2026-01-05T00:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111106',
    'DS Camo Beach Slippers',
    'ds-camo-beach-slippers',
    'Slippers',
    'Camo beach slippers with a small DS mark. For the beach and the block.',
    180,
    array['6','7','8','9','10','11','12'],
    array['Camo'],
    array[]::text[],
    false,
    true,
    '2026-01-06T00:00:00Z'
  ),
  (
    '11111111-1111-4111-8111-111111111107',
    'DS Designer Watch',
    'ds-designer-watch',
    'Accessories',
    'A designer-style watch with DS branding. A finishing piece, not a phone.',
    350,
    array['One size'],
    array['Black','Gold'],
    array[]::text[],
    false,
    true,
    '2026-01-07T00:00:00Z'
  )
on conflict (slug) do nothing;
