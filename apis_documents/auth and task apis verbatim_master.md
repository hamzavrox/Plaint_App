# PLANIT Backend API Documentation — Authentication & Task Modules

> **Verbatim Master Markdown Conversion**
> Generated directly from the uploaded PDF so an AI agent can consume the complete specification.


---

## PAGE 1

```text
PLANIT Backend
API Documentation — Authentication & Task Modules
Version 1.0
Date July 1, 2026
Base URL /api/v1
Auth SchemeJWT Bearer Token (header: x-access-token)
Scope Login / Authentication, Task management, App Landing endpoints
```


---

## PAGE 2

```text

```


---

## PAGE 3

```text
Table of Contents
1.  Overview & Conventions
2.  Authentication / Login Endpoints
2.1 User Login
2.2 Verify Email / Request Password Reset
2.3 Reset Password
2.4 Initial Password Reset (Default Password)
3.  Task Endpoints
3.1 Get All Tasks
3.2 Get Tasks Due Today
3.3 Get Tasks by Filter
3.4 Create Task
3.5 Create Subtask
3.6 Get Task Detail
3.7 Update Task
3.8 Update Task Status (Toggle)
3.9 Update Task Assignee
3.10 Delete Task
3.11 Approve Task
3.12 Reject Task
3.13 Add Task Note
3.14 Get Task Notes
3.15 Update Task Note
3.16 Pin/Unpin Task Note
3.17 Delete Task Note
3.18 Update Note Reaction
3.19 Upload Task Attachment
3.20 Delete Task Attachment
3.21 View Task
3.22 Update Task Lead Source
```


---

## PAGE 4

```text
3.23 Update Task Due Date
3.24 Update Task Status (Explicit)
3.25 Update Task Project
4.  App Landing Endpoints
4.1 Get All App Landing Entries
4.2 Create App Landing Entry
4.3 Update App Landing Entry
4.4 Toggle App Landing Status
4.5 Delete App Landing Entry
5.  General Error Responses
6.  Architecture Notes
```


---

## PAGE 5

```text
1. Overview & Conventions
This document describes the REST API endpoints for the Authentication / Login module and the Task Management module of
the PLANIT Backend.
Item Details
Base path /api/v1
Content type application/json (unless noted as multipart/form-data)
Auth token header Any of: x-access-token, authToken, authtoken, or query/body param token
Token type JWT (HS256), expires in 7 days
Standard success envelope{ "Good": true, "data": ... }
Standard failure envelope { "Good": false, "message" | "data": "..." }
Endpoints that require a permission are annotated with a permission badge (e.g. tasks-create). These map to the role/permission
checks enforced by the application's permission middleware.
```


---

## PAGE 6

```text
2. Authentication / Login Endpoints
```


---

## PAGE 7

```text
2.1   User Login
POST /api/v1/user/login
No auth required
Request Body
{
  "email": "user@example.com",
  "password": "password123"
}
Success Response — 200
{
  "Good": true,
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "company_id": 1,
  "sessionTimeoutMins": 360,
  "user": {
    "name": "John Doe",
    "userdata": {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": 2,
      "company_id": 1,
      "status": 1,
      "department": 5,
      "is_head": "yes",
      "wrokfrom_home": 0,
      "image": "profile.jpg",
      "role_title": "Company Admin",
      "user_permissions": ["tasks-create", "tasks-edit", "tasks-delete", "tasks-list"]
    },
    "company": {
      "company_id": 1,
      "company_name": "WebSouls",
      "company_status": 1,
      "company_identifier": "websouls",
      "company_allowed_users": 50,
      "package_name": "Professional",
      "package_id": 1,
      "modules": ["tasks", "attendance", "leave", "projects"],
      "policy": {
        "id": 1,
        "policy_id": 1,
        "company_id": 1,
        "user_id": 123,
        "leavePolicy": [ "..." ],
        "attendencePolicy": [ "..." ],
```


