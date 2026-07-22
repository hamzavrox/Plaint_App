# AGENT CONTEXT — Planit App API Integration

> **Purpose:** Give this file to an AI agent BEFORE it starts working. It contains everything needed to make correct changes without searching the codebase or burning tokens on file reads.

---

## Quick Reference — Where To Edit

| Task | File(s) |
|------|---------|
| Add/change auth flow | `src/services/api/auth.service.ts`, `src/context/AuthContext.tsx` |
| Add/change task API endpoint | `src/services/api/tasks.service.ts` |
| Add/change task type | `src/types/task.types.ts` |
| Add/change task state/action | `src/context/TaskContext.tsx`, `src/hooks/useTasks.ts` |
| Add/change chat API endpoint | `src/services/api/chat.service.ts` |
| Add/change chat type | `src/types/chat.types.ts` |
| Add/change chat state/action | `src/context/ChatContext.tsx`, `src/hooks/useChat.ts` |
| Chat helpers/utilities | `src/utils/chatHelpers.ts` |
| Socket.io events/connection | `src/services/socket/socketService.ts` |
| Notification API/context | `src/context/NotificationContext.tsx`, `src/hooks/useNotifications.ts` |
| File upload with progress | `src/services/api/upload.service.ts` |
| Modify login screen | `src/app/(auth)/login.tsx` |
| Modify forgot password | `src/app/(auth)/forgetpassword.tsx` |
| Modify initial password reset | `src/app/(auth)/initial-reset.tsx` |
| Modify main tasks screen | `src/app/(tabs)/Tasks.tsx` |
| Modify task table/grid | `src/components/TaskTable.tsx` |
| Modify task row (single row) | `src/components/TaskRow.tsx` |
| Modify task detail modal | `src/components/TaskDetailModal.tsx` |
| Modify create task modal | `src/components/CreateTaskModal.tsx` |
| Modify filter modal | `src/components/FilterModal.tsx` |
| Modify header/avatar/logout | `src/components/headerapp.tsx` |
| Modify chat list screen | `src/app/(tabs)/chat.tsx` |
| Modify conversation screen | `src/app/conversation.tsx` |
| Modify inbox/notification modal | `src/components/InboxModal.tsx` |
| Modify add people modal | `src/components/AddPeopleModal.tsx` |
| Modify create channel modal | `src/components/CreateChannelModal.tsx` |
| Change API client behavior | `src/services/api/client.ts` |
| Change error handling | `src/utils/errorHandler.ts` |
| Change status mapping | `src/utils/statusMapper.ts` |
| Change token management | `src/utils/token.ts` |
| Change permissions logic | `src/utils/permissions.ts` |
| Change routing/auth guard | `src/app/_layout.tsx` |

---

## DO NOT TOUCH (Pre-existing, broken, unrelated to API integration)

These files have pre-existing TS errors. Do NOT modify them unless explicitly asked:

- `src/components/CustomTabBar.tsx` — missing `@react-navigation/bottom-tabs`
- `src/components/radialbottom.tsx` — `absoluteFillObject` deprecated
- `src/components/texteditor.tsx` — `showAndroidKeyboard` not on RichEditor type
- `src/components/animated-icon.web.tsx` — missing CSS module
- `src/constants/images.ts` — missing image module declarations
- `src/constants/theme.ts` — missing CSS module declaration
- `assets/icons/*.tsx` — implicit `any` on props (all icon components)
- `src/app/(tabs)/biometric.tsx`, `grid.tsx`, `home.tsx`, `performance.tsx` — use AppHeader without `placeholder` prop (our header now has it optional, so these work)

Note: `src/components/InboxModal.tsx` was fixed during chat integration (replaced mock data with real API). It is no longer in the broken list.

---

## Routing Structure (expo-router file-based)

```
src/app/
├── _layout.tsx                    ← Root: AuthProvider + TaskProvider + ChatProvider wrappers, auth guard
├── conversation.tsx               ← Conversation screen (real-time messaging)
├── (auth)/
│   ├── login.tsx                  ← Login screen
│   ├── forgetpassword.tsx         ← Forgot password (verify email)
│   └── initial-reset.tsx          ← Default password reset (created by us)
└── (tabs)/
    ├── _layout.tsx                ← Tab navigator layout
    ├── Tasks.tsx                  ← Main tasks screen (OUR main file)
    ├── home.tsx                   ← Dashboard (pre-existing)
    ├── performance.tsx            ← Performance (pre-existing)
    ├── chat.tsx                   ← Chat list screen (API-integrated)
    ├── biometric.tsx              ← Biometric (pre-existing)
    └── grid.tsx                   ← Grid view (pre-existing)
```

**Auth guard logic in `_layout.tsx`:**
- Not authenticated → redirect to `/(auth)/login`
- Authenticated + `isDefaultPassword` → redirect to `/(auth)/initial-reset`
- Authenticated + not default password + on auth screen → redirect to `/(tabs)/Tasks`

---

## State Architecture

### Provider Hierarchy (in `_layout.tsx`)

```
<AuthProvider>
  <TaskProvider>
    <ChatProvider>
      <NotificationProvider>
        <RootNavigator />
      </NotificationProvider>
    </ChatProvider>
  </TaskProvider>
</AuthProvider>
```

### AuthContext (`src/context/AuthContext.tsx`)

**State shape:**
```typescript
{
  user: UserData | null;        // authState.user
  company: Company | null;      // authState.company
  token: string | null;
  isAuthenticated: boolean;
  isDefaultPassword: boolean;
  loading: boolean;
  defaultPasswordEmail: string;
}
```

**Access pattern:** `const { state: authState, login, logout } = useAuth();`

**Company type gotcha:** Company has `company_id` NOT `id`. Always use `authState.company?.company_id`.

### TaskContext (`src/context/TaskContext.tsx`)

**State shape:**
```typescript
{
  assignedToMe: TaskListItem[];
  createdByMe: TaskListItem[];
  allOtherTasks: TaskListItem[];
  priorities: TaskPriority[];
  taskOwners: TaskOwner[];
  statusList: string[];
  loading: boolean;
  error: string | null;
  activeFilter: TaskFilter | null;
}
```

