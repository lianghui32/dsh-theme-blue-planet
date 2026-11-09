/**
 * Azure Planet · 蔚蓝星球 — Client half.
 *
 * One static starfield and one planet horizon sit behind the interface at
 * `z-index: -1`; the app's own panels are translucent, so the scene shows
 * through them. Colour work is done by overriding the same-named
 * `--dsw-alias-*` design tokens the interface already reads — no component
 * CSS is patched.
 *
 * The scene is deliberately cheap to composite — every moving part is an
 * opacity / transform animation, no filters or shadows are animated:
 *   - stars twinkle and the whole starfield drifts;
 *   - nebulae breathe and wander;
 *   - the planet floats while its cloud deck slowly churns;
 *   - the moon bobs, the atmosphere breathes, a comet crosses the sky;
 *   - every animation pauses while the document is hidden.
 *
 * The theme is a skin: installing it applies it; the small bottom-right
 * palette picks the energy level — 全辉 (everything moves, full glow),
 * 静谧 (dimmed and still, for reading), 关闭 (scene hidden). The choice
 * is remembered in localStorage.
 */

window.__ModuleLoader__.load({
  id: 'dsh-theme-blue-planet',
  factory() {
    const STORE_KEY = 'dsh-theme-blue-planet/mode'
const MIGRATE_KEY = 'dsh-theme-blue-planet/mode-v2'
    const STAGE_ID = 'bp-stage'
    const STYLE_ID = 'bp-style'
    const HUD_ID = 'bp-hud'
    const MODES = ['full', 'calm', 'off']
    const MODE_LABEL = { full: '全辉', calm: '静谧', off: '关闭' }

    /* ------------------------------------------------------------------ */
    /* Palette — the app's semantic tokens, re-tinted to deep ocean blue.  */
    /* Written for both palettes so the skin survives a light/dark switch. */
    /* ------------------------------------------------------------------ */
    const TOKENS_CSS = `
html body, html body[data-ds-dark-theme] {
  --dsw-alias-bg-base: rgba(4, 11, 25, 0.58) !important;
  --dsw-alias-bg-layer-1: rgba(7, 17, 36, 0.62) !important;
  --dsw-alias-bg-layer-2: rgba(11, 24, 49, 0.72) !important;
  --dsw-alias-bg-layer-3: rgba(15, 32, 63, 0.82) !important;
  --dsw-alias-bg-overlay: rgba(3, 8, 18, 0.94) !important;
  --dsw-alias-bg-module-platform: rgba(8, 19, 40, 0.66) !important;
  --dsw-alias-bg-multi-select: rgba(70, 150, 255, 0.20) !important;
  --dsw-alias-bg-skeleton: rgba(130, 190, 255, 0.10) !important;
  --dsw-alias-bg-mask-1: rgba(1, 5, 12, 0.56) !important;
  --dsw-alias-bg-mask-2: rgba(1, 5, 12, 0.32) !important;
  --dsw-alias-bg-mask-3: rgba(1, 5, 12, 0.74) !important;
  --dsw-alias-bg-mask-photo: rgba(1, 4, 10, 0.92) !important;

  --dsw-alias-label-primary: #e9f3ff !important;
  --dsw-alias-label-primary-bluish: #dcebff !important;
  --dsw-alias-label-primary-dimmed: #c3d5ea !important;
  --dsw-alias-label-secondary: #b7c9e0 !important;
  --dsw-alias-label-tertiary: #93a9c6 !important;
  --dsw-alias-label-caption: #7c93b2 !important;
  --dsw-alias-label-dimmed: #6b7f9c !important;
  --dsw-alias-label-primary-foreground: #05101f !important;
  --dsw-alias-label-primary-inverted: #061426 !important;
  --dsw-alias-label-shimmer: rgba(208, 234, 255, 0.50) !important;
  --dsw-alias-label-deep-diving: #8fd0ff !important;
  --dsw-alias-label-deep-diving-shimmer: rgba(190, 230, 255, 0.75) !important;
  --dsw-alias-label-document-preview: #b6cbe3 !important;

  --dsw-alias-border-inverted: rgba(2, 8, 18, 0.22) !important;
  --dsw-alias-border-inverted2: rgba(2, 8, 18, 0.38) !important;
  --dsw-alias-border-l1: rgba(132, 186, 255, 0.12) !important;
  --dsw-alias-border-l2: rgba(132, 186, 255, 0.18) !important;
  --dsw-alias-border-l3: rgba(140, 196, 255, 0.26) !important;
  --dsw-alias-border-l4: rgba(150, 204, 255, 0.34) !important;

  --dsw-alias-brand-primary: #4da3ff !important;
  --dsw-alias-brand-primary-invert: #dceeff !important;
  --dsw-alias-brand-primary-new-colorprimary-new-color: #4da3ff !important;
  --dsw-alias-brand-text: #8cc6ff !important;
  --dsw-alias-link: #7cc4ff !important;

  --dsw-alias-button-primary-fill: #2f7fe0 !important;
  --dsw-alias-button-primary-hover: #4b9bf5 !important;
  --dsw-alias-button-primary-dimmed: rgba(47, 127, 224, 0.35) !important;
  --dsw-alias-button-contrast-fill: #cfe6ff !important;
  --dsw-alias-button-elevated-fill: rgba(12, 27, 54, 0.80) !important;
  --dsw-alias-button-floating-fill: rgba(8, 20, 42, 0.78) !important;
  --dsw-alias-button-floating-hover: rgba(15, 33, 64, 0.88) !important;
  --dsw-alias-button-info-fill: rgba(90, 169, 255, 0.18) !important;
  --dsw-alias-button-info-hover: rgba(90, 169, 255, 0.28) !important;
  --dsw-alias-button-ghost-active-fill: rgba(90, 169, 255, 0.16) !important;
  --dsw-alias-button-ghost-active-hover: rgba(90, 169, 255, 0.24) !important;
  --dsw-alias-button-ghost-active-border: rgba(110, 190, 255, 0.42) !important;
  --dsw-alias-button-tool-bar-fill: rgba(140, 196, 255, 0.07) !important;
  --dsw-alias-button-tool-bar-fill-invisible: transparent !important;
  --dsw-alias-button-tool-bar-hover: rgba(140, 196, 255, 0.15) !important;

  --dsw-alias-interactive-bg-hover: rgba(120, 180, 255, 0.10) !important;
  --dsw-alias-interactive-bg-hover-solid: rgba(20, 42, 78, 0.86) !important;
  --dsw-alias-interactive-bg-hover-accent: rgba(90, 169, 255, 0.18) !important;
  --dsw-alias-interactive-bg-hover-danger: rgba(255, 107, 122, 0.16) !important;
  --dsw-alias-interactive-bg-active: rgba(120, 180, 255, 0.17) !important;

  --dsw-alias-state-business-primary: #5aa9ff !important;
  --dsw-alias-state-business-tertiary: rgba(90, 169, 255, 0.22) !important;
  --dsw-alias-state-success-primary: #4fe0a0 !important;
  --dsw-alias-state-success-secondary: rgba(79, 224, 160, 0.16) !important;
  --dsw-alias-state-success-tertiary: rgba(79, 224, 160, 0.10) !important;
  --dsw-alias-state-error-primary: #ff6b7a !important;
  --dsw-alias-state-error-secondary: rgba(255, 107, 122, 0.16) !important;
  --dsw-alias-state-warn-primary: #ffc861 !important;
  --dsw-alias-state-warn-secondary: rgba(255, 200, 97, 0.16) !important;
  --dsw-alias-state-warn-tertiary: rgba(255, 200, 97, 0.10) !important;
  --dsw-alias-state-warn-label: #ffd489 !important;
  --dsw-alias-state-idle-primary: #6f86a4 !important;

  --dsw-alias-markdown-code-block: rgba(2, 9, 21, 0.80) !important;
  --dsw-alias-markdown-code-block-banner: rgba(140, 196, 255, 0.06) !important;
  --dsw-alias-markdown-inline-code: rgba(90, 169, 255, 0.14) !important;
  --dsw-alias-markdown-tag: rgba(90, 169, 255, 0.16) !important;
  --dsw-alias-markdown-citation: rgba(90, 169, 255, 0.12) !important;
  --dsw-alias-markdown-placeholder: rgba(140, 196, 255, 0.08) !important;
  --dsw-alias-markdown-code-segment-selected: rgba(90, 169, 255, 0.20) !important;
  --dsw-alias-markdown-code-segment-unselected: rgba(255, 255, 255, 0.04) !important;

  --dsw-alias-scrollbar-bg-l1: rgba(140, 196, 255, 0.12) !important;
  --dsw-alias-scrollbar-bg-l2: rgba(140, 196, 255, 0.16) !important;
  --dsw-alias-scrollbar-hover-l1: rgba(150, 210, 255, 0.28) !important;
  --dsw-alias-scrollbar-hover-l2: rgba(150, 210, 255, 0.32) !important;

  --dsw-alias-toast-bg: rgba(6, 16, 34, 0.94) !important;
  --dsw-alias-toast-label: #e9f3ff !important;
  --dsw-alias-tooltip-bg: rgba(6, 16, 34, 0.94) !important;
  --dsw-alias-tooltip-key-bg: rgba(140, 196, 255, 0.14) !important;

  --dsw-alias-settings-card-fill: rgba(7, 18, 38, 0.58) !important;
  --dsw-alias-settings-card-stroke: rgba(140, 196, 255, 0.18) !important;
  --dsw-alias-switch-thumb: #dceeff !important;
  --dsw-alias-turn-trigger-bg: rgba(140, 196, 255, 0.07) !important;
  --dsw-alias-turn-trigger-bg-hover: rgba(140, 196, 255, 0.14) !important;

  --dsw-menu-surface-fill: rgba(5, 14, 30, 0.92) !important;
  --dsw-specific-menu: rgba(5, 14, 30, 0.94) !important;
  --dsw-alias-menu-group-header-fill: rgba(4, 12, 27, 0.95) !important;
  --dsw-alias-menu-icon: #c8dbef !important;
  --dsw-menu-backdrop-filter: blur(18px) saturate(1.15) !important;

  --dsw-specific-bubble: rgba(90, 169, 255, 0.13) !important;
  --dsw-specific-bubble-highlight: rgba(90, 169, 255, 0.22) !important;
  --dsw-specific-input-major: rgba(4, 13, 29, 0.76) !important;
  --dsw-specific-login-input: rgba(4, 12, 27, 0.70) !important;
  --dsw-specific-selector: rgba(15, 32, 62, 0.92) !important;
  --dsw-specific-sidebar-fill: rgba(2, 8, 18, 0.62) !important;
  --dsw-specific-sidebar-nav-item-active: rgba(90, 169, 255, 0.15) !important;
  --dsw-specific-sidebar-nav-item-active-accent: #5aa9ff !important;
  --dsw-specific-sidebar-nav-item-hover: rgba(140, 196, 255, 0.09) !important;
  --dsw-specific-tip: rgba(9, 22, 44, 0.92) !important;

  --dsw-focus-ring-color: rgba(110, 190, 255, 0.90) !important;
  --dsw-elevation-stroke-color: rgba(140, 196, 255, 0.22) !important;
}

/* The dark static scale is neutral grey; nudge it to the same ocean axis so
   the few components that read static tokens directly stay on-theme. */
html body[data-ds-dark-theme] {
  --dsw-static-neutral-bluish-1000: #04070f;
  --dsw-static-neutral-bluish-950: #04070f;
  --dsw-static-neutral-bluish-900: #061020;
  --dsw-static-neutral-bluish-875: #08152a;
  --dsw-static-neutral-bluish-850: #0b1b35;
  --dsw-static-neutral-bluish-800: #102544;
  --dsw-static-neutral-bluish-750: #16315a;
  --dsw-static-neutral-bluish-700: #24466f;
  --dsw-static-neutral-bluish-600: #6d8cb5;
  --dsw-static-neutral-bluish-500: #8fa9c9;
  --dsw-static-neutral-bluish-400: #a9c0da;
  --dsw-static-neutral-bluish-300: #c6d8ec;
  --dsw-static-neutral-bluish-200: #dbe8f7;
  --dsw-static-neutral-bluish-150: #e6f0fb;
  --dsw-static-neutral-bluish-100: #eef5ff;
  --dsw-static-neutral-bluish-75: #f4f8ff;
  --dsw-static-neutral-bluish-60: #f8fbff;
  --dsw-static-neutral-bluish-50: #f9fcff;
  --dsw-static-neutral-200: #6d8cb5;
  --dsw-static-neutral-300: #8fa9c9;
  --dsw-static-neutral-550: #24466f;
  --dsw-static-neutral-600: #1b3a63;
  --dsw-static-neutral-700: #102544;
  --dsw-static-neutral-850: #061020;
}
`

    /* ------------------------------------------------------------------ */
    /* Scene — fixed backdrop behind the interface.                        */
    /* ------------------------------------------------------------------ */
    const SCENE_CSS = `
html {
  background-color: #02050c !important;
  color-scheme: dark !important;
}
html body {
  background-color: transparent !important;
  background-image: none !important;
}
#root {
  background-color: transparent !important;
  background-image: none !important;
}
html body div[class*="centerCol"] div[class$="_root"] {
  background-color: transparent !important;
}
/* The app frame is a full-viewport scrim; at its stock opacity it multiplies
   the whole scene down to ~38%, which is why the planet looked like a black
   ball. Keep just enough tint to hold the edges, let the art through. */
html body div[class$="_frame"] {
  background-color: rgba(3, 9, 20, 0.10) !important;
  background-image: none !important;
}
::selection {
  background: rgba(90, 169, 255, 0.34) !important;
  color: #f2f9ff !important;
}

/* Panels sit above the planet; keep them translucent enough that the limb
   reads through, dark enough for long-form text. */
html body div[class*="centerCol"] {
  background: transparent !important;
}
html body div[class*="sidebarCol"] {
  background: linear-gradient(180deg,
    rgba(2, 8, 18, 0.64) 0%,
    rgba(2, 7, 16, 0.76) 100%) !important;
}

#${STAGE_ID} {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
}
html[data-bp-mode="off"] #${STAGE_ID} { display: none; }

.bp-layer { position: absolute; inset: 0; }

/* Deep space: three soft glows over an almost-black blue. */
.bp-sky {
  background:
    radial-gradient(120% 92% at 80% 82%, rgba(30, 96, 176, 0.50) 0%, rgba(10, 42, 92, 0.28) 36%, rgba(3, 12, 30, 0) 68%),
    radial-gradient(86% 66% at 12% 8%, rgba(22, 70, 132, 0.34) 0%, rgba(9, 32, 68, 0) 62%),
    radial-gradient(92% 70% at 50% 112%, rgba(10, 40, 88, 0.55) 0%, rgba(4, 16, 38, 0) 64%),
    linear-gradient(180deg, #01030a 0%, #030814 38%, #04101f 68%, #02060d 100%);
}

/* Two nebula wisps, kept soft and edge-free. */
.bp-nebula { position: absolute; border-radius: 50%; filter: blur(6vmin); }
.bp-n1 {
  width: 70vmin; height: 44vmin; left: -8vmin; top: -6vmin;
  background: radial-gradient(closest-side, rgba(46, 130, 220, 0.20), rgba(20, 70, 150, 0) 74%);
  animation: bp-n1-drift 52s ease-in-out infinite alternate;
}
@keyframes bp-n1-drift {
  from { transform: rotate(-18deg) translate3d(0, 0, 0) scale(1); }
  to { transform: rotate(-14deg) translate3d(4%, -3%, 0) scale(1.08); }
}
.bp-n2 {
  width: 90vmin; height: 52vmin; right: -10vmin; top: 18vmin;
  background: radial-gradient(closest-side, rgba(30, 90, 170, 0.16), rgba(10, 40, 100, 0) 76%);
  animation: bp-n2-drift 68s ease-in-out infinite alternate;
}
@keyframes bp-n2-drift {
  from { transform: rotate(24deg) translate3d(0, 0, 0) scale(1); }
  to { transform: rotate(28deg) translate3d(-3.5%, 3%, 0) scale(1.06); }
}

.bp-stars { position: absolute; inset: -3.5%; animation: bp-stars-drift 44s ease-in-out infinite alternate; }
.bp-star-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
@keyframes bp-stars-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-4%, 2.2%, 0); }
}
.bp-tw {
  animation: bp-tw var(--bp-dur, 3.4s) ease-in-out var(--bp-delay, 0s) infinite;
}
@keyframes bp-tw {
  0%, 100% { opacity: var(--bp-o, 0.6); }
  50% { opacity: calc(var(--bp-o, 0.6) * 0.12); }
}

/* A gas giant anchored in the lower-right corner — almost the whole sphere
   is on screen so the limb and terminator read as a real ball, and the
   whole body drifts slowly as if hanging in space. */
.bp-planet {
  position: absolute;
  right: 1vmin;
  bottom: 1vmin;
  width: 60vmin;
  height: 60vmin;
  filter: saturate(1.05);
  animation: bp-float 18s ease-in-out infinite alternate;
}
@keyframes bp-float {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-1.6vmin, -2.8vmin, 0); }
}
.bp-atmo {
  position: absolute;
  inset: 11%;
  border-radius: 50%;
  box-shadow: 0 0 1.2vmin rgba(120, 200, 255, 0.16);
  opacity: 0.5;
}
@keyframes bp-breathe {
  0%, 100% { opacity: 0.82; }
  50% { opacity: 1; }
}
.bp-disc {
  position: absolute;
  inset: 11%;
  z-index: 1;
  border-radius: 50%;
  /* The ball is a rendered sphere (Lambert shading, limb darkening,
     latitude belts), not a pile of gradients: gradients cannot produce a
     convincing terminator, which is why earlier versions read as a blob. */
  background-image: url("data:image/webp;base64,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");
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

/* The cloud deck churns: a slow shear across the visible face. The wrapper
   is oversized (inset -14%) so the drift never exposes the disc edge. */
.bp-surface {
  position: absolute;
  inset: -14%;
  animation: bp-surface-drift 110s ease-in-out infinite alternate;
}
@keyframes bp-surface-drift {
  from { transform: translate3d(-3.2%, 0.6%, 0) rotate(-7.5deg); }
  to { transform: translate3d(3.2%, -0.6%, 0) rotate(-4.5deg); }
}

/* Cloud bands, softened; screen blend keeps them luminous. */
.bp-bands { display: none; }
.bp-clouds { display: none; }
.bp-shade { display: none; }
.bp-rim {
  position: absolute;
  inset: 11%;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(150, 205, 250, 0.14);
}

/* A tilted icy ring. The lower half is a second copy clipped to pass in
   front of the disc; the upper half stays behind it. */
.bp-ring {
  animation: bp-ring-tilt 40s ease-in-out infinite alternate;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.bp-ring-back {
  z-index: 0;
  opacity: 0.55;
  filter: drop-shadow(0 0 0.7vmin rgba(120, 200, 255, 0.35));
}
.bp-ring-front {
  z-index: 2;
  opacity: 0.52;
  clip-path: inset(54% -30% -30% -30%);
}

.bp-moon {
  position: absolute;
  left: 16%;
  top: 34%;
  width: 12.5vmin;
  height: 12.5vmin;
  border-radius: 50%;
  opacity: 0.92;
  /* Rendered sphere with a crater field: a flat gradient read as a square
     patch at small sizes. */
  background-image: url("data:image/webp;base64,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");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  animation: bp-moon-float 22s ease-in-out infinite alternate;
}
@keyframes bp-ring-tilt {
  from { transform: rotate(-1.1deg); }
  to { transform: rotate(1.1deg); }
}
@keyframes bp-moon-float {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(2.4vmin, -2.8vmin, 0); }
}

/* One comet, once every ~16s, far from the reading column. */
.bp-comet {
  position: absolute;
  left: 4%;
  top: 24%;
  width: 13vmin;
  height: 1px;
  opacity: 0;
  background: linear-gradient(90deg,
    rgba(170, 220, 255, 0) 0%,
    rgba(200, 238, 255, 0.55) 62%,
    rgba(255, 255, 255, 0.95) 100%);
  box-shadow: 0 0 0.5vmin rgba(180, 230, 255, 0.55);
  transform-origin: 100% 50%;
  animation: bp-shoot 9s linear 2s infinite;
}
@keyframes bp-shoot {
  0%, 91%, 100% { opacity: 0; transform: translate3d(0, 0, 0) rotate(16deg); }
  92% { opacity: 0.75; }
  98% { opacity: 0; transform: translate3d(62vw, 18vh, 0) rotate(16deg); }
}

/* Legibility scrim: dims the art, never the text. */
.bp-veil {
  background:
    radial-gradient(118% 88% at 50% 44%,
      rgba(1, 4, 10, 0.02) 0%,
      rgba(1, 4, 10, 0.10) 56%,
      rgba(1, 4, 10, 0.34) 100%),
    linear-gradient(180deg,
      rgba(1, 4, 10, 0.12) 0%,
      rgba(1, 4, 10, 0.04) 30%,
      rgba(1, 4, 10, 0.16) 100%);
}

/* Mode switching eases instead of snapping. */
#${STAGE_ID} { transition: opacity 1.2s ease; }

/* 静谧: the scene steps back — clearly dimmer, and still (no drift, no
   twinkle, no comet). Reads as a different state at a glance. */
html[data-bp-mode="calm"] #${STAGE_ID} { opacity: 0.42; }
html[data-bp-mode="calm"] .bp-comet { display: none; }
html[data-bp-mode="calm"] .bp-tw,
html[data-bp-mode="calm"] .bp-atmo,
html[data-bp-mode="calm"] .bp-stars,
html[data-bp-mode="calm"] .bp-n1,
html[data-bp-mode="calm"] .bp-n2,
html[data-bp-mode="calm"] .bp-moon,
html[data-bp-mode="calm"] .bp-ring,
html[data-bp-mode="calm"] .bp-planet,
html[data-bp-mode="calm"] .bp-surface {
  animation-play-state: paused !important;
}

/* Hidden document: freeze every animation. */
html.bp-paused .bp-tw,
html.bp-paused .bp-atmo,
html.bp-paused .bp-comet,
html.bp-paused .bp-stars,
html.bp-paused .bp-n1,
html.bp-paused .bp-n2,
html.bp-paused .bp-moon,
html.bp-paused .bp-ring,
html.bp-paused .bp-planet,
html.bp-paused .bp-surface {
  animation-play-state: paused !important;
}

@media (prefers-reduced-motion: reduce) {
  .bp-tw, .bp-atmo, .bp-comet, .bp-stars,
  .bp-n1, .bp-n2, .bp-moon, .bp-planet, .bp-surface {
    animation: none !important;
  }
  .bp-comet { display: none; }
}

/* ---------------------------------------------------------------------- */
/* The little mode chip; part of the theme, not of the app chrome.        */
/* ---------------------------------------------------------------------- */
#${HUD_ID} {
  position: fixed;
  right: 14px;
  bottom: 12px;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px;
  border-radius: 999px;
  opacity: 0.52;
  transition: opacity 0.25s ease;
  font: 500 11px/1 "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  color: #a9c6e8;
  -webkit-user-select: none;
  user-select: none;
}
#${HUD_ID}:hover, #${HUD_ID}:focus-within { opacity: 1; }
#${HUD_ID} .bp-hud-label {
  padding: 0 4px 0 7px;
  letter-spacing: 0.08em;
  color: #7f9dbc;
}
#${HUD_ID} button {
  appearance: none;
  border: 1px solid rgba(130, 190, 255, 0.18);
  background: rgba(4, 12, 26, 0.52);
  color: inherit;
  border-radius: 999px;
  padding: 6px 9px;
  font: inherit;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}
#${HUD_ID} button:hover {
  color: #e9f3ff;
  border-color: rgba(130, 200, 255, 0.42);
}
#${HUD_ID} button[aria-pressed="true"] {
  color: #eaf5ff;
  border-color: rgba(110, 195, 255, 0.55);
  background: rgba(38, 104, 184, 0.46);
}
html[data-bp-mode="off"] #${HUD_ID} { opacity: 0.72; }
`

    const CSS = `${TOKENS_CSS}\n${SCENE_CSS}`

    /* ------------------------------------------------------------------ */
    /* Deterministic helpers.                                             */
    /* ------------------------------------------------------------------ */
    function mulberry32(seed) {
      let a = seed >>> 0
      return function random() {
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }

    function readMode() {
      try {
        const stored = window.localStorage.getItem(STORE_KEY)
        if (MODES.includes(stored)) {
          // v0.1.0 的“静谧”和全辉几乎没有区别，升级到 v0.2.0 时把旧的
          // calm 视为残留状态重置一次（只跑一次，之后的选择不再干涉）。
          if (stored === 'calm' && !window.localStorage.getItem(MIGRATE_KEY)) {
            window.localStorage.setItem(MIGRATE_KEY, '1')
            window.localStorage.setItem(STORE_KEY, 'full')
            return 'full'
          }
          return stored
        }
      } catch (err) { /* storage may be unavailable */ }
      const reduced = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return reduced ? 'calm' : 'full'
    }

    function writeMode(mode) {
      try { window.localStorage.setItem(STORE_KEY, mode) } catch (err) { /* ignore */ }
    }

    function starSvg() {
      const rand = mulberry32(0x5eed51a7)
      const tints = ['#ffffff', '#dcefff', '#bcdcff', '#9cc7ff', '#ffe8c6']
      let dots = ''
      for (let i = 0; i < 250; i += 1) {
        const x = (rand() * 1600).toFixed(1)
        const y = (rand() * 1000).toFixed(1)
        const r = (0.38 + Math.pow(rand(), 2.2) * 1.55).toFixed(2)
        const tint = tints[Math.floor(rand() * tints.length)]
        const opacity = (0.12 + rand() * 0.72).toFixed(2)
        if (i % 3 === 0) {
          const duration = (3.6 + rand() * 5.8).toFixed(2)
          const delay = (-rand() * 8).toFixed(2)
          dots += `<circle class="bp-tw" cx="${x}" cy="${y}" r="${r}" fill="${tint}" opacity="${opacity}" style="--bp-o:${opacity};--bp-dur:${duration}s;--bp-delay:${delay}s"></circle>`
        } else {
          dots += `<circle cx="${x}" cy="${y}" r="${r}" fill="${tint}" opacity="${opacity}"></circle>`
        }
      }

      let bright = ''
      for (let i = 0; i < 5; i += 1) {
        const x = (70 + rand() * 1460).toFixed(1)
        const y = (50 + rand() * 660).toFixed(1)
        const o = (0.45 + rand() * 0.4).toFixed(2)
        bright += `<g class="bp-tw" opacity="${o}" fill="#eef8ff" style="--bp-o:${o};--bp-dur:${(5 + rand() * 4).toFixed(2)}s;--bp-delay:${(-rand() * 6).toFixed(2)}s">
          <circle cx="${x}" cy="${y}" r="1.5"></circle>
          <rect x="${x - 5.5}" y="${y - 0.4}" width="11" height="0.8" opacity="0.55"></rect>
          <rect x="${x - 0.4}" y="${y - 5.5}" width="0.8" height="11" opacity="0.55"></rect>
        </g>`
      }

      return `<svg class="bp-star-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <radialGradient id="bp-glow">
            <stop offset="0" stop-color="#dff2ff" stop-opacity="0.55"></stop>
            <stop offset="1" stop-color="#dff2ff" stop-opacity="0"></stop>
          </radialGradient>
        </defs>
        <g>${dots}</g>
        <circle cx="260" cy="210" r="18" fill="url(#bp-glow)" opacity="0.5"></circle>
        ${bright}
      </svg>`
    }

    function ringSvg(position) {
      return `<svg class="bp-ring bp-ring-${position}" viewBox="0 0 1000 1000" aria-hidden="true">
        <defs>
          <linearGradient id="bp-ring-grad-${position}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#9fd8ff" stop-opacity="0"></stop>
            <stop offset="0.16" stop-color="#9fd8ff" stop-opacity="0.75"></stop>
            <stop offset="0.36" stop-color="#e2f5ff" stop-opacity="0.30"></stop>
            <stop offset="0.54" stop-color="#7fc4ff" stop-opacity="0.72"></stop>
            <stop offset="0.7" stop-color="#d6efff" stop-opacity="0.28"></stop>
            <stop offset="0.87" stop-color="#8fd0ff" stop-opacity="0.60"></stop>
            <stop offset="1" stop-color="#8fd0ff" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <g transform="rotate(-20 500 500)">
          <ellipse cx="500" cy="500" rx="560" ry="140" fill="none"
            stroke="url(#bp-ring-grad-${position})" stroke-width="7"></ellipse>
          <ellipse cx="500" cy="500" rx="514" ry="124" fill="none"
            stroke="url(#bp-ring-grad-${position})" stroke-width="3.5" opacity="0.9"></ellipse>
          <ellipse cx="500" cy="500" rx="590" ry="152" fill="none"
            stroke="url(#bp-ring-grad-${position})" stroke-width="2.4" opacity="0.65"></ellipse>
        </g>
      </svg>`
    }

    function stageHtml() {
      return `<div class="bp-layer bp-sky"></div>
        <div class="bp-nebula bp-n1"></div>
        <div class="bp-nebula bp-n2"></div>
        <div class="bp-layer bp-stars">${starSvg()}</div>
        <div class="bp-moon"></div>
        <div class="bp-planet">
          <div class="bp-atmo"></div>
          ${ringSvg('back')}
          <div class="bp-disc">
            <div class="bp-surface">
              <div class="bp-bands"></div>
              <div class="bp-clouds"></div>
            </div>
            <div class="bp-shade"></div>
            <div class="bp-rim"></div>
          </div>
          ${ringSvg('front')}
        </div>
        <div class="bp-comet"></div>
        <div class="bp-layer bp-veil"></div>`
    }

    function buildHud(onPick, initial) {
      const hud = document.createElement('div')
      hud.id = HUD_ID
      hud.setAttribute('role', 'group')
      hud.setAttribute('aria-label', '蔚蓝星球主题动效')

      const label = document.createElement('span')
      label.className = 'bp-hud-label'
      label.textContent = '星球'
      hud.appendChild(label)

      const buttons = []
      for (const mode of MODES) {
        const button = document.createElement('button')
        button.type = 'button'
        button.dataset.mode = mode
        button.textContent = MODE_LABEL[mode]
        button.setAttribute('aria-pressed', String(mode === initial))
        button.addEventListener('click', () => onPick(mode))
        hud.appendChild(button)
        buttons.push(button)
      }

      return {
        node: hud,
        sync(active) {
          for (const button of buttons) {
            button.setAttribute('aria-pressed', String(button.dataset.mode === active))
          }
        },
      }
    }

    /* ------------------------------------------------------------------ */
    /* Mount / dispose.                                                   */
    /* ------------------------------------------------------------------ */
    function mount() {
      const doc = document
      const html = doc.documentElement
      const body = doc.body
      const disposers = []

      const style = doc.createElement('style')
      style.id = STYLE_ID
      style.textContent = CSS
      doc.head.appendChild(style)
      disposers.push(() => style.remove())

      const stage = doc.createElement('div')
      stage.id = STAGE_ID
      stage.setAttribute('aria-hidden', 'true')
      stage.innerHTML = stageHtml()
      body.insertBefore(stage, body.firstChild)
      disposers.push(() => stage.remove())

      /* Force the dark palette: this skin is a night scene. */
      const hadDark = body.hasAttribute('data-ds-dark-theme')
      const priorScheme = html.style.colorScheme
      html.style.colorScheme = 'dark'
      if (!hadDark) body.setAttribute('data-ds-dark-theme', '')

      const enforce = () => {
        if (!body.hasAttribute('data-ds-dark-theme')) body.setAttribute('data-ds-dark-theme', '')
        if (html.style.colorScheme !== 'dark') html.style.colorScheme = 'dark'
      }
      const observer = new MutationObserver(enforce)
      observer.observe(body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
      observer.observe(html, { attributes: true, attributeFilter: ['style'] })
      disposers.push(() => {
        observer.disconnect()
        if (!hadDark) body.removeAttribute('data-ds-dark-theme')
        html.style.colorScheme = priorScheme || ''
      })

      /* Mode chip. */
      let mode = readMode()
      const hud = buildHud((next) => setMode(next), mode)
      body.appendChild(hud.node)
      disposers.push(() => hud.node.remove())

      function setMode(next) {
        mode = MODES.includes(next) ? next : 'full'
        html.setAttribute('data-bp-mode', mode)
        writeMode(mode)
        hud.sync(mode)
      }
      setMode(mode)
      disposers.push(() => html.removeAttribute('data-bp-mode'))

      /* Pause the scene while the document is hidden. */
      const onVisibility = () => {
        html.classList.toggle('bp-paused', doc.hidden)
      }
      doc.addEventListener('visibilitychange', onVisibility)
      onVisibility()
      disposers.push(() => {
        doc.removeEventListener('visibilitychange', onVisibility)
        html.classList.remove('bp-paused')
      })
return () => {
        for (const off of disposers.reverse()) {
          try { off() } catch (err) { /* keep unwinding */ }
        }
      }
    }

    return {
      name: 'blue-planet-theme',
      inject: [],
      apply(ctx) {
        ctx.effect(() => {
          if (typeof document === 'undefined' || !document.body) return () => {}
          return mount()
        })
      },
    }
  },
})
