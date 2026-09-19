# Mayu — The Quechua Sky

An educational website with a sourced sky catalogue, public community contributions, and a four-page teacher PDF.

## Develop

Use Node 22.13+ and npm. Run `npm run dev` for the local site, `npm run build` for Worker output, and `npm run db:generate` after changing `db/schema.ts`.

The `DB` D1 binding stores community contributions. Production applies the tracked Drizzle migrations. Local test records stay in the ignored `.wrangler` directory and are never included in deployment archives.

Community submissions are immediately visible to visitors allowed by the Site access settings, are clearly labelled as unverified, and require attribution and publication consent. No email addresses are collected. Per-day hashed connection identifiers enforce a ten-contribution daily limit.

Educational sources and photo attribution are available at `/sources`. The teacher guide is available at `/mayu-teachers-guide.pdf`.
