# Plaint — Project Documentation

## Overview

Plaint is a cross-platform Expo app for task and project management. It targets Android, iOS, and Web while using Expo Router, React Native, TypeScript, and custom SF Pro fonts.

## Key Features

- Onboarding carousel with auto-advance and call‑to‑action navigation
- Login screen with animated floating inputs and password visibility toggle
- Primary task dashboard with search, filters, and status cards
- Scrollable task table with swipeable rows to reveal hidden actions/columns and inline status dropdowns
- Bottom sheet create task modal with task metadata chips and simulated attachments
- Custom floating bottom tab bar across app sections
- Chat list view with category filters, unread indicators, and empty states
- Complex conversation screen with message bubbles, inline calendar/attachment panels, and animated search

---

## Tech Stack

- Expo SDK ~57
- React Native 0.86.0
- React 19.2.3
- TypeScript ~6.0.3
- Expo Router ~57.0.2
- React Navigation via Expo Router Tabs
- `@expo/vector-icons`, `react-native-svg`
- `expo-font`, `expo-linear-gradient`, `expo-splash-screen`
- `react-native-reanimated` 4.5.0
- `react-native-gesture-handler`
- `expo-image`, `expo-device`, `expo-constants`, `expo-linking`, `expo-web-browser`

---

## Project Structure

```
Plaint/
├── assets/
│   ├── fonts/              # SF Pro Text font files
│   ├── icons/              # Custom SVG icon components
│   └── images/             # App visuals, splash, and icons
├── scripts/
│   └── reset-project.js    # Reset helper script
├── src/
│   ├── app/                # Expo Router screens and routes
│   │   ├── _layout.tsx     # Root layout with ThemeProvider and Stack
│   │   ├── index.tsx       # Entry route
│   │   ├── splashscreem.tsx# Onboarding screen
│   │   ├── explore.tsx     # Expo starter example screen
│   │   ├── (auth)/
│   │   │   └── login.tsx   # Login screen
│   │   └── (tabs)/
│   │       ├── _layout.tsx # Tabs layout with custom tab bar
│   │       ├── Tasks.tsx   # Main task dashboard
│   │       ├── Dashboard.tsx
│   │       ├── stats.tsx
│   │       ├── home.tsx
│   │       ├── chat.tsx
│   │       ├── biometric.tsx
│   │       └── grid.tsx
│   ├── components/         # Reusable UI components
│   ├── constants/
│   │   └── theme.ts        # Theme constants
│   ├── context/            # Reserved for React providers
│   ├── hooks/              # Custom hooks
│   ├── services/           # Reserved for service logic
│   ├── theme/
│   │   ├── root.tsx        # Colors, spacing, typography, radius
│   │   └── useAppFonts.tsx # Font loader hook
│   ├── utils/              # Utility helpers
│   └── global.css          # Web global styles
├── app.json                # Expo configuration
├── package.json
└── tsconfig.json
```

---

## Routing & Navigation

### Root Layout — `src/app/_layout.tsx`
- Wraps the app in Expo Router `ThemeProvider`.
- Uses `useColorScheme()` for light/dark theme selection.
- Sets `Stack` screen options with `headerShown: false`.
- Hides the Expo splash screen after mount.

### Tab Layout — `src/app/(tabs)/_layout.tsx`
- Uses Expo Router `Tabs` with a custom `CustomTabBar`.
- Defines 7 bottom tab routes: `Tasks`, `Dashboard`, `stats`, `home`, `chat`, `biometric`, `grid`.

### App Flow

```
/ -> splashscreem -> /login -> /(tabs)/Tasks
```

`explore.tsx` remains available as a separate starter example screen.

---

## Screens

### Onboarding — `src/app/splashscreem.tsx`
- Auto-scrolling banner carousel with 4 slides.
- Uses a custom top gradient header component.
- Displays dot indicators for current slide.
- Navigates to `/login` on CTA tap.