**Access pattern:** `const { state: taskState, allMappedTasks, fetchAllTasks, createTask, ... } = useTasks();`

**Key derived values:**
- `mappedAssignedToMe` / `mappedCreatedByMe` / `mappedAllOtherTasks` — UI-mapped task rows
- `allMappedTasks` — combined array of all mapped tasks (always contains ALL tasks, never overwritten by filters)
- `filteredMappedTasks` — tasks from a separate filter API call (stored separately, not used for tab display)
- `totalCount` — total count from `allMappedTasks.length`

**Important:** `fetchFiltered` stores results in `filteredMappedTasks` and does NOT overwrite `allMappedTasks`. `fetchAllTasks` clears `filteredMappedTasks` and resets `activeFilter`.

---

## API Client Details (`src/services/api/client.ts`)

**Base URL:** `process.env.EXPO_PUBLIC_API_BASE_URL` (from `.env`)

**Auth headers on EVERY request:**
```
x-access-token: <JWT>
authToken: <JWT>
```

**Session expiry detection:** If response body contains `"Un-Athunticated request"` (note: typo is in the actual API), triggers global logout.

**Methods:**
- `apiGet<T>(path, params?)` — GET with query params
- `apiPost<T>(path, body?, isFormData?)` — POST JSON or FormData
- `apiDelete<T>(path)` — DELETE
- `apiUpload<T>(path, formData)` — POST multipart FormData

**Response envelope:** Always `{ Good: boolean, data?: T, message?: string }`

---

## Status Mapping (CRITICAL)

### API vs UI Status Values

| API Value (`TaskStatus`) | UI Display (`UiTaskStatus`) |
|--------------------------|------------------------------|
| `"Pending"` | `"Pending"` |
| `"In-Progress"` | `"In-Progress"` |
| `"Complete"` | `"Completed"` |
| `"Pending-Approval"` | `"Pending-Approval"` |
| `"Rejected"` | `"Rejected"` |
| `"Recurring"` | `"Recurring"` |

**There is NO "On-Hold" status.** It was removed from the UI because the backend API does not have it.

### Mapping Functions (in `src/utils/statusMapper.ts`)

```typescript
apiStatusToUi("Complete")  // → "Completed"
uiStatusToApi("Completed") // → "Complete"
```

### CreateTaskModal Status Labels

The `STATUSES` array in `CreateTaskModal.tsx` uses the **API-compatible format** (hyphens, not spaces):

| Display Label | API Value (after `uiStatusToApi`) |
|---------------|-----------------------------------|
| `"Pending"` | `"Pending"` |
| `"In-Progress"` | `"In-Progress"` |
| `"Completed"` | `"Complete"` |
| `"Rejected"` | `"Rejected"` |
| `"Pending-Approval"` | `"Pending-Approval"` |
| `"Recurring"` | `"Recurring"` |

Status is passed to the API via: `uiStatusToApi((selectedStatus as UiTaskStatus) ?? "Pending")`

### Recurring Task Configuration

When "Recurring" is selected as the status in `CreateTaskModal`, a recurring configuration panel appears with:
- **Recurring Period** — `daily`, `weekly`, `monthly`, `annually`, `quarterly`, `semi-annually`
- **Time** (optional) — e.g. `"09:00"`
- **Total Count** — number of recurrences (default: 1)

The `is_recurring` boolean and related fields (`recurring_period`, `recurring_time`, `recurring_total_count`) are only set when the status is `"Recurring"`. Otherwise `is_recurring` is `false` and recurring fields are null/0.

### TaskListItem → MappedTaskRow mapping

```
item.task_assignee    → createdBy, createdByInitials
item.task_assigned_to → assignedTo, assignedToInitials
item.due_date         → dueDate (formatted as "6, Jul")
item.status           → status (mapped through apiStatusToUi)
item.subtask_count    → extraCount (only if > 0)
item.id               → id (as string)
item.title            → title
```

---

## TaskListItem Shape (API response per task)

```typescript
{
  id: number;
  title: string;
  status: "Pending" | "In-Progress" | "Complete" | "Pending-Approval" | "Rejected";
  due_date: string;
  priority: number;                    // priority ID
  priority_name: string;               // e.g. "High"
  priority_color: string;              // e.g. "#FF0000"
  assignee: number;                    // creator user ID
  asigned_to: number;                  // assignee user ID
  parent_id: number;                   // 0 if not a subtask
  company_id: number;
  is_recurring: boolean;
  approval_required: number;           // 0 or 1
  created_by: number;
  module: string;
  project_id: number;
  sprint_id: number;
  subtask_count: number;
  notes_count: number;
  can_edit: boolean;
  can_edit_status: boolean;
  can_edit_subtask: boolean;
  description?: string;
  rejection_reason?: string;
  task_assignee: { id, first_name, last_name, image, role };
  task_assigned_to: { id, first_name, last_name, image, role };
}
```

---

## Task List Response Shape

```typescript
{
  Good: boolean;
  data: {
    task_owner: TaskOwner[];       // all users in company (for assign-to dropdown)
    priority: TaskPriority[];      // all priorities (for priority dropdown)
    status: string[];              // all status labels
    tasks_assigned_to_me: TaskListItem[];
    tasksByme: TaskListItem[];
    all_other_tasks: TaskListItem[];
  }
}
```

---

## Stat Card Tab → Display Mapping

In `Tasks.tsx`, all tabs filter client-side from `allMappedTasks` via `tasksMap`. No API calls are made when switching tabs (except "all" which refreshes via `fetchAllTasks`). All counts always reflect the full task list.

