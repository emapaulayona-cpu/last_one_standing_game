# CLAUDE.md

Guidance for Claude Code working in this repo. **Read `SPEC.md` first.** It is the source of truth for rules, screens and architecture.

## Project
"מי נשאר?" is a Hebrew-first, pass-and-play word party game for phone and iPad. It is a static single-page app deployed on Vercel from GitHub. There is no backend, no AI and no accounts.

## Stack
- **Vite + React + TypeScript** (strict mode): a static SPA, with no server-side rendering needed.
- **Tailwind CSS**, using logical properties/utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`). Never use `left`/`right` for layout.
- **Vitest** for unit tests.
- **Web Audio API** for all sounds, which are synthesized. There are no audio files.
- **localStorage** for persistence, accessed only through the persistence adapter.

Ask before adding any dependency not listed here.

## Commands
- `npm run dev`: start the local dev server
- `npm run build`: production build (this is what Vercel runs)
- `npm test`: run the unit tests
- `npm run lint`: run the linter

## Folder layout
```
src/
  engine/     pure game logic (reducer, types, rules); NO React/DOM/timers
  content/    locales: strings, letters, categories per locale (he now, en later)
  storage/    versioned localStorage adapter (try/catch, safe fallback)
  services/   audio, wake lock, clock
  ui/         screens/ and components/
```

## Architecture rules
1. **The engine is pure.** Its reducer takes `(state, action) → state`. Randomness and the current time are passed in as inputs. Every rule change needs a test in `engine/`.
2. **The timer uses a deadline, not a counter.** Store the deadline timestamp and compute the remaining time in the UI. The engine must ignore stale `TIMER_EXPIRED` actions.
3. **No hardcoded user-facing strings.** Everything comes from `content/<locale>`. The locale sets `lang` and `dir`.
4. **Content is data.** Letters and categories live in locale files, never inside components.
5. **Storage is optional.** The app must run fully when localStorage throws, just without saving. Stored data carries a schema version.
6. **Audio is unlocked on the first user gesture** (the Start tap), because iOS requires it.

## UI conventions
- Mobile-first and portrait. It must also work on an iPad in portrait and landscape.
- Touch targets are at least 44×44 px. The wheel scales with the smaller viewport dimension.
- Use original visual design only. **Never** use the original game's name, logo, colors, artwork or card text.

## Workflow
- Build in the milestone order from SPEC §7. Finish, test and deploy each milestone before starting the next one.
- Before starting a milestone, briefly state the plan and ask if anything is unclear. Don't assume rules; check SPEC §2.
- Commit once per logical step, with clear messages. `main` auto-deploys to Vercel.
- Keep components small, and push game logic into the engine, not the UI.