### Login — `src/app/(auth)/login.tsx`
- Login form with email and password fields.
- Uses `FloatingInput` with floating labels.
- Password field includes an eye toggle.
- `Log In` button routes to the Tasks tab.
- Includes a placeholder `Forgot Password?` link.

### Tasks — `src/app/(tabs)/Tasks.tsx`
The app’s main task management screen.

Features:
- Header with greeting, description, notification bell, and avatar initials.
- Search input and filter button.
- Scrollable status cards for task category selection.
- Task table rendered from mocked task data.
- Floating action button opens the create task modal.

#### Task Filters
- All Tasks
- Due Today
- Due in 7 days
- Delayed
- Created by me
- Assigned to me
- Recurring
- Completed

### Dashboard — `src/app/(tabs)/Dashboard.tsx`
- Placeholder screen showing the shared `AppHeader` component.

### Stats / Home / Chat / Biometric / Grid Tabs
- `src/app/(tabs)/stats.tsx`
- `src/app/(tabs)/home.tsx`
### Chat — `src/app/(tabs)/chat.tsx`
- Displays a horizontal list of filter chips (All, Unread, Read, Channels, Groups) with green unread dot indicators.
- Renders a mock list of chat users with initials avatars, online status dots, message snippets, timestamps, and unread count bubbles.
- Fallback "Private workspace" empty state when no chats exist.
- When the "Channels" chip is active, it renders a specialized empty state featuring the `ChannelTabIcon` and a "+ Create Channel" button.
- Triggers a sequential modal flow for creating channels: `CreateChannelModal` -> `AddPeopleModal` (in multiple selection mode).
- Bottom-right Floating Action Button (FAB) for creating new messages.

### Conversation — `src/app/conversation.tsx`
- Full-screen messaging interface with incoming (right-aligned, teal background) and outgoing (left-aligned, white background) message bubbles.
- Expandable animated search bar integrated via the header.
- Interactive filter chips (Date, Attachments) that open inline panels:
  - **Date Panel**: Sidebar with quick ranges (Today, Last 7 days, etc.) next to a compact `CalendarPicker`.
  - **Attachments Panel**: Sub-tabs for Images, Videos, Docs, and Links.

### Biometric / Grid Tabs
- `src/app/(tabs)/biometric.tsx`
- `src/app/(tabs)/grid.tsx`

These tabs are currently placeholders with shared app header scaffolding.

### Explore — `src/app/explore.tsx`
- Expo starter example screen.
- Includes theme-aware layout, collapsible sections, and web-specific elements.

---

## Components

### `CustomTabBar`
- Floating bottom tab bar with pill-shaped container.
- Active tab icon is highlighted with a white circular background.
- Uses Ionicons for navigation icons.

### `AppHeader`
- Reusable header used across the main screen and placeholder tabs.
- Shows title, subtitle, notification bell, and avatar initials.

### `StatCard`
- Displays an icon, label, and count.
- Supports both Ionicons string icons and custom React nodes.
- Active card is highlighted with a teal border.

### `TaskTable`
- Collapsible section with a horizontal scroll for wide rows.
- Renders column headers and multiple `TaskRow` components.
- Includes swipeable row logic: swiping left reveals hidden columns and a "More" actions button.
- Maintains open state so only one row dropdown is expanded at a time.

### `TaskRow`
- Displays task title, creator, assignee, due date, status, comment icon, and project name.
- Includes inline dropdown for changing status.
- Marks completed tasks with a checkmark and strikethrough styling.
- Supports statuses: `Pending`, `In-Progress`, `On-Hold`, `Rejected`, `Completed`, `Pending-Approval`.

### `CreateTaskModal`
- Bottom sheet modal for task creation.
- Includes floating title input and description editor.
- Shows action chips for assignee, due date, priority, approval, recurring, subtasks, and dependencies.
- Simulates attachments and tag chips.
- UI only; created tasks are not persisted.

### `FloatingInput`
- Animated floating label input field.
- Handles focus/blur transitions and secure text entry.
- Includes a password visibility toggle when `secureToggle` is enabled.

