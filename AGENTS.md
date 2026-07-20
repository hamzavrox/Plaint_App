# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# Design & Implementation Guidelines

1. **Pixel-Perfect Execution**: Always closely match user-provided screenshots, specifically respecting paddings, typography, border colors, icons, and layout structures.
2. **Component Reuse**: Reuse existing components (like `AppHeader`, `CalendarPicker`, `TaskTable`) and use props (like `compact`, `showSearch`) to handle variations, rather than duplicating components. Do not alter standard components unnecessarily unless explicitly requested.
3. **Complex UIs**: The app uses complex UI layouts like swipeable table rows, inline collapsible panels, floating inputs, and custom tab bars. Do not break these when adding features.
4. **Mocking Data**: The app heavily relies on mock data arrays for UI building (e.g. `CHIP_DATA`, `ALL_USERS`, `TASKS_MAP`). Continue to build out robust mock models if no backend state management is requested.
5. **Multi-Mode Component Patterns**: When a UI varies slightly based on flow (e.g. `AddPeopleModal` single select vs channel invite), add functional modes via props (like `isChannelMode`) rather than duplicating the entire view structure. Adjust alignments (centered vs bottom sheet) deliberately and do not conflate separate modal behaviors.
