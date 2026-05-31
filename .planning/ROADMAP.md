# MojAvto.si Roadmap

## Phase 1: Vehicle Taxonomy Technical Specifications

**Goal:** Extend the taxonomy system so each trim/variant contains structured technical specs that auto-fill during listing creation. Deliver updated JSON schema, Excel import templates, admin CRUD UI, and listing auto-population.

**Requirements:** REQ-001 through REQ-010

**Phase directory:** 01-taxonomy-tech-specs

**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — JSON schema migration: object variants + normalizeTrimEntry helper
- [x] 01-02-PLAN.md — Excel templates (3 per category) + import pipeline validation
- [x] 01-03-PLAN.md — Admin CRUD table with sort/filter/pagination + edit/add modals
- [x] 01-04-PLAN.md — Listing creation auto-fill from taxonomy on trim selection

### Phase 2: Buyer-Seller Messaging: In-platform chat between buyers and sellers so deals can happen without exposing phone/email. Includes Firestore conversations + messages collections with security rules, chat UI (thread list + thread view) wired into listing Contact seller button, unread badge in header and dashboard, block/report user actions, server-side rate limiting and basic profanity/abuse filtering, and email fallback notification when message is unread > 1h. Exit criteria: two test users can negotiate end-to-end without exchanging contact details.

**Goal:** [To be planned]
**Requirements**: TBD
**Depends on:** Phase 1
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 2 to break down)
