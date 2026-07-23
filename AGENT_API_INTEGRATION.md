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
| Task socket real-time events | `src/hooks/useTaskSocket.ts`, `src/services/socket/socketService.ts` |
| Add/change chat API endpoint | `src/services/api/chat.service.ts` |
| Add/change chat type | `src/types/chat.types.ts` |
| Add/change chat state/action | `src/context/ChatContext.tsx`, `src/hooks/useChat.ts` |
| Chat helpers/utilities | `src/utils/chatHelpers.ts` |
| Socket.io events/connection | `src/services/socket/socketService.ts` |
| Socket lifecycle (app-level) | `src/app/_layout.tsx` (connect/disconnect), `src/context/ChatContext.tsx` (chat listeners) |
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
- Authenticated → `connectSocket()` (app-level socket init, idempotent)
- Logout → `disconnectSocket()` (tears down shared socket)

---

## State Architecture

### Provider Hierarchy (in `_layout.tsx`)

```
<App-level socket lifecycle: connectSocket() on auth, disconnectSocket() on logout>
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
| `src/app/_layout.tsx` | Added `NotificationProvider` inside `ChatProvider` + app-level socket lifecycle (`connectSocket` on auth, `disconnectSocket` on logout) |
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

---

## Task Module Socket.io Integration (July 23, 2026)

### Date

July 23, 2026

### Purpose

Integrated real-time Socket.io event handling for the Task module. Tasks ride on the same global socket connection as the chat module — no task-specific namespace or room-joining exists. Every task event is a company-wide broadcast; the client filters by `company_id`.

### Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useTaskSocket.ts` | Central hook that listens for all task-related socket events (`task_update`, `priority_update`, `jobstatus_update`, `user_update`) and dispatches updates to TaskContext. Resilient to socket availability — awaits `connectSocket()` and retries on `connect` event. |

### Files Modified

| File | Why | What Changed | Architectural Reasoning |
|------|-----|-------------|----------------------|
| `src/services/socket/socketService.ts` | Add task socket type definitions | Added `TaskUpdateAction`, `TaskUpdatePayload`, `PriorityUpdatePayload`, `JobStatusUpdatePayload`, `UserUpdatePayload` types; added `task_update`, `priority_update`, `jobstatus_update`, `user_update` to `SocketEventMap` | Type-safe socket event handling; follows the existing pattern of typed event maps |
| `src/context/TaskContext.tsx` | Extend state management for socket events | Added `companyId` getter, `applyPriorityUpdate`/`applyJobStatusUpdate` methods, `PRIORITY_CREATE`/`PRIORITY_UPDATE`/`PRIORITY_DELETE`/`JOBSTATUS_CREATE` reducer actions, imported `useAuth` | Priority and status dropdown lists are company-wide metadata that can be patched directly in state without refetching the entire task list |
| `src/app/_layout.tsx` | App-level socket lifecycle | Added `connectSocket()` on authenticated state, `disconnectSocket()` on logout | **Critical fix:** Socket must be initialized at the app level, not inside ChatScreen. This ensures the socket is available to ALL screens (tasks, chat, etc.) regardless of which screen mounts first. |
| `src/app/(tabs)/tasks.tsx` | Wire up socket listeners | Added `useTaskSocket()` call | Socket listeners are registered at the screen level where task data is consumed |
| `src/components/TaskDetailModal.tsx` | Real-time note/attachment updates | Added socket listener for note-related `task_update` actions (`add_note`, `update_note`, `delete_note`, `update_note_pin`, `update_note_reaction`, `add_attachment`, `delete_attachment`) that refetches notes when the modal is open | Notes are local modal state — socket events trigger a targeted notes refetch for the currently viewed task |
| `src/components/CreateTaskModal.tsx` | Keep assignee picker fresh | Added `user_update` socket listener that refetches the task list (which includes `task_owner` for the assignee dropdown) when the modal is open | Matches the web app's `CreateTask.jsx` pattern of re-fetching user list on `user_update` |
| `src/context/ChatContext.tsx` | Fix stale closure bug + shared socket lifecycle | Refactored `initSocket` to use refs for all state values inside socket listeners (was closing over `state.rooms`, `state.messages`, `state.hasMore`, `state.roomCreator`). Split `cleanupSocket` into `cleanupChatListeners` (listener-only cleanup for screen unmount) and `cleanupSocket` (full disconnect for logout). Removed provider unmount effect that was destroying the shared socket. | **Critical fix:** The stale closure bug caused `initSocket` to be recreated on every state change, tearing down and re-registering ALL 20+ listeners, causing event drops. The unmount effect was destroying the shared socket when navigating away from Chat, breaking task socket listeners. |
| `src/app/(tabs)/chat.tsx` | Use listener-only cleanup | Changed `cleanupSocket()` to `cleanupChatListeners()` in the unmount effect | ChatScreen unmount should only remove chat's listener subscriptions, NOT destroy the app-level socket that tasks also depend on |

