# BHC Jobs

A React Native (Expo) job-seeker app for [BHC Jobs](https://dev.bhcjobs.com) — a platform connecting the Bangladeshi workforce with verified employers in Saudi Arabia.

The app covers the job-seeker landing experience and the full authentication flow: browse industries, recommended jobs and hiring companies without an account, then register, verify your phone by OTP, and sign in.

| Landing                                  | Login            | Register               | OTP                            |
| ---------------------------------------- | ---------------- | ---------------------- | ------------------------------ |
| Hero search, industries, jobs, companies | Phone + password | 8-field validated form | 4-digit code with resend timer |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screens](#screens)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Running the App](#running-the-app)
- [Building an APK](#building-an-apk)
- [API Configuration](#api-configuration)
- [Project Structure](#project-structure)
- [Architecture Notes](#architecture-notes)
- [Scripts](#scripts)
- [Known Issues](#known-issues)
- [License](#license)

---

## Features

### Landing page

- **Hero banner** with a gradient background, an animated SVG wave, and a job search field.
- **Popular Industries** — image + name cards, collapsed to 8 with a "show more" toggle.
- **Recommended Jobs** — company logo, job title, company name, location, job type and salary (SAR, with an approximate BDT figure).
- **Popular Companies** — logo + name cards.
- Every section handles all four states independently: **loading**, **ready**, **empty**, and **error with retry**.

### Authentication

- **Login** — phone + password, with a show/hide password toggle.
- **Registration** — name, mobile, passport number, date of birth, gender, email, password and confirmation, plus a terms checkbox that links out to the live legal pages.
- **OTP verification** — 4-digit code input with auto-advance, paste support, and a resend countdown.
- **Persistent sessions** — the bearer token is written to the device keychain via `expo-secure-store` and rehydrated on cold start, so a signed-in user stays signed in.

### Cross-cutting

- **Dark mode** — a complete light/dark palette, following the system colour scheme.
- **Form validation** — [zod](https://zod.dev) schemas resolved through [react-hook-form](https://react-hook-form.com), validating on blur. Server-side per-field errors are merged into the same form state, so a message like "The phone has already been taken" lands on the phone input rather than in a toast.
- **Typed API layer** — a single axios instance with request/response interceptors that normalise every failure into one `ApiError` shape (`network` / `timeout` / `client` / `server` / `invalid_response` / `unknown`).
- **Global toasts** for request-level success and failure.
- **Dev-only request logging** — formatted request/response blocks with timings and redacted credential headers, compiled out of release builds.
- **Responsive layout** — fluid widths with a max-width cap on the auth cards, safe-area aware, keyboard-avoiding.

---

## Tech Stack

| Area       | Choice                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| Framework  | [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), React Native 0.86, React 19  |
| Language   | TypeScript (`strict`)                                                                |
| Navigation | [expo-router](https://docs.expo.dev/router/introduction/) (file-based, typed routes) |
| Styling    | [NativeWind 4](https://www.nativewind.dev) (Tailwind CSS for React Native)           |
| Forms      | react-hook-form + zod via `@hookform/resolvers`                                      |
| HTTP       | axios, with interceptors for auth, logging and error normalisation                   |
| State      | React Context (`AuthProvider`, `ThemeProvider`, `ToastProvider`) + feature hooks     |
| Storage    | `expo-secure-store` (tokens), `react-native-mmkv` (non-sensitive state)              |
| Images     | `expo-image`                                                                         |
| Animation  | `react-native-reanimated`, `react-native-svg`                                        |
| Linting    | ESLint 9 (flat config, `eslint-config-expo`)                                         |
| Formatting | Prettier 3 + `prettier-plugin-tailwindcss`                                           |

---

## Screens

| Route                | File                                                       | Purpose                     |
| -------------------- | ---------------------------------------------------------- | --------------------------- |
| `/(tabs)/`           | [app/(tabs)/index.tsx](app/%28tabs%29/index.tsx)           | Landing page                |
| `/(tabs)/jobs`       | [app/(tabs)/jobs.tsx](app/%28tabs%29/jobs.tsx)             | Jobs tab (placeholder)      |
| `/(tabs)/search`     | [app/(tabs)/search.tsx](app/%28tabs%29/search.tsx)         | Search tab (placeholder)    |
| `/(tabs)/dashboard`  | [app/(tabs)/dashboard.tsx](app/%28tabs%29/dashboard.tsx)   | Dashboard tab (placeholder) |
| `/(tabs)/profile`    | [app/(tabs)/profile.tsx](app/%28tabs%29/profile.tsx)       | Profile tab (placeholder)   |
| `/(auth)/login`      | [app/(auth)/login.tsx](app/%28auth%29/login.tsx)           | Sign in                     |
| `/(auth)/register`   | [app/(auth)/register.tsx](app/%28auth%29/register.tsx)     | Create an account           |
| `/(auth)/verify-otp` | [app/(auth)/verify-otp.tsx](app/%28auth%29/verify-otp.tsx) | Confirm the phone number    |

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- **Android Studio** with an emulator or a physical device with USB debugging enabled
- **JDK 17** (bundled with recent Android Studio releases)
- macOS + Xcode, only if you intend to build for iOS

### Install

```bash
git clone https://github.com/BodruddozaRedoy/BhcJobs-App.git
cd BhcJobs-App
npm install
```

---

## Environment Setup

Configuration is read from `EXPO_PUBLIC_*` environment variables, which Expo inlines at build time. Every value has a fallback pointing at the dev backend, **so a fresh clone runs without a `.env` file** — create one only to target a different environment.

Copy the template and edit it:

```bash
cp .env.example .env
```

```bash
EXPO_PUBLIC_API_BASE_URL=https://dev.bhcjobs.com
EXPO_PUBLIC_STORAGE_URL=https://dev.bhcjobs.com/storage

# SAR → BDT rate used for the approximate salary figures on job cards.
EXPO_PUBLIC_SAR_TO_BDT=33
```

> `EXPO_PUBLIC_*` values are embedded in the JavaScript bundle and are readable by anyone with the APK. Never put a secret here.

Restart the dev server after changing `.env` — the values are inlined, not read at runtime.

Defaults live in [constants/config.ts](constants/config.ts).

---

## Running the App

```bash
# Start Metro
npm start

# Build and launch on a connected Android device or emulator
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

`npm run android` performs a native build, so the first run takes a few minutes. Subsequent runs reuse the build and only reload JavaScript.

> This project uses native modules (`react-native-mmkv`, `react-native-keyboard-controller`, `expo-secure-store`), so it needs a **development build** — it will not run in Expo Go.

---

## Building an APK

### Local release build

```bash
npx expo run:android --variant release
```

Or with Gradle directly:

```bash
cd android
./gradlew assembleRelease
```

The APK is written to:

```
android/app/build/outputs/apk/release/app-release.apk
```

A debug APK (`.../apk/debug/app-debug.apk`) is produced by a normal `npm run android`.

### Cloud build with EAS

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## API Configuration

**Base URL** — `https://dev.bhcjobs.com`
**Storage URL** — `https://dev.bhcjobs.com/storage`

### Endpoints

| Method | Endpoint                       | Used by            |
| ------ | ------------------------------ | ------------------ |
| `GET`  | `/api/industry/get`            | Popular Industries |
| `GET`  | `/api/job/get`                 | Recommended Jobs   |
| `GET`  | `/api/company/get`             | Popular Companies  |
| `POST` | `/api/job_seeker/register`     | Registration       |
| `POST` | `/api/job_seeker/phone_verify` | OTP verification   |
| `POST` | `/api/job_seeker/login`        | Login              |

Paths are declared once in [services/api/endpoints.ts](services/api/endpoints.ts).

### Response envelope

List endpoints wrap their payload:

```json
{ "status": true, "message": "Jobs fetched successfully", "data": [ ... ] }
```

Two quirks the client handles explicitly:

1. **Failures arrive as HTTP 200** with `status: false` in the body. The response interceptor inspects the envelope and rejects with an `ApiError`, so a wrong password cannot flow through looking like a success.
2. **Field errors live under `error`** (singular), not Laravel's usual `errors`. Both spellings are accepted.

### Images

List endpoints return a bare filename, not a URL. [lib/media.ts](lib/media.ts) resolves it:

```
{STORAGE_URL}/industry-image/{filename}   // industries
{STORAGE_URL}/company-image/{filename}    // jobs and companies
```

A missing filename yields `undefined` so cards can render a placeholder instead of a URL guaranteed to 404.

---

## Project Structure

```
app/                        expo-router routes (file-based)
├─ _layout.tsx              root providers: gesture, keyboard, safe area, theme, toast, auth
├─ (auth)/                  login, register, verify-otp
└─ (tabs)/                  landing, jobs, search, dashboard, profile

components/
├─ global/                  AppHeader, Toast
├─ layout/                  AppScreen — scroll, gradient, safe area, keyboard handling
├─ module/home/             HomeBanner, BannerWave, PopularIndustries, RecommendedJobs,
│                           PopularCompanies, IndustryCard, JobCard, CompanyCard
└─ ui/                      Button, Input, Select, Checkbox, DateField, DatePickerModal,
                            OtpInput, Loader, Divider, FieldLabel, SectionHeading, ShowMoreButton

constants/                  config (env), colors, theme
context/                    AuthProvider, ThemeProvider, ToastProvider
hooks/
├─ feature/auth/            use-login, use-register, use-verify-otp
├─ feature/home/            use-industries, use-jobs, use-companies
├─ use-async-list.ts        loading/ready/empty/error state machine with retry + abort
└─ use-countdown.ts         OTP resend timer

lib/
├─ validation/              zod schemas for login, register and OTP
├─ forms/                   maps server field errors onto react-hook-form state
├─ media.ts                 storage filename → image URL
├─ currency.ts, format.ts   salary and text formatting
└─ logger.ts                dev-only logging (no-op outside __DEV__)

services/
├─ api/                     axios instance, interceptors, request helpers, per-domain clients
├─ storage/                 secure-store and MMKV wrappers, storage keys
└─ session.ts               start / restore / end a session

types/                      auth, user, job, company, industry
```

---

## Architecture Notes

**Screens are presentational.** Every screen with behaviour pairs with a hook that owns validation, the request, error placement and navigation — `useLogin`, `useRegister`, `useVerifyOtp`, `useIndustries`, `useJobs`, `useCompanies`.

**One state field, four states.** `useAsyncList` models list loading as a discriminated union (`loading | ready | empty | error`) rather than separate `isLoading` / `error` / `data` booleans, so a render cannot express "loading and errored". It also aborts in-flight requests on unmount and exposes a `retry` that is only surfaced when the failure is actually retryable.

**Errors surface in exactly one place.** Per-field errors from the API are attached to the matching input; anything else becomes a toast. Never both, so the user is not told the same thing twice.

**Client validation mirrors the backend where it matters.** The login phone rule matches what the server accepts rather than being stricter, so an account created with an unusual number is not locked out of the sign-in form. Registration is intentionally _stricter_ than the server for `name`, `email`, `dob` and `gender`, which the API only checks for presence.

**Sensitive data goes to the keychain.** Tokens live in `expo-secure-store`; MMKV holds only non-sensitive state.

---

## Scripts

| Script                 | Description                       |
| ---------------------- | --------------------------------- |
| `npm start`            | Start the Metro dev server        |
| `npm run android`      | Build and run on Android          |
| `npm run ios`          | Build and run on iOS (macOS only) |
| `npm run web`          | Run in the browser                |
| `npm run lint`         | Lint with ESLint                  |
| `npm run typecheck`    | Type-check with `tsc --noEmit`    |
| `npm run format`       | Format with Prettier              |
| `npm run format:check` | Verify formatting without writing |

---

## Known Issues

- The jobs, search, dashboard and profile tabs are placeholders; the industry and company filter params passed from the landing page are not yet read.
- The error and empty blocks are duplicated inline across the three landing sections rather than extracted into shared components.
- The card components are not wrapped in `React.memo`.
- No skeleton loaders or pull-to-refresh yet.
- Tablet and landscape layouts have not been verified.
- Only a debug APK has been produced so far.

`npm run typecheck`, `npm run lint` and `npm run format:check` all pass clean.

> If `npm run typecheck` reports missing routes such as `/(auth)/verify-otp`, the generated `.expo/types/router.d.ts` is stale — it is gitignored and rebuilt by the dev server. Run `npm start` once and re-check.

See [TASK_TRACKER.md](TASK_TRACKER.md) for the full delivery checklist.

---

## License

MIT — see [LICENSE](LICENSE).
