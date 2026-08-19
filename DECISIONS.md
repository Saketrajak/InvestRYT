# DECISIONS.md — Frontend Engineering

> One page. Three questions. No padding.

---

## 1. Why this ingestion strategy over the obvious alternative you rejected?

**Chosen:** Server-Sent Events (SSE) streamed directly into the UI via `EventSource`, with results cached in `localStorage` before a route redirect to `/report`.

**Rejected:** A standard fetch-and-wait pattern — one POST, wait for the full JSON, render everything at once.

**Why SSE wins here:**

The LangGraph pipeline is sequential across 7 nodes and takes 20–60 seconds. Showing a spinner for a minute is a trust-killer — users assume it crashed. SSE lets each agent node emit its status the moment it finishes, so the UI can run a live progress feed (`AgentProgress` + `AgentPipeline`) showing exactly which node is running, what it returned, and a real-time terminal log. This turns a 45-second wait into a 45-second *experience*.

The `localStorage` bridge between `/search` and `/report` was the deliberate alternative to a global state manager (Zustand/Redux). Report data is large — financials, charts, AI prose — and only ever needed once per session. A state manager adds boilerplate and bundle weight for a single-directional, one-time data handoff. `localStorage` is zero-dependency, survives tab refreshes, and the report page clears it after hydration.

---

## 2. One trade-off made under the time limit — and what a real week would fix.

**Trade-off: No canonical design system. Ad-hoc Tailwind everywhere.**

Every page was built with inline utility classes — `max-w-[1120px]`, `text-[52px]`, `text-zinc-400` scattered freely. This shipped fast but created three compounding problems visible only when the full app was reviewed together:

- Five different `max-width` values across pages made the header look misaligned with content on every route.
- No type scale meant `h1` and `h4` looked almost identical — just scaled, not hierarchically distinct.
- Body text at `text-zinc-400` (#a1a1aa) was perceptibly dim on a `#09090b` background at normal viewing distance.

**With a real week:**

I would define the design system *before* writing a single page component — a `tokens.css` with a canonical type scale (display / h1 / h2 / h3 / body / label / footer), a 5-level text color hierarchy, one container class (`.site-container`), and a spacing scale. No ad-hoc values anywhere.

The font story would also be resolved from day one: **Bricolage Grotesque** for display headings (editorial, geometric, strong weight axis — same choice as modern fintech SaaS), **Inter** for body UI, and **JetBrains Mono** for tickers and data tables (tabular numerals, unambiguous `0O1l`). These three together give a financial product the visual precision and credibility it needs.

---

## 3. Where AI tools were used — and what was personally verified or changed.

**AI generated:**
- Initial page scaffolding for `/features`, `/documentation`, `/api` — structural JSX, grid layouts, component props.
- The Bento Grid layout concept for the Features infrastructure section.
- Pipeline node mockup components — the mini financial table, moat bars, DCF verdict card inside each node panel.
- Root cause diagnosis of the "absurd left padding" — correctly identifying 5 conflicting `max-width` values as one architectural problem.

**Personally reviewed and changed after AI output:**
- The pipeline visualiser was a vertical step list (classic AI default). Redesigned to a **horizontal rail** with a connecting line, active glow rings, and animated panel transitions — which mirrors how LangGraph's StateGraph actually executes.
- Every Bento card micro-UI was individually verified to show realistic but clearly non-functional data — no `[placeholder]` or Lorem ipsum.
- The container alignment fix was verified live in the browser across all four routes, confirming the header logo edge and content body edge were pixel-aligned.
- `globals.css` was hand-reviewed line by line after the tool produced a corrupted intermediate state (duplicate `border-radius` inside `glass-reflection::before`).
- Typography decisions — `text-wrap: balance` on headings, `font-feature-settings: "tnum"` on mono elements, the 5-level color hierarchy from `#ffffff` → `#52525b` — were made by hand, not AI-suggested.