### Socket Architecture

#### App-Level Socket Lifecycle (Critical)

The socket singleton (`socketService.ts`) is managed at the **app level** in `src/app/_layout.tsx`:

```
RootLayout
  ├─ authenticated → connectSocket()     // Creates socket + JWT handshake
  ├─ logout        → disconnectSocket()  // Tears down socket
  └─ children      → all screens share the same socket instance
```

**Why this matters:** Both Chat and Tasks screens share the same socket connection. If the socket was only initialized in ChatScreen, Tasks would never receive events. If ChatScreen destroyed the socket on unmount (navigating to Tasks), all listeners would break.

#### Connection Flow
- `connectSocket()` is called once in `_layout.tsx` when the user becomes authenticated
- `connectSocket()` is **idempotent** — safe to call multiple times (returns existing socket if already connected)
- Authentication uses the JWT handshake (`auth: { token }`)
- ChatScreen registers chat-specific listeners via `initSocket(userId)`
- TasksScreen registers task-specific listeners via `useTaskSocket()`
- Both share the same underlying socket connection

#### Event Registration — useTaskSocket (Resilient)

`useTaskSocket` handles the race condition where the socket may not be connected yet:

1. Calls `connectSocket()` to ensure socket exists (idempotent)
2. Immediately tries to register listeners via `onSocketEvent`
3. If socket wasn't ready, listens for the `connect` event and registers listeners then
4. All listeners are cleaned up on effect cleanup

This avoids the problem where `getSocket()` returns `null` because `connectSocket()` hasn't completed yet.

#### Event Registration — ChatContext.initSocket (Ref-Based)

`initSocket` was refactored to use refs instead of closing over state values:

```typescript
// BEFORE (stale closure bug):
const initSocket = useCallback(async (userId) => {
  // ...
  socketService.onSocketEvent("receiveChatMessage", (msg) => {
    dispatch({ type: "ADD_MESSAGE", message: msg });
    if (msg.sender_id !== userId) { ... }  // userId from closure
    // state.messages used in messagesRead handler — STALE on next render
  });
}, [state.rooms, state.messages, state.hasMore, state.roomCreator]); // recreated every state change!

// AFTER (ref-based):
const stateRef = useRef(state);
stateRef.current = state;
const userIdRef = useRef(0);

const initSocket = useCallback(async (userId) => {
  userIdRef.current = userId;
  // ...
  socketService.onSocketEvent("receiveChatMessage", (msg) => {
    dispatch({ type: "ADD_MESSAGE", message: msg });
    if (msg.sender_id !== userIdRef.current) { ... }  // always fresh
    // stateRef.current.messages — always fresh
  });
}, []); // stable — never recreated
```

**Why this matters:** With the old approach, every state change (e.g., a new message arriving) would cause `initSocket` to be recreated, which would tear down ALL 20+ listeners and re-register them. During the teardown/setup window, events were dropped.

#### Listener Cleanup — Two Functions

| Function | What It Does | When Used |
|----------|-------------|-----------|
| `cleanupChatListeners()` | Removes only chat listener subscriptions from the socket | ChatScreen unmount (navigating away) |
| `cleanupSocket()` | Removes listeners + disconnects socket + resets state | Logout only |

**Why this matters:** If ChatScreen called `disconnectSocket()` on unmount, the socket would be destroyed while TasksScreen still needs it. The new `cleanupChatListeners()` only removes Chat's listener subscriptions, preserving the socket connection for other screens.

#### Event Cleanup
- Every `onSocketEvent` call returns an unsubscribe function
- All cleanup functions are collected and called in the useEffect cleanup
- No duplicate listeners — `initSocket` checks `socketCleanupRef.current.length > 0` before registering

