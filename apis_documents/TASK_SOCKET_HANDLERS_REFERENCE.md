# Task Module — Socket.io Handlers Reference (Simple Task Only)

> **Scope:** this document covers only the **simple/basic task system** (plain CRUD: create, edit, delete, status changes, notes/comments, attachments, sprint assignment). It **deliberately excludes** the auto-scheduling engine (the "Advanced Task Scheduling" feature — effort-based queueing, automatic date calculation, critical-path reordering, pause/bump-to-front). Those are covered in §5 as an explicit exclusion list so nothing is silently missing — see that section before assuming this doc is exhaustive for all task-related sockets.
>
> **Confirmation basis:** every event/action pair below is confirmed directly from source on both sides:
> - Frontend: `src/Components/Screens/Tasks/Tasks.jsx`, `src/Components/Screens/Tasks/CreateTask.jsx`, `src/Services/SocketService.js`
> - Backend (sibling repo `Planit-Backend`): `backend/controllers/admin/tasksController.js`, `backend/controllers/admin/prioritiesController.js`, `backend/controllers/admin/jobstatuses.js`, `backend/controllers/admin/usersController.js`, `backend/cron/recurringTasksCron.js`
>
> Example JSON values (ids, names, timestamps) are illustrative placeholders — field *names* and event *shapes* are copied from real working code.

---

## 1. Connection Recap

Tasks use the exact same socket singleton as the rest of the app (see `src/Services/SocketService.js` — also documented in `CHAT_API_SOCKET_REFERENCE.md`):

```javascript
SocketService.connect();   // idempotent — safe to call from every screen that needs the socket
SocketService.on(eventName, handler);
SocketService.off(eventName, handler);
```

- No task-specific namespace, room-joining, or per-task socket scoping exists. **Every task event is a global `io.emit()` broadcast to all connected clients**, company-wide — the client is always responsible for filtering by `company_id` (and further, by relevance to the current user) itself.
- There is no `registerUser`-equivalent needed for task events specifically — they ride on the same always-connected socket the chat module also uses (see the chat reference doc §2 for the connection/reconnection details, which apply identically here).

---

## 2. `task_update` — the core task event

**One event name carries every task change**, discriminated by an `action` field. Generic payload shape:

```json
{
  "company_id": 7,
  "action": "<action name>",
  "data": { "...": "action-specific payload, see below" },
  "assignee": 12,
  "asigned_to": 34
}
```

