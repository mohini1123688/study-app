# Study App — Project Notes

## Stack
- Phaser 4 + TypeScript + Vite, internal resolution 208×128, `zoom: 3`
- Art via Aseprite (PNG + JSON sprite sheets with tagged animations)
- Colyseus (multiplayer server, separate repo: `server/my-server`)
- Supabase (auth + `profiles` table, RLS enabled)
- Deployed: Colyseus server on Render (free tier — cold starts after 15 min idle)

## Module pattern
Feature logic is split out of scene files into `setupX(scene, ...)` functions returning
`{ destroy, ...other methods }`. Scene files just call setup + wire the returned methods
into their own `shutdown` handler. Existing modules: `taskBar`, `multiplayer`,
`timerDisplay`, `pickTimeMenu`, `completedSession`, `completionAnimation`, `usernameLabel`.

**Always call `.destroy()` in the owning scene's `this.events.once('shutdown', ...)`.**
Missing this leaks DOM listeners / stale sprites across scene reloads.

## Depth convention (Phaser rendering order)
Explicit depth is required — do not rely on add-order, it breaks the moment anything
(e.g. multiplayer sprites arriving asynchronously) is added out of the order you expect.
- `-10` — room background
- `0` (default) — characters (local + remote)
- `1` — tables / room furniture
- `50` — popups (pick-time menu, etc.)
- `100+` — top-priority overlays (delete buttons on top of other overlays, etc.)

**Local vs. remote objects must share the same depth.** A multiplayer feature that
mirrors a local object (e.g. study items shown above a remote player, same as they show
above the local player) needs its remote-side sprite created at the *same* depth as the
local one. It's easy to add a new remote sprite with a different/default depth than its
local counterpart — the sync logic can be completely correct (state updates, listeners
firing, sprite created) while the result is still invisible because it's layered behind
something else. If a synced feature "isn't showing up" but logs confirm the data is
arriving correctly, check depth before suspecting the networking code.

## HTML overlays (task list, popups, username labels, etc.)
Phaser sprites and HTML overlay elements are two separate layers with zero built-in
relationship. Every feature that has both needs explicit handling for:
- **Position**: convert world coords → screen px via `worldToScreen(scene, x, y)`
  (accounts for canvas zoom/scaling — never hardcode a zoom multiplier).
- **Visibility**: toggling a Phaser sprite's `.setVisible()` does NOT hide its
  matching HTML overlay — must be done separately, every time.
- **pointer-events**: overlay containers default to `pointer-events: none` (so clicks
  pass through to the canvas below); any clickable element inside needs
  `pointer-events: auto` explicitly, or clicks silently do nothing.
- **CSS units**: always include a unit (`px`) on numeric style values — `left: -20`
  (no unit) is invalid CSS and is silently ignored, not an error.

## Aseprite animations
Loading an aseprite JSON does NOT automatically register its `frameTags` as playable
animations. Every aseprite asset that gets `.play({ key: ... })` needs a matching
`this.anims.createFromAseprite('<key>')` call once in `create()`, or it fails with
"Missing animation: X".

## Common bug patterns hit repeatedly in this project
- **Duplicate event listeners**: re-running setup logic on every open/click (e.g. inside
  a `showX()` function instead of once at setup) stacks duplicate `.on(...)` handlers.
  Set up listeners once, outside any function that runs repeatedly.
- **Boolean state falling out of sync**: if multiple code paths can hide/show something,
  make the show/hide functions themselves own the state flag — don't update a boolean
  in only one of several callers.
- **Stale closures over changing values**: pass a function (`() => currentValue`) instead
  of a raw value when the consumer needs the *current* state, not a frozen snapshot.

## Multiplayer (Colyseus)
- One `OlinRoom`-style room per physical space; room state syncs via Colyseus Schema
  (`@type(...)` fields), not manual broadcasting.
- Desk assignment: server (`OlinRoom.ts`) owns a fixed `DESKS` array and assigns the
  first free index on join, freeing it on leave. Client renders local + remote players
  at whatever `x`/`y` the server assigns — never hardcode positions client-side.
- The local player's own sprite is repositioned asynchronously once the room confirms
  its assigned desk — anything visually tied to that sprite (e.g. username label) must
  re-anchor via a callback at that point, not just once at initial creation.

## File map

### Client (`study-app/src/`)

**Entry / shared:**
- `main.ts` — Phaser game config, registers all scenes
- `supabaseClient.ts` — initializes the Supabase client from `.env` vars; imported by any file touching auth or the database

