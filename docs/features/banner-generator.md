# Personalized Student Wing banner generator

## Access

Open `/banner-generator` from the public site’s **Get Your Banner** navigation item. No account is required.

## Workflow

1. Enter a name (up to 80 characters) and choose a JPEG, PNG, or WebP portrait up to 10 MB.
2. Inspect the live banner; drag the portrait in the photo window or adjust zoom and horizontal/vertical position.
3. Select **Generate My Banner**, then **Download Banner (PNG)**. **Create another banner** clears the local state.

The image is read from the device as an object URL and rendered in the browser. It is not posted to the application or stored in Supabase. Object URLs are released when replaced or when the component is removed. Files larger than 40 megapixels are rejected after image decode to avoid drawing oversized images into the export canvas.

## Composition and assets

`src/lib/banner/render-banner.ts` draws a new composition on a 764 × 1080 logical canvas at 2× output (1528 × 2160 PNG). The live preview and export call the same renderer. The existing local movement logo at `public/brand/arewa-for-asiwaju-a4a.jpg` is the only image asset used by the template. The supplied flattened banner is used as a visual reference only; it is not used as a background or in the generated file. The green background, texture, frame, tag, rope/eyelets, ribbon, type, nameplate and footer marks are redrawn in Canvas.

Text uses browser-available Georgia, Impact/Arial Narrow and sans-serif fallbacks. The generated file matches the preview in the same browser, though exact font glyph shapes can vary between platforms if a preferred typeface is unavailable. A licensed, bundled condensed display font can be added if exact cross-device typography is required.

## Validation

- `tests/e2e/banner-generator.spec.ts` covers mobile navigation, local image upload, export/download filename and PNG dimensions, reset, and invalid image type.
- Run `npm run test:e2e -- --workers=1` after the production build. The Playwright server uses the local built application and does not require a Supabase account.
- Run `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build` for code-quality validation.
