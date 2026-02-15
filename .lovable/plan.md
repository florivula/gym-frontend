
# Gym Tracking App - Implementation Plan

## Visual Design
- **Dark theme** throughout with light blue (#3B82F6) accents
- Clean, minimalist, mobile-first responsive design
- No purple colors; subtle gradients only where they enhance UX
- All data persisted in **localStorage** (no backend needed initially)

---

## Navigation
Bottom navigation bar (mobile) / top nav (desktop) with 4 tabs:
- **Dashboard** (home icon)
- **Weight** (scale icon)
- **Food** (utensils icon)
- **Gym Session** (dumbbell icon)

---

## Page 1: Dashboard
- **4 KPI Cards** — Current Weight, Today's Calories, Today's Protein, Weekly Gym Sessions — displayed in a responsive grid with large numbers and light blue accents
- **Last Gym Session Summary** — Card showing date, workout plan/day type, and a table of exercises with weight, reps, and sets
- **Consistency Calendar** — GitHub-style heatmap showing gym activity over recent months, with light blue intensity levels and hover tooltips

## Page 2: Weight
- **Weight Entry Form** — kg input, date picker (defaults to today), Save button with validation
- **Weight Chart** — Recharts line chart with smooth curve, light blue line with gradient fill, interactive tooltips
- **Weight Log Table** — Reverse chronological list with date, weight, change from previous entry, trend arrows, and delete option

## Page 3: Food
- **Food Entry Form** — Name, calories, protein, time picker (defaults to now), Add button
- **Quick-add placeholder** — "Saved foods will appear here in future updates"
- **Today's Food Log** — Table with time, food name, calories, protein, delete option, and running totals
- **Daily Summary** — Total calories and protein with progress bars

## Page 4: Gym Session
- **Active Session Banner** — Prominent indicator when a session is in progress, showing workout type and start time
- **Start New Session** — Plan selector (PPL, ULPPL, FBEOD, Other) with dynamic day type dropdown, Start button
- **During Session** — Exercise name input, add sets (weight + reps), complete exercise, view all exercises/sets in the current session with edit/remove options, running volume total, Complete Session button
- **Session History** — Reverse chronological list of past sessions with date, plan, day type, exercise count, total volume, and expandable details

---

## Data & Storage
- All data stored in localStorage using structured JSON
- Weight entries: `{ date, weight }`
- Food entries: `{ id, date, time, name, calories, protein }`
- Gym sessions: `{ id, date, plan, dayType, exercises: [{ name, sets: [{ weight, reps }] }], completed, startTime }`

## Tech Stack
- React + TypeScript with client-side routing (react-router-dom)
- Tailwind CSS with custom dark theme CSS variables
- Recharts for weight chart and any visualizations
- date-fns for date handling
- shadcn/ui components (cards, buttons, inputs, selects, popovers, calendar)
- Form validation with controlled components