| Tab ID | Label | Display Source | Count Source | Filtering Logic |
|--------|-------|----------------|--------------|-----------------|
| `all` | All Tasks | `tasksMap.all` | `allMappedTasks.length` | No filter |
| `today` | Due Today | `tasksMap.today` | `tasksMap.today.length` | `due_date` is today (client-side date filter) |
| `week` | Due in 7 days | `tasksMap.week` | `tasksMap.week.length` | `due_date` is within next 7 days (client-side date filter) |
| `overdue` | Delayed | `tasksMap.overdue` | `tasksMap.overdue.length` | `due_date` is in the past AND status !== "Completed" (client-side date filter) |
| `created` | Created by me | `tasksMap.created` | `tasksMap.created.length` | `mappedCreatedByMe` (from `tasksByme` in all-tasks response) |
| `assigned` | Assigned to me | `tasksMap.assigned` | `tasksMap.assigned.length` | `mappedAssignedToMe` (from `tasks_assigned_to_me` in all-tasks response) |
| `recurring` | Recurring | `tasksMap.recurring` | `tasksMap.recurring.length` | `is_recurring === true` (client-side boolean filter) |
| `completed` | Completed | `tasksMap.completed` | `tasksMap.completed.length` | `status === "Completed"` (client-side status filter) |

**Key design decisions:**
- Tabs use client-side filtering from the all-tasks response, NOT separate API filter calls
- This ensures counts never go to `00` when switching tabs
- `fetchAllTasks` is only called on initial load and when the "all" tab is pressed (refresh)
- `handleTabPress` simply sets `activeTab` state — no loading spinners for tab switches

---

## Auth Endpoints

| Function | Endpoint | Request | Response |
|----------|----------|---------|----------|
| `loginCheckDefault` | `POST /user/login` | `{ email, password }` | `LoginSuccessResponse` OR `LoginDefaultPasswordResponse` |
| `verifyEmail` | `POST /user/verify-email` | `{ email }` | `{ success, message }` |
| `resetPassword` | `POST /user/reset-password` | `{ token, password, confirmPassword }` | `{ success, message }` |
| `initialPasswordReset` | `POST /user/initial-password-reset` | `{ email, password, confirmPassword }` | `{ Good, data }` |

### LoginSuccessResponse shape:
```json
{
  "Good": true,
  "authToken": "jwt...",
  "company_id": 1,
  "sessionTimeoutMins": 60,
  "user": {
    "name": "...",
    "userdata": { "id": 1, "first_name": "...", "last_name": "...", ... },
    "company": { "company_id": 1, "company_identifier": "...", ... }
  }
}
```

### LoginDefaultPasswordResponse shape:
```json
{
  "Good": true,
  "isDefaultPassword": true,
  "userEmail": "user@example.com",
  "message": "..."
}
```

---

## Task Endpoints

| Function | Endpoint | Method | Body |
|----------|----------|--------|------|
| `getAllTasks` | `/tasks/all` | GET | `?company_id=N` |
| `getDueTodayTasks` | `/tasks/duetoday` | GET | `?company_id=N` |
| `getFilteredTasks` | `/tasks/filter` | GET | `?company_id=N&filter=X` |
| `getTaskDetail` | `/tasks/taskdetail/:id` | GET | — |
| `createTask` | `/tasks/create` | POST | `CreateTaskRequest` |
| `createSubtask` | `/tasks/createsubtask/:parentId` | POST | `CreateTaskRequest` |
| `updateTask` | `/tasks/update/:id` | POST | `UpdateTaskRequest` |
| `updateTaskStatus` | `/tasks/updatetaskstatus/:id` | POST | `{ status, company_id, company_identifier }` |
| `reassignTask` | `/tasks/reassigntask/:id` | POST | `{ company_id, company_identifier, assignee }` |
| `deleteTask` | `/tasks/delete/:id` | POST | — |
| `approveTask` | `/tasks/approve/:id` | POST | — |
| `rejectTask` | `/tasks/reject/:id` | POST | `{ rejection_reason }` |
| `viewTask` | `/tasks/viewtask/:id` | POST | — |
| `addNote` | `/tasks/addnote/:id` | POST | `{ notes, company_id, company_identifier }` or FormData |
| `getTaskNotes` | `/tasks/showtasknote/:id` | POST | — |
| `updateNote` | `/tasks/updatenote/:id` | POST | `{ notes, company_id, company_identifier }` |
| `pinNote` | `/tasks/updatenotepin/:id` | POST | `{ pin_top: 0|1, company_id, company_identifier }` |
| `deleteNote` | `/tasks/deletenote/:id` | POST | `{ company_id, company_identifier }` |
| `updateNoteReaction` | `/tasks/updatenotereaction/:id` | POST | `{ reaction, company_id, company_identifier }` |
| `uploadAttachment` | `/tasks/attachments/:id` | POST | FormData (multipart) |
| `deleteAttachment` | `/tasks/attachmentdelete/:id` | POST | `{ company_id, company_identifier }` |
| `updateTaskDueDate` | `/tasks/updatetaskduedate/:id` | POST | `{ duedate, company_id, company_identifier }` |
| `updateTaskProject` | `/tasks/updatetaskproject/:id` | POST | `{ project_id, company_id, company_identifier }` |
| `updateLeadSource` | `/tasks/updateleadsource/:id` | POST | `{ source, company_id, company_identifier }` |

---

## Dependencies Installed

```
expo-secure-store         — JWT token persistence
@react-native-async-storage/async-storage — fallback storage
socket.io-client          — Socket.io real-time connection (chat module)
expo-clipboard            — Copy-to-clipboard (message options menu)
```

---

## How To Verify Changes

```bash
npx tsc --noEmit          # TypeScript type check
npx expo lint             # ESLint check
```

Only errors in files under `src/app/`, `src/components/`, `src/context/`, `src/hooks/`, `src/services/`, `src/types/`, `src/utils/` matter. Pre-existing errors in other files are ignored.

---

## Environment Config

`.env`:
```
EXPO_PUBLIC_API_BASE_URL=https://backend-planit.soulservices.com/api/v1
```

---

## Code Conventions

- **No Axios** — use native `fetch` via `apiGet`/`apiPost`/`apiDelete`/`apiUpload`
- **No Redux/Zustand** — use React Context + `useReducer`
- **TypeScript strict** — all types in `src/types/`
- **Path alias:** `@/` maps to `src/`
- **Expo SDK 57** — read https://docs.expo.dev/versions/v57.0.0/ for API changes
- **Expo Router** — file-based routing, `(auth)` and `(tabs)` are route groups
- **Font families:** `SF_Pro_Regular`, `SF_Pro_Medium`, `SF_Pro_Semibold`, `SF_Pro_Bold`
- **Primary color:** `#00DEAB` (mint green)
- **Dark color:** `#1D1D1D`

