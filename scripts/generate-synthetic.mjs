/**
 * Build-time synthetic data generator. Run with `npm run generate:data`.
 * Faker is intentionally NOT imported by the browser bundle.
 */
import { faker } from '@faker-js/faker';
import { mkdir, writeFile } from 'node:fs/promises';

const OUT_DIR = new URL('../src/data/generated/', import.meta.url);

faker.seed(20261119);

const tenders = Array.from({ length: 60 }, (_, i) => ({
  id: `TND-${1000 + i}`,
  title: faker.commerce.productName() + ' supply',
  county: faker.location.city(),
  amount: Number(faker.commerce.price(500000, 90000000, 0)),
  awardedTo: faker.company.name(),
  awardDate: faker.date.between({ from: '2024-01-01', to: '2025-12-31' }).toISOString(),
  status: faker.helpers.arrayElement(['awarded', 'completed', 'pending', 'cancelled']),
}));

const vendors = Array.from({ length: 40 }, (_, i) => ({
  id: `VEN-${100 + i}`,
  name: faker.company.name(),
  director: faker.person.fullName(),
  phone: faker.phone.number(),
  registered: faker.date.past({ years: 5 }).toISOString(),
}));

await mkdir(OUT_DIR, { recursive: true });
await writeFile(new URL('tenders.json', OUT_DIR), JSON.stringify(tenders, null, 2));
await writeFile(new URL('vendors.json', OUT_DIR), JSON.stringify(vendors, null, 2));
console.log(`Wrote ${tenders.length} tenders and ${vendors.length} vendors to src/data/generated/`);
