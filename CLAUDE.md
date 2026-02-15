# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests once (vitest run)
npm run test:watch   # Tests in watch mode
```

Run a single test file: `npx vitest run src/path/to/file.test.ts`

## Architecture

Personal gym/fitness tracker — React 18 + TypeScript + Vite SPA. **No backend**; all data lives in localStorage.

### Key layers

- **Pages** (`src/pages/`): Dashboard, Weight, Food, GymSession — each route is self-contained with local state
- **UI components** (`src/components/ui/`): shadcn/ui library (Radix + Tailwind + CVA variants). Add new ones via shadcn CLI
- **Custom components** (`src/components/`): ConsistencyCalendar (GitHub-style heatmap), Navigation (responsive top/bottom nav)
- **Hooks** (`src/hooks/`): `useLocalStorage` is the primary data persistence hook — wraps localStorage with React state
- **Types** (`src/types/gym.ts`): Domain models — WeightEntry, FoodEntry, GymSession, Exercise, ExerciseSet, WorkoutPlan

### Data persistence

All state uses `useLocalStorage<T>(key, default)`. Storage keys: `gym-weights`, `gym-foods`, `gym-sessions`. No API calls. React Query is configured but unused (future backend readiness).

### Routing

React Router DOM in `src/App.tsx`: `/` (Dashboard), `/weight`, `/food`, `/gym`, `*` (NotFound).

### Styling

Tailwind CSS with CSS variable theme system defined in `src/index.css`. Always dark mode (hardcoded). Use `cn()` from `src/lib/utils.ts` for conditional classes.

### Path alias

`@/*` maps to `src/*` (configured in vite and tsconfig).

## Testing

Vitest + @testing-library/react + jsdom. Setup in `src/test/setup.ts` (includes matchMedia mock). Tests go in `src/**/*.{test,spec}.{ts,tsx}`.

## Notable choices

- TypeScript strict mode is OFF
- Date handling uses date-fns with ISO strings (`yyyy-MM-dd`)
- Toasts via Sonner (`toast.success()`, `toast.error()`)
- Icons from lucide-react
