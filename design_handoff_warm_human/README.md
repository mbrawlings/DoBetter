# Handoff: DoBetter — Warm & Human visual system

> **⚠️ Person screen update (v2):** the per-person screen has been restructured from a single stacked-scroll form into a read-only **hub + drill-down** system. The tokens, components, and all other screens in this README still apply as-is, **but ignore the old "Person form" screen spec below** (the stacked layout with inline event/gift/moment sections) — it is superseded by **`PERSON_HUB.md`**. Read that for the person screen; read this for everything else. Interactive reference: **`hub-reference.html`**.

## Overview

This package redesigns the DoBetter React Native app with a refined, consistent visual system called **"Warm & Human"** — a warmer, more humane evolution of the current iOS-style pattern. It defines tokens (color, type, spacing, radius), reusable components (buttons, inputs, chips, cards, avatars, section headers), and applies them across every screen the user encounters: Home (people list), Person form (create / edit / inline view), section modals (Gift Idea, Interaction, Event), and empty states.

The goal: replace the ad-hoc inline `StyleSheet.create` blocks scattered across screens with a single, coherent system rooted in `src/theme/theme.ts`.

---

## About the design files

The files in this bundle (`reference.html`, the `.jsx` files) are **design references created in HTML/React-for-web**. They are *not* production code to copy directly — React Native does not run JSX in the browser, and the styling is CSS-in-JS rather than `StyleSheet.create`.

Your task is to **recreate these designs inside the existing React Native (Expo) codebase** using:
- `react-native-paper` (MD3) for the underlying primitives — already a project dependency
- `StyleSheet.create` for component styles
- The token contract defined below, applied via the existing `src/theme/theme.ts`

Open `reference.html` in a browser to see every screen and the foundations card. Open the `.jsx` files to read exact pixel values, paddings, font sizes, and component composition — they are the source of truth for measurements.

## Fidelity

**High-fidelity.** Colors, type sizes, spacings, radii, weights, and exact copy are all final. Recreate pixel-perfectly using the codebase's existing libraries (`react-native-paper`, `StyleSheet`).

---

## Files in this handoff

```
design_handoff_warm_human/
├── README.md          ← you are here
├── reference.html     ← visual reference (open in browser)
├── ios-frame.jsx      ← iOS device chrome (web-only, just for context)
├── shared.jsx         ← icons + sample data used in references
├── direction-a.jsx    ← every screen mockup (source of truth for measurements)
└── style-guide.jsx    ← foundations card (palette, type, components)
```

Files in the existing codebase to **edit** (do not blindly overwrite — preserve all behavior, GraphQL hooks, and state logic):

```
frontend/src/theme/theme.ts                          ← replace tokens
frontend/src/screens/HomeScreen.tsx                  ← restyle list, search, FAB
frontend/src/screens/PersonFormScreen.tsx            ← restyle field groups, header, save
frontend/src/components/inputs/ChipInput.tsx         ← restyle chips
frontend/src/components/inputs/SelectInput.tsx       ← restyle select rows
frontend/src/components/inputs/DateInput.tsx         ← restyle date rows
frontend/src/components/modals/FormModal.tsx         ← restyle sheet chrome
frontend/src/components/modals/GiftIdeaModal.tsx     ← apply chip-group pattern
frontend/src/components/modals/InteractionModal.tsx  ← apply chip-group pattern
frontend/src/components/modals/UpcomingEventModal.tsx
frontend/src/components/modals/TextModal.tsx
frontend/src/components/sections/EventsSection.tsx   ← restyle event cards
frontend/src/components/sections/GiftIdeasSection.tsx
frontend/src/components/sections/InteractionsSection.tsx
frontend/src/components/sections/ItemListSection.tsx ← shared card+actions pattern
```

Files to **create**:

```
frontend/src/theme/tokens.ts                ← exported token objects (see below)
frontend/src/components/ui/Avatar.tsx       ← initials avatar, with palette + sizes
frontend/src/components/ui/FieldGroup.tsx   ← grouped-row container
frontend/src/components/ui/FieldRow.tsx     ← text/select/date field rows
frontend/src/components/ui/SectionLabel.tsx ← uppercase mono section header
frontend/src/components/ui/ItemCard.tsx     ← card used in events/gifts/moments
frontend/src/components/ui/ChipGroup.tsx    ← multi-select chip row used in modals
frontend/src/components/ui/PrimaryButton.tsx
```

---

## Design tokens

Replace `frontend/src/theme/theme.ts` with the following. Keep the `MD3LightTheme` extension shape so `react-native-paper` keeps working.