---

## Task Comments Feature Fixes (July 20, 2026)

### Overview
Resolved the issue where task comments/notes were not loading or displaying in the task details modal (`TaskDetailModal.tsx`).

### Files Modified

1. **`src/services/api/tasks.service.ts`**
   - Modified `getTaskNotes` to accept optional `companyId` and `companyIdentifier` arguments and include them inside the body of the `POST /tasks/showtasknote/:id` request.

2. **`src/context/TaskContext.tsx`**
   - Updated `fetchNotes` interface and implementation signature to accept and forward the optional `companyId` and `companyIdentifier`.
   - Updated `addNoteToTask`, `deleteNoteById`, and `pinNoteById` callbacks to check `res.Good` and throw an explicit error on failure instead of failing silently.

3. **`src/components/TaskDetailModal.tsx`**
   - Updated `loadNotes` to fetch notes passing the company details: `fetchNotes(task.taskId, companyId, companyIdentifier)`.
   - Added a `useEffect` hook to reset `activeTab` back to `"details"` whenever the modal becomes visible (`visible === true`).
   - Hardened `initials` extraction inside the `CommentBubble` component using a robust trim + regex-based split (`.trim().split(/\s+/)`) and a `.filter(Boolean)` filter.

---

## Chat Module API Integration (July 22, 2026)

### Overview
Integrated all 31 PLANIT Backend Chat Module APIs into the mobile app, plus Socket.io real-time, notification center, message search, and file upload progress. Replaced all mock/hardcoded chat data with live API calls while preserving the existing UI design.

### APIs Integrated (31 endpoints)

> **Critical:** All chat endpoints are prefixed with `/chat/`. The base URL is `https://backend-planit.soulservices.com/api/v1`, so the full path is `/api/v1/chat/...`. Notification endpoints are NOT under `/chat/`.

| Category | Endpoints |
|----------|-----------|
| Rooms | `GET /chat/rooms`, `GET /chat/search-users`, `POST /chat/get-or-create-room` |
| Messages | `GET /chat/messages/:roomId`, `POST /chat/send-message`, `POST /chat/edit-message`, `POST /chat/delete-message` |
| Reactions | `POST /chat/reaction` |
| URL Preview | `GET /chat/url-preview` |
| Members | `POST /chat/add-member`, `POST /chat/remove-member`, `POST /chat/leave-room` |
| Room Management | `POST /chat/delete-room`, `POST /chat/clear-messages`, `POST /chat/hide-room`, `POST /chat/mute-room`, `POST /chat/mark-read`, `POST /chat/mark-unread` |
| Pins | `POST /chat/toggle-pin`, `GET /chat/pins/:roomId` |
| Post Types | `GET /chat/post-types/:roomId`, `POST /chat/post-types`, `POST /chat/post-types/delete` |
| Invitations | `POST /chat/invite`, `POST /chat/generate-link`, `GET /chat/accept-invite/:token` |
| Permissions | `POST /chat/update-permission`, `GET /chat/room-permissions/:roomId` |
| Notifications | `GET /notification/all`, `POST /notification/readone/:id`, `GET /notification/readall` |

### Socket.io Events (20+ events)

**Client emits:** `registerUser`, `getOnlineUsers`, `joinChatRoom`, `messagesRead`, `typing`, `messageDelivered`, `messagePinned`, `messageUpdated`, `messageDeleted`, `messageReaction`, `chatCleared`, `roomDeleted`, `memberJoined`, `userLeftRoom`

**Server emits:** `newRoom`, `receiveChatMessage`, `userOnline`, `userOffline`, `userTyping`, `messageReaction`, `messagePinned`, `messageUpdated`, `messageDeleted`, `memberJoined`, `messagesRead`, `chatCleared`, `roomDeleted`, `userLeftRoom`, `removedFromRoom`, `roomPermissionUpdated`, `chatRoomSettingUpdated`, `notification`

### Files Created

| File | Purpose |
|------|---------|
| `src/types/chat.types.ts` | All chat + notification TypeScript interfaces |
| `src/services/api/chat.service.ts` | All 31 API functions (chat + notifications) |
| `src/context/ChatContext.tsx` | Chat state management with Socket.io integration |
| `src/context/NotificationContext.tsx` | Notification state management (inbox/bell icon) |
| `src/hooks/useChat.ts` | Re-export hook |
| `src/hooks/useNotifications.ts` | Re-export hook |
| `src/utils/chatHelpers.ts` | Room display, message formatting, permission, upload, date, search utilities |
| `src/services/socket/socketService.ts` | Socket.io connection, emit/listen, typing, reconnection |
| `src/services/api/upload.service.ts` | XMLHttpRequest upload with progress tracking + file validation |
| `CHAT_API_INTEGRATION.md` | Full integration documentation |

### Files Modified

| File | Change |
|------|--------|
| `src/app/_layout.tsx` | Added `NotificationProvider` inside `ChatProvider` |
| `src/app/(tabs)/chat.tsx` | Replaced mock data with `useChat()` + Socket.io init on mount + initial user search on modal open |
| `src/app/conversation.tsx` | Live API messaging + client-side search filtering + upload progress bar + wired `onSearch` callback + emoji picker modal + forward room picker modal + edit message overlay + three-dots action menu + sender name resolution from room members |
| `src/components/InboxModal.tsx` | Replaced mock data with real `GET /notification/all` API |
| `package.json` | Added `socket.io-client` dependency |

### Features Implemented

1. **Socket.io real-time** — Connection, registration, reconnection recovery, presence tracking, typing indicators, all message events
2. **Notification center/inbox** — Real API data, All/Unread/Mentions tabs, unread badge, mark-read on tap, mark-all-read
3. **Client-side message search** — Substring filter on text + sender name, result count, "no results" state
4. **File upload progress** — XMLHttpRequest progress bar with percentage, cancel button, 10MB/20-file validation
5. **Message action buttons** — All 6 buttons on each message bubble are functional:
   - 👍 Quick react (thumbs-up toggle) → `POST /chat/reaction`
   - 😊 Emoji picker (20 emojis in a grid modal) → `POST /chat/reaction`
   - ➡️ Forward message (room picker modal) → `POST /chat/send-message` with `is_forwarded: true`
   - ✏️ Edit message (input overlay) → `POST /chat/edit-message`
   - ↩️ Reply (sets reply-to context in compose bar)
   - ⋮ More options (Alert menu) → Copy Text (expo-clipboard), Pin/Unpin, Edit (own msgs), Delete (own msgs with confirmation)