---

## PAGE 8

```text
"hrPolicy": { }
      }
    }
  }
}
Alternate Response — Default Password (200)
{
  "Good": true,
  "isDefaultPassword": true,
  "userEmail": "user@example.com",
  "message": "Please reset your default password"
}
Error Responses
400  { "Good": false, "message": "Email and password are required" }
400  { "Good": false, "message": "Invalid password" }
403  { "Good": false, "message": "Your account is inactive. Please contact support." }
403  { "Good": false, "message": "IP does not match allowed office IP" }
403  { "Good": false, "message": "No shift assigned" }
404  { "Good": false, "message": "User not found" }
IP whitelist check applies to non work-from-home users.
Validates that the user has a shift assigned and an active HR policy.
Session timeout defaults to 360 minutes, configurable per company.
JWT token is valid for 7 days.
```


---

## PAGE 9

```text
2.2   Verify Email / Request Password Reset
POST /api/v1/user/verify-email
No auth required
Request Body
{
  "email": "user@example.com"
}
Success Response — 200
{
  "success": true,
  "message": "Reset password link sent to your email"
}
Error Responses
400  { "success": false, "message": "Email is required" }
404  { "success": false, "message": "User not found" }
Generates a reset token valid for 1 hour.
Sends an email with a reset link: https://planit.pk/reset-password/{token}
```


---

## PAGE 10

```text
2.3   Reset Password
POST /api/v1/user/reset-password
No auth required
Request Body
{
  "token": "reset_token_from_email",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
Success Response — 200
{
  "success": true,
  "message": "Password has been reset successfully"
}
Error Responses
400  { "success": false, "message": "All fields are required" }
400  { "success": false, "message": "Passwords do not match" }
400  { "success": false, "message": "Invalid or expired token" }
Password is hashed with bcrypt (10 salt rounds) before being stored.
```


---

## PAGE 11

```text
2.4   Initial Password Reset (Default Password)
POST /api/v1/user/initial-password-reset
No auth required
Request Body
{
  "email": "user@example.com",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
Success Response — 200
{
  "Good": true,
  "data": "Password has been updated successfully. Please login with your new password."
}
Error Responses
400  { "Good": false, "message": "All fields are required" }
400  { "Good": false, "message": "Passwords do not match" }
400  { "Good": false, "message": "Action not allowed" }
404  { "Good": false, "message": "User not found" }
Only applies to accounts still holding the system default password hash (typically bulk-imported users).
```


---

## PAGE 12

```text
3. Task Endpoints
Unless noted otherwise, all task endpoints require a valid auth token. Some also require a specific permission (shown as a badge).
```


---

## PAGE 13

```text
3.1   Get All Tasks
GET /api/v1/tasks/all
Auth required
Query Parameters
company_id  (number, required)
Success Response — 200
{
  "Good": true,
  "data": {
    "task_owner": [ { "id": 123, "first_name": "John", "last_name": "Doe", "email": "john@example.com", 
"company_id": 1, "image": "profile.jpg" } ],
    "priority": [ { "id": 1, "name": "High", "color": "#FF0000", "company_id": 1 } ],
    "status": ["Pending", "In-Progress", "Complete", "Pending-Approval", "Rejected"],
    "tasks_assigned_to_me": [
      {
        "id": 1,
        "title": "Design Database Schema",
        "status": "In-Progress",
        "due_date": "2026-07-15",
        "priority": 1,
        "assignee": 123,
        "asigned_to": 124,
        "parent_id": 0,
        "company_id": 1,
        "is_recurring": false,
        "approval_required": 0,
        "created_by": 123,
        "module": "task",
        "project_id": 5,
        "sprint_id": 2,
        "updatedAt": "2026-07-01T10:30:00Z",
        "task_assignee": { "id": 123, "first_name": "John", "last_name": "Doe", "image": "profile.jpg", 
"role": 2 },
        "task_assigned_to": { "id": 124, "first_name": "Jane", "last_name": "Smith", "image": 
"profile2.jpg", "role": 3 },
        "priority_color": "#FF0000",
        "priority_name": "High",
        "subtask_count": 3,
        "notes_count": 2,
        "can_edit": true,
        "can_edit_status": true,
        "can_edit_subtask": true
      }
    ],
    "tasksByme": [ "..." ],
    "all_other_tasks": [ "..." ]
```


