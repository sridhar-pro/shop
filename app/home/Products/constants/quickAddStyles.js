// ─── Quick-Add pill button styles ────────────────────────────────────────────
// Scoped keyframe + class — no global CSS or Tailwind config changes needed.
export const QUICK_ADD_STYLES = `
  @keyframes qaCheck {
    0%   { transform: scale(0.7) rotate(-10deg); opacity: 0; }
    60%  { transform: scale(1.15) rotate(4deg);  opacity: 1; }
    100% { transform: scale(1)    rotate(0deg);  opacity: 1; }
  }

  @keyframes qaSpin {
    to { transform: rotate(360deg); }
  }

  /* ── Inline pill: lives in the price row, not absolutely positioned ── */
  .qa-pill {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 30px;
    /* collapsed — just shows the + icon */
    width: 30px;
    border-radius: 999px;
    background: #A00300;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(160,3,0,0.30);
    transition:
      width   260ms cubic-bezier(0.34,1.56,0.64,1),
      background 180ms ease,
      box-shadow 180ms ease,
      transform  120ms ease;
    will-change: width;
  }

  /* Expand on card hover (desktop) or direct hover */
  .group:hover .qa-pill,
  .qa-pill:hover {
    width: 80px;
    background: #c00400;
    box-shadow: 0 4px 14px rgba(160,3,0,0.40);
  }

  .qa-pill:active {
    transform: scale(0.93);
  }

  /* Mobile: always expanded */
  @media (max-width: 767px) {
    .qa-pill { width: 72px; }
  }

  .qa-pill-icon {
    flex-shrink: 0;
    width: 13px;
    height: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Label — hidden until pill expands */
  .qa-pill-label {
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    transition: opacity 150ms ease 60ms, max-width 150ms ease 60ms;
    pointer-events: none;
  }

  .group:hover .qa-pill .qa-pill-label,
  .qa-pill:hover .qa-pill-label {
    opacity: 1;
    max-width: 60px;
  }

  @media (max-width: 767px) {
    .qa-pill .qa-pill-label { opacity: 1; max-width: 60px; }
  }

  /* Green "Added!" flash */
  .qa-pill.qa-added {
    background: #16a34a !important;
    box-shadow: 0 4px 14px rgba(22,163,74,0.35) !important;
    width: 80px !important;
    pointer-events: none;
  }

  .qa-pill.qa-added .qa-pill-icon svg {
    animation: qaCheck 280ms cubic-bezier(0.34,1.56,0.64,1) both;
  }

  @media (max-width: 767px) {
    .qa-pill.qa-added { width: 72px !important; }
  }

  /* Grey "Adding…" state — shown while we wait on the real API response */
  .qa-pill.qa-loading {
    background: #7a7f87 !important;
    box-shadow: 0 4px 14px rgba(122,127,135,0.35) !important;
    width: 84px !important;
    pointer-events: none;
    cursor: default;
  }

  .qa-pill.qa-loading .qa-pill-icon svg {
    animation: qaSpin 700ms linear infinite;
  }

  @media (max-width: 767px) {
    .qa-pill.qa-loading { width: 78px !important; }
  }

  /* Red "Failed" flash — shown only if the API call didn't succeed */
  .qa-pill.qa-error {
    background: #dc2626 !important;
    box-shadow: 0 4px 14px rgba(220,38,38,0.35) !important;
    width: 84px !important;
    pointer-events: none;
  }

  @media (max-width: 767px) {
    .qa-pill.qa-error { width: 78px !important; }
  }

  /* Pills advertising a minimum order qty ("Add 5") need a touch more room
     once expanded — the collapsed +icon width is unaffected. */
  .group:hover .qa-pill.qa-has-moq,
  .qa-pill.qa-has-moq:hover {
    width: 84px;
  }

  @media (max-width: 767px) {
    .qa-pill.qa-has-moq { width: 78px; }
  }
`;
