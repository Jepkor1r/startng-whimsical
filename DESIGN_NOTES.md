# Design notes: "Lagos Arcade"

## Concept

start.ng is a home for free browser games, many of them Naija-themed (danfo rush hour, jollof catching,
Lagos markets). The current site is clean and editorial, with no motion and no illustration.

**"Lagos Arcade"** makes the homepage feel like a game you can poke at. It uses things from the games
themselves (jollof pot, mango, puff-puff, suya, naira coin, football, danfo) and the site's own systems
(the start.ng *character*, the *rarity* colours, `yourgame.start.ng` addresses). The brand stays intact:
same sections and copy, same cream `#f6f5ee` / ink `#292a23` / lime `#d8fd71` palette, same Helvetica,
same rounded cards.

Rule we followed: **every effect has to point at an action the user can take (play, browse, publish, learn).**

## Effects and why they fit

| # | Effect | Where | Why it fits start.ng |
|---|--------|-------|----------------------|
| 1 | **Highlighter draws itself** under "Good games." | Hero | Animates start.ng's existing lime `<mark>` and puts the focus on the promise: good games. |
| 2 | **Floating Lagos things** bob gently and drift away from the cursor (parallax); **tap one** and it boings and shouts ("Jollof!", "Oya enter!") | Hero | Introduces the Naija game themes before you read a word. Tapping something to make it react is the core loop of a game, a tiny taste of play. |
| 3 | **Your start.ng character** blinks, breathes, watches your cursor, jumps when tapped | Hero, next to Play | The site gives signed-in players a character; this previews it and makes the main button feel "watched over". |
| 4 | **Play now = insert coin**: on hover a coin hovers over a slot; on click it drops in, the button presses, sparks fly, the character jumps, then the page scrolls to the games | Primary CTA | The arcade "insert coin" moment is the clearest possible signal for *play*. The celebration lasts under 0.5 s, so it never slows anyone down. |
| 5 | **Game cards** tilt toward the cursor; a shadow in the card's *rarity colour* slides out; the cover art pops and a shine sweeps across | Games grid | Feels like picking up a collectible card. It reuses start.ng's rarity palette (rare blue, epic purple, legendary amber…). |
| 6 | **Danfo route**: as you scroll "Got a game?", a danfo drives along a road, the road fills behind it, and each step's stop and "0x" chip lights up lime when the bus arrives. It reverses and turns around if you scroll back. | Publish steps | Turns a 4-step process into a journey with visible progress. The danfo is Lagos's most iconic ride, the perfect guide for "getting your game there". |
| 7 | **Logo dot** bounces like a ball on hover | Nav / footer | A small brand wink. |
| 8 | **FAQ "+"** wiggles on hover and spins into "×"; answers spring open | FAQ | Makes the FAQ feel responsive and tactile without changing its layout. |
| 10 | **Light/dark toggle**: sun morphs into a moon; the new theme sweeps out in a circle from the button like a light switch (View Transitions API) | Nav | start.ng already offers both themes; this makes switching feel like a game's lights-out moment. Instant switch with reduced motion or in browsers without View Transitions. |
| 11 | **Hidden snack hunt**: tap every floating thing in the hero. The first tap reveals a counter on the character ("3/6"), and each find gets a lime ✓. Find them all and the character jumps, confetti flies, and a speech bubble says *"Na you sabi!"* with a **Pick a game** button. | Hero | A game hidden in a games site rewards curious players. It ends by pointing at the main action (playing a real game), and teases the daily tournament. The total adapts to what's visible (6 on phones, 8 on desktop). It's an optional extra: floaters stay `aria-hidden`, but the win message is announced via a live region, closes with × or Esc, and works with reduced motion (just no bouncing). |
| 12 | **3D jollof pot** (the single Three.js moment, capable desktops only; see below) | Hero | The hero-level "wow": a steaming pot of jollof is the most start.ng object there is. |
| 13 | **Phone menu**: links fold into a drop-down card; the bars morph into ×, and links tumble in | Nav (phones) | Matches the live site's phone menu and gives the hero the whole screen. Esc closes it and returns focus; closed links can't be tabbed to. |
| 9 | **Scroll reveals**: cards and FAQ rise in with a stagger | Throughout | Gently paces the page; content is never hidden without JS or with reduced motion. |

### Prototype additions vs. the live site
- The live homepage HTML shows the game list as an A–Z list only (cards appear to load client-side).
  The prototype adds a **featured grid of 8 real community games** with illustrated covers so the card
  interactions can be shown. Links point to the real game pages.
- All nav/footer links point to the real start.ng pages.