### Color (light)

| Token              | Hex        | Usage                                          |
| ------------------ | ---------- | ---------------------------------------------- |
| `bg`               | `#FAF7F2`  | App background — warm off-white                |
| `surface`          | `#FFFFFF`  | Cards, field groups, modals                    |
| `raised`           | `#F4EFE7`  | Search bar, chip inputs, secondary surfaces    |
| `primary`          | `#B85C3E`  | Brand — terracotta. Used for save / accents    |
| `primaryFg`        | `#FFFFFF`  | Text on primary                                |
| `primarySoft`      | `#F8E5DC`  | Tinted backgrounds (birthday card, empty hero) |
| `text`             | `#1B1714`  | Primary text                                   |
| `textMuted`        | `#6F6860`  | Secondary text, labels                         |
| `textFaint`        | `#A6A096`  | Placeholder, disabled, meta                    |
| `border`           | `#ECE4D6`  | Dividers, card borders                         |
| `borderStrong`     | `#D8CCB4`  | Drag handles, dashed "add" outlines            |
| `success`          | `#6F8E3F`  | "Current event" dot, positive state            |
| `danger`           | `#C44A3E`  | Delete actions, errors                         |

### Color (dark) — phase 2, not blocking

| Token              | Hex        |
| ------------------ | ---------- |
| `bg`               | `#1A1614`  |
| `surface`          | `#211C18`  |
| `raised`           | `#2A2520`  |
| `primary`          | `#D17A5C`  (lift +12L for AMOLED contrast) |
| `primarySoft`      | `#3A1F16`  |
| `text`             | `#F8F4ED`  |
| `textMuted`        | `#9C958A`  |
| `textFaint`        | `#5F594F`  |
| `border`           | `#2F2925`  |
| `borderStrong`     | `#3F3833`  |

### Avatar palette

Used by `getAvatarColor()` — replace the existing array in `theme.ts`:

```ts
['#B85C3E','#6F8E3F','#3F7B8E','#8E5C9C','#C9963D','#5D6E54','#9C5C72','#3F6E8E']
```

### Spacing scale (unchanged — keep current)

`xs:4, sm:8, md:12, lg:16, xl:24, xxl:32`

### Radius scale

| Token   | Value | Usage                                  |
| ------- | ----- | -------------------------------------- |
| `sm`    | `8`   | Small accents                          |
| `md`    | `12`  | Search bar, small chips                |
| `lg`    | `16`  | Field groups, item cards               |
| `xl`    | `20`  | Modal sheets                           |
| `pill`  | `999` | Filter chips, interest tags, avatar    |

### Typography

Font family: **Plus Jakarta Sans** (load via `expo-font` or `@expo-google-fonts/plus-jakarta-sans`). Fall back to `system-ui`.

| Style       | Size | Weight | Letter-spacing | Usage                                |
| ----------- | ---- | ------ | -------------- | ------------------------------------ |
| `display`   | 34   | 700    | -0.8           | Large titles ("People")              |
| `title`     | 22   | 700    | -0.5           | Empty state title, hero name         |
| `headline`  | 16   | 600    | -0.2           | Card titles, person names in list    |
| `body`      | 16   | 400    | -0.1           | Field values                         |
| `bodySm`    | 15   | 400    | -0.1           | Card body, list secondary            |
| `caption`   | 13   | 500    |  0.0           | Subtitle, meta                       |
| `eyebrow`   | 12   | 600    |  1.2 (caps)    | Section labels (UPPERCASE)           |
| `mono`      | 11   | 500    |  0.5 (caps)    | Optional — for dates/IDs             |

### Shadows

- **Card / list row:** `0 1px 0 rgba(0,0,0,0.02), 0 2px 8px rgba(28,20,12,0.04)` (almost flat — the warm bg is doing the work)
- **Primary button:** `0 1px 0 rgba(0,0,0,0.04), 0 6px 16px rgba(184,92,62,0.18)` (tinted glow)
- **Modal sheet:** `0 -8px 32px rgba(0,0,0,0.12)`

---

## Component specs

For each component below, see the matching JSX in `direction-a.jsx` for exact values.

### `<PrimaryButton>` (was: react-native-paper `<Button mode="contained">`)
- bg `primary`, text `primaryFg`, radius `lg` (14), padding vertical 14 / horizontal 20
- font 16/600, letter-spacing -0.1
- tinted shadow (see above)
- `full` prop → 100% width
- Loading state: spinner replaces text, button stays full opacity

