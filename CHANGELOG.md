# Changelog

## Unreleased

### Added

- Added Cloudflare/OpenNext build and deployment support.
- Added pnpm as the project package manager with `pnpm-lock.yaml`.
- Added a generated privacy page at `/privacy` and `/zh/privacy`.
- Added shared site URL, route, metadata, tool content, and SEO configuration helpers.
- Added BBox multilingual support for English, Chinese, German, Spanish, and French.
- Added pure utility modules and Node tests for Base64, GeoJSON, JSON extraction, BBox, coordinate conversion, ObjectID, SEO, sitemap, and localized routing behavior.
- Added `AGENTS.md` maintenance guidance for routing, SEO, metadata, sitemap, robots, and tool content.

### Changed

- Kept English canonical routes unprefixed while preserving `/en/*` localized access.
- Standardized ordinary localized tool routes to accept only `en` and `zh`; unsupported language prefixes now return 404.
- Kept BBox as the special multilingual tool with `/bbox`, `/zh/bbox`, `/de/bbox`, `/es/bbox`, and `/fr/bbox`.
- Updated sitemap, robots, canonical URLs, hreflang alternates, Open Graph, Twitter metadata, and structured data to match the current routing rules.
- Refreshed the tool UI with shared `@mofei-dev/ui` components and reusable controls.
- Updated README documentation in English and Chinese for the current stack, tools, routes, deployment, and development workflow.
- Updated Wrangler build configuration to use `pnpm run cf:build`.

### Removed

- Removed npm lockfile usage in favor of pnpm.
- Removed the old JavaScript Next config in favor of `next.config.ts`.