---

## PAGE 14

```text
}
}
Error Response
400  { "message": "Company ID is required" }
Results are grouped into tasks_assigned_to_me, tasksByme, and all_other_tasks.
Tasks due today are excluded here (see 3.2).
Visibility is hierarchical — admins see all tasks; regular users see only their own, created, or mentioned tasks.
3.2   Get Tasks Due Today
GET /api/v1/tasks/duetoday
Auth required
Query Parameters
company_id  (number, required)
Same response shape as 3.1, filtered to due_date == today.
3.3   Get Tasks by Filter
GET /api/v1/tasks/filter
Auth required
Query Parameters
company_id  (number, required)
filter      (string, required) one of:
  delayed | due_in_7_days | created_by_me | assigned_to_me |
  pending_approval | recurring | complete
Same response shape as 3.1, filtered according to the selected filter value.
```


---

## PAGE 15

```text
3.4   Create Task
POST /api/v1/tasks/create
Auth required tasks-create
Request Body
{
  "title": "Design Database Schema",
  "company_identifier": "websouls",
  "company_id": 1,
  "assign_to": 124,
  "due_date": "2026-07-15",
  "priority": 1,
  "approval_required": 0,
  "status": "Pending",
  "description": "Create comprehensive database schema for new module",
  "project_id": 5,
  "is_recurring": false,
  "recurring_period": null,
  "recurring_time": null,
  "recurring_total_count": 0,
  "recurring_exclude_days": [],
  "recurring_week_day": null,
  "recurring_month_date": null,
  "recurring_annual_month": null,
  "recurring_annual_date": null
}
Recurring Task Variants
// Daily (skip Sundays)
{ "is_recurring": true, "recurring_period": "daily", "recurring_time": "09:00 AM",
  "recurring_total_count": 0, "recurring_exclude_days": ["Sunday"] }
// Weekly (every Monday)
{ "is_recurring": true, "recurring_period": "weekly", "recurring_time": "10:00 AM",
  "recurring_week_day": "Monday", "recurring_total_count": 0 }
// Monthly (15th of each month)
{ "is_recurring": true, "recurring_period": "monthly", "recurring_time": "02:00 PM",
  "recurring_month_date": 15, "recurring_total_count": 0 }
// Annually (July 4th)
{ "is_recurring": true, "recurring_period": "annually", "recurring_time": "08:00 AM",
  "recurring_annual_month": 7, "recurring_annual_date": 4, "recurring_total_count": 0 }
Success Response — 200
{
  "Good": true,
  "data": {
```


---

## PAGE 16

```text
"id": 1001,
    "title": "Design Database Schema",
    "company_id": 1,
    "asigned_to": 124,
    "due_date": "2026-07-15",
    "priority": 1,
    "approval_required": 0,
    "status": "Pending",
    "description": "Create comprehensive database schema for new module",
    "created_by": 123,
    "assignee": 123,
    "module": "task",
    "parent_id": 0,
    "is_recurring": false,
    "recurring_period": null,
    "recurring_time": null,
    "recurring_total_count": 0,
    "recurring_completed_count": 0,
    "project_id": 5,
    "createdAt": "2026-07-01T10:30:00Z",
    "updatedAt": "2026-07-01T10:30:00Z"
  }
}
Error Response
400  { "Good": false, "data": "Cannot create tasks for projects currently in the Planning phase. Please 
move the project to an execution status first." }
assignee is auto-set to the current user if different from assign_to.
Email notification sent to the assignee if different from the creator; a socket event is emitted for real-time UI updates.
Full activity history is logged.
3.5   Create Subtask
POST /api/v1/tasks/createsubtask/:id
Auth required tasks-create
URL Parameters
id  (number, required) — parent task ID
Request / Response
Same body and response shape as 3.4 Create Task.
Only the creator, assignee, their supervisor, or an admin may create a subtask; the parent task must exist.
```