### `<SectionLabel>` (was: inline `styles.sectionLabel` in PersonFormScreen)
- 12px uppercase, weight 600, letter-spacing 1.2, color `textMuted`
- Padding: `20px 24px 8px` (top spacing creates the section break)
- Optional `action` slot on the right (small primary-colored text link)

### `<FieldGroup>`
- bg `surface`, radius `lg` (16), border `1px solid border`
- `overflow: hidden` (so child dividers don't bleed)
- Horizontal margin `lg` (16) from screen edge
- Holds 2–5 `<FieldRow>` children with hairline dividers between

### `<FieldRow>` (replaces direct `<TextInput>` rows)
- Layout: horizontal — `[label 112px][value flex:1][optional chevron]`
- Padding: `12px 16px`
- Label: 13px, weight 500, color `textMuted` (or `primary` when focused/required)
- Value: 16px, color `text` (or `textFaint` if empty)
- Divider: 1px `border`, only on non-last rows (`borderBottom`)
- Focused row: background `#FFFBF5` (very subtle warm highlight), label switches to `primary`
- Required row: label gets ` *` suffix in `primary`

Multi-line variant (for interests, notes): label sits above the field, padding `12px 16px`, content full-width.

### `<SelectFieldRow>`
- Same as FieldRow but with a `chevron-down` (16×16, color `textFaint`) on the right
- Opens an action sheet / picker

### `<DateFieldRow>`
- Same as SelectFieldRow but value formatted as `"Apr 12, 1989"`
- Opens native date picker on tap

### `<Chip>` (interests in detail, occasion/status in modals)
- Padding: `6px 10px 6px 12px`, radius `pill` (999)
- bg `raised`, border `1px solid border`, text 13/500, color `text`
- Removable variant has a 14×14 close icon on the right with `textMuted` color
- **Selected** variant (modal chip groups): bg `primary`, color `primaryFg`, border matches bg
- **Add chip** placeholder: dashed `1px borderStrong` border, color `textFaint`, no bg

### `<Avatar>`
- Sizes: 36 (small list), 40 (default list), 48 (cards), 84 (form header)
- Border radius = size / 2
- Background: `getAvatarColor(firstName + lastName)` from palette
- Text: white, weight 600, size = size × 0.38
- Empty/placeholder variant (new person): bg `raised`, dashed border `borderStrong`, user-outline icon in `textFaint`

### `<ItemCard>` (used in Current events, Upcoming, Gift ideas, Moments)
- bg `surface`, border `1px solid border`, radius `lg` (16)
- Padding: `14px 16px`
- Cards are stacked with `gap: 8px` (not separated by FieldGroup hairlines)
- Standard internal layout: `[icon 40px? icon][title + subtitle, flex:1][chevron 16px? edit pencil 14px]`
- Tap → opens the corresponding modal

### `<SearchBar>` (HomeScreen)
- bg `raised`, radius `md` (12), padding `11px 14px`
- Leading search icon 18×18, color `textMuted`
- Text 16/regular, placeholder color `textMuted`
- Replace react-native-paper `<Searchbar>` — too heavy / has elevation we don't want

### `<FilterChipsRow>` (HomeScreen)
- Horizontal scroll, padding `0 16px`, gap 8
- Each chip: padding `7px 12px`, radius pill, 13/500
- Selected: bg `text`, color `surface`, border matches bg
- Default: bg `surface`, color `text`, border `1px solid border`
- Suggested filters: `All N`, `Family`, `Friends`, `Work`, `Need to reach out N`

### `<NavBar>` (large + standard)
- Large: padding `52px 20px 8px` top, title 34/700 letter-spacing -0.8
- Standard: padding `52px 12px 10px`, 3-column flex with centered title 16/600
- Leading area can hold `<BackButton>` (chevron-left + "Back" in `primary`)
- Trailing area: Save link (`primary`, 15/600), action icon button (34×34, bg `raised`)

### `<Modal>` / bottom sheet (Gift idea, Interaction, Event)
- Backdrop: `rgba(15,12,10,0.32)`, tap to dismiss
- Sheet: bg `bg` (NOT `surface` — keep the warm tone), radius `20px 20px 0 0`, padding `14px 0 32px`
- Drag handle: 36×5, radius 3, color `borderStrong`, top center
- Header row: padding `0 20px`, 3-col → `[Cancel small primary][Title 17/700][Save primary 14/600]`
- Body: `<FieldGroup>` for text fields, then `<SectionLabel>` + chip rows for taxonomy choices (occasion / status / priority)
- Priority/numbered choices render as a 3-column equal-width grid of pill cells (radius 12)

### `<EmptyState>`
- Center column, padding-top 80
- Icon medallion: 120×120, radius 60, bg `primarySoft`, icon color `primary`, size 56
- Title: 24/700, letter-spacing -0.5
- Subtitle: 15/400, color `textMuted`, max-width 300, line-height 1.45
- Primary CTA, secondary "Import from Contacts" as text-only link in `textMuted`

---

## Screen specs

### Home (`HomeScreen.tsx`)

Layout top-to-bottom:
1. `<NavBar large title="People">` with `+` icon trailing
2. `<SearchBar>` placeholder `"Search people, interests, places"`
3. `<FilterChipsRow>` — horizontal scroll
4. **"Reach out today"** `<SectionLabel>` (only show when reach-out signals exist)
5. Single `<ItemCard>`-style row prompt with person avatar 48, last-contact subtext
6. **"All people · N"** `<SectionLabel>` with right-aligned "Sort: Recent" link
7. Big `<FieldGroup>`-style container (bg `surface`, radius `lg`, border) holding flat list of people, divided by hairlines.
   - Row: padding `12px 16px`, avatar 40, name 15/600, subtitle 13/500 `textMuted` (`relationship · city`), last-contact pill 12/500 `textFaint` on the right
8. Bottom: 80px scroll padding to clear FAB / safe area

Empty list → render `<EmptyState>` instead of the list section.

Loading → keep current ActivityIndicator pattern but tint with `primary`.

Error → keep current error layout but use new tokens.

### Person form (`PersonFormScreen.tsx`)

The whole screen is a `<ScrollView>` with `bg: bg`.

Top-to-bottom:
1. `<NavBar title="Edit">` or `title="New person"`, leading `<BackButton>`, trailing Save link
2. **Header**: centered column, padding `4px 16px 8px`
   - Avatar 84 (current colored initials, or dashed placeholder for new)
   - "Change photo" / "Add photo" text link in `primary`, 14/500
3. `<SectionLabel>Name</SectionLabel>` + `<FieldGroup>` with First/Last `<FieldRow>`s
4. `<SectionLabel>Details</SectionLabel>` + `<FieldGroup>` with City/Employer/Role text rows + Relationship `<SelectFieldRow>`
5. `<SectionLabel>Personal</SectionLabel>` + `<FieldGroup>`:
   - Birthday `<DateFieldRow>`
   - Interests — multi-line variant, label on top, chip grid below with an "+ add" placeholder
6. `<SectionLabel>What's going on</SectionLabel>` + stacked `<ItemCard>` list of current events
   - Each card: 6×6 green dot · text 15 · pencil icon 16 trailing
   - Below cards: "+ Add current event" link in `primary`
7. `<SectionLabel>Upcoming</SectionLabel>` + stacked `<ItemCard>` list
   - Card: tinted icon block (40×40, radius 10, bg `primarySoft`, color `primary`, cake icon) · title 15/600 + date+notes subtitle 13/500 · chevron-right
8. `<SectionLabel>Gift ideas · N</SectionLabel>` + similar card list — icon block tinted gold (`#F2E9D9` / `#8E6A2A`)
9. `<SectionLabel>Recent moments · N</SectionLabel>` + cards
   - Top row: "channel · date" 13/500 `textMuted` + pencil 14 trailing
   - Body: 15 text, line-height 1.35
10. Bottom: full-width `<PrimaryButton>` "Save changes", then a destructive "Delete person" text link (`danger`, 15/500, centered) below it. Padding `32px 16px 60px`.

Empty/new state differences:
- Required fields ("First *", "Last *") get the `primary` label color
- "Save" trailing nav link is muted (`textFaint`) until both required fields are filled
- Bottom of screen shows a 13/regular tip in `textMuted` instead of Delete: `"Only first and last name are required. You can add events, gifts, and moments after saving."`

### Modals (Gift idea, Interaction, Event)

Bottom-sheet pattern (see `<Modal>` spec). Same field-group pattern as Person form, but inside a sheet.

Gift idea modal sections:
1. Title field (required, focused on open)
2. Notes field (multi-line)
3. Occasion: chip row — `birthday / holiday / anniversary / other`
4. Status: chip row — `idea / shortlist / purchased / gifted`
5. Priority: 3-column grid (1, 2, 3) — selected cell uses `primary` bg

Interaction modal sections:
1. Summary (required, multi-line)
2. Date (DateFieldRow)
3. Channel chips — `irl / call / text / video / other`
4. Location (optional text)

Event modal sections:
1. Title (required)
2. Date
3. Notes (multi-line)

### Empty state (no people yet)

See `<EmptyState>` spec. Copy:
- Title: **"Your people, in one place"**
- Subtitle: **"Add someone you care about. Track birthdays, gift ideas, and the moments worth remembering."**
- Primary CTA: **"Add your first person"**
- Secondary link: **"Import from Contacts"**

---

## Interactions & behavior

- **All existing GraphQL hooks and state stay unchanged.** This is a pure restyle — don't touch Apollo queries or mutation logic.
- Field focus → row background shifts to `#FFFBF5`, label color shifts to `primary`
- Tap chevron rows → existing action-sheet / picker behavior preserved
- Modal open → sheet slides up from bottom, backdrop fades in (200ms `ease-out`)
- "Add" buttons inside sections add an entry locally (when creating) or fire the existing mutation (when editing) — current logic in `PersonFormScreen.tsx` is correct, just wrap the UI
- Save button → disabled state when required fields empty: label color `textFaint`, no shadow, `opacity: 0.5`
- Delete person → confirmation alert with destructive style (no design needed, native Alert)

## State

No new state shape — match the existing `PersonFormScreen` state vars exactly. The redesign is purely presentational.

## Assets

- **Icons:** use a single icon library consistently. The references use Phosphor-style strokes (1.5–1.75). If sticking with `react-native-paper`'s `<Icon>` (Material), keep doing so — the visual reference is just guidance. Suggested mappings:
  - search → `magnify`
  - plus → `plus`
  - back → `chevron-left`
  - chevron → `chevron-right` / `chevron-down`
  - pencil → `pencil-outline`
  - trash → `trash-can-outline`
  - calendar → `calendar-blank-outline`
  - gift → `gift-outline`
  - cake → `cake-variant-outline`
  - chat → `message-outline`
  - bell → `bell-outline`
  - user → `account-outline`
  - users → `account-group-outline`
  - close → `close`
- **Fonts:** install `@expo-google-fonts/plus-jakarta-sans` and load weights 400/500/600/700 in `App.tsx` with `useFonts`.

## Acceptance checklist

- [ ] `src/theme/theme.ts` exports the new token shape; old constants still work
- [ ] Plus Jakarta Sans loaded and applied app-wide via `react-native-paper` provider
- [ ] Home shows search → filter chips → reach-out card → grouped list, all matching reference
- [ ] Person form sections rendered with new SectionLabel + FieldGroup pattern
- [ ] Header avatar 84 + "Change photo" link present on edit; dashed placeholder on create
- [ ] Required-field labels (First *, Last *) get `primary` color; Save link mutes until valid
- [ ] All chip groups in modals use the new pill spec (`primary` selected, `surface` default)
- [ ] Priority picker is a 3-column equal-width grid
- [ ] Bottom-sheet modal uses warm `bg` background, drag handle, and 20px top radius
- [ ] Delete person is a centered text link in `danger` below the primary save button
- [ ] Empty state matches copy and layout
- [ ] Dark mode tokens defined (even if not wired yet)

---

## Cursor prompt — short version

If you want to paste a single prompt instead of pointing Cursor at this whole README, use this:

> Apply the **Warm & Human** visual system to the DoBetter React Native app. The complete spec is in `design_handoff_warm_human/README.md` — read it end-to-end before editing. Visual references are in `design_handoff_warm_human/reference.html` and `direction-a.jsx`. Implement in this order:
> 1. Replace tokens in `src/theme/theme.ts` per the README's "Design tokens" section. Install `@expo-google-fonts/plus-jakarta-sans` and wire it up in `App.tsx`.
> 2. Create the shared UI primitives in `src/components/ui/` listed under "Files to create" (Avatar, FieldGroup, FieldRow, SectionLabel, ItemCard, ChipGroup, PrimaryButton).
> 3. Restyle `HomeScreen.tsx` per the "Screen specs · Home" section.
> 4. Restyle `PersonFormScreen.tsx` per the "Screen specs · Person form" section.
> 5. Restyle the three modal components per the "Screen specs · Modals" section.
> 6. Restyle the section components (`EventsSection`, `GiftIdeasSection`, `InteractionsSection`, `ItemListSection`) to use the new `ItemCard` primitive.
>
> Do not change any GraphQL queries, mutations, or state logic — this is a pure visual restyle. Preserve all existing behavior. Match measurements pixel-for-pixel against the `.jsx` references. Use the codebase's existing `react-native-paper` + `StyleSheet.create` patterns.