### `CreateChannelModal`
- A perfectly centered modal for naming a new channel.
- Uses `FloatingInput` for the channel name.
- Transitions seamlessly to `AddPeopleModal` after submission.

### `AddPeopleModal`
- Reusable bottom sheet modal for finding and selecting users.
- Features a floating search input and a list of `UserRow` components.
- Supports two modes:
  - **Single Select**: Tapping a user routes directly to the conversation.
  - **Channel Mode** (`isChannelMode`): Displays checkboxes for multi-selection, a "Select All" option, and a green "Invite" button at the top to finalize channel creation.

### Additional Components
- `FilterModal` — task filter modal.
- `CalendarPicker` — date selection UI.
- `BottomTabBar` — legacy alternate bottom tab bar.
- `app-tabs.tsx` / `app-tabs.web.tsx` — platform tab abstractions.
- `animated-icon.tsx` / `animated-icon.web.tsx` — animated icon wrappers.
- `gradientheader.tsx` — top gradient decoration.
- `gradientfooter.tsx` — bottom gradient decoration.
- `radialbottom.tsx` — radial gradient accent.
- `hint-row.tsx` — hint/tip row.
- `external-link.tsx` — external link helper.
- `themed-text.tsx` / `themed-view.tsx` — theme-aware wrappers.
- `web-badge.tsx` — web-only badge.
- `ui/collapsible.tsx` — reusable collapsible component.

---

## Theme & Styling

### `src/theme/root.tsx`
- Primary color: `#1ED9A5`
- Button background: `#00DFAB`
- Button text: `#1D1D1D`
- Background: `#FFFFFF`
- Primary text: `#1D1D1D`
- Secondary text: `#6B6B6B`
- Placeholder: `#E6E6E6`
- Input border focus: `#1D1D1D`
- Input border default: `#E6E6E6`

### `src/theme/useAppFonts.tsx`
- Loads SF Pro Text fonts: `Light`, `Regular`, `Medium`, `Semibold`, `Bold`.

### Web Styles
- `src/global.css` contains web-specific global styling.

---

## Assets

- `assets/fonts/` — SF Pro Text font files.
- `assets/icons/` — custom SVG icon components.
- `assets/images/` — splash, banners, logos, and app imagery.

---

## Configuration

### `package.json`
- Expo app with React 19.2.3 and React Native 0.86.0.
- Uses `expo-router`, `expo-font`, `expo-linear-gradient`, `react-native-reanimated`, and `@expo/vector-icons`.
- Scripts: `start`, `android`, `ios`, `web`, `lint`, `reset-project`.

### `app.json`
- App name: `Plaint`
- Scheme: `plaint`
- Orientation: `portrait`
- `userInterfaceStyle`: `automatic`
- Android adaptive icon configuration.
- Web output: `static`.
- Uses Expo splash screen plugin with custom image.
- Enables typed routes and React compiler experiment flags.

---

## Scripts

- `npm run start` — launch Expo dev server.
- `npm run android` — run on Android.
- `npm run ios` — run on iOS.
- `npm run web` — launch web build.
- `npm run lint` — run Expo lint.
- `npm run reset-project` — execute `scripts/reset-project.js`.

---

## Notes

- Most app data is currently mocked in `src/app/(tabs)/Tasks.tsx`.
- Task creation modal is UI-only and does not persist tasks.
- Several tab screens are placeholders ready for feature expansion.
- `explore.tsx` and some components are Expo starter template remnants.
- App structure is set up for iterative development of task management workflows.

| Prop | Type | Description |
|---|---|---|
| label | string | Floating label text |
| secureToggle | boolean | Adds eye icon for password visibility |
| value / onChangeText | string / fn | Controlled input |

- Label animates up and shrinks on focus or when value is present
- Border changes from `#E6E6E6` → `#1D1D1D` on focus

### Custom Icons — `assets/icons/`