- `company_id` — **always present**; every listener's first line is a `String(payload.company_id) !== String(companyId)` guard that bails out otherwise (confirmed in `Tasks.jsx`).
- `assignee` / `asigned_to` — present on several (not all) actions. Naming is backend-original (confirmed spelling: `asigned_to`, missing a "s" — not a typo to "fix" client-side, it's the real field name end-to-end). `assignee` = the task **creator**, `asigned_to` = the person the task is **assigned to** — confirmed via frontend usage (`isCreator = assignee === currentUserId`, `isAssignee = asigned_to === currentUserId`).
- `data` shape depends entirely on `action` — documented action-by-action below.

### 2.1 `action: "create"` — new task created

Confirmed emit sites: `tasksController.js:1956` (manual creation) and `backend/cron/recurringTasksCron.js:404` (auto-generated recurring task instance — same action, same shape, no special-casing needed client-side).

```json
{
  "company_id": 7,
  "action": "create",
  "data": {
    "id": 501,
    "title": "Fix login bug",
    "description": "Users report session timeout",
    "status": "Pending",
    "priority": 3,
    "task_priority": 3,
    "effort_hours": 4,
    "due_date": "2026-07-25T00:00:00.000Z",
    "start_date": "2026-07-23T00:00:00.000Z",
    "project_id": 12,
    "sprint_id": null,
    "parent_id": null,
    "company_id": 7,
    "task_assignee": { "id": 12, "first_name": "Ayesha", "last_name": "Khan", "image": null, "role": "Manager" },
    "task_assigned_to": { "id": 34, "first_name": "Bilal", "last_name": "Ahmed", "image": null, "role": "Developer" },
    "asignedd_to": { "id": 34, "first_name": "Bilal", "last_name": "Ahmed", "image": null, "role": "Developer" }
  },
  "assignee": 12,
  "asigned_to": 34
}
```
- Note the confirmed (not a typo) field name **`asignedd_to`** (double-d) alongside `task_assigned_to` — both point to the same user object; backend sends both, client reads `task_assigned_to` as primary.
- Client-side enrichment (`Tasks.jsx`) additionally attaches `priority_color`/`priority_name` (looked up locally from the priority list) and `can_edit`/`can_edit_status`/`can_edit_subtask` booleans — these are **not** sent by the backend, they're computed client-side per-viewer from `assignee`/`asigned_to` vs. the current user.
- If `parent_id` is set, the client treats this as a subtask create and folds it into the parent's `sub_tasks` array instead of adding a new top-level row (see §2.2 for the dedicated subtask variant).

### 2.2 `action: "create_subtask"` — subtask created

Confirmed: `tasksController.js:2337`. Same `data` shape as `create`, always with `parent_id` set. Kept as a distinct action name from `create` on the backend (both exist; client handles them almost identically — the only practical difference is intent/logging, not payload shape).

### 2.3 `action: "update"` — general field edit

Confirmed: `tasksController.js` (multiple sites — main task-edit endpoint, plus smaller single-field updates like lead-source change, due-date change, and task-approval completion).

```json
{
  "company_id": 7,
  "action": "update",
  "data": {
    "id": 501,
    "title": "Fix login bug (P1)",
    "description": "Escalated — affects all SSO users",
    "priority": 1,
    "effort_hours": 6,
    "due_date": "2026-07-24T00:00:00.000Z",
    "task_assignee": { "id": 12, "first_name": "Ayesha", "last_name": "Khan", "image": null, "role": "Manager" },
    "task_assigned_to": { "id": 34, "first_name": "Bilal", "last_name": "Ahmed", "image": null, "role": "Developer" },
    "assignee": { "id": 12, "first_name": "Ayesha", "last_name": "Khan", "image": null, "role": "Manager" },
    "asignedd_to": { "id": 34, "first_name": "Bilal", "last_name": "Ahmed", "image": null, "role": "Developer" }
  },
  "assignee": 12,
  "asigned_to": 34
}
```
- `data` is a **partial patch** — only the fields that actually changed are present (plus `id`) for most of the smaller single-purpose `update` emit sites (e.g. `{ id, lead_source }`, `{ id, due_date }`); the main edit-endpoint emit sends a fuller `updatedValue` spread. **Treat every field except `id` as optional** and merge into existing client state rather than replacing the whole task object.
- The client also special-cases `action === "update" || action === "status_update"` together for an "optimistic patch" of just `status`/`priority`/`task_priority` before doing a full re-fetch (`TaskServices.viewTask`) to pick up everything else the partial payload didn't carry — **the client does not fully trust the socket payload alone for a complete task refresh; it always re-fetches** after any `update`/`status_update`/`add_note`/`delete_note`/`add_attachment`/`delete_attachment` action (see `Tasks.jsx` — `if (action !== "add_note" && action !== "delete_note") TaskServices.viewTask(...)`). Mobile should follow the same pattern: use the socket event as a "something changed, go re-fetch" signal, not as the sole source of truth for every field.

### 2.4 `action: "status_update"` — status (and sometimes priority) changed

Confirmed: `tasksController.js` (several sites — plain status change, approval-flow status change, status + task_priority combined).

```json
{ "company_id": 7, "action": "status_update", "data": { "id": 501, "status": "In-Progress" }, "assignee": 12 }
```
Also seen with additional fields:
```json
{ "company_id": 7, "action": "status_update", "data": { "id": 501, "status": "Complete", "task_priority": 2 } }
```
- One confirmed variant carries `from_completed: true` in `data` — the client interprets this as "a completed task was reopened via a comment" and prompts the user for new effort-hours (`Tasks.jsx` — `setReopenModal`). Confirm the exact trigger condition with backend if replicating this UX on mobile; not fully traced to its origin call site in this pass.
- **Do not confuse this with `status_change`** (§5) — that's a differently-named action used only by the advanced scheduling engine's pause/reorder logic, explicitly out of scope here.

### 2.5 `action: "delete"` — task deleted

Confirmed: `tasksController.js:2553`.
```json
{ "company_id": 7, "action": "delete", "data": { "id": 501, "parent_id": null }, "assignee": 12 }
```
`parent_id` is included so the client can decrement the parent's `subtask_count` and remove the row from its `sub_tasks` array when a subtask is deleted, in addition to removing the task itself from every list.

### 2.6 `action: "sprint_assigned"` — task moved to a sprint/project

Confirmed: `tasksController.js:5932`.
```json
{ "company_id": 7, "action": "sprint_assigned", "data": { "id": 501, "project_id": 12, "sprint_id": 3 } }
```
Patches only `project_id`/`sprint_id` on the task row — used so every connected client's sprint/project chip updates live when a task is moved between sprints.

### 2.7 Notes/Comments — five actions, all scoped to a single task's note thread

All confirmed in `tasksController.js`. A task's notes/comments are **not** a separate socket event — they all ride on `task_update` with these actions:

#### `add_note`
```json
{
  "company_id": 7,
  "action": "add_note",
  "data": {
    "task_id": 501,
    "note": {
      "id": 900,
      "mod_id": 501,
      "notes": "Reassigning this to backend team @[Bilal Ahmed](34)",
      "user_id": 12,
      "pin_top": 0,
      "reactions": [],
      "createdAt": "2026-07-23T10:00:00.000Z"
    }
  }
}
```
Mention markup in `notes` uses the same `@[Full Name](userId)` inline format as chat (see chat reference doc §3). Mentioned users get a separate notification — traced far enough to confirm mention detection happens (`_earlyMentionedIds`) but the actual notification dispatch mechanism for task mentions wasn't cross-checked against the `/notification/*` API in this pass — worth confirming if mobile needs task-mention inbox parity with chat-mention inbox behavior.

#### `update_note`
```json
{ "company_id": 7, "action": "update_note", "data": { "id": 900, "task_id": 501, "notes": "Edited comment text" } }
```

#### `delete_note`
```json
{ "company_id": 7, "action": "delete_note", "data": { "id": 900, "task_id": 501 } }
```

#### `update_note_pin`
```json
{ "company_id": 7, "action": "update_note_pin", "data": { "id": 900, "task_id": 501, "pin_top": 1 } }
```
Confirmed single-pin-per-task rule enforced **client-side** (`Tasks.jsx`: when a note's `pin_top === 1` arrives, all other notes in that task's list are locally unpinned) — not verified as an atomic guarantee server-side; treat it the same way chat's "single pinned message" rule was flagged (client convention, not a proven DB constraint).

#### `update_note_reaction`
```json
{ "company_id": 7, "action": "update_note_reaction", "data": { "id": 900, "task_id": 501, "reactions": [ { "emoji": "👍", "users": [34] } ] } }
```
Same `{ emoji, users: [userId] }` aggregated-per-emoji shape confirmed for chat message reactions — this is evidently a shared convention across both modules.

### 2.8 Attachments — two actions

#### `add_attachment`
```json
{ "company_id": 7, "action": "add_attachment", "data": { "task_id": 501, "attachment": { "id": 55, "originalName": "screenshot.png", "url": "/public/uploads/tasks/attachments-....png" } } }
```
(Exact attachment sub-object field list wasn't traced further than what's shown — confirm additional fields like `size`/`fileType` against `chatController.js`-style multer output if the mobile UI needs them; the chat module's equivalent object is fully documented in `CHAT_API_SOCKET_REFERENCE.md` §3/§6 and is a reasonable field-shape assumption here given the same author/pattern, but it was not independently re-verified for the task attachment model.)

#### `delete_attachment`
```json
{ "company_id": 7, "action": "delete_attachment", "data": { "id": 77, "task_id": 501 } }
```

> **Reminder:** attachment `url`s follow the same rule confirmed for chat — direct `/public/...` static access is disabled app-wide; fetch through `GET /api/v1/secure-file?p=...` with the `authToken` header (see `CHAT_API_SOCKET_REFERENCE.md` §6 for the exact transform — it is not chat-specific, it applies to every `/public/` path returned by any module including tasks).

---

## 3. `priority_update` — task-priority list changed (company-wide dropdown data, not a specific task)

Confirmed: `backend/controllers/admin/prioritiesController.js`. This is the event that keeps every open client's **priority dropdown** (the list of selectable priority levels a company has configured, e.g. "Low/Medium/High/Critical") in sync when an admin adds/edits/removes one — it has nothing to do with an individual task's priority *value* (that's `task_update`'s `priority`/`task_priority` fields).

```json
{ "company_id": 7, "action": "create", "data": { "id": 4, "name": "Critical", "color": "#ff4d4f", "order": 1, "company_id": 7 } }
```
```json
{ "company_id": 7, "action": "update", "data": { "id": 4, "name": "Urgent", "color": "#ff0000", "order": 1 } }
```
```json
{ "company_id": 7, "action": "delete", "data": { "id": 4 } }
```
Frontend listener confirmed in `Tasks.jsx` (`_handlePriorityUpdate_live`): maintains a local `taskPriority` list, applying `create`/`update`/`delete` the obvious way by matching `data.id`.

---

## 4. `jobstatus_update` — task-status list changed (company-wide dropdown data)

Confirmed: `backend/controllers/admin/jobstatuses.js`. Same pattern as `priority_update`, but for the company's configurable list of task statuses (e.g. "Pending / In-Progress / On-Hold / Complete").

```json
{ "company_id": 7, "action": "create", "data": { "id": 6, "name": "Blocked", "company_id": 7, "status": 1 } }
```
```json
{ "company_id": 7, "action": "update", "data": { "id": 6, "name": "Blocked (Waiting on Client)" } }
```
```json
{ "company_id": 7, "action": "delete", "data": { "id": 6 } }
```
Frontend listener confirmed in `Tasks.jsx` (`_handleJobStatusUpdate_live`): patches **two** separate local state slices (`taskStatus` and `taskSt`) in parallel — both kept in sync from the same event; not yet understood why two copies exist (possibly one for a filter dropdown and one for a different UI list) — worth asking if consolidating on mobile causes any behavior gap.

---

## Bonus: `user_update` — company user directory changed (consumed by task creation UI, not task-specific)

Confirmed emit sites: `backend/controllers/admin/usersController.js` (user create/update/delete), plus incidental emits from `attandenceController.js` and `absenteeismCron.js` for attendance-driven user field changes (status flips, etc. — outside task scope, mentioned only for completeness of "why does this fire so often").

```json
{ "company_id": 7, "action": "create", "data": { "...": "full user record" } }
```

**Why it's in this doc:** `CreateTask.jsx` listens for `user_update` purely to keep its **assignee picker** fresh — if any user in the company is added/edited/deactivated while the "create task" form is open, it silently re-fetches `UserServices.getDepartmentUsernames(companyId)` so the dropdown never shows stale/deleted people:

```javascript
SocketService.on("user_update", (payload) => {
  if (String(payload.company_id) !== String(companyId)) return;
  fetchUsers(); // re-fetch assignable users, ignore the payload's `data` entirely
});
```
The client **ignores the actual payload contents** and just uses the event as a "go re-fetch the user list" trigger — so the exact `data` shape doesn't matter for this consumer; don't over-invest in modeling it unless another part of the mobile app needs the raw user-changed payload for a different reason.

---

## 5. Explicitly Excluded — Advanced Task Scheduling Engine (not in scope for this doc)

These `task_update` **actions** exist on the exact same event/controller and are real, working, backend-confirmed features — they are excluded here only because they belong to the separate **auto-scheduling engine** (effort-hour-based queueing, automatic start/due-date calculation, critical-path/priority-queue reordering), which is a distinct, larger subsystem better covered by its own dedicated reference if/when the mobile app needs it.

| Action | What it does (confirmed from `tasksController.js`) |
|---|---|
| `schedule_update` | Backend's scheduling engine (`rescheduleUserQueue` / `cascadeReschedule`) recalculated a task's `start_date`/`due_date` automatically — fired in bursts, which is why the frontend explicitly **debounces/batches these for 350ms** before applying (`scheduleFlushTimerRef` in `Tasks.jsx`) rather than re-rendering per-event. |
| `critical_reorder` | A task's position in a "critical path" priority queue changed; `data` is an **array** of `{ id, critical_order }` patches (note: array payload, not a single object — the one exception to the usual `data` shape in this whole event). |
| `status_change` | The scheduling engine paused/bumped a task in its queue (e.g. "bump to front", auto-pause) — distinct from the ordinary `status_update` action in §2.4; easy to confuse by name, confirmed as a **separate, differently-spelled action** (`status_change` vs `status_update`) tied specifically to queue mechanics, not a user-initiated status edit. |

The backend's own code comment (`tasksController.js`, right after the plain `create` emit) explicitly draws this same line: *"only reschedule when the new task participates in scheduling (has `effort_hours`). **Simple tasks** have no slot in the queue."* — confirming "simple task" (no `effort_hours`, no queue participation) vs. "scheduled task" is a real distinction the backend itself makes, not just a convenient split invented for this document.

If/when the mobile app needs the advanced scheduling engine, request (or generate) a separate reference — it involves additional concepts not covered here (the priority queue itself, `cascadeReschedule`, per-user queue packing) that go well beyond a "just add these socket listeners" scope.
