# Proxi — Location & Crowd Management for Service Agencies

A cross-platform mobile app (Android + iOS) that helps people **find nearby service
agencies** — banks, telecom offices, hospitals, clinics, administrative centres — see
**how crowded they are right now**, get an **optimised route** there, and **book a
waiting ticket remotely** so they skip the queue.

The app ships two experiences from a single binary:

| Role | Who it is | What they do |
| --- | --- | --- |
| `user` | The customer | Find agencies on a map, check live queue/wait, book & pay for a ticket, track appointments |
| `provider` | The agency / service owner | Publish services & time slots, watch the visitor queue, accept/complete appointments |

> **Note on the spec.** The original proposal recommended Flutter (Dart). This repo is
> implemented in **React Native + TypeScript** instead. Everything else in the spec
> (features, phases, integrations) still applies — where this README and the proposal
> disagree on technology, **this README is the source of truth.**

📄 **[docs/PROJECT-SPEC.md](docs/PROJECT-SPEC.md)** — the full client requirements: every
feature with acceptance criteria, the security requirements, the 14-week phase plan, a
traceability matrix, and the open questions that still need a client decision. Read that
for *what we agreed to build*; read this README for *what is built*.

---

## Table of Contents

- [Feature Status](#feature-status)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Navigation Map](#navigation-map)
- [Backend API Reference](#backend-api-reference)
- [Data Models](#data-models)
- [Core Flows](#core-flows)
- [Conventions](#conventions)
- [Native Permissions](#native-permissions)
- [Known Gaps & Roadmap](#known-gaps--roadmap)
- [Troubleshooting](#troubleshooting)

---

## Feature Status

Mapping the proposal's feature list to what is actually in the codebase today.

### A. Location and Navigation

| Feature | Status | Where |
| --- | --- | --- |
| Real-time geolocation of agencies by category | Done | [Home.tsx](src/screens/user/Home.tsx), `serviceApi.nearMeServicebyCategory` |
| Map with markers, address search & autocomplete | Done | [Home.tsx](src/screens/user/Home.tsx) (Google Places Autocomplete + Place Details) |
| Service details (slots, description, photos, contact) | Done | Service modal in [Home.tsx](src/screens/user/Home.tsx) |
| Fastest route calculation | Partial | Google Directions API + polyline decode in [Home.tsx](src/screens/user/Home.tsx). Driving mode only, **no live-traffic parameters yet** (`departure_time`/`traffic_model` are not sent) |

### B. Crowd Monitoring

| Feature | Status | Where |
| --- | --- | --- |
| Queue count / estimated wait / crowd badge in UI | Done | `crowdLevel`, `queueCount`, `estimatedWaitMinutes` on [ServiceListing](src/types/models.ts) rendered in [Home.tsx:661](src/screens/user/Home.tsx#L661) |
| Provider dashboard with visitor counts | Done | `appointmentApi.getVisitorsStatus` in [HomeProvider.tsx](src/screens/provider/HomeProvider.tsx) |
| **Real-time** push of queue fluctuations | Missing | Polling / pull-to-refresh only. No sockets, no push — see [Roadmap](#known-gaps--roadmap) |

### C. Remote Booking and Payment

| Feature | Status | Where |
| --- | --- | --- |
| Remote ticket booking with date + slot picker | Done | [Home.tsx](src/screens/user/Home.tsx), `appointmentApi.createAppointment` |
| Ticket number + confirmation screen | Done | [PaymentSuccess.tsx](src/screens/user/PaymentSuccess.tsx) |
| Payment (Orange Money / PayPal / Stripe / Card) | **Simulated** | The payment modal collects details, generates a client-side `transactionId`, hardcodes `paymentAmount: 5.50`, and posts `paymentStatus: 'Completed'`. **No real gateway SDK is integrated.** |
| Notification reminders before a visit | Partial | In-app tray only ([NotificationContext.tsx](src/context/NotificationContext.tsx)), in-memory, cleared on app restart. No scheduled or push reminders |

### D. Personalized Statistics

| Feature | Status | Where |
| --- | --- | --- |
| Visit & reservation history | Done | [History.tsx](src/screens/user/History.tsx), [HistoryProvider.tsx](src/screens/provider/HistoryProvider.tsx) |
| Peak / off-peak insights | Missing | — |
| AI-driven time-slot suggestions | Missing | — |

---

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | React Native `0.87.0` (New Architecture enabled), React `19.2.3` |
| Language | TypeScript `^6.0.3` |
| Navigation | React Navigation v7 — native-stack + bottom-tabs |
| Maps | `react-native-maps` `^1.29.0` (Google provider) |
| Geolocation | `@react-native-community/geolocation` |
| Routing / Places | Google Maps Platform REST APIs (Directions, Places Autocomplete, Place Details) called via `fetch` |
| Storage | `@react-native-async-storage/async-storage` (JWT, cached user, last known location) |
| State | React Context — `AuthContext`, `UiContext`, `NotificationContext`. No Redux |
| Media | `react-native-image-picker` (profile photos, provider documents, service photos) |
| Dates | `moment` + `@react-native-community/datetimepicker` |
| Vector assets | `react-native-svg` + `react-native-svg-transformer` (SVGs import as components) |
| i18n | `i18next` / `react-i18next` installed, `en` + `fr` bundles present — **not wired up yet** |
| Backend | Separate service at `https://proxyapp-backend.onrender.com/` |
| Tests | Jest + `react-test-renderer` |

---

## Getting Started

### Prerequisites

- **Node.js >= 22.11.0** (enforced by `engines` in [package.json](package.json))
- A completed [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for your target platform
- Android Studio (Android) and/or Xcode + CocoaPods (iOS, macOS only)
- A running backend instance, or use the hosted URL — see [Configuration](#configuration)

### Install

```sh
npm install

# iOS only (macOS) — on first clone and after any native dependency change
bundle install
bundle exec pod install --project-directory=ios
```

Custom fonts live in [src/assets/fonts/](src/assets/fonts/) and are linked via
[react-native.config.js](react-native.config.js). If a newly added font does not render,
run `npx react-native-asset` and rebuild.

### Run

```sh
npm start          # Metro bundler
npm run android    # build + install on Android device/emulator
npm run ios        # build + install on iOS simulator (macOS only)
```

### Quality gates

```sh
npm run lint       # ESLint (@react-native/eslint-config)
npm test           # Jest
npx tsc --noEmit   # TypeScript type check
```

---

## Configuration

### API base URL

[src/api/client.ts](src/api/client.ts) resolves the base URL automatically — you should
not need to edit it to run against a local backend:

- **Release builds** use `https://proxyapp-backend.onrender.com/`
- **Dev builds** derive the host from the Metro `scriptURL` on port `3001`, so a physical
  phone on the same Wi-Fi reaches your machine's LAN IP without any edit. Falls back to
  `10.0.2.2:3001` (Android emulator) or `localhost:3001` (iOS simulator).

Change `DEV_PORT` / `PROD_URL` at the top of that file if the backend moves.

> The hosted backend is on a free tier: the **first request after idle can take 30–60 s**
> to cold start. That is not an app bug.

### Google Maps API key

**The key is currently hardcoded and committed in two places:**

- [src/config/maps.ts](src/config/maps.ts) — used by the JS-side REST calls
- [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml) —
  `com.google.android.geo.API_KEY`, used by the native map view

Before any public release: **rotate this key**, move it out of version control (e.g.
`react-native-config`, a gradle property, or an xcconfig), and restrict it by package
name + SHA-1 and bundle ID in the Google Cloud console.

Required Google Cloud APIs: **Maps SDK for Android**, **Maps SDK for iOS**,
**Directions API**, **Places API**.

---

## Project Structure

```
src/
├── api/
│   ├── client.ts          # fetch wrapper: base URL, JWT header, 401 handling, ApiError
│   └── endpoints.ts       # every backend call, grouped by domain, + payload types
├── assets/
│   ├── fonts/             # Inter, Poppins, Roboto, Nunito Sans, Raleway, ABeeZee, SF Pro
│   ├── images/            # PNG artwork & category icons
│   └── tabsIcon/          # SVG tab bar icons (normal + selected pairs)
├── components/            # Text, TextField, PrimaryButton, PageHeader, LegalDocument,
│                          # AppointmentListItem, EmptyState
├── config/maps.ts         # Google Maps API key
├── content/               # Built-in Terms & Privacy copy, used when the CMS entry is
│                          # missing or a placeholder (legal.ts holds the shared bits)
├── context/
│   ├── AuthContext.tsx    # token + userDetail, persisted to AsyncStorage
│   ├── UiContext.tsx      # global loading overlay + toast
│   └── NotificationContext.tsx   # in-app notification tray + bell button
├── hooks/usePaginatedList.ts     # generic paginated list (load more / refresh / hasMore)
├── locales/               # en.json, fr.json (not yet consumed)
├── navigation/            # RootNavigator, role tabs, nested stacks, param-list types
├── screens/
│   ├── auth/              # SignIn, SignUp, ForgotPassword
│   ├── user/              # Home (map + booking), MyAppointments(+Details), PurposeOfVisit,
│   │                      # History, Profile, Settings, PaymentSuccess, PrivacyPolicy, T&C
│   └── provider/          # HomeProvider (dashboard), MyAppointmentsProvider(+Details),
│                          # MyServiceProvider, HistoryProvider, ProfileProvider, SettingsProvider
├── theme/                 # colors.ts (brand orange #F05023), typography.ts
├── types/models.ts        # Category, ServiceListing, Appointment, UserProfile
└── utils/                 # location.ts (permission + current position), imagePicker.ts,
                           # richText.ts (CMS HTML -> renderable blocks)
```

---

## Architecture

### Provider tree

[App.tsx](App.tsx) composes the app shell:

```
GestureHandlerRootView
└── SafeAreaProvider
    └── UiProvider                    (loading overlay + toasts)
        └── AuthProvider              (token, userDetail, login/logout)
            └── NotificationProvider  (in-app tray)
                └── RootNavigator
```

### API layer

All network access goes through [src/api/client.ts](src/api/client.ts). Screens call
[src/api/endpoints.ts](src/api/endpoints.ts) — **never `fetch` the backend directly**. The
Google Maps REST calls in `Home.tsx` are the one deliberate exception, since they hit a
third party rather than our API.

The client:

- injects `Authorization: Bearer <token>` from AsyncStorage on every request
- sets `Content-Type: application/json` **unless** the body is `FormData` (multipart
  uploads must set their own boundary)
- on **401**, clears stored credentials and fires the unauthorized handler registered by
  `AuthContext`, dropping the user back to the sign-in stack
- throws `ApiError { message, status, body }` on any non-2xx response

Standard call shape in a screen:

```ts
try {
  showLoading();
  const res: any = await appointmentApi.getAppointmentByUser({ limit: 10, page: 1 });
  setItems(res?.data ?? []);
} catch (err) {
  showToast(err instanceof ApiError ? err.message : 'Something went wrong');
} finally {
  hideLoading();
}
```

The backend wraps results as `{ status, message, data }`, hence the `res?.data` reads.
Responses are currently typed `any` at the call site — tightening that is a good
incremental cleanup.

### Auth & session

- `login(token, userDetail)` persists both to AsyncStorage and updates state.
- On cold start, `AuthProvider` rehydrates from AsyncStorage behind an `isLoading`
  spinner, so the app never flashes sign-in for an already-authenticated user.
- [RootNavigator](src/navigation/RootNavigator.tsx) switches on `token` (auth stack vs app
  stack), and `RoleTabs` switches on `userDetail.role` (`provider` → `ProviderTabs`,
  otherwise `UserTabs`).

---

## Navigation Map

```
RootStack (headers hidden)
├── unauthenticated: SignIn · SignUp · ForgotPassword
├── authenticated:
│   ├── Tabs → role-based:
│   │   ├── UserTabs
│   │   │   ├── Home                     map, categories, crowd status, booking + payment
│   │   │   ├── MyAppointments (stack)   → MyAppointmentsDetails → PurposeOfVisit
│   │   │   ├── History
│   │   │   └── Settings (stack)         → Profile
│   │   └── ProviderTabs
│   │       ├── HomeProvider             visitor stats, availability switch, latest bookings
│   │       ├── MyAppointmentsProvider (stack) → MyAppointmentsDetailsProvider
│   │       ├── HistoryProvider
│   │       └── SettingsProvider (stack) → ProfileProvider · MyServiceProvider
│   └── PaymentSuccess { appointmentId }
└── always available: PrivacyPolicy · TermsAndConditions
```

All route names and params are typed in [src/navigation/types.ts](src/navigation/types.ts).
**Add the route there first**, then wire the screen — that keeps `navigation.navigate`
type-safe.

---

## Backend API Reference

Paths are relative to the base URL resolved by [client.ts](src/api/client.ts). Everything
except the auth endpoints requires a Bearer token.

### Auth — `authApi`

| Method | Endpoint | Notes |
| --- | --- | --- |
| `login` | `POST auth/login` | `{ email, password }` → token + user |
| `register` | `POST auth/register` | `{ name, email, phone, password, role }` |
| `sendOTPForSignUp` | `POST sendOTPForSignUp` | No `auth/` prefix — matches the backend as-is |
| `sendOTP` | `POST auth/sendOTP` | Forgot-password flow |
| `verifyOTP` | `POST auth/verifyOTP` | `{ otp, token }` |
| `changePassword` | `POST auth/changePassword` | `{ password, token }` |
| `getProfile` | `GET auth/getProfile` | |
| `updateProfile` | `POST auth/updateProfile` | **FormData** — also used to flip provider `isAvailable` |
| `fileUpload` | `POST auth/user/fileupload` | **FormData** — provider verification documents |

### Categories — `categoryApi`

| Method | Endpoint |
| --- | --- |
| `getCategory` | `GET category/getCategory` |

### Services — `serviceApi`

| Method | Endpoint | Notes |
| --- | --- | --- |
| `nearMeServicebyCategory` | `POST service/nearMeServicebyCategory` | `{ category, location: [lng, lat] }` — **GeoJSON order** |
| `getService` | `GET service/getService` | The provider's own listings |
| `createService` / `updateService` | `POST service/createService` · `POST service/updateService` | **FormData**: `service_location` and `service_slot` are JSON-stringified; `oldImages` carries retained photo URLs |
| `deleteService` | `DELETE service/deleteService/:id` | |

### Appointments — `appointmentApi`

| Method | Endpoint | Notes |
| --- | --- | --- |
| `createAppointment` | `POST appointment/createAppointment` | Returns `{ _id, ticketNumber }` |
| `getRequestAppointmentById` | `GET appointment/getRequestAppointmentById/:id` | |
| `getAppointmentByUser` | `GET appointment/getAppointmentByUser` | `?limit&page` |
| `getAppointmentByProvider` | `GET appointment/getAppointmentByProvider` | `?limit&page` |
| `getRequestAppointmentByProviderId` | `GET appointment/getRequestAppointmentByProviderId/:id` | |
| `updateAppointmentStatusByProvider` | `POST appointment/updateAppointmentStatusByProvider` | `{ id, status }` |
| `getHistoryByUserId` / `getHistoryByProviderId` | `GET appointment/getHistoryBy*/:id` | `?limit&page` |
| `getVisitorsStatus` | `GET appointment/getVisitorsStatus` | `{ totalAppoint, pendingAppoint, completedAppoint }` |

### Content — `contentApi`

| Method | Endpoint | Notes |
| --- | --- | --- |
| `getContent` | `GET content/getContent` | Privacy Policy / Terms copy |

### Third-party (Google Maps Platform, called from [Home.tsx](src/screens/user/Home.tsx))

| Purpose | Endpoint |
| --- | --- |
| Address autocomplete | `place/autocomplete/json` |
| Resolve a prediction to coordinates | `place/details/json?fields=geometry` |
| Route polyline, distance, duration | `directions/json?mode=driving` |

---

## Data Models

Defined in [src/types/models.ts](src/types/models.ts).

- **`Category`** — `_id`, `name`, `image`. Drives the category chips on Home (Banks,
  Hospitals, Telecom offices, …).
- **`ServiceListing`** — a bookable branch/agency: `service_slot: string[]` (bookable
  times), `service_photo[]`, `address`, a GeoJSON `service_location`
  (`coordinates: [longitude, latitude]`), the owning `user` (provider), and the crowd
  fields `queueCount`, `estimatedWaitMinutes`, `crowdLevel: 'Low' | 'Moderate' | 'High'`.
- **`Appointment`** — a booked ticket: visitor identity, `purpose_of_visit`,
  `date` / `time` / `full_date`, `status: 'Pending' | 'Completed'`, `ticketNumber`, and the
  payment block (`paymentMethod`, `paymentAmount`, `transactionId`, `paymentStatus`).
- **`UserProfile`** — account record for both roles. Providers additionally use
  `isAvailable`, `about_us`, `document[]`, and
  `status: 'Pending' | 'Verified' | 'Suspended'`.

**Coordinate-order trap:** the backend stores GeoJSON `[longitude, latitude]`, while
`react-native-maps` and the Google REST APIs expect `latitude, longitude`. Check the order
any time you touch location code.

---

## Core Flows

### Booking a ticket (user)

1. Home requests location permission and centres the map on the user, falling back to the
   last location cached in AsyncStorage under `user_saved_location`.
2. The user picks a category → `nearMeServicebyCategory` returns nearby listings → markers
   drop on the map.
3. Tapping a marker or card opens the service modal: photos, description, the **crowd
   badge** (`Low` / `Moderate` / `High`), people-ahead count and estimated wait, plus a
   Directions action that draws the decoded Google polyline with distance and ETA.
4. Book → slot modal: one of the next 4 days × the provider's `service_slot` times.
5. Payment modal: visitor details → payment method (Orange Money / PayPal / Stripe / Card)
   → per-method validation → `createAppointment` with the payment block.
6. A local success notification is pushed into the tray, then the app navigates to
   `PaymentSuccess` with the returned `appointmentId`, which shows the **ticket number**.

> Payment is **mocked end to end**. Wiring a real gateway means replacing the transaction
> block in [Home.tsx:500](src/screens/user/Home.tsx#L500) with a server-created payment
> intent, and only calling `createAppointment` once the gateway confirms.

### Managing a service (provider)

Settings → My Services → create or edit a listing (name, category, address, map location,
description, photos, time slots). Submitted as multipart `FormData`; on edit, retained
images are sent back as `oldImages` so the server can diff them.

### Working the queue (provider)

[HomeProvider](src/screens/provider/HomeProvider.tsx) shows `getVisitorsStatus` counters,
the 5 most recent appointments, and an availability `Switch` that patches `isAvailable`
through `updateProfile`. The full list and accept/complete actions live under the
Appointments tab (`updateAppointmentStatusByProvider`).

---

## Conventions

- **Text**: import `Text` from [src/components/Text.tsx](src/components/Text.tsx), *not*
  from `react-native`. It maps `fontWeight` onto the correct bundled Roboto family, which
  is what keeps typography consistent on Android.
- **Colors**: use tokens from [src/theme/colors.ts](src/theme/colors.ts) — `colors.primary`
  is the brand orange `#F05023`. No raw hex in screens.
- **Feedback**: use `useUi()` — `showLoading` / `hideLoading` / `showToast`. Don't build
  per-screen spinners or use `Alert.alert` for errors.
- **In-app notifications**: `useNotifications().addNotification(title, message, type)`.
- **Paginated lists**: reuse [usePaginatedList](src/hooks/usePaginatedList.ts) rather than
  hand-rolling page state.
- **SVGs**: `import Icon from '../assets/tabsIcon/x.svg'` yields a component — see
  [src/declarations.d.ts](src/declarations.d.ts).
- **Styles**: `StyleSheet.create` at the bottom of each file; no inline style objects in JSX.
- **Exports**: screens are default exports; components, hooks and contexts are named exports.

---

## Native Permissions

Declared in [AndroidManifest.xml](android/app/src/main/AndroidManifest.xml) and
`ios/proxy/Info.plist`:

| Permission | Why |
| --- | --- |
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` / `NSLocationWhenInUseUsageDescription` | Centre the map, find nearby agencies, compute routes |
| `CAMERA` / `NSCameraUsageDescription` | Profile photos, provider documents, service photos |
| `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE` (maxSdk 32) / `NSPhotoLibraryUsageDescription` | Pick existing images |
| `INTERNET` | API access |

Android requests location at runtime via
[requestLocationPermission()](src/utils/location.ts); iOS relies on the Info.plist string.

---

## Known Gaps & Roadmap

Roughly ordered by impact. Items marked **(spec)** are explicitly promised in the proposal.

1. **Real payment integration (spec).** Replace the simulated flow with real Orange Money /
   PayPal / Stripe SDKs plus server-side verification. A client-generated `transactionId`
   and `paymentStatus: 'Completed'` must never be trusted.
2. **Real-time queue updates (spec).** Crowd data is a snapshot fetched on load. Needs
   WebSockets/SSE or push so `queueCount` and `estimatedWaitMinutes` update live.
3. **Push notifications & visit reminders (spec).** The tray is in-memory and dies with the
   process. Needs FCM/APNs plus scheduled local notifications before an appointment.
4. **Secrets management.** Rotate and externalise the committed Google Maps key, and add
   API key restrictions — see [Configuration](#configuration).
5. **Live-traffic routing (spec).** Directions calls should pass `departure_time=now` (and
   consider `traffic_model`) to deliver "fastest route based on current traffic".
6. **i18n activation.** `i18next` and the `en` / `fr` bundles are in place, but nothing
   initialises them — there is no `i18n.ts` and no `useTranslation` call anywhere. Wire it
   up and replace the hardcoded strings.
7. **Biometric authentication (spec).** Password auth only right now.
8. **Personalized statistics (spec).** Peak/off-peak insights and AI-driven slot
   suggestions are not started.
9. **Provider analytics dashboard** and a **customer feedback/rating system** — listed as
   future enhancements in the proposal.
10. **Typed API responses.** Endpoint calls return `any`; give each response a real type.
11. **Test coverage.** Only the default [__tests__/App.test.tsx](__tests__/App.test.tsx)
    exists.
12. **[Home.tsx](src/screens/user/Home.tsx) is ~960 lines** and owns map, search, routing,
    booking and payment. Splitting the modals and the Google Maps calls into their own
    modules/hooks is the highest-value refactor before the next feature lands there.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Network requests fail on a physical device | Metro host detection needs the device on the same Wi-Fi as your machine; also confirm the backend binds `0.0.0.0:3001`, not `127.0.0.1` |
| First API call hangs 30–60 s | Free-tier backend cold start — expected |
| Map renders blank or grey on Android | Google Maps key missing/restricted, or Maps SDK for Android not enabled in the Cloud console |
| Fonts fall back to the system default | Run `npx react-native-asset`, then rebuild (a reload is not enough) |
| Stale native state after `npm install` | `cd android && ./gradlew clean` · `cd ios && bundle exec pod install` |
| Metro cache weirdness | `npm start -- --reset-cache` |

For general React Native issues, see
[reactnative.dev/docs/troubleshooting](https://reactnative.dev/docs/troubleshooting).