### Known Backend Bugs/limitations

- `userTyping` event missing `room_id` — typing indicator only works for active room
- `getOnlineUsers` is a no-op — no bulk presence snapshot on connect
- No push notification backend — must be built from scratch with backend team
- No server-side message search endpoint — client-side only

### Known Bugs Fixed

- **API path prefix (July 22, 2026):** All chat endpoints were missing the `/chat/` prefix (e.g., calling `/rooms` instead of `/chat/rooms`), causing every chat API request to hit a 404. Fixed by adding `/chat/` to all 28 chat endpoint paths in `chat.service.ts`.
- **Upload path (July 22, 2026):** `ChatContext.tsx` hardcoded `/send-message` for progress uploads — fixed to `/chat/send-message`.
- **Search users not loading (July 22, 2026):** `SearchUser` type had `first_name`/`last_name` but backend returns `full_name`. Fixed type to include `full_name` (optional) and updated component mappings. Also removed 2-char minimum on search (backend supports empty query for full list) and added initial fetch when modal opens.
- **`room_id` must use MongoDB `_id`, not numeric `id` (July 22, 2026):** Backend expects `room_id` as a MongoDB ObjectId string (e.g., `"6a606754c3484d18150fb531"`), NOT the numeric `id` field (e.g., `"28"`). Passing numeric `id` causes a 500 Internal Server Error on `POST /chat/send-message`. The `Room` type has both `_id: string` (MongoDB ObjectId) and `id: number` (numeric). **Always use `room._id`** for: navigation params (`roomId`), API calls (`room_id`/`roomId`), socket `joinChatRoom`, and reducer room matching. `room.id` is only used for local UI state (e.g., selected-chat highlight).
- **Missing `sender_name` in message responses (July 22, 2026):** Backend may return `sender_id` without `sender_name` on messages. `MessageBubble` in `conversation.tsx` resolves the name from `state.currentRoom?.members` by matching `sender_id`. `getMessageInitials()` in `chatHelpers.ts` handles `undefined`/`null` input gracefully (returns "??" instead of crashing). `ChatMessage.sender_name` and `sender_image` are now optional in the type.
- **Duplicate messages from REST + socket (July 22, 2026):** When sending a message, the REST response dispatches `ADD_MESSAGE`, and the socket `receiveChatMessage` event fires for the same message, causing duplicate entries. Fixed by adding `_id`-based deduplication in the `ADD_MESSAGE` reducer — if a message with the same `_id` already exists, the dispatch is a no-op.
- **`memberJoined` socket event crash (July 22, 2026):** The `memberJoined` socket event handler dispatched `UPDATE_ROOM` with `typed.room` which could be `undefined` if the server payload doesn't include the `room` field. Added a guard (`if (typed.room)`) before dispatching. Also added a safety guard in the `UPDATE_ROOM` reducer itself (`if (!action.room) return state`).
- **React duplicate key crash (July 22, 2026):** Message list used `msg.id.toString()` as the React key, but numeric `id` values can collide across messages. Changed to `msg._id` (unique MongoDB ObjectId) to prevent "Encountered two children with the same key" errors.

### Architectural Decisions

1. **Followed existing patterns exactly:** React Context + useReducer, same API client, same error handling
2. **Socket.io integrated:** Full real-time support with reconnection recovery
3. **UI preserved:** Same visual design, same component structure, same styling
4. **All 31 endpoints integrated** from `chat_apis_VERBATIM_MASTER.md` + `answers2.md`
5. **Provider hierarchy:** `AuthProvider > TaskProvider > ChatProvider > NotificationProvider > RootNavigator`
6. **All chat endpoints use `/chat/` prefix:** Backend routes are `GET /chat/rooms`, `GET /chat/search-users`, etc. Notification endpoints (`/notification/*`) are NOT under `/chat/`.
```

---

## Task Endpoints

| Function | Endpoint | Method | Body |
|----------|----------|--------|------|
| `getAllTasks` | `/tasks/all` | GET | `?company_id=N` |
| `getDueTodayTasks` | `/tasks/duetoday` | GET | `?company_id=N` |
| `getFilteredTasks` | `/tasks/filter` | GET | `?company_id=N&filter=X` |
| `getTaskDetail` | `/tasks/taskdetail/:id` | GET | — |
| `createTask` | `/tasks/create` | POST | `CreateTaskRequest` |
| `createSubtask` | `/tasks/createsubtask/:parentId` | POST | `CreateTaskRequest` |
| `updateTask` | `/tasks/update/:id` | POST | `UpdateTaskRequest` |
| `updateTaskStatus` | `/tasks/updatetaskstatus/:id` | POST | `{ status, company_id, company_identifier }` |
| `reassignTask` | `/tasks/reassigntask/:id` | POST | `{ company_id, company_identifier, assignee }` |
| `deleteTask` | `/tasks/delete/:id` | POST | — |
| `approveTask` | `/tasks/approve/:id` | POST | — |
| `rejectTask` | `/tasks/reject/:id` | POST | `{ rejection_reason }` |
| `viewTask` | `/tasks/viewtask/:id` | POST | — |
| `addNote` | `/tasks/addnote/:id` | POST | `{ notes, company_id, company_identifier }` or FormData |
| `getTaskNotes` | `/tasks/showtasknote/:id` | POST | — |
| `updateNote` | `/tasks/updatenote/:id` | POST | `{ notes, company_id, company_identifier }` |
| `pinNote` | `/tasks/updatenotepin/:id` | POST | `{ pin_top: 0|1, company_id, company_identifier }` |
| `deleteNote` | `/tasks/deletenote/:id` | POST | `{ company_id, company_identifier }` |
| `updateNoteReaction` | `/tasks/updatenotereaction/:id` | POST | `{ reaction, company_id, company_identifier }` |
| `uploadAttachment` | `/tasks/attachments/:id` | POST | FormData (multipart) |
| `deleteAttachment` | `/tasks/attachmentdelete/:id` | POST | `{ company_id, company_identifier }` |
| `updateTaskDueDate` | `/tasks/updatetaskduedate/:id` | POST | `{ duedate, company_id, company_identifier }` |
| `updateTaskProject` | `/tasks/updatetaskproject/:id` | POST | `{ project_id, company_id, company_identifier }` |
| `updateLeadSource` | `/tasks/updateleadsource/:id` | POST | `{ source, company_id, company_identifier }` |

---

## Dependencies Installed

```
expo-secure-store         — JWT token persistence
@react-native-async-storage/async-storage — fallback storage
socket.io-client          — Socket.io real-time connection (chat module)
expo-clipboard            — Copy-to-clipboard (message options menu)
```

---

## How To Verify Changes

```bash
npx tsc --noEmit          # TypeScript type check
npx expo lint             # ESLint check
```

Only errors in files under `src/app/`, `src/components/`, `src/context/`, `src/hooks/`, `src/services/`, `src/types/`, `src/utils/` matter. Pre-existing errors in other files are ignored.

---

## Environment Config

`.env`:
```
EXPO_PUBLIC_API_BASE_URL=https://backend-planit.soulservices.com/api/v1
```

---

## Code Conventions

- **No Axios** — use native `fetch` via `apiGet`/`apiPost`/`apiDelete`/`apiUpload`
- **No Redux/Zustand** — use React Context + `useReducer`
- **TypeScript strict** — all types in `src/types/`
- **Path alias:** `@/` maps to `src/`
- **Expo SDK 57** — read https://docs.expo.dev/versions/v57.0.0/ for API changes
- **Expo Router** — file-based routing, `(auth)` and `(tabs)` are route groups
- **Font families:** `SF_Pro_Regular`, `SF_Pro_Medium`, `SF_Pro_Semibold`, `SF_Pro_Bold`
- **Primary color:** `#00DEAB` (mint green)
- **Dark color:** `#1D1D1D`

