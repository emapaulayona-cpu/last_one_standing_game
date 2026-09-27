# SPEC — "מי נשאר?" (Who's Left?)

A digital, Hebrew-first word game for phone and iPad, inspired by the classic "name a word in the category before the timer runs out" party game. Built for Alma (14) and her friends and family.

- **Working title:** מי נשאר? (English: *Who's Left?*). It is easy to rename, because the title lives only in the string files.
- **Status:** MVP planning
- **Deploy:** GitHub → Vercel (static site)

---

## 1. Goals and non-goals

### Goals (MVP)
- Pass-and-play on **one shared device**, either a phone passed hand to hand or an iPad in the middle of the table.
- Hebrew UI with RTL layout, built on an i18n structure so English can be added later **without refactoring**.
- Fast, fun and noisy: a clear timer, sound effects and a satisfying elimination moment.
- Answers are checked by players, not by the app (honor system).
- Players, scores and custom categories are saved on the device.
- A solo mode, built as the last MVP milestone so it can be cut without affecting anything else.

### Non-goals (MVP)
- No backend, accounts or online multiplayer.
- No AI and no automatic answer validation.
- No laptop-specific layout. It should still work there, but it isn't optimized.
- No syncing of custom categories between devices.
- No use of the original game's name, logo, artwork or card text.

---

## 2. Game rules (digital version)

### 2.1 Setup
- **Players:** 2–8 named players. Names can be picked from saved players or typed in.
- **Difficulty:** Easy, Hard or Mixed. This controls which categories are drawn.
- **Custom categories only:** an optional toggle, shown once at least one custom category exists, that restricts the draw to custom categories only (still filtered by difficulty).
- **Cards to win:** 3, 5 or 10 (default 3).
- Turn timer (5, 10 or 15 seconds, default 10) and sound (on/off) are global preferences set once in Settings (screen 10), not chosen per game.

### 2.2 The letter wheel
- The wheel has all **22 Hebrew letters**: א ב ג ד ה ו ז ח ט י כ ל מ נ ס ע פ צ ק ר ש ת.
- Final forms (ך ם ן ף ץ) count as their regular letters. A word ending in a final form is irrelevant, because only the **first** letter matters.
- A tapped letter is **locked** for the rest of the round.

### 2.3 A round
1. A category is drawn at random, filtered by difficulty. It can be skipped and redrawn **before** the round starts.
2. The starting player rotates each round. The first player of the first round is chosen at random.
3. The first player's turn and timer start when someone taps **Start**.
4. **On your turn:** say an answer out loud that fits the category and starts with an unlocked letter, then tap that letter.
   - The letter locks, the turn passes to the next active player, and the timer restarts automatically.
5. **Timer runs out:** the current player is **out for this round**. The buzzer sounds, a short "X is out" screen appears, and play continues when someone taps **Continue**.
6. **Challenge (פסילה):** during the next player's turn, a Challenge button is available. Tapping it:
   - eliminates the **previous** player,
   - unlocks the letter they tapped,
   - restarts the current player's timer.
   This covers invalid answers, repeated words and wrong-letter taps. It is honor-based: the table decides.
7. **Round ends** when only one player is left. That player wins the category card.

### 2.4 Overtime
- If **all letters are locked** and more than one player is still active:
  - The wheel resets, a new category is drawn, and only the players still active continue.
  - Each turn now requires **two letters**, meaning two answers with different starting letters, before the timer is beaten.
  - The UI shows a "1 of 2" / "2 of 2" indicator.

### 2.5 Winning
- The first player to reach the card target wins the game.
- Eliminated players return at the start of every new round.
- The end screen shows the winner, a celebration, each player's cards, and buttons for a rematch with the same players or a new game.

### 2.6 Solo mode (last MVP milestone)
- One player picks a difficulty, and a category is drawn.
- The timer runs per answer. Each letter tap resets it.
- The game ends when the timer runs out or all 22 letters are used.
- **Score:** the number of letters tapped.
- The best score per difficulty is saved on the device, with a "new record!" moment.
- It reuses the same wheel, timer and sounds as the multiplayer game. Only the flow is different.

---

## 3. Screens

| # | Screen | Key contents |
|---|---|---|
| 1 | Home | Title, **New game**, **Solo**, **Categories**, **Scores**, instructions icon, settings icon |
| 2 | Game setup | Players (add/remove/pick saved), difficulty, custom-only toggle (when applicable), cards to win |
| 3 | Round intro | Category card (skip/redraw), starting player, **Start** |
| 4 | Game board | Letter wheel, center timer, current player, active/out player chips, **Challenge** |
| 5 | Player out | Short overlay: "X is out", **Continue** |
| 6 | Round won | Winner of the card, card counts, **Next round** |
| 7 | Game over | Winner, celebration, final standings, **Rematch** / **New game** |
| 8 | Categories | Browse built-in categories (read-only); add/edit/delete **"הקטגוריות של אלמה"** (custom) |
| 9 | Scores | Wins per saved player, solo records |
| 10 | Settings | Sound on/off, default timer, reset saved data |
| 11 | Instructions | "איך משחקים?" - the game's rules, reachable from Home |

A pause/exit control must be reachable from the game board, with a confirmation before quitting.

---

## 4. UX requirements

- **Mobile-first**, portrait orientation. It must also work on an iPad in portrait or landscape.
- **Wheel layout:** 22 letter buttons arranged in a circle, with a large timer/start button in the center.
  - Touch targets must be at least 44×44 px.
  - The wheel scales with the smaller viewport dimension.
- **Locked letters** are visibly "pressed down" (dimmed and depressed) and cannot be tapped.
- **Timer:** a countdown ring plus seconds, which turns urgent (color change and faster ticking) in the last 3 seconds.
- **Current player** is shown prominently, because the device is passed around.
- **Screen stays awake** during a game, using the Screen Wake Lock API where it is supported.
- **Readability:** large type, high contrast, playful but clean design. It uses original visual design only, not the original game's colors or artwork.
- The layout is **RTL** in Hebrew, and all directional styling must mirror automatically for LTR.

---

## 5. Architecture

### 5.1 Overview
- **Static single-page app.** There is no server: all state lives in the browser, and Vercel only serves files.
- **Layers**, where each layer depends only on the ones below it:

```
UI (screens & components)
   ↓ dispatches actions / reads state
Game engine (pure state machine: state + action → new state)
   ↓
Content (categories, letters, UI strings per locale)
Persistence adapter (localStorage, versioned)
Platform services (audio, wake lock, timer clock)
```

### 5.2 Why this shape
- **A pure game engine** (a reducer with no React, DOM or timers inside) can be fully unit-tested, and it is the part most likely to have bugs (overtime, challenge, rotation). It also means a future online mode could run the same engine on a server.
- **Content kept separate from code** means adding English is a new strings file plus a new categories file, with no component changes.
- **A persistence adapter** keeps `localStorage` in one place. It carries a schema version so saved data can be migrated later, and swapping to a backend would touch one module.

### 5.3 Game engine
- It models the game as explicit phases:
  `setup → roundIntro → turnActive → playerOut → roundWon → gameOver` (plus a `solo*` set for solo mode).
- **Actions** include `START_ROUND`, `TAP_LETTER`, `TIMER_EXPIRED`, `CHALLENGE`, `CONTINUE`, `SKIP_CATEGORY`, `NEXT_ROUND`, `REMATCH`, `QUIT`.
- **Randomness** (category draw, first player) is passed in as an injectable random function, so tests are deterministic.

### 5.4 Timer
- The timer stores a **deadline timestamp**, not a counter that ticks down. The UI computes the remaining time from the current time on each animation frame.
- **Why:** browsers slow down timers in background tabs and on iOS, so a tick-counting timer drifts. A deadline stays accurate.
- The UI dispatches `TIMER_EXPIRED` when the time passes the deadline. The engine ignores stale expiries, for example ones that arrive after a letter tap already moved the turn on.

### 5.5 Audio
- Sounds are **synthesized with the Web Audio API**: tick, urgent tick, letter tap, buzzer, round win and game win.
- This avoids licensing sound files and keeps the bundle small.
- iOS only allows audio after a user gesture, so the audio context is unlocked on the first **Start** tap.
- Muting must be instant and global.

### 5.6 Internationalization
- **All** user-facing text comes from a locale dictionary. There are no hardcoded strings in components.
- The locale sets `<html lang>` and `dir` (`he` → `rtl`, `en` → `ltr`).
- Styling uses **logical CSS properties** only (start/end, not left/right).
- Letter sets and categories are defined per locale. The English wheel, later, will be its own letter set.
- The MVP ships `he` only, but the structure must accept `en` as a drop-in.

### 5.7 Persistence (localStorage)
- **Stored data:** saved players (names), wins per player, solo records per difficulty, custom categories, and settings.
- **Not stored:** in-progress games. Refreshing the page ends the game, which is acceptable for the MVP.
- **Safety:** all access goes through a wrapper with try/catch, because storage can be unavailable in private mode. The app must still work, just without saving.

---

## 6. Categories

Categories are content, stored as data per locale. Each one has an `id`, `text` and `level` (`easy` or `hard`). Custom categories also have `level` and `custom: true`.

All categories below are originally written for this app.

### Easy (קל)
מדינות · ערים · חיות · דומם · מאכלים · שמות · פירות וירקות · מקצועות · בגדים ואביזרים · כלי תחבורה · ענפי ספורט · דברים שיש במטבח · דברים שיש בבית ספר · ממתקים וחטיפים · שמות לחיות מחמד · תוספות לפיצה · דברים שיש בים · דברים שיש בבית · סרטים וסדרות · זמרים וזמרות · דמויות מסרטים מצוירים · דברים שקונים בסופר · דברים שיש בקניון · אפליקציות ואתרים · תחביבים · דברים שעושים בחופש הגדול · משהו שיש בחדר שלך · מותגים

### Hard (קשה)
בירות של מדינות · נהרות, ימים ואגמים · מקומות ויישובים בישראל · מאכלים מרחבי העולם · תבלינים ורטבים · צמחים ופרחים · בעלי חיים ימיים · ממציאים ומדענים · דמויות היסטוריות · סופרים וספרים · מותגי אופנה · מילים באנגלית שנכנסו לעברית · רגשות ותחושות · תכונות אופי · דברים שעפים · דברים עגולים · דברים שעושים רעש · דברים ששמים במזוודה · משהו שאפשר לשבור · חלקים של מכונית · כלי נגינה · דברים שיש במוזיאון · מקצועות בבית חולים · פעלים (דברים שעושים)

### Custom — "הקטגוריות של אלמה"
- Custom categories can be added, edited and deleted, with a level choice for each.
- They are included in draws according to the difficulty filter, and a setup option allows playing **custom only**.
- Validation: text is required, 40 characters max, and duplicates are blocked (compared after trimming, case-insensitive).

---

## 7. Milestones

Each milestone ends with a working, deployed build.

| # | Milestone | Done when |
|---|---|---|
| 1 | Scaffold (Vite, i18n, RTL) + game engine + unit tests | App shell renders in Hebrew RTL; all rules in §2.1–2.5 covered by passing tests |
| 2 | Setup screen + wheel + timer (core loop) | Two players can play a round on a phone |
| 3 | Full flow: out, challenge, overtime, round/game win | A full game to 3 cards works end to end |
| 4 | Sounds, wake lock, settings | Works with sound on an iPhone/iPad |
| 5 | Persistence: players, scores, custom categories | Data survives reload; works when storage is blocked |
| 6 | Solo mode | Solo game with saved records |
| 7 | Polish + device testing | Tested on a real phone and iPad |

The GitHub → Vercel pipeline already exists. A new repo only needs to be imported as a Vercel project once.

---

## 8. Future (post-MVP)

- An English locale and English letter wheel.
- A speed mode preset (5 seconds) or other variant presets.
- A PWA manifest, so the game can be added to the home screen and played offline.
- Online multiplayer, with each player on their own phone. This would need a real-time backend running the same game engine.
- Syncing custom categories across devices.
- Playing against a computer opponent. This would need answer lists or AI.

---

## 9. Acceptance checklist (MVP)

- [ ] A 2–8 player game on one phone works end to end, including overtime.
- [ ] Challenge correctly eliminates the previous player and unlocks their letter.
- [ ] The timer stays accurate when the screen is busy, and the app handles being backgrounded.
- [ ] The whole UI is Hebrew RTL, with no hardcoded strings.
- [ ] Sound works on iOS after the first tap, and mute works.
- [ ] Custom categories, players and scores persist across reloads.
- [ ] No original game names, logos, artwork or card text are used.
- [ ] It is deployed on Vercel from the GitHub main branch.
