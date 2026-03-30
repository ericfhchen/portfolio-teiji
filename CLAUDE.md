# Portfolio Teiji

## Task List (2026-03-30)

### Backlog (lower priority)

1. **Debug image gallery lag — responsive image loading**
2. ~~**Empty alt text on all images** — Files: `components/RichComponents.tsx`~~ DONE
3. ~~**GROQ queries don't fetch alt text** — `lib/queries.ts`~~ DONE (queries already use spread; added alt field to projectImage schema)
4. ~~**No runtime validation on `customWidth`** — Clamp in `getWidthStyle()`.~~ DONE (was already implemented)
5. ~~**No runtime validation on `colSpan`** — Clamp to 1–4 in `imageGrid` renderer.~~ DONE (was already implemented)
6. ~~**Silent image drop in dual/triple** — Add `console.warn`.~~ DONE (was already implemented)
7. ~~**Use `??` instead of `||` for class fallbacks**~~ DONE
8. ~~**Type safety** — Image item map callbacks use `any` types.~~ DONE
9. ~~**Responsive `sizes` attribute** — Hardcoded, doesn't account for layout width.~~ DONE (was already implemented)
10. ~~**Legacy spacer string parsing** — Remove `parseFloat` dead code if migrated.~~ DONE
11. **Index page preloading** — Look at preloading on index items. Loading only 1 at a time is less smooth, but need to ensure it doesn't cause grid lines duplicating or multiple videos having autoplay/pause issues.
12. ~~**Remove "Studio" from page tab titles** — e.g. "Teiji" instead of "Teiji Studio".~~ DONE
