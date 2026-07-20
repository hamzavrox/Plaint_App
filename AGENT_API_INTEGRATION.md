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
- `src/components/InboxModal.tsx` — missing `listContent` style
- `src/components/radialbottom.tsx` — `absoluteFillObject` deprecated
- `src/components/texteditor.tsx` — `showAndroidKeyboard` not on RichEditor type
- `src/components/animated-icon.web.tsx` — missing CSS module
- `src/constants/images.ts` — missing image module declarations
- `src/constants/theme.ts` — missing CSS module declaration
- `assets/icons/*.tsx` — implicit `any` on props (all icon components)
- `src/app/(tabs)/biometric.tsx`, `grid.tsx`, `home.tsx`, `performance.tsx` — use AppHeader without `placeholder` prop (our header now has it optional, so these work)

---

## Routing Structure (expo-router file-based)

```
src/app/
├── _layout.tsx                    ← Root: AuthProvider + TaskProvider wrappers, auth guard
├── (auth)/
│   ├── login.tsx                  ← Login screen
│   ├── forgetpassword.tsx         ← Forgot password (verify email)
│   └── initial-reset.tsx          ← Default password reset (created by us)
└── (tabs)/
    ├── _layout.tsx                ← Tab navigator layout
    ├── Tasks.tsx                  ← Main tasks screen (OUR main file)
    ├── home.tsx                   ← Dashboard (pre-existing)
    ├── performance.tsx            ← Performance (pre-existing)
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
    <RootNavigator />
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
