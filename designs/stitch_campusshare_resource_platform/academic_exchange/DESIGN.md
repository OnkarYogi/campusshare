---
name: Academic Exchange
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#202b3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#364154'
  on-tertiary-container: '#a2adc4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a civic, institutional, and student-first presence tailored for higher education communities. Its aesthetic rejects transactional e-commerce paradigms—omitting shopping carts, monetary prices, and aggressive consumerist patterns—in favor of a cooperative, high-utility collegiate commons. 

The visual personality balances academic authority with open accessibility. Surfaces feel clean, structured, and dependable, evoking the clarity of modern digital library systems and civic tool-sharing collectives. Key design principles:
- **Institutional Trust:** Clear verification markers, credential badges, and authoritative hierarchy ensure students and faculty feel confident exchanging valuable equipment, books, and lab instruments.
- **Ecological Stewardship:** Emphasis on circularity, communal ownership, and campus sustainability via vitality-focused availability cues rather than sales promotions.
- **Frictionless Legibility:** Immediate clarity of item status (Available, Reserved, On Loan), pick-up locations, and campus departmental origins.

## Colors
The palette leverages deep collegiate blue to convey institutional permanence, complemented by active emerald and teal accents that celebrate sustainability, sharing, and verified availability.

- **Primary (`#1E3A8A`):** Deep Collegiate Navy. Applied to structural headers, primary actions (request, borrow, list item), active navigation anchors, and institutional branding.
- **Secondary (`#0D9488`):** Resilient Teal / Emerald. Used specifically for positive availability states, sustainability metrics, successful handoffs, and verification indicators.
- **Tertiary (`#1E293B`):** Deep Slate Indigo. Acts as the high-contrast base for primary text, system icons, and strong containment lines.
- **Neutral (`#64748B`):** Balanced Slate. Governs secondary descriptions, building timestamps, metadata labels, and subtle dividing boundaries.

### Semantic Status Matrix
- **Available:** Background `#F0FDF4`, border `#BBF7D0`, text `#15803D` (WCAG AAA compliant against white).
- **Reserved:** Background `#FEF3C7`, border `#FDE68A`, text `#B45309`.
- **On Loan / Checked Out:** Background `#F1F5F9`, border `#CBD5E1`, text `#475569`.
- **Surface Canvas:** `#F8FAFC` (Canvas), `#FFFFFF` (Surface Container/Card), with structural dividers strictly calibrated to `#E2E8F0`.

## Typography
The pairing blends the structured, modern humanism of Plus Jakarta Sans for titles and headers with the systematic, neutral legibility of Inter for body text, data density, campus codes, and status tags.

- **Headlines:** Use Plus Jakarta Sans with tighter tracking to give campus sections, department names, and resource titles an authoritative yet forward-thinking presence.
- **Metadata and Running Text:** Inter handles dense metadata (e.g., "Mudd Library - Floor 3", "Serial #EE-2041", "Return by Oct 24") with exceptional clarity at 11px to 14px sizes. Numbers retain clean tabular proportions to simplify comparing reservation windows and loan durations.

## Layout & Spacing
The layout adheres to a fixed-max-width responsive container (maximum 1280px) centered on screen, operating on an 8pt spatial grid with 4pt baseline snap for tight UI modules.

- **Desktop (1024px+):** 12-column grid with `1.5rem` (24px) gutters and `2rem` (32px) margins. Directory listings default to 3-column or 4-column item grids, while inventory detail panes use an asymmetrical 8-column content / 4-column custodial metadata split.
- **Tablet (768px - 1023px):** 8-column layout with `1.5rem` gutters and `1.5rem` margins. Two-column listing grid.
- **Mobile (<768px):** 4-column fluid layout with `1rem` (16px) gutters and `1rem` margins. Single-column card stacking with sticky bottom action trays for requesting items.
- **Rhythm Rules:** Spacing inside item cards uses `space-md` (16px) for interior padding. Tag clusters (location, department, status) utilize `space-xs` (4px) to `space-sm` (8px) gaps to maintain immediate semantic association.

## Elevation & Depth
This design system avoids excessive, drop-shadow-heavy layering in order to stay utilitarian, fast, and authentic to institutional tools. Depth is established through crisp, low-contrast boundary lines and deliberate tonal surfaces:

