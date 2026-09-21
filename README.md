# Mayu — The Quechua Sky

**Visit the public website:** https://mayu-quechua-sky.c-ariascoquil.chatgpt.site/

An educational website with 11 sourced sky entries, community stories and recommendations, and a four-page teacher guide. English explanations accompany Quechua names and regional spelling variants.

## What is included

- Interactive catalogue of bright objects and dark-cloud figures, with source links and observing advice.
- Shared contributions with display name, region, language variety, attribution, and permission to publish.
- Teacher activities, a quiz, and a printable guide at `public/mayu-teachers-guide.pdf`.
- React/Vinext application, Cloudflare Worker output configuration, and D1 database migrations.

## Run locally

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_chubby_celestials.sql
npm run dev
```

Apply the initial migration once per fresh local database. Follow the local URL printed by the development server. After changing `db/schema.ts`, generate and review a new migration with `npm run db:generate`. Do not rewrite migrations already applied to a live database.

## Hosting and data

The live website is hosted on Sites. This GitHub repository stores the source; GitHub pushes do not automatically update the live website. Changes must also be built and published through the existing Sites project.

The `.openai/hosting.json` file identifies that existing Site and declares the logical `DB` binding. It contains no access credential. The hosting service manages the production database. Submitted stories and local test records are **not** included in this repository.

GitHub Pages alone cannot run the contribution API. Hosting elsewhere requires a compatible Cloudflare Worker deployment, a D1 database bound as `DB`, and application of the included migrations.

Contributions become visible immediately as unverified community accounts. The form requires attribution and publication consent, collects no email addresses, and enforces a ten-contribution daily limit per connection using a daily hash. There is no moderation dashboard in this version.

## Sources and attribution

The website's `/sources` page links the educational references. Names and stories differ across Quechua communities; this is a starting collection, not a definitive dictionary.

Photograph: “A cosmic rainbow in Ultra HD,” ESO/B. Tafreshi (https://twanight.org), CC BY 4.0. Original: https://www.eso.org/public/images/potw1533a/. Cropped for the site. Preserve attribution when reusing it.

Vendored components retain their accompanying third-party notices. No blanket licence is granted over community contributions or cited source material.
