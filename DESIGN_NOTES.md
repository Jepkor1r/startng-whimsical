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

**We chose not to use Three.js.** Everything is CSS + inline SVG + about 330 lines of commented vanilla JS
(about 96 KB for the whole site, no dependencies). The hero depth effect is layered parallax, which reads
as 3D, costs almost nothing on a phone and needs no WebGL.

If a 3D hero moment is added later (e.g. a spinning jollof pot), the plan is:
1. Keep the current SVG floater as the default markup (it *is* the fallback).
2. Only load Three.js with a dynamic `import()` when **all** hold: WebGL2 context can be created,
   `prefers-reduced-motion` is not set, not `navigator.connection.saveData`,
   `navigator.hardwareConcurrency > 4`, and `(pointer: fine)` or a wide screen.
3. Swap the SVG for the canvas only after the first frame renders; on context loss, swap back.

## Motion, performance and accessibility

- **Only `transform` and `opacity`** are animated (plus `translate` for the bus rumble). Shadows on cards
  are a separate layer that slides, not an animated `box-shadow`.
- **Pointer work is throttled to `requestAnimationFrame`**, reading layout before writing in each frame.
- **Idle loops pause** when the hero scrolls off-screen (IntersectionObserver), and the route only listens
  to scroll while it's visible.
- **`html.lite`** (Save-Data or ≤ 2 CPU cores) drops the always-on bobbing and parallax.
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
