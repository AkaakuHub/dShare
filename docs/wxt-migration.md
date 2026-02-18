# WXT Migration Notes

## Current status (2026-02-18)
- Branch integration is complete: extension source from `origin/chrome` is merged into `main`.
- Legacy MV3 source is preserved under `legacy/chrome-mv3/`.
- New WXT entrypoint is added at `entrypoints/content.ts`.

## Next steps
1. Run `npm install`.
2. Run `npm run dev` to validate behavior on dアニメストア pages.
3. Remove `legacy/chrome-mv3/` after validating WXT build output and release flow.