| File | Component |
|---|---|
| `bellicon.tsx` | Bell notification icon (SVG) |
| `duetoday.tsx` | Due Today icon (SVG) |
| `filtericon.tsx` | Filter icon (SVG) |
| `sevenday.tsx` | 7-day icon (SVG) |

### Other Components

| Component | Purpose |
|---|---|
| `gradientheader.tsx` (TopMintGlow) | Mint/teal gradient at top of screen |
| `gradientfooter.tsx` (BottomGlow) | Gradient at bottom of screen |
| `BottomTabBar.tsx` | Alternative tab bar (unused/legacy) |
| `StatCard.tsx` | Stat card (see above) |
| `collapsible.tsx` | Generic collapsible section |
| `animated-icon.tsx` | Animated icon wrapper |
| `external-link.tsx` | External URL link component |
| `themed-text.tsx` | Theme-aware Text |
| `themed-view.tsx` | Theme-aware View |
| `hint-row.tsx` | Hint/tip row UI |
| `radialbottom.tsx` | Radial gradient bottom decoration |
| `web-badge.tsx` | Web-only badge |
| `app-tabs.tsx` | Platform tab abstraction |

---

## Theme & Styling

### `src/theme/root.tsx` — App Theme
```ts
Colors.primary          = '#1ED9A5'   // Teal brand color
Colors.bgButtonColor    = '#00DFAB'   // CTA button background
Colors.buttonText       = '#1D1D1D'   // Button text
Colors.background       = '#FFFFFF'
Colors.textPrimary      = '#1D1D1D'
Colors.textSecondary    = '#6B6B6B'
Colors.placeholder      = '#E6E6E6'
```

Spacing: `xs(4)` `sm(8)` `md(16)` `lg(24)` `xl(32)` `xxl(48)`

Border Radius: `sm(8)` `md(12)` `lg(16)` `pill(28)` `screen(40)`

### `src/constants/theme.ts` — System Theme
Light/dark mode color tokens, platform-specific fonts, spacing scale.

### Fonts
All text uses SF Pro Text loaded via `expo-font`:

| Family Key | File |
|---|---|
| `SF_Pro_Bold` | SF-Pro-Text-Bold.otf |
| `SF_Pro_Light` | SF-Pro-Text-Light.otf |
| `SF_Pro_Medium` | SF-Pro-Text-Medium.otf |
| `SF_Pro_Regular` | SF-Pro-Text-Regular.otf |
| `SF_Pro_Semibold` | SF-Pro-Text-Semibold.otf |

---

## Hooks

| Hook | File | Purpose |
|---|---|---|
| `useAppFonts` | `theme/useAppFonts.tsx` | Loads SF Pro fonts, returns `[fontsLoaded]` |
| `useColorScheme` | `hooks/use-color-scheme.ts` | Native color scheme detection |
| `useTheme` | `hooks/use-theme.ts` | App theme access |

---

## App Configuration — `app.json`

| Key | Value |
|---|---|
| Name | Plaint |
| Version | 1.0.0 |
| Orientation | Portrait |
| Scheme | `plaint` |
| UI Style | Automatic (light/dark) |
| Splash bg | `#208AEF` |
| Web output | Static |
| Typed Routes | Enabled |
| React Compiler | Enabled |

---

## Setup & Running

```bash
# Install dependencies
npm install

# Start dev server
npx expo start

# Platform-specific
npx expo start --android
npx expo start --ios
npx expo start --web

# Lint
npx expo lint

# Reset to blank starter
npm run reset-project
```

---

## Key Design Decisions

- **File-based routing** via Expo Router — screens map directly to file paths
- **Custom tab bar** floats above content as a pill, no native tab bar used
- **Inline status dropdown** in TaskRow — only one open at a time, managed by parent TaskTable via `openRowIndex` state
- **StatCard filtering** — TASKS_MAP pre-filters task arrays per category; active tab drives which dataset renders
- **Floating label inputs** — pure React Native Animated API, no third-party form library
- **SF Pro fonts** loaded once at app root via `useAppFonts` hook before rendering