---

## Task Comments Feature Fixes (July 20, 2026)

### Overview
Resolved the issue where task comments/notes were not loading or displaying in the task details modal (`TaskDetailModal.tsx`).

### Files Modified

1. **`src/services/api/tasks.service.ts`**
   - Modified `getTaskNotes` to accept optional `companyId` and `companyIdentifier` arguments and include them inside the body of the `POST /tasks/showtasknote/:id` request.

2. **`src/context/TaskContext.tsx`**
   - Updated `fetchNotes` interface and implementation signature to accept and forward the optional `companyId` and `companyIdentifier`.
   - Updated `addNoteToTask`, `deleteNoteById`, and `pinNoteById` callbacks to check `res.Good` and throw an explicit error on failure instead of failing silently.

3. **`src/components/TaskDetailModal.tsx`**
   - Updated `loadNotes` to fetch notes passing the company details: `fetchNotes(task.taskId, companyId, companyIdentifier)`.
   - Added a `useEffect` hook to reset `activeTab` back to `"details"` whenever the modal becomes visible (`visible === true`).
   - Hardened `initials` extraction inside the `CommentBubble` component using a robust trim + regex-based split (`.trim().split(/\s+/)`) and a `.filter(Boolean)` filter.

---

## Chat Module API Integration (July 22, 2026)

### Overview
Integrated all 31 PLANIT Backend Chat Module APIs into the mobile app, plus Socket.io real-time, notification center, message search, and file upload progress. Replaced all mock/hardcoded chat data with live API calls while preserving the existing UI design.

### APIs Integrated (31 endpoints)

> **Critical:** All chat endpoints are prefixed with `/chat/`. The base URL is `https://backend-planit.soulservices.com/api/v1`, so the full path is `/api/v1/chat/...`. Notification endpoints are NOT under `/chat/`.

| Category | Endpoints |
|----------|-----------|
| Rooms | `GET /chat/rooms`, `GET /chat/search-users`, `POST /chat/get-or-create-room` |
| Messages | `GET /chat/messages/:roomId`, `POST /chat/send-message`, `POST /chat/edit-message`, `POST /chat/delete-message` |
| Reactions | `POST /chat/reaction` |
| URL Preview | `GET /chat/url-preview` |
| Members | `POST /chat/add-member`, `POST /chat/remove-member`, `POST /chat/leave-room` |
| Room Management | `POST /chat/delete-room`, `POST /chat/clear-messages`, `POST /chat/hide-room`, `POST /chat/mute-room`, `POST /chat/mark-read`, `POST /chat/mark-unread` |
| Pins | `POST /chat/toggle-pin`, `GET /chat/pins/:roomId` |
| Post Types | `GET /chat/post-types/:roomId`, `POST /chat/post-types`, `POST /chat/post-types/delete` |
| Invitations | `POST /chat/invite`, `POST /chat/generate-link`, `GET /chat/accept-invite/:token` |
| Permissions | `POST /chat/update-permission`, `GET /chat/room-permissions/:roomId` |
| Notifications | `GET /notification/all`, `POST /notification/readone/:id`, `GET /notification/readall` |

### Socket.io Events (20+ events)

**Client emits:** `registerUser`, `getOnlineUsers`, `joinChatRoom`, `messagesRead`, `typing`, `messageDelivered`, `messagePinned`, `messageUpdated`, `messageDeleted`, `messageReaction`, `chatCleared`, `roomDeleted`, `memberJoined`, `userLeftRoom`

**Server emits:** `newRoom`, `receiveChatMessage`, `userOnline`, `userOffline`, `userTyping`, `messageReaction`, `messagePinned`, `messageUpdated`, `messageDeleted`, `memberJoined`, `messagesRead`, `chatCleared`, `roomDeleted`, `userLeftRoom`, `removedFromRoom`, `roomPermissionUpdated`, `chatRoomSettingUpdated`, `notification`

### Files Created

