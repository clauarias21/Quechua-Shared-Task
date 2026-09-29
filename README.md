# Mayu — The Quechua Sky

**Visit the public website:** https://mayu-quechua-sky.c-ariascoquil.chatgpt.site/

An educational website with 11 sourced sky entries, community stories and recommendations, and a four-page teacher guide. Spanish and English explanations accompany Quechua names and regional spelling variants. The Cusco-Collao Quechua translation is explicitly marked as a working draft awaiting fluent-speaker review.

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

Apply each migration in `drizzle/` in order, once per local database; the audio addition is `0001_grey_pretty_boy.sql`. Follow the local URL printed by the development server. After changing `db/schema.ts`, generate and review a new migration with `npm run db:generate`. Do not rewrite migrations already applied to a live database.

## Hosting and data

The live website is hosted on Sites. This GitHub repository stores the source; GitHub pushes do not automatically update the live website. Changes must also be built and published through the existing Sites project.

The `.openai/hosting.json` file identifies that existing Site and declares the logical `DB` and `AUDIO` bindings. It contains no access credential. The hosting service manages the production database. Submitted stories and local test records are **not** included in this repository.

GitHub Pages alone cannot run the contribution API. Hosting elsewhere requires a compatible Cloudflare Worker deployment, a D1 database bound as `DB`, an R2 bucket bound as `AUDIO`, and application of the included migrations.

Contributions become visible immediately as unverified community accounts. The form requires attribution and publication consent, collects no email addresses, and enforces a ten-contribution daily limit per connection using a daily hash. There is no moderation dashboard in this version.

## Sources and attribution

The website's `/sources` page links the educational references. Names and stories differ across Quechua communities; this is a starting collection, not a definitive dictionary.

Photograph: “A cosmic rainbow in Ultra HD,” ESO/B. Tafreshi (https://twanight.org), CC BY 4.0. Original: https://www.eso.org/public/images/potw1533a/. Cropped for the site. Preserve attribution when reusing it.

Vendored components retain their accompanying third-party notices. No blanket licence is granted over community contributions or cited source material.

## Languages and star charts

Spanish is the default. The interface supports Spanish, English, and a clearly marked Cusco-Collao Quechua working translation awaiting fluent-speaker review. Language choice is retained locally and included in navigation links. Community submissions remain in their original language.

The interactive charts show selected Pleiades stars and Alpha/Beta Centauri with the Southern Cross as a reference. Coordinates in `lib/star-data.json` come from the linked SIMBAD records (ICRS, epoch J2000). A gnomonic projection preserves their relative arrangement; these charts are not local, date-specific visibility predictions. Optional cross lines are modern reference guides, not reconstructed Inka outlines.

Teacher PDFs: `public/mayu-teachers-guide-es.pdf`, `-en.pdf`, and `-qu.pdf` (Quechua draft). High-resolution charts for each language are in `public/charts/`. The original PDF URL remains an English alias.

## Community audio

Contributions can include one MP3, M4A, WAV, OGG, or WebM file, up to 10 MiB, with a description/transcript of 10–4,000 characters. Text-only contributions retain their 30-character minimum. The contributor must confirm permission from the people recorded. Files can be selected from a phone or computer and previewed before publication; the site does not record the microphone directly.

The `AUDIO` R2 binding stores audio bytes; D1 stores nullable audio metadata. `POST /api/contributions` accepts multipart forms and retains compatibility with existing JSON text submissions. Body size and container signatures are checked server-side. This checks the container, not every codec; browser playback support varies. Audio is served through `/api/contributions/:id/audio`, with byte ranges for seeking. Failed writes clean up uploaded objects, and retries use the contribution ID to prevent duplicate posts. Existing contributions remain unchanged. New Quechua wording remains provisional; the recording-permission text also appears in Spanish/English to avoid presenting an unreviewed consent translation as validated.