#### Reconnection Strategy
- Built-in `socket.io-client` reconnection (`reconnectionDelay: 1000`, `reconnectionAttempts: Infinity`)
- `useTaskSocket` listens for the `connect` event to re-register listeners after reconnect
- `ChatContext.initSocket` rejoins all rooms on reconnect via the `connect` listener
- Task data is refetched on initial mount via `fetchAllTasks`

#### Error Handling
- All socket event handlers guard against missing/invalid payloads
- `company_id` filtering prevents processing events from other companies
- No socket payload is trusted as sole source of truth — task data is re-fetched via REST
- `connectSocket()` failures are caught and logged (non-blocking)

#### Store Synchronization
- `task_update` → triggers `fetchAllTasks()` (full task list refetch)
- `priority_update` → patches `state.priorities` directly (create/update/delete)
- `jobstatus_update` → patches `state.statusList` directly (create only; update/delete noted but not applied to avoid stale list)
- `user_update` → triggers `fetchAllTasks()` (refreshes `task_owner` list)
- Note events → triggers notes refetch in TaskDetailModal via `loadNotes()`

### Events Implemented

| Event | Direction | Purpose | Affected Screens | Affected Stores |
|-------|-----------|---------|-----------------|----------------|
| `task_update` (action: `create`) | Server → Client | New task created (manual or recurring cron) | TasksScreen | TaskContext (refetch) |
| `task_update` (action: `create_subtask`) | Server → Client | Subtask created | TasksScreen | TaskContext (refetch) |
| `task_update` (action: `update`) | Server → Client | Task fields edited (title, description, due date, etc.) | TasksScreen | TaskContext (refetch) |
| `task_update` (action: `status_update`) | Server → Client | Task status changed | TasksScreen | TaskContext (refetch) |
| `task_update` (action: `delete`) | Server → Client | Task deleted | TasksScreen | TaskContext (refetch) |
| `task_update` (action: `sprint_assigned`) | Server → Client | Task moved to sprint/project | TasksScreen | TaskContext (refetch) |
| `task_update` (action: `add_note`) | Server → Client | Note/comment added to task | TaskDetailModal | Notes (refetch) |
| `task_update` (action: `update_note`) | Server → Client | Note/comment edited | TaskDetailModal | Notes (refetch) |
| `task_update` (action: `delete_note`) | Server → Client | Note/comment deleted | TaskDetailModal | Notes (refetch) |
| `task_update` (action: `update_note_pin`) | Server → Client | Note pin toggled | TaskDetailModal | Notes (refetch) |
| `task_update` (action: `update_note_reaction`) | Server → Client | Note reaction updated | TaskDetailModal | Notes (refetch) |
| `task_update` (action: `add_attachment`) | Server → Client | Attachment added to task | TaskDetailModal | Notes (refetch) |
| `task_update` (action: `delete_attachment`) | Server → Client | Attachment deleted from task | TaskDetailModal | Notes (refetch) |
| `priority_update` (action: `create`) | Server → Client | New priority level added | TasksScreen, CreateTaskModal | TaskContext.state.priorities |
| `priority_update` (action: `update`) | Server → Client | Priority level edited | TasksScreen, CreateTaskModal | TaskContext.state.priorities |
| `priority_update` (action: `delete`) | Server → Client | Priority level removed | TasksScreen, CreateTaskModal | TaskContext.state.priorities |
| `jobstatus_update` (action: `create`) | Server → Client | New status label added | TasksScreen, CreateTaskModal | TaskContext.state.statusList |
| `jobstatus_update` (action: `update`) | Server → Client | Status label edited | TasksScreen, CreateTaskModal | Noted (not applied) |
| `jobstatus_update` (action: `delete`) | Server → Client | Status label removed | TasksScreen, CreateTaskModal | Noted (not applied) |
| `user_update` (action: `create/update/delete`) | Server → Client | User added/edited/deactivated | CreateTaskModal | TaskContext (refetch for task_owner) |

### State Management Changes

**TaskContext new reducer actions:**
- `PRIORITY_CREATE` — adds a new `TaskPriority` to `state.priorities`
- `PRIORITY_UPDATE` — replaces a `TaskPriority` by `id` in `state.priorities`
- `PRIORITY_DELETE` — removes a `TaskPriority` by `id` from `state.priorities`
- `JOBSTATUS_CREATE` — appends a new status name string to `state.statusList`
- `JOBSTATUS_UPDATE` / `JOBSTATUS_DELETE` — noted but not applied (would require list rebuild)

