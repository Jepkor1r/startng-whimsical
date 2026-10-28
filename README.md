# start.ng · Whimsical Redesign (HNG15)

A whimsical, playful prototype of [start.ng](https://start.ng), Nigeria's home for free browser games,
built for the HNG15 individual task *"Create a whimsical design for Ziki, Start.ng or Zedu."*

**Concept: "Lagos Arcade".** The homepage becomes a lively Lagos street where Naija game objects come
alive: floating jollof, mangoes and danfos that react to you, a start.ng character that watches your cursor,
and a danfo bus that drives you through the "publish your game" steps.

See [DESIGN_NOTES.md](DESIGN_NOTES.md) for the concept, every effect and why it fits.

## Stack

Plain HTML + CSS + a little vanilla JS (ES modules). **No dependencies, no build step, no Three.js.**
The whole site is about 96 KB uncompressed, and all illustrations are inline SVG.

```
index.html            all sections + an inline SVG icon sprite
styles/tokens.css     start.ng brand tokens (cream / ink / lime + rarity colours)
styles/base.css       reset, layout, nav, buttons, footer, focus states
styles/sections.css   hero, games grid, danfo route, about + FAQ (static layout)
styles/effects.css    every keyframe + reduced-motion handling
scripts/main.js       entry: shared motion settings, starts each module
scripts/hero.js       parallax, tappable snacks, character, Play-now coin burst
scripts/cards.js      game-card cursor tilt
scripts/route.js      danfo bus driven by scroll, lights up each step
scripts/reveal.js     IntersectionObserver scroll reveals
scripts/theme.js      light/dark toggle (saved choice, else OS setting)
assets/favicon.svg
vercel.json           static deploy config (cache + security headers)
```

## Run locally

ES modules need to be served over HTTP (opening the file directly with `file://` won't run the JS).
Any static server works:

```bash
# Python (pre-installed on most machines)
python3 -m http.server 4173
# or Node
npx serve .
```

Then open http://localhost:4173. To test on your phone, use your computer's LAN IP
(e.g. `http://192.168.1.20:4173`) while both devices are on the same Wi-Fi.

**Things to try:** move your mouse over the hero, tap the floating snacks and the little character,
click **Play now**, flip the sun/moon toggle, hover the game cards, scroll slowly through "Got a game?", and open an FAQ.
Turn on *Reduce motion* in your OS settings to see the calm version.

## Deploy to Vercel (recommended)

1. Push to GitHub (already set up: `main` branch of `startng-whimsical`).
2. Go to https://vercel.com/new and **Import** the `startng-whimsical` repository.
3. Framework preset: **Other**. Leave *Build Command* and *Output Directory* empty
   (root directory `./`; the site is already static).
4. Click **Deploy**. Every push to `main` now auto-deploys, and pull requests get preview URLs.

CLI alternative: `npx vercel` (first time links the project) then `npx vercel --prod`.

## Deploy to Render (alternative)

1. https://dashboard.render.com → **New** → **Static Site** → connect the repo.
2. Branch `main`, *Build Command* empty (or `echo ok`), *Publish Directory* `.`
3. Create the site. Auto-deploy on push is on by default.

## Accessibility & performance

- Respects `prefers-reduced-motion` (all decorative motion off, all content visible, no scroll-jacking).
- Animates only `transform` and `opacity`; idle loops pause when the hero is off-screen and are
  dropped entirely on Save-Data / low-core devices.
- Semantic landmarks, skip link, visible keyboard focus, decorative art hidden from screen readers.
- Works without JavaScript: you get the plain, fully readable page.
