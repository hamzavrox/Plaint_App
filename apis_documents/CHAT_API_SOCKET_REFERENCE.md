# Chat Module — Full API & Socket.io Reference (for Mobile App Developer)

> **How this document was produced:** There is no backend-authored spec for this module — `PLANIT.md` was a list of unanswered questions sent to the backend team. This document was instead reverse-engineered field-by-field from the **web frontend's actual implementation** (`src/Services/ChatService.js`, `src/Services/SocketService.js`, `src/Components/Screens/Chat/ChatContext.jsx`, `src/Components/Screens/Chat/ChatModal.jsx` — ~4,500 lines of client code). Every route, payload key, and socket event name below is copied verbatim from working client code that talks to the real production backend, so it is safe to build the mobile client against.
>
> **What is NOT guaranteed:** exact numeric/string example *values* in the JSON samples below (ids, timestamps, names) are illustrative placeholders, not captured real payloads — the *shape and key names* are real, the *content* is invented for readability. Server-side validation rules, error payload shape, and hard limits (max file size, etc.) are invisible from the frontend and are called out explicitly as unknown where relevant.

---

## Table of Contents

1. [Base Configuration](#1-base-configuration)
2. [Socket.io Connection](#2-socketio-connection)
3. [Data Models](#3-data-models)
4. [REST API Routes](#4-rest-api-routes)
5. [Socket Event Reference](#5-socket-event-reference)
6. [File Upload Flow](#6-file-upload-flow)
7. [Message Search](#7-message-search)
8. [Push Notifications](#8-push-notifications)
9. [Behavioral Notes](#9-behavioral-notes-ordering-pagination-deletes-receipts-etc)
10. [Open Gaps](#10-open-gaps-cannot-be-answered-from-frontend-code)

---

## 1. Base Configuration

```
REST base URL:   https://backend-planit.soulservices.com/api/v1/
Socket URL:      https://backend-planit.soulservices.com          (no /api/v1, no namespace)
Static files:    https://backend-planit.soulservices.com/public/...
```

(Values come from `.env` — `REACT_APP_BASE_URL` / `REACT_APP_SOCKET_URL`. There is also an older `backend.planit.pk` host referenced as a fallback default in a few places — confirm with backend team which host the mobile app should target.)

### Every REST request must send this header:

```
authToken: <token>
Content-Type: application/json        (omit / let it auto-set to multipart/form-data when uploading files)
Accept: application/json
```

Notes:
- The auth scheme is a **custom header named `authToken`**, holding the raw token string — **not** `Authorization: Bearer <token>`.
- The token is read from local secure storage (`adminInfo.authToken`) on every request.
- On `401`, or if the response body is literally `"Un-Athunticated request"`, the web client force-logs-out and redirects to `/`. The mobile client should treat both of those the same way: **token invalid → force re-login.**

### Standard response envelope

Every endpoint below returns:

```json
{
  "Good": true
}
```

as the base envelope — `Good: false` on failure. The frontend only branches on `res.Good`; there is **no consistently-populated error message/code field** observed anywhere, so treat `Good: false` as "generic failure" unless/until backend confirms an error schema.

---

## 2. Socket.io Connection

### Client setup (mirror this in the mobile Socket.IO client)

```javascript
io("https://backend-planit.soulservices.com", {
  transports: ["websocket", "polling"],
  reconnection: true,
});
```

| Setting | Value |
|---|---|
| Namespace | Root `/` (none) |
| Transports | `websocket` then `polling` fallback |
| Reconnection | Socket.IO default backoff (no custom `reconnectionDelay`/`reconnectionAttempts` set) |
| Heartbeat/ping | Engine.IO defaults — nothing customized |
| Connection timeout | Not customized |
| Handshake auth | **None** — no JWT in `auth`/`query`/headers at `io()` time |

### Identifying yourself after connecting

The socket has **no identity** until you tell it who you are. Do this immediately on `connect`, and again on **every reconnect**:

```javascript
socket.emit("registerUser", String(userId));   // raw string, not an object!
socket.emit("getOnlineUsers");                 // no payload
```

### Reconnection recovery sequence (do this every time `connect` fires, including the very first time)

1. `emit("registerUser", String(userId))`
2. `emit("getOnlineUsers")`
3. For every room the app already knows about locally: `emit("joinChatRoom", roomId)`
4. Call `GET /chat/rooms` and reconcile (merge unread counts using `max(local, server)` so you never lose an optimistic increment that happened while offline)

This "re-sync on every connect" pattern is how the web client compensates for the total lack of custom reconnection/backoff tuning and any missed-event guarantee — treat socket events as **best-effort real-time UI updates**, and REST as the **source of truth** you reconcile against periodically / on reconnect.

---

## 3. Data Models

### Room

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c01",
  "type": "direct",
  "name": null,
  "members": [
    {
      "id": 12,
      "first_name": "Ayesha",
      "last_name": "Khan",
      "image": "1700000000000-ayesha.jpg",
      "is_deleted": false,
      "status": 1
    },
    {
      "id": 34,
      "first_name": "Bilal",
      "last_name": "Ahmed",
      "image": null,
      "is_deleted": false,
      "status": 1
    }
  ],
  "last_message": { "...": "Message object, see below" },
  "unreadCount": 3,
  "is_muted": false,
  "force_unread": false,
  "created_by": 12,
  "my_visible_from": "2026-06-01T10:00:00.000Z",
  "parent_id": null
}
```

- `type` is one of: `"direct"`, `"channel"`, `"project"`.
- `name` is only meaningful for `"channel"`/`"project"` rooms.
- `parent_id` links a channel to a parent project room (nested channels).
- `my_visible_from` is a **per-requesting-user** cursor: messages created before this timestamp are hidden from that user only (used for "clear chat" / "hide conversation" — see §9).
- `members[].is_deleted` / `status` mark a deactivated user — client renders them as "Deleted User" with no avatar.

### Message

```json
{
  "_id": "665f200000000000000000aa",
  "room_id": "665f1a2b3c4d5e6f7a8b9c01",
  "sender_id": 12,
  "sender_name": "Ayesha Khan",
  "sender_image": "1700000000000-ayesha.jpg",
  "text": "Hey @[Bilal Ahmed](34), can you check this?",
  "type": "text",
  "attachments": [
    {
      "name": "1700000001111-invoice.pdf",
      "originalName": "invoice.pdf",
      "fileType": "file",
      "url": "/public/uploads/chat/1700000001111-invoice.pdf"
    }
  ],
  "reply_to": null,
  "parent_id": null,
  "is_pinned": false,
  "is_edited": false,
  "is_read": [34],
  "reactions": [
    { "emoji": "👍", "users": [34] }
  ],
  "mentions": [34],
  "postType": null,
  "is_forwarded": false,
  "forwarded_from_name": null,
  "createdAt": "2026-07-20T09:15:00.000Z"
}
```

Field notes:
- `text` contains **inline mention markup**: `@[Full Name](userId)`. The mobile client must parse this same markup to render mention chips (regex used by web: `/@\[([^\]]+)\]\((\d+)\)/`).
- `type`: `"text"` normal, `"audio"` for voice notes (voice notes have `attachments` with `fileType: "audio"` and typically empty `text`).
- `attachments[].fileType` is one of `"image"`, `"audio"`, `"file"` (derived client-side from MIME type / extension — may or may not be set the same way server-side).
- `attachments[].url` is a **relative path** — build the full URL as `${baseHost}${url starts with /public ? url : '/public'+url}`. `baseHost` = the REST base URL **without** the trailing `/api/v1/`.
- `is_read` is an **array of user IDs** who have read the message (supports group rooms), not a boolean. Empty array / absent = unread by everyone else.
- `reactions[].users` is an array of user IDs who reacted with that emoji (aggregated per-emoji, not one row per reaction).
- `postType` is a string matching either a built-in type or a `CustomPostType.name` (see below) — only meaningful in `"channel"` rooms.

### Attachment (embedded in Message)

```json
{
  "name": "1700000001111-invoice.pdf",
  "originalName": "invoice.pdf",
  "fileType": "file",
  "url": "/public/uploads/chat/1700000001111-invoice.pdf"
}
```

### Custom Post Type (per-channel)

```json
{ "name": "Announcement", "color": "#0DDFAB", "icon": "Megaphone" }
```

- `icon` is a string key into a fixed icon set the client maps to actual icons: `Megaphone, MessagesSquare, Lightbulb, Bell, Tag, Star, Zap, Heart, Flag, Bookmark, AlertCircle, CheckCircle`. Mobile should support the same icon set (or at minimum fall back to a generic tag icon for unknown values).
- Built-in post types the UI treats specially by lowercase name: `announcement`, `discussion`, `idea`, `update` — anything else is "custom" and uses `color`/`icon` directly.

### Room Permission (channel/project rooms only)

Enum values (exact strings — case-sensitive, used as-is in API payloads):

| Value | Meaning |
|---|---|
| `"Full edit"` | Can add people, create post types, send messages, manage the channel. Effectively the owner/admin level. |
| `"Edit"` | Can create post types and send messages. Cannot add people. |
| `"Comment"` | Can send messages using existing post types only. Cannot create post types or add people. |
| `"View Only"` | Read-only. Cannot send messages or interact (react/pin/etc. — not verified individually, assume all write actions blocked). |

Default assumed by the client when nothing is returned yet: `"Full edit"`.

### User / Member (search results, mention list, add-member results)

```json
{
  "id": 34,
  "full_name": "Bilal Ahmed",
  "first_name": "Bilal",
  "last_name": "Ahmed",
  "email": "bilal@company.com",
  "image": "1699999999999-bilal.jpg"
}
```
(`/chat/search-users` and `/user/note-mentions` responses are consumed with slightly different field names in each — see route table.)

---

## 4. REST API Routes

All paths are relative to the base URL above. All require the `authToken` header unless noted.

### 4.1 Rooms

#### `GET /chat/rooms`
List all rooms visible to the current user (server should already exclude rooms the user hid — see §9).

**Response:**
```json
{
  "Good": true,
  "rooms": [ /* array of Room objects, see §3 */ ]
}
```

#### `POST /chat/get-or-create-room`
Idempotent — returns the existing room if one already exists (e.g. an existing DM between the same two users), otherwise creates it.

**Request (direct message):**
```json
{ "type": "direct", "targetId": 34 }
```

**Request (new channel):**
```json
{ "type": "channel", "name": "Design Team", "parent_id": null }
```
(`parent_id` optional — set when creating a channel nested under a project room.)

**Response:**
```json
{ "Good": true, "room": { "...": "Room object" } }
```

#### `POST /chat/leave-room`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }
```
**Response:** `{ "Good": true }`
Client also emits socket `userLeftRoom` after this succeeds (see §5).

#### `POST /chat/remove-member`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "userId": 34 }
```
**Response:** `{ "Good": true }`
Used both for "kick a member" and "leave via self-removal" — client checks `isSelf` to decide UI copy.

#### `POST /chat/delete-room`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }
```
**Response:** `{ "Good": true }`
Only the room creator is allowed to do this per the UI gating (`created_by === currentUserId`) — not verified server-side from frontend code.

#### `POST /chat/add-member`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "userId": 34 }
```
**Response:**
```json
{ "Good": true, "user": { "id": 34, "first_name": "Bilal", "last_name": "Ahmed", "image": null } }
```

#### `POST /chat/hide-room` / `POST /chat/unhide-room`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }
```
**Response:** `{ "Good": true }`
Soft-hides a room from `GET /chat/rooms` for this user only (no socket broadcast — doesn't affect other members). Web additionally tracks this in `localStorage` as a belt-and-suspenders fallback; mobile does **not** need to replicate the local cache, just call these endpoints and trust `GET /chat/rooms`.

#### `POST /chat/mute-room`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }
```
**Response:** `{ "Good": true }`
Server is expected to broadcast `chatRoomSettingUpdated` (`type: "mute"`) to sync mute state across the user's other sessions/devices (see §5). Looks like a toggle (no explicit on/off param sent) — confirm with backend whether calling it again un-mutes, or whether a separate unmute route exists that just isn't used by web yet.

#### `POST /chat/mark-read` / `POST /chat/mark-unread`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }
```
**Response:** `{ "Good": true }`
`mark-read` is called automatically whenever a room is opened/messages fetched (in addition to the `messagesRead` socket emit — call both). `mark-unread` is a manual "mark as unread" user action from the room list context menu.

---

### 4.2 Messages

#### `GET /chat/messages/:roomId?page=<n>&after=<isoDate>`
Paginated message history, newest-first-loaded-then-reversed (i.e. page 1 = most recent messages).

- `page` — 1-based integer.
- `after` — **optional**, an ISO-8601 timestamp. When present, only messages created at/after this time are relevant (used to hide pre-"clear chat" history — see §9). Omit entirely if the room has no clear/hide cursor (don't send `after=null`).

**Example request:** `GET /chat/messages/665f1a2b3c4d5e6f7a8b9c01?page=1`
**Example request (paginated further back):** `GET /chat/messages/665f1a2b3c4d5e6f7a8b9c01?page=2&after=2026-06-01T10%3A00%3A00.000Z`

**Response:**
```json
{
  "Good": true,
  "messages": [ /* array of Message objects, chronological order within the page */ ],
  "hasMore": true
}
```
`hasMore: false` once the oldest message has been reached — stop paginating.

#### `POST /chat/send-message`
Sends a new message. **Two content types depending on whether there are attachments** (see §6 for the full upload story):

**No attachments — `application/json`:**
```json
{
  "room_id": "665f1a2b3c4d5e6f7a8b9c01",
  "text": "Hey @[Bilal Ahmed](34), can you check this?",
  "parent_id": null,
  "reply_to": "665f200000000000000000a1",
  "postType": "Announcement"
}
```

**With attachments — `multipart/form-data`:**
```
room_id:    665f1a2b3c4d5e6f7a8b9c01
text:       "See attached"
parent_id:  (omitted if null/empty — client skips empty/null fields entirely)
reply_to:   (omitted if null)
postType:   (omitted if null)
attachments: <binary file 1>
attachments: <binary file 2>        // repeated field name for multiple files
```

Notes:
- `reply_to` is the `_id` of the message being replied to, or `null`.
- `postType` only applies to channel/project rooms; omit for DMs.
- **The web client never sends `null`/empty-string fields at all** in the FormData case (it filters them out before appending) — mobile should do the same to avoid the backend receiving the literal string `"null"`.

**Response:**
```json
{ "Good": true, "message": { "...": "full Message object, including server-assigned _id and createdAt" } }
```

> **Important for mobile:** the sender does **not** receive their own new message back over the socket — the REST response is authoritative for the sender's own UI. Other room members are expected to receive it via the `receiveChatMessage` socket event (server-side broadcast, not something the client emits itself).

#### `POST /chat/edit-message`
**No new attachments — JSON:**
```json
{ "messageId": "665f200000000000000000aa", "text": "Updated text", "keepAttachmentIds": ["att123"] }
```

**With new attachments added — `multipart/form-data`:**
```
messageId:            665f200000000000000000aa
text:                 Updated text
keepAttachmentIds[]:  att123
keepAttachmentIds[]:  att456
attachments:          <new binary file>
```
`keepAttachmentIds[]` lists the IDs of *existing* attachments to retain; anything not listed is presumably dropped by the backend. New files are appended fresh via `attachments`.

**Response:**
```json
{ "Good": true, "message": { "...": "updated Message object" } }
```
Client then emits socket `messageUpdated` (see §5). Only allows editing your own messages, and (per UI comment) only within some time window — `isWithinOneHour()` exists client-side but it's currently unused/not gating the edit action, so **don't rely on a 1-hour edit window being enforced** unless backend confirms it independently.

#### `POST /chat/delete-message`
```json
{ "messageId": "665f200000000000000000aa", "deleteFor": "everyone" }
```
`deleteFor` is `"me"` (soft local-only removal) or `"everyone"` (broadcasts deletion to all members via socket).

**Response:** `{ "Good": true }`

#### `POST /chat/clear-messages`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }
```
**Response:** `{ "Good": true }`
Sets the requesting user's `my_visible_from` cursor to "now" — does not delete anything for other members. Client emits socket `chatCleared` after success.

#### `GET /chat/pins/:roomId`
```json
{ "Good": true, "pinned": [ /* array of Message objects */ ] }
```

#### `POST /chat/toggle-pin`
```json
{ "messageId": "665f200000000000000000aa" }
```
Toggle — pins if unpinned, unpins if pinned. **Only one message can be pinned per room at a time** (client locally unpins all other messages in the room when a new one is pinned — confirm this "single pin" rule is enforced server-side too, since right now it's only enforced in the client's local state).

**Response:**
```json
{ "Good": true, "is_pinned": true, "message": { "...": "Message object" } }
```

#### `POST /chat/reaction`
Toggle a single emoji reaction from the current user on a message.
```json
{ "messageId": "665f200000000000000000aa", "emoji": "👍" }
```
**Response:**
```json
{ "Good": true, "reactions": [ { "emoji": "👍", "users": [12, 34] } ] }
```
`reactions` in the response is the **full updated reactions array** for the message (not just the delta) — client replaces its local copy wholesale with this.

---

### 4.3 Post Types (per-channel custom labels)

#### `GET /chat/post-types/:roomId`
```json
{ "Good": true, "customPostTypes": [ { "name": "Announcement", "color": "#0DDFAB", "icon": "Megaphone" } ] }
```

#### `POST /chat/post-types`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "name": "Blocker", "color": "#ff4d4f", "icon": "AlertCircle" }
```
**Response:** `{ "Good": true, "customPostTypes": [ /* full updated array for this room */ ] }`

#### `POST /chat/post-types/delete`
Exact payload shape wasn't exercised in any read path of the current UI (no "delete post type" button was found wired up) — **assumed** to be:
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "name": "Blocker" }
```
**Confirm the real payload shape with backend before implementing on mobile** — this one route is genuinely unverified.

---

### 4.4 Permissions & Invites (channel/project rooms)

#### `GET /chat/room-permissions/:roomId`
```json
{
  "Good": true,
  "memberPermissions": [
    { "userId": 12, "permission": "Full edit" },
    { "userId": 34, "permission": "Comment" }
  ]
}
```

#### `POST /chat/update-permission`
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "userId": 34, "permission": "Edit" }
```
**Response:** `{ "Good": true }`
Server is expected to broadcast `roomPermissionUpdated` over the socket (see §5) to all connected members of the room.

#### `POST /chat/invite`
Invite an existing user (or an email address not yet on the platform) to a channel/project room.
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "email": "new.person@company.com", "userId": 34, "permission": "Comment" }
```
`userId` is present when inviting a known platform user, omitted for a bare external email invite.
**Response:** `{ "Good": true }`

#### `POST /chat/generate-link`
Generate a shareable join link for a room.
```json
{ "roomId": "665f1a2b3c4d5e6f7a8b9c01", "permission": "Comment", "allowedUserIds": [34, 56] }
```
`allowedUserIds` is only sent when the link is scoped to specific pre-selected people (`inviteLinkType === "selected"`); omitted entirely for an open "anyone with the link" invite.
**Response:**
```json
{ "Good": true, "inviteLink": "abc123token" }
```
The web client builds the final shareable URL client-side around this token (`buildInviteLink(res.inviteLink)`) — get the exact URL template from backend/web team since it's app-specific routing, not part of this API surface.

#### `GET /chat/accept-invite/:token`
```json
{ "Good": true, "room": { "...": "Room object the user just joined" } }
```

---

### 4.5 Search & Mentions

#### `GET /chat/search-users?query=<text>`
Search platform users by name (used for "start new DM" and "add people to channel"). Passing `query=` (empty string) is valid and expected to return a default/full list (used to pre-populate the "add people" panel before the user types anything).

**Response:**
```json
{
  "Good": true,
  "users": [
    { "id": 34, "full_name": "Bilal Ahmed", "email": "bilal@company.com", "image": null }
  ]
}
```

#### `GET /user/note-mentions?company_id=<id>`
Returns the full mentionable-user list for `@mention` autocomplete while composing (**note**: this is a shared endpoint, not under `/chat/`, also reused by task notes).

**Response:**
```json
{
  "Good": true,
  "data": {
    "user": [ { "id": 34, "full_name": "Bilal Ahmed" } ]
  }
}
```

---

## 5. Socket Event Reference

### 5.1 Client → Server (emit)

| Event | Payload example | Emitted when |
|---|---|---|
| `registerUser` | `"12"` *(raw string, the user id)* | Immediately on connect and every reconnect |
| `getOnlineUsers` | *(no payload)* | Immediately on connect and every reconnect |
| `joinChatRoom` | `"665f1a2b3c4d5e6f7a8b9c01"` *(raw roomId string)* | On app load for every known room; when a new room is created/received; when a room is opened |
| `messagesRead` | `{ "room_id": "665f1a2b3c4d5e6f7a8b9c01", "user_id": "12" }` | When messages are fetched for a room the user just opened, and again whenever a new incoming message arrives while that room stays open |
| `typing` | `{ "room_id": "665f1a2b3c4d5e6f7a8b9c01", "user_id": 12, "user_name": "Ayesha", "isTyping": true }` | On every keystroke in the composer while `isTyping` was previously false; auto-emits `isTyping: false` after 3s of inactivity or immediately on send/blur |
| `messageDelivered` | `{ "messageId": "665f200000000000000000aa", "senderId": 34, "roomId": "665f1a2b3c4d5e6f7a8b9c01" }` | As soon as a message from someone else is received while the app is running (delivery ack — independent of "read") |
| `messagePinned` | `{ "room_id": "...", "messageId": "...", "isPinned": true, "message": { "...": "Message object" } }` | After `POST /chat/toggle-pin` succeeds — client self-broadcasts the result to other members |
| `messageUpdated` | `{ "messageId": "...", "text": "Updated text", "room_id": "..." }` | After `POST /chat/edit-message` succeeds |
| `messageDeleted` | `{ "messageId": "...", "room_id": "..." }` | After `POST /chat/delete-message` succeeds with `deleteFor: "everyone"` |
| `messageReaction` | `{ "room_id": "...", "messageId": "...", "reactions": [ { "emoji": "👍", "users": [12] } ] }` | After `POST /chat/reaction` succeeds |
| `memberJoined` | `{ "room": { "...": "full updated Room object" } }` | After `POST /chat/add-member` succeeds |
| `chatCleared` | `{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }` | After `POST /chat/clear-messages` succeeds |
| `userLeftRoom` | `{ "roomId": "...", "userId": "12" }` | After `POST /chat/leave-room`, or after self-removal via `POST /chat/remove-member` |
| `roomDeleted` | `{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }` | After `POST /chat/delete-room` succeeds |

> **Important architecture note:** these client-emitted events (`messagePinned`, `messageUpdated`, `messageDeleted`, `messageReaction`, `memberJoined`, `chatCleared`, `userLeftRoom`, `roomDeleted`) are the client **broadcasting the result of a REST call it just made**, so every other connected client receives the *same event name* back from the server (presumably the server just re-broadcasts to the room, or has its own equivalent server-side emit triggered by the REST handler — either way, the mobile app must **listen for these same event names** to stay in sync with actions taken on other devices/web). Sending a new chat message itself is **not** done via socket — only `POST /chat/send-message`.

### 5.2 Server → Client (on)

| Event | Payload example | Effect on client |
|---|---|---|
| `newRoom` | full Room object | New room appears in sidebar; client auto-`joinChatRoom`s it |
| `receiveChatMessage` | full Message object (see §3) | Appends message to the open room (if matching), bumps `unreadCount` elsewhere, plays sound, fires OS + in-app notification, auto-emits `messageDelivered` |
| `project_update` | `{ "action": "create" }` | Triggers a delayed (2s) re-fetch of `GET /chat/rooms` — likely fired when a project's default chat channel finishes provisioning server-side |
| `roomDeleted` | `{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }` *(also tolerate `room_id`)* | Removes room from list; closes the chat view if it was open |
| `userLeftRoom` | `{ "roomId": "...", "userId": "34" }` | Removes that member from the room's `members` array |
| `chatRoomSettingUpdated` | `{ "roomId": "...", "type": "mute", "is_muted": true }` or `{ "roomId": "...", "type": "force_unread" }` or `{ "roomId": "...", "type": "clear_unread" }` | Cross-device sync: mute toggle, "mark as unread" flag, or clearing the unread badge |
| `userOnline` | `"34"` **or** `{ "userId": 34 }` **or** an array of either | Add user id(s) to the online set. **Payload shape is inconsistent — handle all of: raw string/number, `{userId}`, `{user_id}`, `{id}`, `{_id}`, and arrays of any of those.** |
| `userOffline` | same variability as `userOnline` | Remove user id(s) from the online set |
| `onlineUsers` **and** `onlineUsersList` | array of ids/objects | Seed initial presence set on connect. **Both event names must be listened for** — the backend event name for this was never pinned down during development, so the web client subscribes to both to be safe. Recommend mobile do the same, or confirm with backend which one is actually still in use. |
| `userTyping` **and** `typing` | `{ "room_id": "...", "user_id": 12, "user_name": "Ayesha", "isTyping": true }` | Same dual-listening situation as presence — **subscribe to both event names.** Adds/removes `user_name` keyed by `user_id` in a per-room typing map; ignore if `user_id` is your own. |
| `messageReaction` | `{ "messageId": "...", "reactions": [ { "emoji": "👍", "users": [12] } ] }` | Replace the message's `reactions` array wholesale |
| `messagePinned` | `{ "messageId": "...", "isPinned": true, "message": { "...": "Message object" } }` | Update pin state on the message; add/remove from the pinned-messages list |
| `messageUpdated` | `{ "messageId": "...", "text": "Updated text" }` | Update message text; set `is_edited: true` |
| `messageDeleted` | `{ "messageId": "..." }` | Remove message from the view and from the pinned list if present |
| `memberJoined` | `{ "room": { "...": "full Room object with updated members[]" } }` | Merge `members` into local room/active-room state |
| `messageDelivered` | `{ "messageId": "..." }` | Set `isDelivered: true` on that message (single tick) |
| `messagesRead` | `{ "room_id": "...", "user_id": 34 }` | Mark the **current user's own sent messages** in that room as read by `user_id` (double/blue tick) — ignore if `user_id` equals your own id |
| `chatCleared` | `{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }` | If this room is currently open, empty the message list |
| `roomPermissionUpdated` | `{ "room_id": "...", "userId": 34, "permission": "Edit", "memberPermissions": [ { "userId": 34, "permission": "Edit" } ] }` | Update the per-member permission map; if `userId` is you, also update your own effective permission |
| `removedFromRoom` | `{ "roomId": "665f1a2b3c4d5e6f7a8b9c01" }` | Remove the room, close it if open, show a "You have been removed from this channel" message |

---

## 6. File Upload Flow

**Confirmed: it is "Option A" from the original spec.** There is no separate `/upload` endpoint and no `fileId` concept. Files travel **inline** with the message request as `multipart/form-data`:

```
POST /chat/send-message
Content-Type: multipart/form-data

room_id: 665f1a2b3c4d5e6f7a8b9c01
text: "See attached"
attachments: <binary>
attachments: <binary>     ← same field name repeated for multiple files
```

Same inline pattern applies to `POST /chat/edit-message` (adding new attachments) and to forwarding a message (the app re-downloads the source attachment as a blob and re-uploads it fresh — there's no "attach by reference/id").

| Question | Answer from current implementation |
|---|---|
| Upload progress | **Not implemented.** Plain `axios.post`, no `onUploadProgress` wired up. Mobile can add its own progress UI (e.g. from the native multipart request), backend won't send progress events. |
| Chunked / resumable uploads | Not supported. |
| Cancellation | Not supported (no abort wired to the request). |
| Max attachment size | **Unknown — not enforced or read client-side.** Get this from backend/multer config directly. |
| Max attachments per message | Not enforced client-side — UI allows attaching an arbitrary number of files. |
| Allowed MIME types / extensions | Not restricted client-side (a file picker restricts by intent, not enforcement). |
| Request timeout | Client sets a 500-second axios timeout for **all** requests (not upload-specific). |
| Client-side compression | Images are compressed (`compressImage()`) before upload to cut payload size — recommend the mobile app do equivalent image compression before upload for parity in perceived performance, though it's not a backend requirement. |

**Reading/downloading attachments:** attachments aren't fetched by hitting `url` directly — the web client fetches through an authenticated wrapper (adds the `authToken` header to a `fetch()` of a "secure" variant of the URL) and only falls back to opening the raw `url` directly if that fails. This strongly suggests attachment URLs may also require the `authToken` header (or a signed/secure variant endpoint) rather than being plain public static files — confirm the exact secure-fetch URL transformation with the backend/web team before assuming plain `GET <url>` works unauthenticated on mobile.

---

## 7. Message Search

**There is no backend message-search endpoint.** The original spec proposed `GET /messages/search/:roomId` — it does not exist. Message search in the web app is a **pure client-side substring filter** over messages already paginated into memory:

```javascript
matches = (message.text || "").toLowerCase().includes(query.toLowerCase())
       || (message.sender_name || "").toLowerCase().includes(query.toLowerCase());
```

This only searches whatever's currently loaded (not full server-side history), and does not search filenames or mention targets. If the mobile app needs real cross-history search, **that is new backend work, not something to reverse-engineer** — flag it to the backend team.

(Separate from this: `GET /chat/search-users` searches *people*, for starting a DM or adding a member — unrelated to message content.)

---

## 8. Push Notifications

**There is no push notification backend (no FCM, no Expo Push, no OneSignal, no `/devices/register` route).** Nothing in `package.json` or the codebase references any push provider. What the web app actually does instead — **none of which transfers to a killed/backgrounded mobile app**:

- Registers a browser Service Worker (`/sw.js`) purely to make the in-browser `Notification` API more reliable (mainly macOS Safari/Chrome).
- Shows a **browser-native `Notification`** only while the app tab is open and the socket delivers `receiveChatMessage` for a room that isn't currently being viewed.
- Requests notification permission lazily on the user's first click/keypress (a gesture is required by browsers).
- Also raises an **in-app** notification (custom DOM event `chatNotification`) consumed by a header notification panel — same "not currently viewing this room" condition.
- Deep-link on click: currently hardcoded to a fixed route (`/{companyIdentifier}/employee-attendance`) then opens the chat modal for the relevant room ~500ms later. Not a generic per-notification deep link scheme.
- `is_muted` on a room suppresses both sound and notification for it. No quiet-hours concept exists anywhere.
- Notification "type" distinction is limited to a boolean `isMention` (checks the message's `mentions` array against the current user) — there's no separate payload/type for reply vs. room-invite vs. pinned-message.

**For mobile, this whole section needs to be built from scratch with backend** (device token registration endpoint, APNs/FCM payload contract, deep-link scheme) — there is nothing to copy from the web implementation beyond "here's what a notification should visually contain" (sender name/avatar, message preview, mention flag, mute-awareness).

---

## 9. Behavioral Notes (ordering, pagination, deletes, receipts, etc.)

| Topic | Behavior |
|---|---|
| **Message ordering** | No server ordering guarantee is relied upon beyond `createdAt` — client sorts/groups by it for date dividers. Locally-sent (optimistic) messages are shown immediately and reconciled against the REST response by a temporary client-side id. |
| **Pagination strategy** | Hybrid: 1-based `page` number **plus** an optional `after` ISO-timestamp cursor (used to exclude history from before a "clear chat"/"hide" action). `hasMore: boolean` in the response tells the client whether to keep paging backward. |
| **Soft vs. permanent delete** | Everything is soft: <br>• `deleteFor: "me"` — removed from that user's view only. <br>• `deleteFor: "everyone"` — removed from all members' views, broadcast via `messageDeleted`. <br>• "Clear chat" / "hide conversation" — advances the user's `my_visible_from` cursor rather than deleting rows (so a room can "reappear" with only new messages if the same person messages again). |
| **Edit history** | Not tracked — only a boolean `is_edited` flag on the message, no revision list exposed. |
| **Read receipts** | `is_read: userId[]` per message, kept current via the `messagesRead` socket event + `POST /chat/mark-read`. Model supports multiple readers (group rooms) even though the current UI only visualizes a single other-participant's read state. |
| **Delivery receipts** | Separate from read: `messageDelivered` sets a single-tick `isDelivered` state independent of the double-tick `is_read` state. |
| **Typing timeout** | 3000ms of inactivity auto-clears typing state client-side (in addition to clearing immediately on send/blur). |
| **Max message length** | Not enforced/validated client-side — get the real limit from backend if one exists. |
| **Rate limiting** | None client-side. Outgoing messages go through a local FIFO queue that sends **one at a time**, waiting for each REST response before sending the next — this guarantees per-device send order, it is not a rate limit. |
| **API versioning** | Path-based: `/api/v1/`. No other versioning scheme observed. |

---

## 10. Open Gaps (cannot be answered from frontend code)

Flag these to the backend team directly — nothing in the client resolves them:

1. Exact error response shape on `Good: false` (no error `message`/`code` field is consistently read anywhere in the client).
2. Max attachment size, max attachment count, allowed MIME types/extensions.
3. Whether `POST /chat/send-message` server-side actually triggers a `receiveChatMessage` socket emit to other members (assumed from client behavior, never seen in backend source).
4. Exact contract for `POST /chat/post-types/delete` — payload shape is guessed, not exercised anywhere in the current UI.
5. Whether `messageEdit` has a real time-window restriction (an `isWithinOneHour()` helper exists client-side but isn't wired to block anything currently).
6. Which of `onlineUsers`/`onlineUsersList` and `typing`/`userTyping` is the "real" event name going forward — the web client listens to both because this was never settled.
7. Full push notification contract (device registration route, payload shape, APNs/FCM specifics, deep-link scheme) — **does not exist yet at all**, needs to be designed with backend for mobile, not extracted from web.
8. Real message-search endpoint (`GET /messages/search/:roomId` or equivalent) — **does not exist yet**, current "search" is a client-only in-memory filter.
9. Whether attachment `url`s need the `authToken` header to fetch (client behaves as if they might, via a "secure fetch" wrapper) or are plain public static files.
10. Whether `/chat/mute-room` is a toggle or needs a paired `/unmute-room` (no unmute call exists in the current client).
