# Verifix Jobs - Canonical TZ Gap Plan

Source of truth:
- Spec: `Verifix_Jobs_FINAL_TZ_v6.0.md`
- Codebase: current `verifix-jobs` repository

## Gap Summary

### Wave 1 - Candidate Marketplace
- `FR-A01 Public Vacancy Catalog`: partial
  - Exists: public vacancies API, base web listing, city/category filters, pagination.
  - Missing or partial: map mode, promoted sorting, deeper SEO/SSR metadata.
- `FR-A02 Vacancy Detail 2.0`: partial
  - Exists: salary-first card, sticky apply CTA, benefits, employer block, Telegram CTA.
  - Missing or partial: distance and employer response badge.
- `FR-A03 Category / City Hubs`: partial
  - Exists: category/city aggregate endpoints.
  - Missing or partial: richer SEO/SSR metadata and deeper landing content.
- `FR-A04 Company Directory`: partial
  - Exists: company list/detail endpoints and web pages, reviews.
  - Missing or partial: full branding tab structure, top companies sidebar.
- `FR-A05 Statistics Sidebar`: delivered in public web, still improvable.
- `FR-A06 Phone-first Auth + Quick Apply`: partial
  - Exists: candidate OTP API and quick apply endpoint.
  - Missing or partial: full candidate-auth web flow and deeper Telegram continuity.
- `FR-A07 Favorites / Alerts / Saved Searches`: partial
  - Exists: favorites, digest baseline, saved-search table and CRUD baseline.
  - Missing or partial: editing/management polish and channel UX refinements.

### Wave 2 - Employer Operations
- Status: mostly partial.
- Backend foundations exist for dashboard, vacancy board, health, response inbox, automation, civility, templates, bump.
- Main remaining work: remaining workflow stitching beyond dashboard, stronger diagnostics, complete workflow coverage.

### Wave 3 - Automation and AI-Assisted Hiring
- Status: partial.
- Exists: task inbox backend, activity feed backend, automation rules, AI intake/screening/outreach/sourcing service layer.
- Missing or partial: complete API/UI exposure, human-in-the-loop workflow stitching, Telegram-first operational flows.

### Wave 4 - Employer Intelligence
- Status: partial to missing.
- Exists: hiring project, talent hub, integration hub, value report baselines.
- Missing or partial: organization memory, semantic search integration, market intelligence depth.

## Implementation Order

1. `FR-A01` public catalog foundations
   - Search filters and sorting
   - Split-view desktop UX
   - SEO URL normalization
   - Map mode and promoted ordering
2. `FR-A02` vacancy detail 2.0
   - Similar vacancies
   - Salary intelligence block
   - Branch and response trust signals
3. `FR-A03` and `FR-A04`
   - Category/city/company landing pages
   - SEO metadata and SSR-friendly routing
4. `FR-A05` to `FR-A07`
   - Statistics sidebar
   - Candidate web auth continuity
   - Saved searches and alerts
5. Wave 2 stabilization
6. Wave 3 operational AI stitching
7. Wave 4 intelligence completion

## Started In This Pass

- `FR-A01`: expanded public catalog filtering and sorting in backend and web UI.
- Added support for salary range, shift, benefits, verified employer filter, and sort modes.
- Added desktop split-view behavior, canonical route normalization for city/category landings, and public page titles.
- `FR-A02`: wired similar vacancies and salary intelligence into public vacancy detail.
- `FR-A03/A05`: added public category/city hub routes, statistics sidebar, and title metadata for key public pages.
- `FR-A06`: added local candidate continuity for quick apply via persisted phone/name/city and candidate id reuse.
- `FR-A07`: aligned saved-search contract, added public saved-search endpoints, full-filter subscriptions, alert scheduler matching, and richer saved-search web UI.
- Wave 2 employer operations: connected dashboard UI to real task/feed/civility/value-report endpoints and exposed task inbox actions.