---

## PAGE 17

```text
3.6   Get Task Detail
GET /api/v1/tasks/:id
Auth required
URL Parameters
id  (number, required) — task ID
Success Response — 200
{
  "Good": true,
  "data": {
    "priority": [
      {
        "id": 1001,
        "title": "Design Database Schema",
        "company_id": 1,
        "asigned_to": 124,
        "due_date": "2026-07-15",
        "priority": 1,
        "approval_required": 0,
        "status": "Pending",
        "description": "Create comprehensive database schema for new module",
        "created_by": 123,
        "assignee": 123,
        "module": "task",
        "parent_id": 0,
        "is_recurring": false,
        "project_id": 5,
        "createdAt": "2026-07-01T10:30:00Z"
      }
    ]
  }
}
```


---

## PAGE 18

```text
3.7   Update Task
POST /api/v1/tasks/update/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — task ID
Request Body
{
  "title": "Design Database Schema",
  "company_id": 1,
  "company_identifier": "websouls",
  "asigned_to": 124,
  "due_date": "2026-07-20",
  "priority": 2,
  "approval_required": 1,
  "status": "In-Progress",
  "description": "Updated description",
  "is_recurring": false,
  "recurring_period": null,
  "recurring_time": null,
  "recurring_total_count": 0,
  "recurring_exclude_days": [],
  "project_id": 5,
  "sprint_id": 2
}
Success Response — 200
{ "Good": true, "msg": "Record has Been Updated" }
Full edit (any field) is restricted to the task creator.
Status + subtask edits are allowed for the creator, assignee, supervisor, or admin.
Setting status to "Complete" when approval_required = 1 instead moves the task to "Pending-Approval" unless the
actor is the creator.
Emails the assignee and creator (if different from the updater); emits a socket event; logs activity.
```


---

## PAGE 19

```text
3.8   Update Task Status (Toggle)
POST /api/v1/tasks/statusupdate/:id
Auth required
URL Parameters
id  (number, required) — task ID
Request Body
{}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
Toggles status between 0/1 as a simple flag; prefer 3.24 (explicit status update) for full workflow control.
3.9   Update Task Assignee
POST /api/v1/tasks/updateasignedto/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — task ID
Request Body
{
  "company_id": 1,
  "company_identifier": "websouls",
  "assignee": 125
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
Error Response
403  { "Good": false, "data": "Only the task creator can reassign this task." }
Only the task creator may reassign; emails the new assignee and notifies the old assignee/creator; emits a socket event.
```


---

## PAGE 20

```text
3.10   Delete Task
DELETE /api/v1/tasks/:id
Auth required tasks-delete
URL Parameters
id  (number, required) — task ID
Success Response — 200
{ "Good": true, "data": "Task deleted successfully" }
Error Responses
404  { "Good": false, "data": "Task not found" }
403  { "Good": false, "data": "You do not have permission to delete this task." }
Only the creator can delete a task; cascades to attachments/notifications and emails the assignee and creator.
3.11   Approve Task
POST /api/v1/tasks/approve/:id
Auth required
URL Parameters
id  (number, required) — task ID
Request Body
{}
Success Response — 200
{ "Good": true, "data": "Task approved and marked complete" }
Error Responses
400  { "Good": false, "data": "Task is not pending approval" }
403  { "Good": false, "data": "Only the task creator or admin can approve tasks" }
Task must be in "Pending-Approval" status; only the creator or a company admin may approve.
```


---

## PAGE 21

