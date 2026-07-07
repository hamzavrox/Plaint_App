# Plaint — Project Documentation

## Overview

**Plaint** is a React Native (Expo) task & project management mobile app. It supports Android, iOS, and Web. Built with Expo Router (file-based routing), React 19, TypeScript, and a custom SF Pro font system.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.86 + Expo ~57 |
| Language | TypeScript ~6 |
| Routing | Expo Router ~57 (file-based) |
| Navigation | React Navigation (Bottom Tabs) |
| Icons | @expo/vector-icons (Ionicons, Fontisto) + custom SVG icons |
| Fonts | SF Pro Text (Bold, Light, Medium, Regular, Semibold) via `expo-font` |
| Gradients | `expo-linear-gradient` |
| Animations | `react-native-reanimated` 4.5 |
| Gestures | `react-native-gesture-handler` |
| SVG | `react-native-svg` |
| State | React `useState` (local) |

---

## Project Structure

```
Plaint/
├── assets/
│   ├── fonts/              # SF Pro Text font files (.otf)
│   ├── icons/              # Custom SVG icon components
│   └── images/             # App images, logos, tab icons, splash
├── scripts/
│   └── reset-project.js    # Resets app to blank starter
├── src/
│   ├── app/                # Expo Router screens (file-based routes)
│   │   ├── _layout.tsx     # Root layout (ThemeProvider + Stack)
│   │   ├── index.tsx       # Entry point
│   │   ├── splashscreem.tsx# Onboarding/splash screen
│   │   ├── explore.tsx
│   │   ├── (auth)/
│   │   │   └── login.tsx   # Login screen
│   │   └── (tabs)/
│   │       ├── _layout.tsx # Tab layout (CustomTabBar)
│   │       ├── Tasks.tsx   # Main tasks screen ← primary screen
│   │       ├── Dashboard.tsx
│   │       ├── stats.tsx
│   │       ├── home.tsx
│   │       ├── chat.tsx
│   │       ├── biometric.tsx
│   │       └── grid.tsx
│   ├── components/         # Reusable UI components
│   ├── constants/
│   │   └── theme.ts        # Light/dark colors, fonts, spacing constants
│   ├── context/            # (reserved for React context providers)
│   ├── hooks/              # Custom hooks
│   ├── services/           # (reserved for API/service layer)
│   ├── theme/
│   │   ├── root.tsx        # App-wide Colors, Spacing, Typography, Radius
│   │   └── useAppFonts.tsx # Font loading hook
│   ├── utils/              # (reserved for utility functions)
│   └── global.css          # Global CSS (web)
├── app.json                # Expo config
├── package.json
└── tsconfig.json
```

---

## Routing & Navigation

### Root Layout — `src/app/_layout.tsx`
- Wraps the entire app in `ThemeProvider` (light/dark via `useColorScheme`)
- Uses `Stack` navigator with `headerShown: false`
- Hides splash screen on mount

### Tab Layout — `src/app/(tabs)/_layout.tsx`
- Uses Expo Router `Tabs` with a fully custom tab bar (`CustomTabBar`)
- 7 tabs: Tasks, Dashboard, Stats, Home, Chat, Biometric, Grid

### App Flow
```
index.tsx → splashscreem.tsx (onboarding) → /login → /Tasks (main)
```

---

## Screens

### Onboarding — `splashscreem.tsx`
- Auto-scrolling image carousel (4 slides, 2.5s interval)
- Animated dot indicators
- "Get Started" CTA → navigates to `/login`
- Uses `TopMintGlow` header gradient

### Login — `(auth)/login.tsx`
- Email + password inputs using `FloatingInput` (animated floating label)
- Password visibility toggle
- "Log In" → navigates to `/Tasks`
- "Forgot Password?" link (placeholder)
- Uses `TopMintGlow` header gradient

### Tasks — `(tabs)/Tasks.tsx` ← Primary Screen
The core screen of the app.

**Features:**
- Greeting header with user name + bell notification icon + avatar
- Search bar with filter button
- Horizontally scrollable `StatCard` row (8 categories)
- Vertically scrollable `TaskTable` filtered by active stat card
- Floating Action Button (FAB) to add new tasks

**Stat Card Categories:**

| ID | Label | Count |
|---|---|---|
| all | All Tasks | 1200 |
| today | Due Today | 05 |
| week | Due in 7 days | 15 |
| overdue | Delayed | 03 |
| created | Created by me | 12 |
| assigned | Assigned to me | 05 |
| recurring | Recurring | 15 |
| completed | Completed | 03 |

**Task Fields:** title, createdBy, createdByInitials, assignedTo, assignedToInitials, dueDate, status, project, extraCount

**Task Statuses:** `Pending` · `In-Progress` · `On-Hold` · `Rejected` · `Completed` · `Pending-Approval`

### Dashboard — `(tabs)/Dashboard.tsx`
Placeholder screen (in development).

---

## Components

### `StatCard`
Horizontally scrollable card showing a task category count.

| Prop | Type | Description |
|---|---|---|
| label | string | Category name |
| count | string \| number | Task count |
| iconName | Ionicons name \| ReactNode | Icon (string = Ionicons, node = custom SVG) |
| active | boolean | Highlights card with teal border |
| onPress | () => void | Tab selection handler |

### `TaskTable`
Collapsible table section with a horizontal scroll for columns.

| Prop | Type | Description |
|---|---|---|
| sectionTitle | string | Section heading |
| tasks | TaskRowProps[] | Array of task data |

- Collapse/expand toggle via chevron button
- Manages which row's status dropdown is open (only one at a time)
- Column headers: Task Title, Created By, Assigned to, Due Date, Status, Comment, Project

### `TaskRow`
Single task row with inline status dropdown.

| Prop | Type | Description |
|---|---|---|
| title | string | Task title |
| createdBy / createdByInitials | string | Creator info |
| assignedTo / assignedToInitials | string | Assignee info |
| dueDate | string | Due date string |
| status | StatusType | Current status |
| project | string | Project name |
| extraCount | number | Sub-task count badge |
| isOpen | boolean | Controls dropdown visibility |
| onOpenRequest / onClose | () => void | Dropdown open/close callbacks |

**Status Colors:**

| Status | Background | Text |
|---|---|---|
| Pending | `#FEF3C7` | `#D97706` |
| In-Progress | `#DBEAFE` | `#2563EB` |
| On-Hold | `#F3F4F6` | `#6B7280` |
| Rejected | `#FEE2E2` | `#DC2626` |
| Completed | `#D1FAE5` | `#059669` |
| Pending-Approval | `#EDE9FE` | `#7C3AED` |

Completed tasks show a teal checkmark circle and strikethrough title.

### `CustomTabBar`
Floating pill-shaped bottom tab bar.

- Black background, rounded pill (`borderRadius: 40`), floating 20px above bottom
- Active tab: white circular background around icon
- Inactive tabs: white icon on black
- 7 tabs with Ionicons icons

### `FloatingInput`
Animated floating label text input.

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
