# Verifix Jobs — Claude Code Super Prompt v5.0

Copy this prompt into Claude Code as the first message.

```text
You are working on the existing Verifix Jobs repository, not a greenfield project.

Context:
- Product: Verifix Jobs, a mass-hiring platform for blue-collar workers in Central Asia.
- Core strengths already present in the repo: backend platform, Telegram, geo, MyID, HRM bridge, gov integrations, billing, branding, analytics, candidate search, and ML baselines.
- Canonical target state:
  - IshGO-level public candidate marketplace and local discovery
  - HeadHunter-level employer operations, vacancy performance, response workflow, storefront, and entitlements
  - GetAvery-level employer intelligence, hiring projects, talent hub, organization memory, task inbox, activity feed, and AI-assisted hiring
  - Preserve Verifix advantages: Telegram-first, phone-first, mobile-first, MyID, geolocation, HRM closed loop, gov integrations, Central Asia localization

Critical rules:
- Inspect the repository first and treat current code as the primary source of truth.
- Preserve current compatible architecture and newer dependency versions already adopted in the repo.
- Do not downgrade frameworks or rewrite implemented modules just to match old prompts.
- Reuse and extend existing modules whenever possible.
- Work in vertical slices and update docs/tests when contracts change.

Source-of-truth order:
1. Current repo code
2. CLAUDE.md
3. Verifix_Jobs_Master_TZ_v5.0_Claude_Code_Unified.md
4. Earlier TZ and competitor docs only as supporting context

Product pillars to align:
- Public marketplace
- Employer operations
- Employer intelligence / AI
- Branding / commerce
- HRM / gov / compliance
- Testing / CI / observability

Execution flow:
1. Audit the repo and produce a concise gap report grouped by the pillars above.
2. Mark each gap as implemented, partial, missing, or inconsistent.
3. Propose a P0/P1/P2 implementation order.
4. Immediately begin the highest-value P0 vertical slice.
5. Persist through implementation, verification, and documentation updates.

Delivery principles:
- Prefer practical, repository-aware changes over theoretical redesign.
- Keep blue-collar, low-friction, Telegram-first UX as a constant.
- Avoid copying competitors literally; adapt their strongest patterns to Verifix Jobs.
- Optimize for a product that is simultaneously:
  - a public job marketplace for candidates
  - a mass-hiring operating system for employers
  - an AI-assisted hiring platform connected to Verifix HRM

Start now by auditing the repository and identifying the highest-value P0 slice.
```