```text
3.12   Reject Task
POST /api/v1/tasks/reject/:id
Auth required
URL Parameters
id  (number, required) — task ID
Request Body
{
  "rejection_reason": "Design needs revision before implementation"
}
Success Response — 200
{ "Good": true, "data": "Task rejected" }
Error Responses
400  { "Good": false, "data": "Task is not pending approval" }
403  { "Good": false, "data": "Only the task creator or admin can reject tasks" }
Sets status to "Rejected" and stores the rejection_reason.
```


---

## PAGE 22

```text
3.13   Add Task Note
POST /api/v1/tasks/addnote/:id
Auth required tasks-list
URL Parameters
id  (number, required) — task ID
Headers
Content-Type: multipart/form-data
x-access-token: <JWT_TOKEN>
Request Body (multipart/form-data)
notes: "This is a comment with @124 mention"
company_id: 1
company_identifier: "websouls"
file: <optional_attachment.pdf>
reply_to: {"note_id": 456, "user_id": 123}   (optional)
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
Supported file types: png, jpg, jpeg, pdf, docx, csv, txt, zip, rar, sql, ppt, xls, xlsx, svg, webp, avif, doc — max 30MB.
@mentions use the format @{user_id} and trigger notifications.
Adding a note on a Pending-Approval / Complete / Pending task auto-transitions it to In-Progress (for authorized users).
```


---

## PAGE 23

```text
3.14   Get Task Notes
POST /api/v1/tasks/showtasknote/:id
Auth required
URL Parameters
id  (number, required) — task ID
Request Body
{}
Success Response — 200
{
  "Good": true,
  "data": [
    {
      "id": 1,
      "module": "task",
      "company_id": 1,
      "mod_id": 1001,
      "notes": "This is a comment with @124 mention",
      "pin_top": 0,
      "user_id": 123,
      "user_name": "John Doe",
      "user_image": "profile.jpg",
      "attachment_file": "file_12345.pdf",
      "extension": "pdf",
      "created_at": "2026-07-01T10:30:00Z",
      "reply_to": { "note_id": 456, "user_id": 124 }
    }
  ]
}
```


---

## PAGE 24

```text
3.15   Update Task Note
POST /api/v1/tasks/updatenote/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — note ID
Request Body
{
  "notes": "Updated comment text",
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
3.16   Pin/Unpin Task Note
POST /api/v1/tasks/updatenotepin/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — note ID
Request Body
{
  "pin_top": 1,
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
pin_top: 0 = unpinned, 1 = pinned.
```


---

## PAGE 25

```text
3.17   Delete Task Note
POST /api/v1/tasks/deletenote/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — note ID
Request Body
{
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
3.18   Update Note Reaction
POST /api/v1/tasks/updatenotereaction/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — note ID
Request Body
{
  "reaction": " 👍 ",
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
```


---

## PAGE 26

```text
3.19   Upload Task Attachment
POST /api/v1/tasks/attachments/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — task ID
Headers
Content-Type: multipart/form-data
x-access-token: <JWT_TOKEN>
Request Body (multipart/form-data)
file: <file.pdf>
company_id: 1
company_identifier: "websouls"
Success Response — 200
{
  "Good": true,
  "data": {
    "id": 1,
    "mod_id": 1001,
    "module": "task",
    "attachment_file": "file_12345.pdf",
    "company_id": 1,
    "created_at": "2026-07-01T10:30:00Z"
  }
}
Same file type / size restrictions as task notes (30MB max).
```


---

## PAGE 27

```text
3.20   Delete Task Attachment
POST /api/v1/tasks/attachmentdelete/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — attachment ID
Request Body
{
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
```


---

## PAGE 28

```text
3.21   View Task
POST /api/v1/tasks/view/:id
Auth optional
URL Parameters
id  (number, required) — task ID
Request Body
{}
Success Response — 200
{
  "Good": true,
  "data": {
    "id": 1001,
    "title": "Design Database Schema",
    "status": "In-Progress",
    "due_date": "2026-07-15",
    "description": "...",
    "asigned_to": 124,
    "assignee": 123,
    "company_id": 1,
    "project_id": 5,
    "updatedAt": "2026-07-01T10:30:00Z"
  }
}
```


