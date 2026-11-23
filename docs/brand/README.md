# Kirzner identity

<img src="kirzner-mark-light.svg" width="96" height="96" alt="Kirzner">

The mark uses the shared 32 × 32 grid. A closed market frame surrounds the product, while its top-right corner breaks loose as the noticed opportunity.

| Element | x | y | Width | Height |
| --- | --- | --- | --- | --- |
| Product (shared centre) | 11 | 11 | 10 | 10 |
| Top bar | 2 | 2 | 19 | 4 |
| Left bar | 2 | 6 | 4 | 20 |
| Bottom bar | 2 | 26 | 24 | 4 |
| Right bar | 26 | 11 | 4 | 19 |
| Breakout square | 26 | 2 | 4 | 4 |

## Why this form

- **The centre** is the product at the heart of the market.
- **The frame** is the existing market: established boundaries, channels and assumptions around that product.
- **The breakout** is the opportunity the entrepreneur notices, expressing Kirzner's entrepreneurial alertness.
- The frame stays closed around three sides, unlike Duhem's closed frame, where the enclosure itself carries the mark. Semon's brackets represent capture and reference; Ostrom's edge bars represent shared governance; Tolmap's staggered segments represent mapping. Agent Workbench's lower squares represent delegated workers. Kirzner's detached corner instead makes the newly noticed opportunity the defining feature.

## Files

| File | Use |
| --- | --- |
| `kirzner-mark.svg` | Master mark, `currentColor`. Use inline. |
| `kirzner-mark-{light,dark}.svg` | Fixed `#111111` / `#FFFFFF` mark for `<img>`. |
| `kirzner-wordmark.svg` | Outlined Inter Regular wordmark, `currentColor`. |
| `kirzner-lockup.svg` | Horizontal lockup, `currentColor`. |
| `kirzner-lockup-{light,dark}.{svg,png}` | Fixed-colour lockups for pages and READMEs. |
| `favicon.svg` | Centred mark that switches to white under `prefers-color-scheme: dark`. |
| `favicon.ico` | 16, 32 and 48 px PNG entries. |
| `kirzner-{16,32,48,64,192,512}.png` | Centred black mark on transparency. |
| `kirzner-app-icon.png` | 1024 px white mark on a navy `#1E3A5F` rounded plate. |
| `kirzner-apple-touch-icon.png` | 180 px opaque square app icon for iOS. |
| `social-preview.png` | 1280 × 640 social preview with the lockup and tagline. |
| `Inter-OFL.txt` | Licence for the outlined wordmark font. |

## Rules

- Keep the mark monochrome. Do not add gradients, shadows or rotation.
- Preserve the five-unit gaps from the breakout square to the top and right bars. The generator checks these gaps in each raster output, with hand-snapped 16 px and 48 px grids.
- Favicons, icon PNGs, app icons and the social preview centre the visible ink. Leave clear space around standalone marks and use at least a 16 px canvas.
- The social preview keeps the lockup and tagline in the crop-safe centre.

## Regenerating

```sh
cd /path/to/kit
npm install
npm run generate
```

`generate.mjs` is the source of truth; edit the geometry there, not generated assets. Its pinned dependencies are build-time only.

## References

- [Duhem brand kit](https://github.com/onsager-ai/duhem/tree/main/assets/brand)
- [Ostrom mark](https://github.com/onsager-ai/ostrom/tree/main/docs/brand)
- [Tolmap identity](https://github.com/onsager-ai/tolmap/tree/main/docs/design/brand)
- [Semon identity](https://github.com/onsager-ai/semon/tree/main/docs/brand)
- [Agent Workbench identity](https://github.com/onsager-ai/agent-workbench/tree/main/docs/brand)
- Kirzner, I. M. *Competition and Entrepreneurship* (1973).