| File | Purpose |
|------|---------|
| `src/types/chat.types.ts` | All chat + notification TypeScript interfaces |
| `src/services/api/chat.service.ts` | All 31 API functions (chat + notifications) |
| `src/context/ChatContext.tsx` | Chat state management with Socket.io integration |
| `src/context/NotificationContext.tsx` | Notification state management (inbox/bell icon) |
| `src/hooks/useChat.ts` | Re-export hook |
| `src/hooks/useNotifications.ts` | Re-export hook |
| `src/utils/chatHelpers.ts` | Room display, message formatting, permission, upload, date, search utilities |
| `src/services/socket/socketService.ts` | Socket.io connection, emit/listen, typing, reconnection |
| `src/services/api/upload.service.ts` | XMLHttpRequest upload with progress tracking + file validation |
| `CHAT_API_INTEGRATION.md` | Full integration documentation |

### Files Modified

| File | Change |
|------|--------|
| `src/app/_layout.tsx` | Added `NotificationProvider` inside `ChatProvider` |
| `src/app/(tabs)/chat.tsx` | Replaced mock data with `useChat()` + Socket.io init on mount + initial user search on modal open |
| `src/app/conversation.tsx` | Live API messaging + client-side search filtering + upload progress bar + wired `onSearch` callback + emoji picker modal + forward room picker modal + edit message overlay + three-dots action menu + sender name resolution from room members |
| `src/components/InboxModal.tsx` | Replaced mock data with real `GET /notification/all` API |
| `package.json` | Added `socket.io-client` dependency |

### Features Implemented

1. **Socket.io real-time** — Connection, registration, reconnection recovery, presence tracking, typing indicators, all message events
2. **Notification center/inbox** — Real API data, All/Unread/Mentions tabs, unread badge, mark-read on tap, mark-all-read
3. **Client-side message search** — Substring filter on text + sender name, result count, "no results" state
4. **File upload progress** — XMLHttpRequest progress bar with percentage, cancel button, 10MB/20-file validation
5. **Message action buttons** — All 6 buttons on each message bubble are functional:
   - 👍 Quick react (thumbs-up toggle) → `POST /chat/reaction`
   - 😊 Emoji picker (20 emojis in a grid modal) → `POST /chat/reaction`
   - ➡️ Forward message (room picker modal) → `POST /chat/send-message` with `is_forwarded: true`
   - ✏️ Edit message (input overlay) → `POST /chat/edit-message`
   - ↩️ Reply (sets reply-to context in compose bar)
   - ⋮ More options (Alert menu) → Copy Text (expo-clipboard), Pin/Unpin, Edit (own msgs), Delete (own msgs with confirmation)

### Known Backend Bugs/limitations

- `userTyping` event missing `room_id` — typing indicator only works for active room
- `getOnlineUsers` is a no-op — no bulk presence snapshot on connect
- No push notification backend — must be built from scratch with backend team
- No server-side message search endpoint — client-side only

### Known Bugs Fixed

- **API path prefix (July 22, 2026):** All chat endpoints were missing the `/chat/` prefix (e.g., calling `/rooms` instead of `/chat/rooms`), causing every chat API request to hit a 404. Fixed by adding `/chat/` to all 28 chat endpoint paths in `chat.service.ts`.
- **Upload path (July 22, 2026):** `ChatContext.tsx` hardcoded `/send-message` for progress uploads — fixed to `/chat/send-message`.
- **Search users not loading (July 22, 2026):** `SearchUser` type had `first_name`/`last_name` but backend returns `full_name`. Fixed type to include `full_name` (optional) and updated component mappings. Also removed 2-char minimum on search (backend supports empty query for full list) and added initial fetch when modal opens.
- **`room_id` must use MongoDB `_id`, not numeric `id` (July 22, 2026):** Backend expects `room_id` as a MongoDB ObjectId string (e.g., `"6a606754c3484d18150fb531"`), NOT the numeric `id` field (e.g., `"28"`). Passing numeric `id` causes a 500 Internal Server Error on `POST /chat/send-message`. The `Room` type has both `_id: string` (MongoDB ObjectId) and `id: number` (numeric). **Always use `room._id`** for: navigation params (`roomId`), API calls (`room_id`/`roomId`), socket `joinChatRoom`, and reducer room matching. `room.id` is only used for local UI state (e.g., selected-chat highlight).
- **Missing `sender_name` in message responses (July 22, 2026):** Backend may return `sender_id` without `sender_name` on messages. `MessageBubble` in `conversation.tsx` resolves the name from `state.currentRoom?.members` by matching `sender_id`. `getMessageInitials()` in `chatHelpers.ts` handles `undefined`/`null` input gracefully (returns "??" instead of crashing). `ChatMessage.sender_name` and `sender_image` are now optional in the type.
- **Duplicate messages from REST + socket (July 22, 2026):** When sending a message, the REST response dispatches `ADD_MESSAGE`, and the socket `receiveChatMessage` event fires for the same message, causing duplicate entries. Fixed by adding `_id`-based deduplication in the `ADD_MESSAGE` reducer — if a message with the same `_id` already exists, the dispatch is a no-op.
- **`memberJoined` socket event crash (July 22, 2026):** The `memberJoined` socket event handler dispatched `UPDATE_ROOM` with `typed.room` which could be `undefined` if the server payload doesn't include the `room` field. Added a guard (`if (typed.room)`) before dispatching. Also added a safety guard in the `UPDATE_ROOM` reducer itself (`if (!action.room) return state`).
- **React duplicate key crash (July 22, 2026):** Message list used `msg.id.toString()` as the React key, but numeric `id` values can collide across messages. Changed to `msg._id` (unique MongoDB ObjectId) to prevent "Encountered two children with the same key" errors.

### Architectural Decisions