---

## PAGE 29

```text
3.22   Update Task Lead Source
POST /api/v1/tasks/updateleadsource/:id
Auth optional
URL Parameters
id  (number, required) — task ID
Request Body
{
  "source": "Website",
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
3.23   Update Task Due Date
POST /api/v1/tasks/updatetaskduedate/:id
Auth optional
URL Parameters
id  (number, required) — task ID
Request Body
{
  "duedate": "2026-07-20",
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
```


---

## PAGE 30

```text
3.24   Update Task Status (Explicit)
POST /api/v1/tasks/updatetaskstatus/:id
Auth required
URL Parameters
id  (number, required) — task ID
Request Body
{
  "status": "In-Progress",
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
3.25   Update Task Project
POST /api/v1/tasks/updatetaskproject/:id
Auth required tasks-edit
URL Parameters
id  (number, required) — task ID
Request Body
{
  "project_id": 6,
  "company_id": 1,
  "company_identifier": "websouls"
}
Success Response — 200
{ "Good": true, "data": "Record has Been Updated" }
```


---

## PAGE 31

```text
4. App Landing Endpoints
The App Landing module manages promotional/landing content shown inside the mobile app (title, description, call-to-action
button, and images), scoped per company. All endpoints require a valid auth token. Data is stored in MongoDB (Mongoose).
Field Type Notes
id Number Auto-incremented (max existing id + 1)
company_id Number Required, scopes the entry to a company
title String Required, non-empty
description String Optional, defaults to ""
button_text String Optional, defaults to "Get Started"
button_url String Optional, defaults to ""
images String[] Server-side paths to uploaded files, e.g. /uploads/app-landing/<file>
status Number 1 = active, 0 = inactive; defaults to 1 on create
Known gap: The current AppLanding create/edit form in the frontend collects image URLs  as plain text inputs and submits them as JSON
( images: string[]). The backend routes for /create and /update/:id only accept images via multipart/form-
data file uploads (multer upload.array("images", 20)) and build the stored images array exclusively from req.files
— req.body.images (the URL strings) is never read. As a result, images entered as URLs in the current UI are silently dropped and
not persisted. To support URL-based images, either the frontend needs to switch to real file uploads, or the controller needs to also
accept/merge string URLs from the JSON body.
```


---

## PAGE 32

```text
4.1   Get All App Landing Entries
GET /api/v1/app-landing/all
Auth required
Query Parameters
company_id  (number, required)
Success Response — 200
{
  "Good": true,
  "data": [
    {
      "id": 1,
      "company_id": 123,
      "title": "Welcome to Our App",
      "description": "Get started with our application",
      "button_text": "Download Now",
      "button_url": "https://example.com/download",
      "images": [
        "/uploads/app-landing/1699564800000-banner.jpg",
        "/uploads/app-landing/1699564801000-feature.jpg"
      ],
      "status": 1,
      "createdAt": "2026-07-01T10:30:00.000Z",
      "updatedAt": "2026-07-01T10:30:00.000Z"
    }
  ]
}
Error Response
500  { "Good": false, "message": "<error message>" }
```


---

## PAGE 33

```text
4.2   Create App Landing Entry
POST /api/v1/app-landing/create
Auth required
Headers
Content-Type: multipart/form-data
authToken: <JWT_TOKEN>
Request Body (multipart/form-data)
company_id: 123
title: "Welcome to Our App"
description: "Get started with our application"
button_text: "Download Now"
button_url: "https://example.com/download"
images: [File1, File2, ...]   (field name "images", up to 20 files)
Success Response — 200
{ "Good": true, "data": "App landing entry created" }
Error Responses
400  { "Good": false, "data": "Invalid Company ID" }
400  { "Good": false, "data": "Title is required" }
500  { "Good": false, "message": "<error message>" }
Allowed image extensions: png, jpg, jpeg, gif, webp, svg, avif; max 10MB per file, up to 20 files.
Uploaded files are stored under public/uploads/app-landing/, named <timestamp>-
<original_filename>.
id is auto-assigned as the current max id + 1; new entries default to status: 1.
Emits socket event app_landing_update with action: "create"; activity is logged (actor, module "app_landing",
new values).
```


