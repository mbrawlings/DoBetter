# Handoff: DoBetter — Person Hub system (navigation restructure)

> **Read this with `README.md`.** That file defines the **Warm & Human** visual system (tokens, type, components) — still the source of truth and **unchanged**. This document describes the one structural change layered on top: the per-person screen is no longer a single stacked-scroll form. It becomes a read-only **hub** that drills into dedicated list screens, with editing via the bottom sheets you already ship.

---

## Why

A populated person was one endless `ScrollView` — name, details, current events, upcoming, gifts, moments, all stacked. With a real power user (≈12 moments, 8 gifts, 7 events) the part you actually open the screen to read is buried. The hub fixes that: the screen's #1 job is a **quick refresher before you see someone**, so it leads with identity + what's going on, then offers one tappable row per section.

## Visual reference

- **`hub-reference.html`** — open in a browser. Self-contained, offline. Section **04 · Person hub system** is the interactive hub (drill into Events / Moments / Gifts, filter gifts, tap a card to open its edit sheet). Section **05 · States & dark mode** has the empty hub, create flow, and dark mode.
- **`person-options.jsx`** — source of truth for measurements, layout, and exact copy. All values map to existing tokens in `src/theme/theme.ts`.

Fidelity: **high**. Sizes, spacing, radii, copy are final. The sample data in `person-options.jsx` (`MAYA`) is illustrative only.

---

## Navigation model

**Today:** `RootNavigator` has `Home → Person`, where `PersonFormScreen` is *both* create and edit — tapping a person drops you straight into the editable stacked form.

**New:**

```
Home (People list)
  └─ PersonHub            ← NEW. Read-only refresher view (the default destination on tap)
       ├─ EventsScreen    ← NEW. Current + upcoming
       ├─ MomentsScreen   ← NEW. Interactions list
       ├─ GiftsScreen     ← NEW. Gift ideas list (status filter)
       └─ PersonForm      ← EXISTING screen, now bio-only (see below)
```

- Tapping a person in `HomeScreen` now navigates to **`PersonHub`** (not the form).
- **Creating** a person still uses `PersonFormScreen` with no `id` (unchanged entry from the `+` action).
- `PersonFormScreen` in **edit** mode becomes the **bio editor only** — see "Bio editor" below.
- Add these as `Stack.Screen`s in `RootNavigator.tsx`. All can stay in the existing native stack; no tab bar (deferred — only pays off with cross-person views, which are out of scope for now).

**Data & state: unchanged.** Same Apollo queries/mutations (`PERSONS_QUERY`, `GET_PERSON_QUERY`, `GIFT_IDEAS_QUERY`, `INTERACTIONS_QUERY`, the gift/interaction/person mutations, and the `currentEvents`/`upcomingEvents` fields on the person). The hub and list screens read the same data; this is a presentation/navigation change only.

---

## Screen specs

### `PersonHub` (new) — the refresher

Top-to-bottom, `ScrollView` on `colorsLight.bg`:

1. **NavBar** — leading `BackButton` ("People"), centered person name, trailing **"Edit"** link (→ `PersonForm` bio editor). Sticky, translucent (`colorsLight.bg` @ ~0.86 + blur), hairline bottom border.
2. **Profile header** — avatar 68 + full name (24/700, ls -0.6) + `relationship · city` (14, `textMuted`). **The whole header row is tappable → opens the bio editor** (same as "Edit"); show a faint `chevron-right` (`textFaint`) at the row's trailing edge to signal it. There is intentionally **no separate "Details" row** — the header tap + Edit link are the two entry points to the bio.
3. **Key-facts chips** — horizontal scroll, 8px gap: `Birthday {date}` (tinted: `primarySoft` bg, `primary` text), `{employer}`, `Last contact {n}`. Each chip is `Fact`: 7×12 padding, pill radius, leading 14px icon. (Glance summary only; full record is the bio editor.)
4. **"What's going on"** `SectionLabel` with a trailing **"+ Add"** link (opens the current-event sheet). Below: stacked `ItemCard`s — 7px `success` dot · text 15 · trailing `pencil`. Tap a card → edit-current sheet. This block sits directly under identity because it's the most important refresher info.
5. **"Sections"** `SectionLabel`, then three tappable summary rows (`gap: 10`):

   | Row | Icon block tint | Count | Preview (one latest item) |
   |-----|-----------------|-------|---------------------------|
   | **Events** | `primarySoft` / `primary`, cake | total current+upcoming | nearest upcoming, e.g. "Birthday in 9 days · …" |
   | **Moments** | `#E5EBEE` / `#3F7B8E` (dark `#22323A`), chat | count | latest summary · relative time |
   | **Gift ideas** | `giftIconBg` / `giftIconFg`, gift | count | shortlist count + top idea |

   Row = `ItemCard` layout: 44px icon block · `[title 16/600 + count 13/600 textFaint][preview 13/textMuted, single line ellipsis]` · `chevron-right` 18. Tap → the matching list screen. **Preview = count + one latest item** (decided).

