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
::selection {
  background: rgba(90, 169, 255, 0.34) !important;
  color: #f2f9ff !important;
}

/* Panels sit above the planet; keep them translucent enough that the limb
   reads through, dark enough for long-form text. */
html body div[class*="centerCol"] {
  background: linear-gradient(180deg,
    rgba(4, 12, 26, 0.22) 0%,
    rgba(3, 10, 22, 0.32) 52%,
    rgba(2, 8, 18, 0.44) 100%) !important;
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
  animation: bp-n1-drift 150s ease-in-out infinite alternate;
}
@keyframes bp-n1-drift {
  from { transform: rotate(-18deg) translate3d(0, 0, 0) scale(1); }
  to { transform: rotate(-14deg) translate3d(4%, -3%, 0) scale(1.08); }
}
.bp-n2 {
  width: 90vmin; height: 52vmin; right: -10vmin; top: 18vmin;
  background: radial-gradient(closest-side, rgba(30, 90, 170, 0.16), rgba(10, 40, 100, 0) 76%);
  animation: bp-n2-drift 190s ease-in-out infinite alternate;
}
@keyframes bp-n2-drift {
  from { transform: rotate(24deg) translate3d(0, 0, 0) scale(1); }
  to { transform: rotate(28deg) translate3d(-3.5%, 3%, 0) scale(1.06); }
}

.bp-stars { position: absolute; inset: -3.5%; animation: bp-stars-drift 170s ease-in-out infinite alternate; }
.bp-star-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
@keyframes bp-stars-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-2.2%, 1.2%, 0); }
}
.bp-tw {
  animation: bp-tw var(--bp-dur, 6s) ease-in-out var(--bp-delay, 0s) infinite;
}
@keyframes bp-tw {
  0%, 100% { opacity: var(--bp-o, 0.6); }
  50% { opacity: calc(var(--bp-o, 0.6) * 0.32); }
}

/* A gas giant anchored in the lower-right corner — almost the whole sphere
   is on screen so the limb and terminator read as a real ball, and the
   whole body drifts slowly as if hanging in space. */
.bp-planet {
  position: absolute;
  right: 0vmin;
  bottom: -7vmin;
  width: 76vmin;
  height: 76vmin;
  filter: saturate(1.05);
  animation: bp-float 64s ease-in-out infinite alternate;
}
@keyframes bp-float {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-0.8vmin, -1.6vmin, 0); }
}
.bp-atmo {
  position: absolute;
  inset: 2.5%;
  border-radius: 50%;
  background: radial-gradient(circle closest-side,
    rgba(90, 180, 255, 0) 0%,
    rgba(90, 180, 255, 0) 80%,
    rgba(110, 200, 255, 0.16) 83%,
    rgba(160, 225, 255, 0.30) 87%,
    rgba(70, 150, 255, 0.10) 92%,
    rgba(70, 150, 255, 0) 98%);
  filter: blur(0.35vmin);
  animation: bp-breathe 16s ease-in-out infinite;
  opacity: 0.92;
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
  overflow: hidden;
  /* Sphere shading: light from the upper right so the lit face lands in the
     open right margin of the app (the chat column covers the center-left). */
  background: radial-gradient(circle at 74% 24%,
    #f2fcff 0%,
    #d3f1ff 7%,
    #a8e2ff 17%,
    #6fbdf6 33%,
    #3a93dd 50%,
    #1f6ab4 64%,
    #0d4579 76%,
    #04203f 82%,
    #020e20 91%,
    #010714 100%);
  box-shadow:
    inset 0 0 0 1px rgba(170, 226, 255, 0.22),
    inset -14px 18px 70px rgba(185, 235, 255, 0.22);
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
.bp-bands {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(171deg,
      rgba(200, 235, 255, 0) 0 4.2%,
      rgba(214, 242, 255, 0.16) 4.2% 5.8%,
      rgba(200, 235, 255, 0) 5.8% 9.1%,
      rgba(8, 36, 80, 0.20) 9.1% 11.2%,
      rgba(200, 235, 255, 0) 11.2% 15.4%);
  filter: blur(8px);
  opacity: 0.85;
}
.bp-clouds {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(34% 11% at 30% 36%, rgba(232, 248, 255, 0.50), rgba(160, 215, 255, 0.10) 58%, transparent 74%),
    radial-gradient(26% 8% at 61% 50%, rgba(206, 238, 255, 0.40), rgba(130, 195, 255, 0.08) 60%, transparent 76%),
    radial-gradient(16% 6% at 44% 65%, rgba(186, 228, 255, 0.32), transparent 72%),
    radial-gradient(40% 13% at 52% 82%, rgba(160, 210, 255, 0.22), transparent 74%);
  filter: blur(12px);
  opacity: 0.85;
  mix-blend-mode: screen;
}
.bp-shade {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(118% 118% at 74% 24%,
      rgba(2, 6, 16, 0) 0%,
      rgba(2, 6, 16, 0) 43%,
      rgba(2, 6, 16, 0.20) 54%,
      rgba(2, 6, 16, 0.52) 65%,
      rgba(1, 4, 12, 0.80) 76%,
      rgba(0, 2, 8, 0.93) 87%,
      rgba(0, 2, 8, 0.97) 100%),
    linear-gradient(230deg,
      transparent 40%,
      rgba(0, 3, 10, 0.18) 58%,
      rgba(0, 2, 8, 0.50) 74%,
      rgba(0, 2, 8, 0.78) 88%);
}
.bp-rim {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow:
    inset -7px 9px 24px rgba(196, 238, 255, 0.30),
    inset 0 0 0 2px rgba(160, 220, 255, 0.32);
}

/* A tilted icy ring. The lower half is a second copy clipped to pass in
   front of the disc; the upper half stays behind it. */
.bp-ring {
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
  left: 24%;
  top: 15%;
  width: 8.6vmin;
  height: 8.6vmin;
  border-radius: 50%;
  opacity: 0.9;
  background: radial-gradient(circle at 30% 26%,
    #f3f8ff 0%,
    #d3e0f0 11%,
    #9db1cb 30%,
    #627892 56%,
    #32435c 80%,
    #121c2d 100%);
  box-shadow:
    inset -5px -7px 16px rgba(0, 0, 0, 0.72),
    0 0 3.4vmin rgba(150, 200, 255, 0.16);
  animation: bp-moon-float 96s ease-in-out infinite alternate;
}
@keyframes bp-moon-float {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(1.2vmin, -1.4vmin, 0); }
}
.bp-moon::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background:
    radial-gradient(circle at 36% 40%, rgba(18, 28, 46, 0.34) 0 7%, transparent 8%),
    radial-gradient(circle at 63% 58%, rgba(14, 24, 42, 0.28) 0 11%, transparent 12%),
    radial-gradient(circle at 47% 73%, rgba(10, 18, 34, 0.30) 0 5%, transparent 6%),
    radial-gradient(circle at 71% 31%, rgba(20, 32, 52, 0.22) 0 8%, transparent 9%);
  filter: blur(0.08vmin);
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
  animation: bp-shoot 17s linear 7s infinite;
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
      rgba(1, 4, 10, 0.20) 0%,
      rgba(1, 4, 10, 0.06) 30%,
      rgba(1, 4, 10, 0.24) 100%);
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
        if (i % 9 === 0) {
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
        bright += `<g opacity="${o}" fill="#eef8ff">
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