---

## PAGE 34

```text
4.3   Update App Landing Entry
POST /api/v1/app-landing/update/:id
Auth required
URL Parameters
id  (number, required) — app landing entry ID
Headers
Content-Type: multipart/form-data
authToken: <JWT_TOKEN>
Request Body (multipart/form-data)
title: "Updated Title"
description: "Updated description"
button_text: "Click Here"
button_url: "https://example.com/new-url"
existing_images: ["/uploads/app-landing/1699564800000-banner.jpg"]   (paths to keep)
images: [File1, File2, ...]   (new files to add, field name "images")
Success Response — 200
{ "Good": true, "data": "App landing entry updated" }
Error Responses
404  { "Good": false, "data": "Record not found" }
400  { "Good": false, "data": "Title is required" }
500  { "Good": false, "message": "<error message>" }
Final images array = existing_images (kept) concatenated with newly uploaded files.
Emits socket event app_landing_update with action: "update"; activity is logged with old/new title and
description.
```


---

## PAGE 35

```text
4.4   Toggle App Landing Status
POST /api/v1/app-landing/statusupdate/:id
Auth required
URL Parameters
id  (number, required) — app landing entry ID
Request Body
{}
Success Response — 200
{ "Good": true, "data": "Status updated" }
Error Responses
404  { "Good": false, "data": "Record not found" }
500  { "Good": false, "message": "<error message>" }
Flips status between 1 (active) and 0 (inactive); no explicit target value is accepted.
Emits socket event app_landing_update with action: "status_update".
4.5   Delete App Landing Entry
DELETE /api/v1/app-landing/delete/:id
Auth required
URL Parameters
id  (number, required) — app landing entry ID
Success Response — 200
{ "Good": true, "data": "App landing entry deleted" }
Error Responses
404  { "Good": false, "data": "Record not found" }
500  { "Good": false, "message": "<error message>" }
Permanently removes the record (no soft-delete).
Emits socket event app_landing_update with action: "delete".
```


---

## PAGE 36

```text
5. General Error Responses
Authentication Errors
403  "Un-Athunticated request"        // No token provided
200  "Un-Athunticated request"        // Invalid / expired token
Permission Errors
403  { "Good": false, "data": "You do not have permission to [action]" }
Validation Errors
400  { "Good": false, "message": "[Field] is required" }
Server Errors
500  { "Good": false, "message": "Internal server error" }
```


---

## PAGE 37

```text
6. Architecture Notes
Authentication
JWT-based token authentication (HS256), tokens expire after 7 days.
Session timeout is configurable per company (default 360 minutes).
Office IP whitelist enforced for non-WFH users; WFH users bypass the IP check.
Task Permissions
Creator-only: full edit, delete, reassignment.
Assignee / Supervisor: status updates, subtask management.
Admin: all operations.
Mentioned users: view and comment only.
Recurring Tasks
Supported periods: daily, weekly, monthly, quarterly, semi-annually, annually.
New occurrences are spawned automatically via a scheduled cron job.
Exclude-day configuration (e.g. skip weekends) and finite/infinite recurrence counts are supported.
Notifications & Emails
Delivered asynchronously (fire-and-forget) so they don't block the API response.
User mentions use the @{user_id} format inside notes.
Real-time updates are pushed via Socket.io.
Activity Logging
Every change is tracked with actor identity, IP address, and old/new values, forming a queryable audit trail.
```
