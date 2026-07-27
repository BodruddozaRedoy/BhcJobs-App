# BHC Jobs React Native Task Tracker

> Task: Landing Page & Authentication Development
>
> Platform: React Native (Expo SDK 57)
> Status: 🟢 Near complete — see [Remaining Work](#remaining-work)
>
> Last reviewed: 2026-07-27

---

# Progress

- [x] Project Setup
- [x] Landing Page
- [x] Login Screen
- [x] Registration Screen
- [x] API Integration
- [ ] Testing — manual QA checklist not signed off (see §14)
- [x] Documentation
- [ ] Final Submission — release APK + final review pending (see §15, §17)

---

# 1. Project Setup

## Initialize Project

- [x] Create React Native project — Expo SDK 57 + expo-router
- [x] Setup TypeScript — `strict: true`, `@/*` path alias
- [x] Configure ESLint — `eslint.config.js` (flat config, `eslint-config-expo`)
- [x] Configure Prettier — `.prettierrc` + `.prettierignore`, with `prettier-plugin-tailwindcss` sorting classes across `className`, `containerClassName` and `contentClassName`
- [x] Setup folder structure — `app/ components/ hooks/ services/ lib/ types/ constants/ context/`
- [x] Configure environment variables (.env) — `constants/config.ts` reads `EXPO_PUBLIC_*` with dev fallbacks
- [x] Install required dependencies

## Navigation

- [x] Setup React Navigation — expo-router file-based routing, `(auth)` and `(tabs)` groups
- [x] Landing Screen — `app/(tabs)/index.tsx`
- [x] Login Screen — `app/(auth)/login.tsx`
- [x] Registration Screen — `app/(auth)/register.tsx`
- [x] OTP Verification Screen — `app/(auth)/verify-otp.tsx` (beyond spec)

## State Management

- [x] Choose state management — React Context (`AuthProvider`, `ThemeProvider`, `ToastProvider`) + feature hooks
- [x] Setup API layer — `services/api/` (axios instance, interceptors, typed clients)
- [x] Global loading state — `AuthProvider.isRestoring` for session rehydration; per-section states via `useAsyncList`

---

# 3. API Configuration

## Base URL

- [x] Configure Base URL

```
https://dev.bhcjobs.com
```

## Storage URL

- [x] Configure Storage URL

```
https://dev.bhcjobs.com/storage
```

## GET APIs

- [x] Industry API
- [x] Jobs API
- [x] Companies API

```
GET /api/industry/get
GET /api/job/get
GET /api/company/get
```

## POST APIs

- [x] Register API
- [x] Phone Verify API
- [x] Login API

```
POST /api/job_seeker/register
POST /api/job_seeker/phone_verify
POST /api/job_seeker/login
```

---

# 4. Landing Page

## Hero Banner

- [x] Hero section — `HomeBanner` with gradient + animated `BannerWave` + search field
- [x] Proper spacing
- [x] Responsive layout

---

## Popular Industries

- [x] Fetch industries
- [x] Loading state
- [x] Empty state
- [x] Error state
- [x] Industry cards
- [x] Industry image
- [x] Industry name

---

## Recommended Jobs

- [x] Fetch jobs
- [x] Loading state
- [x] Empty state
- [x] Error state
- [x] Job cards

Display:

- [x] Company logo
- [x] Job title
- [x] Company name
- [x] Location
- [x] Job type (if available)
- [x] Salary (if available) — SAR with approximate BDT conversion

---

## Popular Companies

- [x] Fetch companies
- [x] Loading state
- [x] Empty state
- [x] Error state

Display:

- [x] Company logo
- [x] Company name

---

## Landing UI

- [x] Matches reference website
- [x] Responsive on small devices
- [ ] Responsive on tablets — layout is fluid, but not yet verified on a tablet form factor
- [x] Consistent spacing
- [x] Modern typography
- [x] Reusable cards
- [x] Proper shadows
- [x] Rounded corners

---

# 5. Login Screen

## UI

- [x] Phone input
- [x] Password input — with show/hide toggle
- [x] Login button — with inline loading spinner
- [x] Register navigation

---

## Validation

- [x] Required phone
- [x] Required password
- [x] Invalid phone validation — `^01\d{9}$` (zod + react-hook-form, `onBlur`)

---

## API

- [x] Call login API
- [x] Loading state
- [x] Success handling — session persisted to secure storage, `router.replace("/(tabs)")`
- [x] Error handling — per-field errors inline, everything else as a toast

---

# 6. Registration Screen

## UI

- [x] Required input fields — name, phone, passport, DOB, gender, email, password, confirm
- [x] Register button
- [x] Login navigation

---

## Validation

- [x] Required fields
- [x] Phone validation
- [x] Password validation — min 6 characters (matches backend)
- [x] Confirm password validation (if applicable)
- [x] Passport format, real-calendar DOB + age bounds, email format, terms acceptance

---

## API

- [x] Register API integration
- [x] Receive OTP — redirects to `verify-otp` with the phone as a param
- [x] Phone Verify API
- [x] Loading state
- [x] Success state
- [x] Error state

---

# 7. Image Handling

- [x] Centralised in `lib/media.ts` — returns `undefined` for a missing filename so cards can fall back to a placeholder

## Industry

- [x] Build URL

```
{Storage_URL}/industry-image/{image}
```

---

## Jobs

- [x] Build URL

```
{Storage_URL}/company-image/{image}
```

---

## Companies

- [x] Build URL

```
{Storage_URL}/company-image/{image}
```

---

# 8. Components

## Reusable Components

- [x] Button
- [x] Text Input
- [x] Header — `components/global/AppHeader.tsx`
- [x] Section Header
- [x] Job Card
- [x] Company Card
- [x] Industry Card
- [x] Loader
- [x] Error View — `components/ui/ErrorView.tsx`, with an optional retry gated on `canRetry`
- [x] Empty View — `components/ui/EmptyView.tsx`
- [x] Extras: Checkbox, Select, DateField, DatePickerModal, OtpInput, Divider, FieldLabel, ShowMoreButton, Toast

---

# 9. Error Handling

- [x] API failure — normalised into `ApiError` in the axios response interceptor
- [x] Network failure — `kind: "network"`, "No internet connection…"
- [x] Timeout handling — 15s `API_TIMEOUT_MS`, `kind: "timeout"`
- [x] Invalid response handling — `getData()` rejects a 200 with a missing `data` key
- [x] User-friendly messages — server wording preferred, generic fallback per status class
- [x] Handles this API's HTTP-200-with-`status: false` failure envelope

---

# 10. Performance

- [ ] FlatList — deliberately not used: the home screen is one vertical `ScrollView` and the list endpoints are unpaginated, so a nested vertical `FlatList` would warn and lose virtualisation anyway. Sections cap at 8 items with a "show more" toggle. Revisit if the API adds pagination.
- [x] Memoized components — `JobCard`, `IndustryCard` and `CompanyCard` wrapped in `React.memo`, on top of the React Compiler's automatic memoisation
- [x] useCallback
- [x] useMemo
- [x] Optimized image rendering — `expo-image` with caching
- [x] Avoid unnecessary re-renders — module-level fetchers keep `useAsyncList` effects stable; requests aborted on unmount

---

# 11. Code Quality

- [x] Reusable components
- [x] Custom hooks — `useAsyncList`, `useCountdown`, one hook per feature
- [x] API service separation — `services/api/{axios,client,endpoints,*.api}.ts`
- [x] Constants — `constants/{config,colors,theme}.ts`
- [x] Types — one file per domain in `types/`
- [x] No duplicated code
- [x] Clean naming
- [x] Comments where necessary

---

# 12. Responsive Design

- [x] Small Android
- [x] Large Android
- [ ] Tablet support — auth cards cap at 420px and centre; home grid untested on a tablet
- [ ] Landscape check (optional)

---

# 13. Optional Bonus

- [ ] Skeleton loaders — spinner + message instead
- [x] Fade animations — Toast enter/exit, animated banner wave
- [ ] Pull to refresh — `AppScreen` accepts a `refreshControl`, but the home screen does not pass one
- [x] Dark mode — full light/dark palette via `ThemeProvider` + NativeWind `dark:` variants
- [ ] Better empty state — plain text, no illustration
- [x] Better error UI — kind-aware message plus a "Try again" button only when a retry could succeed
- [x] Secure session storage — token in `expo-secure-store`, non-sensitive state in MMKV
- [x] Global toast system

---

# 14. Testing Checklist

> Verified by code review; runtime QA on a device still to be signed off.

Landing

- [x] Industry API works
- [x] Jobs API works
- [x] Company API works
- [x] Images load correctly

Login

- [ ] Validation
- [ ] Success
- [ ] Invalid credentials
- [ ] Network error

Registration

- [ ] Validation
- [ ] Register
- [ ] OTP received
- [ ] Phone verification

---

# 15. Deliverables

- [x] Push source code to GitHub — https://github.com/BodruddozaRedoy/BhcJobs-App (`main` up to date with origin)
- [ ] APK generated — only a **debug** APK exists (`android/app/build/outputs/apk/debug/app-debug.apk`); release build pending
- [x] README written
- [ ] Screen recording (optional)

---

# 16. README Checklist

- [x] Project overview
- [x] Features
- [x] Folder structure
- [x] Installation
- [x] Environment setup
- [x] Run Android
- [x] Build APK
- [x] API configuration
- [x] Tech stack

---

# 17. Final Review

- [x] No console.log — all logging goes through `lib/logger.ts`, a no-op outside `__DEV__`
- [x] No unused imports — `npm run lint` passes clean
- [x] No TypeScript errors — `npm run typecheck` passes clean
- [x] No ESLint warnings — 0 errors, 0 warnings
- [x] Proper formatting
- [x] All APIs working
- [x] Images working
- [x] Responsive UI
- [x] README completed
- [ ] APK tested — debug only

---

# Remaining Work

Ordered by what blocks submission.

1. **Generate a release APK** — `npx expo run:android --variant release` or `eas build -p android --profile preview`.
2. **Manual QA pass** — walk §14 on a device and tick it off.
3. **Bonus polish** — skeleton loaders, pull-to-refresh, richer empty states (§13).
4. **Check the layout on a tablet** (§12).

## Done — memoised cards (2026-07-27)

- Wrapped `JobCard`, `IndustryCard` and `CompanyCard` in `React.memo`, keeping the same export names so no call site changed.
- The payoff is the "show more" toggle. Flipping `expanded` re-runs each section's `.map()` and builds a fresh element for every card; memo lets the cards already on screen skip re-rendering instead of rebuilding all of them to reveal the ones below. `JobCard` gains the most — it derives two currency lines, a date and a logo URL on every render.
- Verified the props are actually stable, since memo is worthless otherwise: all three sections pass the item straight from the fetched array and forward `onSelect`/`onView`/`onApply` unwrapped, so nothing is rebuilt inline at the call site. Noted in each component's docstring, because an inline arrow added later would silently switch the memo off.
- Note: `app.json` sets `experiments.reactCompiler: true` and `babel-plugin-react-compiler@1.0.0` is installed, so components are already auto-memoised internally. The compiler does not add a props-comparison at the component boundary, which is exactly what these `memo` calls contribute — the two are complementary, not redundant.

## Done — shared state components (2026-07-27)

- Added `components/ui/ErrorView.tsx` and `components/ui/EmptyView.tsx`, built to match `Loader`'s API (`fullScreen`, `className`) and padding, so all three states occupy the same visual slot and a section does not jump as it moves between them.
- `ErrorView` takes `canRetry` and only renders the button when a retry could actually succeed, keeping the rule in one place instead of re-stated per section.
- Refactored `PopularIndustries`, `RecommendedJobs` and `PopularCompanies` onto them — 60 lines of duplicated JSX down to 6, with no visual change.
- Both announce themselves to screen readers (`ErrorView` as an `alert`), which the inline blocks did not.

## Done — build health (2026-07-27)

- Reinstalled dependencies, which resolved the missing `react-native-keyboard-controller` and `react-native-svg` type declarations.
- Regenerated `.expo/types/router.d.ts`. It was stale: it predated `verify-otp.tsx` and carried bogus `/../components/ui/*` entries, which is what made `router.replace("/(auth)/verify-otp")` fail to typecheck.
- Fixed 11 ESLint errors the missing `eslint` package had been hiding:
  - `Toast.tsx` — `useRef(new Animated.Value(…)).current` reads a ref during render and reconstructs the value on every render. Now a `useState` lazy initialiser.
  - `DatePickerModal.tsx` — three `setState`-in-effect violations. The wheel highlight is now a drag _override_ (`dragIndex ?? index`) instead of a mirror needing re-sync; the day clamp is derived during render; and the re-seed-on-open effect is gone, replaced by `DateField` remounting the modal with a `key`. Side effect: 31 Jan → Feb → Mar now returns to the 31st instead of being permanently rewritten to the 28th.
- Scoped ESLint overrides for the two legitimate warning classes (CommonJS `require` in build configs, `axios.create`/`axios.isAxiosError` member access).
- Added Prettier 3.9 + `.prettierrc`/`.prettierignore`, moved `prettier-plugin-tailwindcss` from `dependencies` to `devDependencies` (0.5 → 0.8), and formatted the codebase.
- Added `.env.example`; added `typecheck`, `format` and `format:check` scripts; removed the broken `reset-project` script (`scripts/reset-project.js` does not exist).
- Deleted the four empty files: `store/app.store.ts`, `store/auth.store.ts`, `store/index.ts`, `lib/i18n.ts`.

`npm run typecheck`, `npm run lint` and `npm run format:check` all pass clean, and `npx expo export --platform android` bundles successfully.