**TaskContext new context values:**
- `companyId: number | null` — derived from auth state, used by `useTaskSocket` for event filtering
- `applyPriorityUpdate(action, data)` — dispatches priority create/update/delete
- `applyJobStatusUpdate(action, data)` — dispatches job status create

**ChatContext changes:**
- `initSocket` — now uses refs (`stateRef`, `userIdRef`) for all state access inside listeners; dependency array is `[]` (stable)
- `cleanupChatListeners()` — new function that only removes listener subscriptions without disconnecting the socket
- `cleanupSocket()` — now calls `cleanupChatListeners()` then `disconnectSocket()`; used only for logout
- Removed the provider unmount `useEffect` that was calling `cleanupSocket()` (was destroying the shared socket)

### Navigation Changes

None. Existing navigation preserved.

### Performance Improvements

1. **Socket event as trigger, not source of truth** — task data is re-fetched via REST after socket events, ensuring consistency with the authoritative backend state
2. **Priority/status updates applied directly** — dropdown metadata is patched in state without refetching the entire task list, avoiding unnecessary network requests
3. **Scoped socket listeners** — note and user_update listeners are only active when their respective modals are visible, preventing unnecessary processing
4. **Ref-based stale closure prevention** — socket handlers use refs for `companyId`, `state`, and callbacks to avoid stale closures while maintaining stable listener references
5. **Proper cleanup** — all socket listeners are unsubscribed on component unmount or dependency changes
6. **Idempotent socket initialization** — `initSocket` checks if listeners are already registered before re-registering, preventing duplicate listeners

### Known Limitations

1. **No optimistic UI for task changes** — the mobile app refetches the full task list on every `task_update` event instead of applying optimistic patches. This is intentional per the reference doc's guidance ("use the socket as a signal to re-fetch")
2. **`jobstatus_update` for update/delete not fully applied** — the status list is not rebuilt when statuses are updated or deleted because the current `statusList` is a flat `string[]` without IDs. Would require restructuring to `TaskStatusItem[]` with `{ id, name }` shape
3. **No task detail socket listener** — the TaskDetailModal receives task data as props from the parent screen. When the parent refetches, fresh data flows down. There's no direct socket-to-detail-modal update path
4. **No offline event queue** — socket events received while offline are lost; the app relies on the next full mount/refetch to restore state
5. **`asigned_to` typo preserved** — the backend field name `asigned_to` (single "s") and `asignedd_to` (double "d") are preserved as-is per the reference doc's confirmation that these are the real field names

### Future Improvements

1. **Offline support with event queue** — buffer socket events received while offline and replay them on reconnection
2. **Optimistic task list updates** — apply socket payloads directly to the task list for instant UI feedback, then reconcile on refetch
3. **Task detail socket listener** — add a socket listener in TaskDetailModal that patches the displayed task in real-time without waiting for parent refetch
4. **`jobstatus_update` full support** — restructure `statusList` from `string[]` to `TaskStatusItem[]` with `{ id, name }` to support update/delete operations
5. **Push notification integration** — register FCM/APNs tokens and display push notifications for task assignments and status changes

### Breaking Changes

None. All changes are additive. Existing task REST API integration and UI are unaffected.

### Architectural Decisions

1. **App-level socket lifecycle** — socket is created in `_layout.tsx` on authentication and destroyed on logout. All screens share the same socket instance. This prevents the socket from being destroyed when navigating between screens.
2. **Shared socket singleton** — tasks reuse the chat module's socket connection. No separate task socket or namespace.
3. **Company-wide broadcast filtering** — every socket handler's first line is a `company_id` guard. The client is responsible for filtering.
4. **Re-fetch strategy over optimistic patches** — the reference doc explicitly recommends re-fetching after `update`/`status_update` events. The mobile app follows this pattern.
5. **Priority/status metadata patched directly** — company-wide dropdown data is small and changes infrequently; direct state patching avoids unnecessary refetches.
6. **Scoped modal listeners** — note and user socket listeners are only active when their modals are visible, minimizing overhead.
7. **No duplicate socket instances** — all socket access goes through the single `socketService.ts` singleton.
8. **Refs for socket listener state** — socket event handlers use refs (`stateRef`, `userIdRef`, `companyIdRef`) instead of closing over React state. This prevents stale closures without causing listener teardown/re-registration on every state change.
9. **Listener cleanup vs socket disconnect** — screen unmount only cleans up that screen's listeners. The socket connection persists until logout. This allows multiple screens to independently manage their socket subscriptions.

