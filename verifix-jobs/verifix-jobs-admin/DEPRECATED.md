# DEPRECATED - Standalone Admin Panel

**Status:** DEPRECATED as of 2026-04-04

This standalone admin application (`verifix-jobs-admin/`) has been superseded by the
unified admin panel inside `verifix-jobs-web/src/app/features/admin/`.

## What happened

All functionality from this standalone admin has been ported into the canonical
admin panel at `/admin` within `verifix-jobs-web`. This includes:

- Dashboard (KPIs with trends, system health, moderation preview, audit activity)
- Users management (candidates, employers, admins)
- Audit log with CSV export
- Analytics (metrics, growth chart, top cities)
- A/B Experiments (CRUD, stats)
- System Settings (feature toggles, rate limits, moderation rules)

The embedded admin already had and retains:
- Companies / Employers management
- Moderation queue
- Fraud monitoring
- Gov Sync (ARGOS, ENST, Mehnat)
- Access & Security (2FA, password management, team access, invites)

## Canonical admin paths

- **Production:** `https://job.verifix.uz/admin/login`
- **Local:** `/admin/login` within `verifix-jobs-web`

## Why not deleted yet

This directory is kept temporarily as a reference implementation.
It is NOT part of the production build pipeline and should NOT be deployed.

## Migration notes

- Auth token key changed from `vja_token` to `vjw_admin_token`
- API service base changed from `/api/v1` to `/api/v1/admin`
- i18n keys are in `web-translations.admin.ts` (not inline like the old service)
- Component selector prefix changed from `vja-*` to `vjw-*`