- **Surface Grounding:** The root canvas rests on `#F8FAFC`. Base resource cards, inventory drawers, and modal sheets are `#FFFFFF`, separated by a sharp 1px border (`#E2E8F0`).
- **Resting Depth (Level 0 / Cards):** No drop shadow. Structural clarity is sustained via border contrast: `border: 1px solid #E2E8F0`.
- **Interactive Hover (Level 1):** Elevates via a subtle ambient shadow combined with border intensification: `border-color: #CBD5E1; box-shadow: 0 4px 12px -2px rgba(30, 41, 59, 0.06), 0 2px 6px -1px rgba(30, 41, 59, 0.04)`.
- **Flyout / Popover / Dropdown (Level 2):** Soft directional shadow with tinted cool slate: `box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04); border: 1px solid #E2E8F0`.
- **Modals & Safety Confirmations (Level 3):** Backdrop scrim set to `rgba(15, 23, 42, 0.45)` with soft ambient blur (`backdrop-filter: blur(4px)`). Modal dialog features an elevated border and deep drop envelope: `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`.

## Shapes
A roundedness factor of `2` (`0.5rem` / 8px default radius) provides a contemporary, friendly institutional feel without appearing toy-like or juvenile.

- **Base Inputs, Badges, and Buttons:** `0.5rem` (8px). Delivers balanced corners matching standard academic desktop and tablet inputs.
- **Resource Cards and Panels (`rounded-lg`):** `1rem` (16px). Softens large surface containers holding high volumes of text and item photos.
- **Dialogs and Bottom Trays (`rounded-xl`):** `1.5rem` (24px). Creates distinct modal framing.
- **Availability & Tag Pills:** Full radius (`9999px`) reserved specifically for discrete state indicators ("Available", "Biology Lab", "Verified Faculty") to distinguish them from actionable square-cornered buttons.

## Components

### Buttons
- **Primary ("Request to Borrow", "List a Resource"):** Solid `#1E3A8A` background with crisp white text (`Inter`, `label-lg`). Hover: `#1E293B`. Active: `#0F172A`. Never displays currency or shopping icons. Focused state: 2px offset ring with `#0D9488`.
- **Secondary ("Message Custodian", "Check Schedule"):** `#FFFFFF` surface with 1px border in `#CBD5E1`, text in `#1E293B`. Hover: `#F8FAFC` background, `#0F172A` text, `#94A3B8` border.
- **Ghost / Tertiary ("Cancel", "View Guidelines"):** Transparent background, `#64748B` text. Hover: `#F1F5F9` background with `#1E293B` text.

### Availability & Identity Badges
- **Availability Chips:** Fully rounded pills (`padding: 4px 10px`) with a preceding 6px solid circular dot indicator.
  - *Available:* Dot `#10B981`, background `#F0FDF4`, text `#15803D`.
  - *Reserved:* Dot `#F59E0B`, background `#FEF3C7`, text `#B45309`.
  - *On Loan:* Dot `#94A3B8`, background `#F1F5F9`, text `#475569`.
- **Location & Department Tags:** `#F1F5F9` background, `#334155` text, 4px border radius with leading micro-icon (e.g., building glyph or campus pin).
- **Institutional Verification Badge:** Compact `#ECFDF5` chip displaying a shield checkmark icon with `#065F46` label ("Verified Student" or "Verified Lab Staff").

### Resource Cards
- Constructed with `#FFFFFF` background, 1px `#E2E8F0` border, and `1rem` corner rounding.
- Cards maintain zero commerce visual cues: no prices, no star reviews, no add-to-cart controls.
- Top section holds an uncropped 16:10 aspect ratio image of the physical asset, overlaid with an instant Availability Badge top-left and an Institutional Tag top-right.
- Card body features title (`headline-sm`), owning organization or department (`body-sm`), campus building location, and custodial return expectations.
- Bottom actions display clear non-commercial action: "Borrow Resource" or "Place Hold".

### Form Controls & Inputs
- **Text Inputs & Date Pickers:** 1px `#CBD5E1` border on `#FFFFFF`, padded with `10px 14px`, 8px corner radius. Placeholder text `#94A3B8`. Active/Focus produces a crisp 1px `#1E3A8A` border with a 3px `#0D9488` focus ring at 20% opacity.
- **Checkboxes & Radios:** 18px square (checkbox) or circle (radio), `#FFFFFF` base, `#CBD5E1` border. Selected state is solid `#1E3A8A` displaying an inner white mark.

### Hand-off Timeline & Item Custody Status
- Step-indicator component displaying the lifecycle of a borrow action: `Requested` → `Approved by Custodian` → `Picked Up at Location` → `Returned`. 
- Completed steps display `#0D9488` connector lines with emerald check nodes; pending steps remain `#E2E8F0` lines with `#94A3B8` nodes.