**Scenes (`src/scenes/`):**
- `WelcomeScene.ts` — landing screen. Imports `authOverlay` (shows login/signup if no session) and `supabase` directly (logout button)
- `authOverlay.ts` — login/signup popup module. Imports `supabaseClient`. Used only by `WelcomeScene`
- `OnboardingScene.ts` — post-signup profile form (username/school/year). Imports `supabaseClient` directly, writes to the `profiles` table
- `CharacterCustomizeScene.ts` — pick girl/boy sprite, stored in `registry.selectedCharacter`
- `ChooseStudySpotScene.ts` — map/hotspot scene linking to Olin/BD/Dorm
- `OlinScene.ts` — main gameplay scene. Imports and wires together: `taskBar`, `multiplayer`, `timerDisplay`, `pickTimeMenu`, `completedSession`, `completionAnimation`, `usernameLabel`, `supabaseClient`
- `BDScene.ts`, `DormScene.ts` — stubs, not yet built out like `OlinScene`

**Feature modules (`src/scenes/`, imported by `OlinScene` — see Module pattern above):**
- `taskBar.ts` — task list, checkmark toggle, delete button. Takes an `onTaskCompleted` callback (wired to `completionAnimation.play`) and an `isBlocked` callback (wired to `pickTimeMenu.isOpen`)
- `multiplayer.ts` — Colyseus client connection. Imports `usernameLabel` (creates labels for remote players). Takes the local player sprite + a repositioning callback (wired to `usernameLabel.reposition`)
- `timerDisplay.ts` — digit-sprite MM:SS countdown (`setupTimerDisplay`) + picked-time display (`setupPickedTimeDisplay`)
- `pickTimeMenu.ts` — time-selection popup. Imports `timerDisplay` (for the picked-time display)
- `completedSession.ts` — end-of-session completed-tasks screen. Reads `registry.taskList` directly
- `completionAnimation.ts` — the bear celebration, self-contained
- `usernameLabel.ts` — HTML-overlay username labels. Imports `supabaseClient` (fetches/caches the logged-in user's username in `registry.username`). Exports both a generic `createUsernameLabel` (used for remote players by `multiplayer.ts`) and `setupOwnUsernameLabel` (used by `OlinScene` for the local player)

**Root files (`study-app/`):**
- `index.html` — hosts the Phaser canvas plus every HTML overlay div (`task-list-overlay`, `task-input`, `pick-time-overlay`, `completed-session-overlay`, `auth-overlay`, `username-labels-container`)
- `.env` / `.env.production` — `VITE_SERVER_URL` (Colyseus), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

### Server (`server/my-server/src/`) — separate repo, deployed on Render
- `index.ts` — entry point, calls `listen(app)`. Do not hand-edit (per its own header comment) if ever switching to Colyseus Cloud
- `app.config.ts` — registers rooms (`gameServer.define("olin_room", OlinRoom)`)
- `rooms/OlinRoom.ts` — room logic: `Player`/`OlinRoomState` schema, desk assignment (`DESKS` array), join/leave lifecycle

### How client and server connect
Client's `multiplayer.ts` connects via `VITE_SERVER_URL` (`ws://localhost:2567` locally,
`wss://<render-url>` in production) → Colyseus server's `OlinRoom` → assigns a desk,
tracks player state (character, username, x/y) → broadcasts diffs back to all connected
clients automatically (no manual broadcast code needed, just mutate `this.state` server-side).

Client and server are two separate Git repos/projects — changes to one never
auto-sync to the other; both need their own commits and (for the server) a
redeploy on Render to take effect live.

## Tuning workflow
Most visual placement (offsets, spacing, hitboxes) is done via named constants marked
`// TUNE` at the top of the relevant function, in world units (matching the 208×128
internal resolution), not raw screen pixels. Change the constant, save, reload, adjust.

## Testing multiplayer locally
Supabase sessions live in localStorage, which is **shared across normal tabs in the same
browser**. Logging in as a second account in another tab silently overwrites the first
tab's session — both tabs become the same user, producing mismatched/incoherent test data.
Always test two accounts using a normal window + an incognito window (or two different
browsers / Chrome profiles), never two normal tabs.

## Presence tracking
Room presence is stored in Supabase's `room_presence` table (written by the Colyseus
server via `supabaseAdmin`), NOT via Colyseus room metadata or a lobby room. That approach
was tried and abandoned — the lobby's join/snapshot/leave cycle raced badly against
scene transitions and produced unreliable, intermittently empty results. A plain database
read is deterministic and matches how the rest of the app already fetches data.

Killing the server with Ctrl+C skips `onDispose`, orphaning presence rows that reference
rooms which no longer exist. `app.config.ts` wipes the table on startup to handle this in
dev; that wipe would be incorrect with multiple concurrent server instances in production.