### `EventsScreen` (new)

- NavBar: back, "Events", trailing `+` (→ new upcoming-event sheet).
- **"What's going on"** label (+ Add → current-event sheet) → current-event `ItemCard`s (dot + pencil, tap to edit).
- **"Upcoming · N"** label with a right-aligned sort affordance ("By date"). Cards: tinted icon block · title 15/600 (+ relative-time pill when soon, `primary` on `primarySoft`) · `{when} · {note}` subtitle · chevron. Tap → edit-event sheet.

### `MomentsScreen` (new)

- NavBar: back, "Moments", trailing `+` (→ new-moment sheet).
- **"N moments"** label + sort affordance ("Recent").
- `ItemCard`s: top row `CHANNEL` (11/600 caps, `primary`) + relative time (`textFaint`); body summary 15/1.4; optional location row with `pin` icon. Tap → edit-moment sheet. List is recency-ordered.

### `GiftsScreen` (new)

- NavBar: back, "Gift ideas", trailing `+` (→ new-gift sheet).
- **Status filter chips** (horizontal): `All N · Shortlist N · Idea N · Purchased N · Gifted N`. Selected = `text` bg / `bg` text (matches the home filter-chip pattern). Filtering is client-side over the loaded list.
- Label reflects the active filter + sort affordance ("Priority").
- `ItemCard`s: gift icon block · title 15/600 · status pill (color per status, see below) + `{occasion} · P{priority}`. Tap → edit-gift sheet.

**Gift status pill colors** (light): `idea` `#F4EFE7`/`#6F6860` · `shortlist` `#F8E5DC`/`#B85C3E` · `purchased` `#E7EEDB`/`#5C7A2E` · `gifted` `#E5EBEE`/`#3F7B8E`. Dark variants in `person-options.jsx` (`DARK.status`).

#### Sorting (all lists)

Default is **recency** now. Build the sort affordance as a real control (it opens a sheet like the existing `SortSheet`) so it can extend per-list without layout change: Moments → recent / oldest / by channel; Gifts → priority / status / recently added; Events → by date. Wire only recency for v1; leave the others as the obvious next step.

### Bio editor — `PersonFormScreen`, slimmed

The existing edit form, with the **section blocks removed** (no `EventsSection`, `GiftIdeasSection`, `InteractionsSection`). It now contains only: avatar 84 + "Change photo", **Name** group, **Details** group (City / Employer / Role / Relationship), **Personal** group (Birthday / Interests chips), then the **Delete person** link. This is what the long stacked scroll collapses to — short and focused. Create mode is unchanged (name required, muted Save until valid, tip text at the bottom).

> Section editing (events/gifts/moments) no longer lives in this form — it happens on the hub and list screens via the sheets below.

---

## Edit model — reuse the existing DRY bottom sheets

**No new edit UI.** Add *and* edit both open the bottom sheet you already ship:

| Object | Component (existing) | Opened from |
|--------|----------------------|-------------|
| Gift idea | `GiftIdeaModal` (→ `FormModal`) | Gifts screen rows + `+` |
| Moment | `InteractionModal` (→ `FormModal`) | Moments screen rows + `+` |
| Upcoming event | `UpcomingEventModal` | Events screen rows + `+` |
| Current event | `TextModal` | "What's going on" rows + "+ Add" (hub & Events) |

These are already driven by an `initial` prop + `titleText`, so one component serves create and edit — keep that. The hub's quick-add and each list's `+` both call the same modal with an empty `initial`; tapping a row calls it with the row's data. The section components (`GiftIdeasSection`, etc.) already own this open/edit/delete wiring — lift that logic into the new list screens largely as-is.

---

## Deleting items

Delete is destructive, so it lives in **two surfaces** and always confirms through the existing **`ConfirmSheet`** (destructive variant). Applies to gift ideas, moments, and events. See `DeleteSwipe` / `DeleteInSheet` in the reference (section **06 · Deleting items**).

### A · Swipe-to-delete (primary)

The iOS-standard swipe on any list row — Moments, Gifts, and the Upcoming/What's-going-on rows on the Events screen.

