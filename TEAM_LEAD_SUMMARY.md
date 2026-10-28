# HNG15 whimsical design task: start.ng

**Live:** https://startng-whimsical.vercel.app/ · **Code:** https://github.com/Jepkor1r/startng-whimsical

**What I built:** a faithful recreation of the start.ng homepage (same sections, copy and cream/ink/lime
branding) with a whimsical layer on top. It's plain HTML/CSS/vanilla JS, about 106 KB, plus one lazy-loaded Three.js moment for capable desktops.

**The idea, "Lagos Arcade":** start.ng is Nigeria's home for browser games, so the homepage itself should feel
playable, and feel like Lagos.
- Jollof, mangoes, puff-puff, suya and a danfo float in the hero, drift away from your cursor and shout when you tap them ("Jollof!", "Oya enter!").
- A little start.ng character watches your cursor and jumps when you hit **Play now**, which works like an arcade coin slot.
- Game cards tilt like collectible cards, with shadows in start.ng's rarity colours.
- A hidden snack hunt: tap every floating thing and the character celebrates ("Na you sabi!") and sends you to pick a game.
- On desktop, the jollof becomes a steaming 3D pot (Three.js), loaded only on capable devices. Phones keep the flat drawing.
- In "Got a game?", a danfo drives along a road as you scroll, lighting up each publish step it reaches.

**Quality:** light + dark themes (matching start.ng's), mobile first, fully respects reduced-motion (calm static version), only transform/opacity
animations, idle animations pause off-screen and on low-power devices, keyboard-accessible, and works without JS.

**Feedback I'd love:**
1. Does the Lagos/Naija theme feel right for start.ng, or too much?
2. Is any effect distracting, or is something missing a "wow" moment (does the 3D jollof pot earn its weight)?
3. How does it feel on your phone?
