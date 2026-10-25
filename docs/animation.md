# Goal

Add 80s blank-VHS-cover style motion design to my Astro CV site. Refactor the existing animations and the light/dark theme switch transition so they all use one coherent animation system.

The reference video is at `blank vhs covers were kinda beautiful.mp4` (102 s, 1920x1080, 60 fps). The site design is deliberately sober, so the animation is where it can get fancy and creative. Keep the content readable and the layout calm. The motion carries the personality.

# Study the reference first

Use ffmpeg to extract frames and look at them before writing any code. Contact sheets work well, e.g. `ffmpeg -ss 21 -i video.mp4 -t 13 -vf "fps=4,scale=480:-1,tile=6x4" sheet.png`. Use a higher fps on the fast moments to understand the easing.

My favourite parts, in priority order:

1. **0 to 10 s ("APHEX VIDEOCASSETTE")**: On a near-black background, a gold hairline draws in along a ~45° diagonal. Then a thick multicolour band (gold, orange, red, magenta, blue, green) sweeps in along the same diagonal. A small dark tab slides along the band and wipes in a label that is rotated to follow the stripe. Finally the band breaks apart into separate stripes of different weights, and thin parallel hairlines multiply across the screen.

2. **21 to 34 s (a continuous sequence)**:
    - A black diagonal band wipes across white.
    - Three thin stripes (red, green, blue) sit at a shallow angle (~-15°). A brand label ("SUPERTAPE / T-120 2-4-6 HOUR VIDEOCASSETTE") slides in along the stripe direction, with a slow camera drift.
    - The stripes spread apart, flatten toward horizontal and thicken. The background turns into cream ruled paper (the "maxell 120" shot), and the stripes become horizontal bars with black separators.
    - On white ("Dynamicron E-180"), the bars morph: colours swap and the band count grows from 3 to 6 in a warm gradient (gold, orange, red, magenta, purple), while the whole thing pans horizontally.
    - In the "Polaroid SUPERCOLOR" shot, a short stack of bars cycles its colours, and colour blocks rise up to form a tri-colour logo mark.

   The key idea is **continuity**: stripes persist from one shot to the next and morph (angle, thickness, count, colour, background) instead of hard-cutting.

3. **Everything else in the video** is fair game for inspiration. Explore it: diagonal block wipes, rotating colour fields, the perspective grid, glowing light beams and prisms, neon curves. Pick what fits and suggest ideas I haven't asked for.

Do not reproduce the real brand names or logos (Sony, Maxell, TDK, Polaroid...). Invent our own labels in the same spirit, based on my identity and stack. For example: "CRTY", "SRE-180", "T-120 DEVOPS", "KUBE-HQ", "EXTRA HIGH UPTIME".

# Existing code

- Before proposing anything, audit what is already there: the current animations (CSS, scripts, libraries), the theme system (how light/dark is stored, applied and toggled) and the existing theme-switch transition.
- Refactor all of it into the new system. Leave no duplicate or orphaned animation code behind.

# Theme switch

I have light and dark themes, and switching between them should be a showpiece moment. One idea: a burst of diagonal VHS stripes sweeps across the viewport, and the page underneath is revealed in the new theme. Use the View Transitions API (`document.startViewTransition`) with clip-path or mask animations where it's supported, and a simpler fallback where it isn't. Each theme needs its own stripe palette, so the stripes look right on both near-black and off-white backgrounds. The ruled cream paper from the video could inspire the light theme. You're free to propose something better.

# Technical direction

- **GSAP** (free, including SplitText, ScrollTrigger and CustomEase) for timelines. Use inline SVG or CSS transforms for the stripes. Astro renders the markup at build time and plain `<script>` modules add the motion. Don't add React/Vue islands just for animation.
- **Three.js** only if a 3D shot is truly worth it (prism, grid). If so, put it in a lazily loaded island (`client:visible`) and justify the weight.
- Keep text as real DOM text, never baked into SVG paths or canvas, for accessibility and SEO.
- Put stripe palettes, angles and easings in one shared module or in CSS custom properties, so every animation feels like the same "tape brand".
- Use a snappy CustomEase (fast start, hard stop) as the house ease.
- Respect `prefers-reduced-motion`. The static end state of every scene should still look designed, not broken.
- If the site uses Astro's `<ClientRouter />`, set animations up on `astro:page-load` and clean them up on `astro:before-swap`.
- Performance: animate only transform, opacity and clip-path. No layout shift. Pause off-screen loops. Check that the Lighthouse performance score doesn't regress meaningfully.
- Mobile must work: rethink the stripe angles and density for portrait screens rather than just scaling them down.

# Process

1. Study the video and audit the repo, then come back with a short plan: which animation goes where (hero intro, section reveals on scroll, hover states, theme switch, page transitions...), what gets refactored or removed, and any creative ideas beyond my list. Wait for my go-ahead before implementing.
2. Implement in small steps. Start with the hero intro based on the 0 to 10 s shot, then the 21 to 34 s morphing sequence (perhaps as a scroll-driven story across the CV sections), then the theme switch.
3. Verify visually: run the dev server, record or screenshot the animations with Playwright at a few timestamps, in both themes and at desktop and mobile widths, and compare them against the reference frames. Iterate on timing and easing until it feels like the video, not just looks like it.