1. **Followed existing patterns exactly:** React Context + useReducer, same API client, same error handling
2. **Socket.io integrated:** Full real-time support with reconnection recovery
3. **UI preserved:** Same visual design, same component structure, same styling
4. **All 31 endpoints integrated** from `chat_apis_VERBATIM_MASTER.md` + `answers2.md`
5. **Provider hierarchy:** `AuthProvider > TaskProvider > ChatProvider > NotificationProvider > RootNavigator`
6. **All chat endpoints use `/chat/` prefix:** Backend routes are `GET /chat/rooms`, `GET /chat/search-users`, etc. Notification endpoints (`/notification/*`) are NOT under `/chat/`.
7. **Search users API:** Backend returns `full_name` (not `first_name`/`last_name`). Empty `query=` returns full user list for pre-populating the "Add People" panel.
8. **Room identifier convention:** Always use `room._id` (MongoDB ObjectId) for backend communication — API calls, socket `joinChatRoom`, navigation params, and reducer room matching. `room.id` (numeric) is only used for local UI state (e.g., selected-chat highlight). Socket room names follow `chat_<_id>` format.

### Breaking Changes

None. All changes are additive. Existing task and auth functionality unaffected.

### Remaining Work

- Push notifications (blocked on backend — needs device registration endpoint + FCM/APNs)
- Server-side message search (when backend builds it)
- Offline support with message queue
- Image/file preview in conversation

---

## Chat Module Fixes & Enhancements (July 22, 2026)

### Overview
Addressed company member listing by default, full emoji keyboard integration (`rn-emoji-keyboard`), and audio voice note recording and playback with safe native module fallbacks.

### Files Modified

1. **`src/context/ChatContext.tsx`**
   - Removed 2-character query guard (`if (query.trim().length < 2)`) in `searchUsersAction`.
   - Updated `setSearchQuery` to execute immediately when `query === ""`.

2. **`src/components/AddPeopleModal.tsx`**
   - Removed `onSearch?.("")` call on modal open (API enforces a 2-char minimum — sending empty query returns no results).
   - `visible` `useEffect` now only resets local `query` and `selectedUserIds` state without hitting the API.
   - Client-side `filtered` list filters the `users` prop (provided by the parent) by the typed query.

3. **`src/app/(tabs)/chat.tsx`** *(Primary fix for "no members showing")*
   - **Root Cause:** Backend `/chat/search-users` enforces ≥ 2 characters minimum. Sending `query=""` on modal open returned empty results, so the list was always blank.
   - **Two-Tier Member List Strategy:**
     - **Default (query empty or < 2 chars):** Builds `defaultMemberList` locally from all `state.rooms[].members` + `taskState.taskOwners`. Instantly available with no API call.
     - **Search (query ≥ 2 chars):** Calls `setSearchQuery(query)` to hit the API; shows `state.searchResults` mapped to the modal user format.
   - Added `addPeopleQuery` local state to track the typed query independently of `state.searchQuery`.
   - Imported `useTasks` and `TaskOwner` to pull task owners into the default member list.
   - `defaultMemberList` is de-duplicated by user ID, excludes the current user, and sorted alphabetically.

4. **`src/app/conversation.tsx`**
   - **Full Emoji Keyboard (`rn-emoji-keyboard`):** Replaced hardcoded 20-emoji grid modal with `<EmojiPicker />`. Wired reaction buttons on message bubbles and the input bar emoji button.
   - **Audio Voice Recorder (`expo-av` + `expo-audio`):** Wired mic button to record voice notes with live timer, cancel, and send controls. Uploads `.m4a` as attachment.
   - **In-Chat Voice Player:** `VoiceNotePlayer` component inside `MessageBubble` with play/pause, progress bar, and timestamp.
   - **Safe Native Module Loading:** `require("expo-av")` wrapped in try-catch to prevent `[Error: Cannot find native module 'ExponentAV']` crash.

5. **`src/utils/chatHelpers.ts`**
   - Added `getCompanyMembersFromState()` utility (not currently used in UI — member list is built inline in `chat.tsx` for simplicity).

6. **`package.json`**
   - Added `rn-emoji-keyboard`, `expo-av`, and `expo-audio` dependencies.

### Known Backend Constraints

- `/chat/search-users` requires **minimum 2 characters** in `query`. Empty queries return no results.
- Workaround: Populate the default member list from locally available data (room members + task owners) so the modal is never blank on open.

### Architectural Decision

> **Never call `/chat/search-users` with an empty `query`.** Use room members and task owners as the local fallback source for the "Add People" panel default state. Only invoke the API when the user has typed ≥ 2 characters.

---

## Channel Invites Email Fix & Project-Channel Architecture (July 22, 2026)

### Overview
Resolved the issue where inviting users to channels did not send email invitations, and implemented full Project-Channel room hierarchy support (`parent_id`) allowing project rooms to contain child channels (`# General`, `# Description`, custom channels).

### Files Modified

1. **`src/types/chat.types.ts`**
   - Added `parent_id?: number` and `created_by?: number` to `Room` type.
   - Added `email?: string` to `RoomMember` type.

2. **`src/context/ChatContext.tsx`**
   - Implemented `createProjectWithChannels(projectId: number)` helper action:
     - Creates or fetches the project room (`type: "project"`).
     - Auto-creates child channel `"General"` (`type: "channel"`, `parent_id: projectRoom.id`).
     - Auto-creates child channel `"Description"` (`type: "channel"`, `parent_id: projectRoom.id`).
     - Refreshes rooms state automatically.
   - Added `createProjectWithChannels` to `ChatContextValue` type and context provider.

3. **`src/app/(tabs)/chat.tsx`**
   - **Channel Invite Email Fix:**
     - Sourced `inviteUser` and `addMember` from `useChat()`.
     - Updated `handleInviteUsers` callback to process all selected users after channel creation.
     - Calls `inviteUser(roomId, email, userId, "Full edit")` (`POST /chat/invite`) for users with an email address, sending email invitations.
     - Falls back to `addMember(roomId, userId)` (`POST /chat/add-member`) for users without an explicit email address.
     - Emits user feedback via `Alert` reporting emails sent vs. members added directly.
   - **Project-Channel Architecture UI:**
     - Added `projectChannelMap` to map child channels (`parent_id`) to their parent project rooms.
     - Added `expandedProjects` state to allow expanding/collapsing project rooms under the "Projects" chip view.
     - Project rooms under the "Projects" chip display their child channels when expanded.
     - Added an **"+ Add Channel"** action under expanded project containers to easily create channels under specific project contexts.
     - Updated Floating Action Button (FAB) to support creating channels under projects or standalone.

