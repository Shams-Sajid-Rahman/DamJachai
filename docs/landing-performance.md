# 3D landing page: performance and fallbacks

## How the scene is chosen (`client/src/lib/deviceTier.js`)

| Situation | What the visitor gets |
|-----------|-----------------------|
| Desktop or strong device | **Full** 3D: 3 test tubes, blood drop, microscope, 4 price orbs, sparkles, antialiasing, DPR up to 1.75 |
| Screen under 768 px, 4 or fewer CPU cores, or 4 GB RAM or less | **Lite** 3D: 1 tube, drop, 2 orbs, no sparkles, no antialiasing, DPR up to 1.25 |
| No WebGL, a software GPU (SwiftShader, llvmpipe), 2 or fewer cores, 2 GB RAM or less, or Save-Data on | **2D fallback**: CSS gradients and soft blobs only, and three.js is never downloaded |
| `prefers-reduced-motion: reduce` | The 3D renders **one static frame** (`frameloop="demand"`). Nothing floats or follows the mouse, scroll does not move the camera, and the count-up numbers jump straight to their final value |

For testing, add `?scene=full`, `?scene=lite`, `?scene=fallback` or `?scene=static` to the URL to force a mode.

## What keeps it fast

1. **Text first.** The headline, search bar and every section are plain HTML. The canvas is decoration
   (`aria-hidden`), so search engines and screen readers get all the content, and the LCP element is the `<h1>`,
   which is not animated.
2. **three.js loads lazily, in its own chunk.** `vendor-three` (about 250 kB gzipped) is only imported by `HeroScene`,
   through `React.lazy`. `vite.config.js` keeps Vite's preload helper out of that chunk, so no other page downloads it.
3. **Late start.** On desktop the 3D starts after `window.load`, when the browser is idle. On phones the 2D gradient
   shows first, and the lite 3D loads on the first scroll, touch or keypress, so the first paint stays fast.
4. **Capped pixel ratio.** DPR is capped at 1.75 or 1.25, and drei's `PerformanceMonitor` drops it to 1 when the
   frame rate falls.
5. **Paused when not visible.** An `IntersectionObserver` and `visibilitychange` switch the render loop to `never`
   when the story section is off screen or the tab is hidden.
6. **No re-renders on scroll.** Scroll progress and pointer position live in refs that `useFrame` reads every frame.
   Scrolling never triggers a React render.
7. **Cheap materials.** The glass is a transparent `MeshPhysicalMaterial` with clearcoat (no transmission pass), the
   glow is an additive back-face halo (no bloom post-processing), and there are no HDR environment maps or model files.
8. **Clean-up.** React Three Fiber disposes the geometries and materials declared in JSX on unmount. Geometries built in
   `useMemo` (the blood-drop lathe and the price-tag extrusion) are disposed in effect clean-ups. The WebGL context
   used for device detection is released straight away (`WEBGL_lose_context`).
9. **Non-blocking fonts.** The Google Fonts CSS is preloaded and applied on load (`media="print"` swap), with
   `display=swap`.
10. **No layout shift.** The full-height page loader keeps the footer below the fold while a lazy page loads.
11. **No request for anonymous visitors.** The session refresh only runs if this browser has logged in before.
12. **Vendor splitting.** React, the router, data libraries, i18n and three.js are separate long-cached chunks.

## Lighthouse (production build, `vite preview`, Lighthouse 12)

| Run | Performance | Accessibility | Best practices | SEO |
|-----|-------------|---------------|----------------|-----|
| Mobile (simulated Moto G, slow 4G) | **81** | 100 | 100 | 100 |
| Desktop | **95** | 100 | 100 | 100 |

Mobile metrics: FCP 2.2 s, LCP 4.5 s, TBT 110 ms, CLS 0.03.

I also tried loading the landing page eagerly instead of lazily. LCP fell to about 3.2 s, but the extra JavaScript
raised TBT to about 360 ms, so the score stayed the same. The lazy version was kept because it is lighter on the main
thread for low-end phones.

**Further gains, if needed:** pre-render the hero HTML at build time (SSG), so the headline paints before any JavaScript
runs. That would most likely bring mobile LCP under 2.5 s.
