# Admin Panel Improvement Plan

## Goal
Bring the embedded admin panel to an operational level for moderators and super admins:
- secure access management
- faster moderation workflows
- better day-to-day usability
- clearer operational visibility

## Implemented In This Pass

### Access and Security
- Added current admin profile endpoint and UI
- Added self-service password change
- Added TOTP setup flow
- Added super-admin management of admin users
- Added moderator/admin creation
- Added role updates
- Added password reset for admin users
- Added copy-ready credential panel for newly created or reset accounts
- Added strong password generation in the UI

### Operational UX
- Rebuilt embedded admin login
- Rebuilt admin shell with better navigation and mobile behavior
- Rebuilt dashboard with overview cards, moderation preview, fraud preview, and recent audit activity
- Rebuilt employer moderation screen with richer company context
- Rebuilt moderation queue with filters, preview, and approve/reject flow
- Rebuilt fraud screen with risk states and review actions
- Rebuilt gov sync screen with cleaner summaries

### Reliability
- Added integration coverage for admin access flows
- Fixed JSONB mapping for admin permissions and audit details
- Added richer analytics counters for moderation, fraud, and admin activity

## Convenience Improvements Added
- Generate strong password for:
  - own password update
  - new moderator/admin creation
  - moderator password reset
- Copy-to-clipboard for:
  - TOTP secret
  - issued email
  - issued password
- Last issued credential card so super admins can safely hand off access after create/reset

## Remaining Backlog

### Phase 2
- invite-based moderator onboarding by email
- forced password rotation on first login
- admin session list and remote sign-out
- audit filters by entity, actor, and date range
- bulk moderation actions

### Phase 3
- moderation SLA timers
- assignment queues by moderator
- saved admin views and filters
- live operational notifications in admin
- deeper fraud drill-down with candidate/employer context

## Release Checklist
- backend integration test passes
- web production build passes
- deploy api and web with targeted recreate only
- smoke check:
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/access`
