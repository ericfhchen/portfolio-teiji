# Portfolio Teiji

## Task List (2026-03-27)

### Features & Fixes (priority order)

1. ~~**Iframe embed block for project pages**~~ ✅ — Sanity schema + renderer added. Supports src/title/allow/allowfullscreen, aspect ratio, width, background, caption.

2. ~~**Drag-to-reorder projects in Sanity**~~ ✅ — Replaced with separate `featuredHome`/`featuredWork` toggles with numeric ordering fields.

3. ~~**Work grid — gridline misalignment on uneven project count**~~ ✅ — Fixed partial row alignment.

4. ~~**Separate "featured" toggles for home vs work page**~~ ✅ — `featuredHome` and `featuredWork` booleans with `homeOrder`/`workOrder` number fields.

5. ~~**Nav menu text `mix-blend-mode: difference`**~~ ✅ — Applied to top and bottom nav.

6. ~~**Menu — don't hide on scroll**~~ ✅ — Menu stays visible at all times on mobile.

7. ~~**Project page — rich text description field**~~ ✅ — Converted to portable text with link support. Migration script in `scripts/`.

8. ~~**About page — right side image gallery**~~ ✅ — Image gallery field with mixed aspect ratios, top-left aligned. Migration script in `scripts/`.

9. ~~**About page CV links open in new tab**~~ ✅ — All external links use `target="_blank" rel="noopener noreferrer"`.

10. ~~**Final Research credit**~~ ✅ — Corner-lines hover animation on both About pages. Mobile tap-to-navigate with 1.5s animation.

11. ~~**Mobile index filters — fix stacking, horizontal scroll**~~ ✅ — Filters use horizontal scroll with overflow on mobile.

12. **Debug image gallery lag — responsive image loading** — Gallery component feels laggy between images. Investigate responsive image loading strategy (sizes, srcset, priority, placeholder blur).

### Image Layout System Issues (from 2026-03-20 review)

13. **Empty alt text on all images** — Every image component hardcodes `alt=""`. Use available alt text from the image schema or index item title as fallback.
    - Files: `components/RichComponents.tsx` (all image renderers)

14. **GROQ queries don't fetch alt text** — `uploadedImage` projections in `lib/queries.ts` for `imageDual`, `imageTriple`, and `imageGrid` don't include `alt`. The `...` spread may cover it but should be explicit.
    - File: `lib/queries.ts`

15. **No runtime validation on `customWidth`** — `getWidthStyle()` in `RichComponents.tsx` interpolates `customWidth` directly into inline styles. Sanity schema validates 20–100 but this isn't enforced at render time. Clamp the value: `Math.max(20, Math.min(100, customWidth))`.

16. **No runtime validation on `colSpan`** — `imageGrid` renderer uses `colSpan` directly in `gridColumn: span X` without clamping to 1–4. Validate before use.

17. **Silent image drop in dual/triple** — `.map().filter(Boolean)` can silently render fewer images than expected if an image source is invalid. Add a `console.warn` when rendered count differs from expected.

18. **Use `??` instead of `||` for class fallbacks** — Alignment and caption position class lookups use `||` which treats empty string as falsy. Use `??` for explicit null/undefined handling.

19. **Type safety** — Image item map callbacks use `any` types. Define proper interfaces for image items.

20. **Responsive `sizes` attribute** — `sizes` strings are hardcoded and don't account for the actual layout width. If layout is 40%, sizes should be proportionally smaller.

21. **Legacy spacer string parsing** — The spacer renderer handles legacy string heights (`parseFloat`). If all existing spacer data has been migrated to numbers, this dead code can be removed.