- Swipe a row left to reveal a full-height **Delete** action (92px, `colorsLight.danger` bg, white `trash` icon + "Delete" label, on the row's trailing edge).
- Tapping Delete (or a full swipe) opens **`ConfirmSheet`**; it does **not** delete inline without confirmation.
- Use `react-native-gesture-handler`'s `Swipeable` (already in the RN/Expo stack via React Navigation) for the row. Row corners stay `radius.lg`; clip the swipe action to the row.

### B · Delete in the edit sheet (discoverable)

The always-findable path for anyone who doesn't swipe. Every edit sheet (`GiftIdeaModal`, `InteractionModal`, `UpcomingEventModal`, `TextModal`) gets a destructive **"Delete {item}"** control at the bottom of its body — a full-width outlined button: `danger` text + `trash` icon, `1px border` (`colorsLight.border`), `radius.lg`. Mirrors the existing **"Delete person"** link in the bio editor.

- Shown only in **edit** mode (when the sheet has an `initial` item), never on create.
- Tapping it opens **`ConfirmSheet`** above the form sheet; confirming runs the delete and dismisses both.

### Confirmation — reuse `ConfirmSheet`

Both paths call the existing `ConfirmSheet` with `destructive`:

- **Title:** `Delete {moment|gift idea|event}?`
- **Message:** name the item, e.g. *“Ceramics workshop voucher” will be removed from Maya's gift ideas.* (events/moments: quote the title/summary).
- **Confirm:** `Delete` (red). **Cancel** dismisses.

### Data

- **Gift ideas** → `DELETE_GIFT_IDEA_MUTATION` (by `id`), then refetch.
- **Moments** → `DELETE_INTERACTION_MUTATION` (by `id`), then refetch.
- **Events** (current & upcoming) → no delete mutation — they're array fields on the person; remove the item and call `UPDATE_PERSON_MUTATION` with the new `currentEvents` / `upcomingEvents`, exactly as `EventsSection` already edits them.
- In **create** mode (new person, before save), delete just removes the entry from local state — no network, matching the current `PersonFormScreen` local-array pattern.

> **Bulk multi-select** was considered and **parked** — add an "Edit" toggle with selection + a "Delete N" bar only if backlogs get messy.

---

## States

- **Empty hub (fresh person):** identity + a dashed hint card ("Nothing logged yet…") + a "Start adding" group of three prompt rows (Events / Moments / Gifts) with a trailing `+`. See `HubEmpty` in the reference.
- **Empty within a list:** standard empty copy + the section's add affordance.
- **New person:** unchanged create flow (`PersonFormScreen`, no id). See `NewPerson` in the reference.
- **Dark mode:** fully specified — tokens already exist in `colorsDark`. The reference's dark hub is interactive. Card shadows drop to none on dark; status/icon tints use the dark map.

---

## Component reuse map

Mostly reuse — the hub is new composition over existing primitives:

| Need | Use |
|------|-----|
| Avatar, SectionLabel, ItemCard, FieldGroup/FieldRow, PrimaryButton, NavBar/BackButton/NavLink | existing `src/components/ui/*` |
| Gift / moment / event / current-event sheets | existing `src/components/modals/*` |
| Section open/edit/delete logic | lift from existing `src/components/sections/*` into the new list screens |
| Tokens, avatar color, initials | existing `src/theme/theme.ts` (no changes) |
| **New:** `PersonHub`, `EventsScreen`, `MomentsScreen`, `GiftsScreen` | create under `src/screens/` |
| **New:** `SummaryRow` (count + preview hub row), `KeyFactChip` | create under `src/components/ui/` |

---

## Acceptance checklist

- [ ] Tapping a person opens `PersonHub` (read-only), not the form.
- [ ] Hub header (avatar + name) and "Edit" both open the bio editor; faint chevron on the header signals it. No separate "Details" row.
- [ ] Key-facts chips render in a horizontal scroll; birthday chip is tinted.
- [ ] "What's going on" sits under identity with quick-add; cards open the current-event sheet.
- [ ] Three section rows (Events / Moments / Gifts) show count + one latest preview and push their list screens.
- [ ] Each list screen has its own `+` and recency order; Gifts has working status filter chips; sort affordance present (recency wired).
- [ ] Add/edit everywhere uses the existing bottom-sheet modals (one component, create + edit).
- [ ] `PersonFormScreen` edit mode shows bio only — no event/gift/moment sections.
- [ ] Empty hub, empty lists, and new-person states match the reference.
- [ ] Dark mode matches; no Apollo query/mutation changes.
- [ ] Delete available two ways — swipe-to-delete on list rows **and** a "Delete {item}" control in each edit sheet (edit mode only).
- [ ] Both delete paths confirm via `ConfirmSheet` (destructive); gifts/moments use delete mutations, events use `UPDATE_PERSON_MUTATION` with the item removed.

## Out of scope (parked)

Global bottom tab bar and cross-person views (all-gifts board, all-upcoming) — revisit if/when you want app-wide rollups. No reminder/nudge cue on the hub (removed by design). Bulk multi-select delete parked (see Deleting items).