## Dark theme

- Same palette as start.ng's own dark theme (`#292a23` background, `#f6f5ee` text, dark-mode rarity colours),
  defined as token overrides in `styles/tokens.css`. No component CSS has hard-coded colours.
- Starts from the saved choice (`localStorage`), otherwise follows the OS `prefers-color-scheme` (and keeps
  following it until the user picks). It's applied in `<head>` before first paint, so there's no flash.
- The illustrations have olive-black outlines that would disappear on the dark background, so in dark mode they
  get a cream die-cut **sticker edge** (`--sticker`, chained `drop-shadow`s, painted once, not animated).
- "Good games." gets a background-coloured text stroke over the lime highlight, the same trick start.ng uses.
- Anything on lime always uses dark text (`--on-lime`).

## Three.js and the fallback strategy

Three.js is used **once**: a cartoon 3D jollof pot that replaces the flat jollof sticker in the hero. It
spins slowly, leans toward the cursor, puffs steam, and hops when clicked (it still counts in the snack hunt).
It uses toon shading and an inverted-hull outline (cream in dark mode) so it matches the flat art.

**The SVG pot is the default and the fallback.** `scripts/hero-3d.js` only fetches Three.js, after the page has
loaded and gone idle, when **all** of these hold:
- motion is OK (no `prefers-reduced-motion`) and the device isn't flagged `lite`;
- not `navigator.connection.saveData`, and `navigator.hardwareConcurrency` ≥ 4;
- a mouse/trackpad (`(hover: hover) and (pointer: fine)`) on a screen ≥ 760 px wide;
- a WebGL2 context can actually be created (the probe context is released straight away).

So **phones, tablets, low-power devices and reduced-motion users never download it.** Then:
1. The canvas is swapped in only after its first frame is drawn, in the same task, so there's no blank frame.
2. It renders only while visible (IntersectionObserver plus page visibility) via `setAnimationLoop`.
3. On `webglcontextlost`, or if the user switches on reduced motion mid-visit, it disposes everything and the
   SVG comes back. A failed import (network, old browser) silently keeps the SVG.

**Weight:** Three.js 0.186 no longer ships minified builds, so `tools/build-three.sh` bundles and tree-shakes
only the classes the pot uses (`tools/three-subset.js`) into `assets/vendor/three-subset.min.js`:
525 KB minified, about **135 KB gzipped**. Most of that is the WebGL renderer's shader code, which can't be
shaken out. It's committed, so deploys still need no build step, and the site's own code stays about 106 KB.

**Tested** in headless Chrome with software WebGL (SwiftShader): mounts with a mouse present; stays SVG with
no download on a phone viewport, with reduced motion, and with WebGL disabled; tears down when reduced motion
is switched on.

## Motion, performance and accessibility

- **Only `transform` and `opacity`** are animated (plus `translate` for the bus rumble). Shadows on cards
  are a separate layer that slides, not an animated `box-shadow`.
- **Pointer work is throttled to `requestAnimationFrame`**, reading layout before writing in each frame.
- **Idle loops pause** when the hero scrolls off-screen (IntersectionObserver), and the route only listens
  to scroll while it's visible.
- **`html.lite`** (Save-Data or ≤ 2 CPU cores) drops the always-on bobbing and parallax (and the 3D pot).
- **`prefers-reduced-motion: reduce`**: no entrance, idle, hover or scroll-linked motion, no Play-now
  delay (it's a plain anchor link), the bus is parked at the last stop and all steps are lit. The setting is
  re-checked live.
- **No JS / very old browsers** (`nomodule`): you get a complete, readable static page.
- Semantic landmarks and headings, skip link, visible `:focus-visible` outlines, and keyboard focus triggers
  the same card and CTA effects as hover. Decorative SVG is `aria-hidden`.
- Text contrast: ink on cream ≈ 13:1, muted grey on cream ≈ 5:1, white on ink ≈ 14.5:1, ink on lime ≈ 12.6:1 (all pass WCAG AA).

## Browser and device support

- Latest Chrome, Edge, Firefox and Safari (desktop + iOS/Android). Uses ES modules, IntersectionObserver,
  the Web Animations API, CSS custom properties and `color-mix()` (with a solid fallback colour).
- Mobile first: two-column game grid and a vertical danfo road on phones; four columns and a horizontal
  road from 760 px.
- Touch devices skip hover/tilt/parallax; tapping snacks, the character and Play now still reacts.
- Tested in headless Chrome at 1280×800 (desktop) and 390×844 (mobile, touch emulation), with motion on
  and with reduced motion.
