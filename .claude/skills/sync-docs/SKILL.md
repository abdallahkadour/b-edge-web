---
name: sync-docs
description: >
  Use this skill when working in b-edge-web and the documentation should be
  brought back in line with the code — after a frontend feature lands, when
  the user asks to "update the docs", "update the help pages", "update the
  README", or when `check-docs.sh` reports drift. Covers the in-app help
  guides (`customer-guide.ts`, `artist-guide.ts`, `admin-guide.ts`),
  `b-edge-web/project-docs/`, this repo's README, and the cross-repo
  documentation index that lives in `b-edge-api/project-docs/`.
---

# Sync the documentation to the code (web side)

**The detector and the full procedure live in the API repo**, because the
documentation index spans both repositories and there must be exactly one copy
of the rules. Read that skill and follow it:

```
../b-edge-api/.claude/skills/sync-docs/SKILL.md
```

Run the detector from here:

```bash
../b-edge-api/scripts/check-docs.sh
```

It already inspects this repo — it detects `b-edge-web` as a sibling and maps
changed frontend paths to the documents they implicate. Set `BEDGE_WEB_DIR` if
the repos are not siblings.

## What is different when the change is a frontend one

The counted claims this repo owns are `web_help_*_topics`, `web_ng_routes` and
`web_spec_files`. The one that carries meaning is **help topics**: it should
grow when a user-visible feature ships, and a route count that moved while the
topic count stayed still is the signal that a screen shipped without anyone
telling the user it exists.

Three things specific to this repo:

**The help guides are compiled TypeScript, not markdown.** They are
`GuideSection[]` of `GuideTopic { id, title, summary, steps, notes? }` —
see `projects/shared/src/lib/help/model.ts`. A malformed edit breaks the
build, which is a feature. Always build after editing a guide:

```bash
npx ng build shared && npx ng build customer-pwa && npx ng build artist-dashboard
```

**`@bedge/shared` resolves to `./dist/shared`, not to source.** Editing
anything under `projects/shared/src/` — including `help/model.ts` — and
rebuilding only the apps silently uses the previous library. `ng build shared`
must run first. This has cost a full debugging cycle before.

**Bold text in a guide is a claim about a UI label.** Every `**Select
location**` asserts that those exact words are on screen. When a label
changes, search the guides for the old wording before adding anything new —
the fix is almost always a correction, not a new topic.

## Where things go

- Hand-written web docs → `b-edge-web/project-docs/`
- The cross-repo index → `b-edge-api/project-docs/DOCUMENTATION.md`
- **Never** `b-edge-api/docs/` — gitignored swagger output, silently lost
