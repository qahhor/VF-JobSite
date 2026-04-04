# Admin + I18n Improvement Plan

## Audit Snapshot
- `verifix-jobs-web` already has a unified i18n layer, but explicit coverage is uneven.
- Current catalogs have full `uz_lat / ru / en`, while `uz_cyr` is mostly auto-transliterated and `kk / tg / ky` mostly fall back to Russian.
- Admin workflows are operationally usable, but the current shell is visually heavy for long moderation sessions and mixes “accent” styling with operational data.

## Coverage Baseline
- `web-translations.shared.ts`: 230 keys, explicit `kk/tg/ky` coverage is near-zero.
- `web-translations.public.ts`: 115 keys, `kk/tg/ky` currently depend on fallback.
- `web-translations.employer.ts`: 349 keys, `kk/tg/ky` currently depend on fallback.
- `web-translations.admin.ts`: 177 keys, `kk/tg/ky` currently depend on fallback.

## Goals
1. Make all visible top-level surfaces safe and understandable in every supported language.
2. Reduce admin visual noise and make operator workflows easier to scan.
3. Keep future i18n regressions detectable with a simple local audit script.

## Execution Order
### Phase 1: Foundation
- Add a repeatable i18n coverage audit script.
- Add explicit multi-language overrides for the most visible navigation, shared, and admin keys.
- Keep `uz_cyr` transliteration as a fallback, but stop relying only on Russian for visible admin actions.

### Phase 2: Minimalist Admin Shell
- Convert the admin shell from high-contrast neon styling to a calmer minimalist layout.
- Standardize cards, inputs, buttons, section spacing, and responsive behavior.
- Prioritize the screens used most often by ops teams:
  - Login
  - Dashboard
  - Moderation
  - Companies
  - Fraud
  - Gov sync
  - Access / Security

### Phase 3: Full Module Sweep
- Continue explicit translation pass across public and employer modules.
- Replace residual fallback-only strings on the highest-traffic pages first.
- Audit hardcoded UI strings in remaining feature areas.

## Started In This Pass
- Foundation audit script
- Visible language overrides for shared + admin UI
- Minimalist redesign of the embedded admin shell and core admin screens
