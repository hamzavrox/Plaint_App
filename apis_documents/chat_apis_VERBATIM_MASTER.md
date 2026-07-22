# Chat Module API Documentation

---
## GET `/rooms`

Fetches all rooms (Direct Messages, Channels, and synced Projects) for the current user.

### Success Response:
```json
{
  "Good": true,
  "rooms": [
    {
      "_id": "...",
      "id": 1,
      "type": "direct | project | channel",
      "name": "Room Name",
      "my_visible_from": "2024-01-01T12:00:00Z",
      "is_muted": false,
      "force_unread": false,
      "unreadCount": 5,
      "members": [{ "id": 1, "first_name": "John", "last_name": "Doe", "image": "...", "isOnline": true }]
    }
  ]
}
```

---
## GET `/search-users?query={string}`

Searches users within the company by name or email (min 2 chars) for initiating DMs.

### Success Response:
```json
{
  "Good": true,
  "users": [
    { "id": 2, "first_name": "Jane", "last_name": "Smith", "email": "jane@example.com", "image": "..." }
  ]
}
```

---
## POST `/get-or-create-room`

Gets an existing room or creates a new one (Direct, Project, or Channel).

### Parameters
- type (string): "direct", "project", or "channel"
- targetId (number): Target user ID (for DM) or Project ID (for Project)
- name (string): Name of the channel (if type is channel)
- parent_id (number): Parent room ID (optional, for channel creation)

### Body Parameters:
```json
{
  "Good": true,
  "room": {
    "id": 10,
    "type": "direct",
    "members": [{ "id": 1, ... }, { "id": 2, ... }],
    "my_visible_from": null
  }
}
```

---
## GET `/messages/:roomId`

Fetches chat messages for a specific room with pagination.

### Parameters
- page (number): Page number (default: 1)
- limit (number): Messages per page (default: 50)
- after (date string): Fetch messages after this timestamp

### Query Parameters:
```json
{
  "Good": true,
  "messages": [
    {
      "_id": "...",
      "id": 100,
      "room_id": "...",
      "sender_id": 1,
      "text": "Hello World",
      "sender_name": "John Doe",
      "sender_image": "...",
      "attachments": [],
      "parent_id": null
    }
  ],
  "hasMore": true
}
```

---
## POST `/send-message`

Sends a message to a room. Supports multipart/form-data for attachments.

### Parameters
- room_id (string): Room Object ID
- text (string): Message text
- mentions (array): User IDs mentioned
- parent_id (string): ID of parent message (for replies)
- postType (string): Type of post (if channel)
- is_forwarded (boolean)
- forwarded_from_name (string)
- attachments (files): Up to 20 files

### Body Parameters:
```json
{
  "Good": true,
  "message": {
    "id": 101,
    "text": "Hello",
    "attachments": [{ "name": "file.jpg", "url": "/public/uploads/chat/...", ... }],
    ...
  }
}
```

---
## POST `/reaction`

Toggles an emoji reaction on a message.

### Parameters
- messageId (string): Message Object ID
- emoji (string): Emoji character

### Body Parameters:
```json
{
  "Good": true,
  "reactions": [
    { "emoji": "👍", "users": [1, 2] }
  ]
}
```

---
## GET `/url-preview?url={url}`

Fetches metadata for a given URL for link preview cards.

### Success Response:
```json
{
  "Good": true,
  "data": {
    "title": "Page Title",
    "description": "Page description...",
    "images": ["https://..."]
  }
}
```

---
## POST `/add-member`

Adds a user to an existing Project or Channel room.

### Parameters
- roomId (string)
- userId (number)

### Body Parameters:
```json
{
  "Good": true,
  "message": "Member added successfully",
  "user": { "id": 2, "first_name": "Jane", "last_name": "Smith", ... }
}
```

---
## POST `/remove-member`

Removes a user from a room (Only creator can remove others).

### Parameters
- roomId (string)
- userId (number)

### Body Parameters:
```json
{
  "Good": true,
  "message": "Member removed successfully"
}
```

---
## POST `/leave-room`

Allows the current user to leave a room.

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true,
  "message": "Left room successfully"
}
```

---
## POST `/delete-room`

Soft deletes a room (Only the creator can do this).

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true,
  "message": "Room deleted successfully"
}
```

---
## POST `/clear-messages`

Deletes all messages in a specific room.

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true,
  "message": "Chat cleared successfully"
}
```

---
## POST `/toggle-pin`

Pins or unpins a single message in a room (overwrites previous pin).

### Parameters
- messageId (string)

### Body Parameters:
```json
{
  "Good": true,
  "is_pinned": true,
  "message": { ... }
}
```

---
## GET `/pins/:roomId`

Fetches all pinned messages in a specific room.

### Success Response:
```json
{
  "Good": true,
  "pinned": [ { ...messageObjects } ]
}
```

---
## POST `/edit-message`

Edits the text/attachments of a previously sent message.

### Parameters
- messageId (string)
- text (string)
- keepAttachmentIds (array of strings)
- attachments (new files)

### Body Parameters (multipart/form-data):
```json
{
  "Good": true,
  "message": { ...updatedMessage }
}
```

---
## POST `/delete-message`

Deletes a message for the user or for everyone.

### Parameters
- messageId (string)
- deleteFor (string): "self" or "everyone"

### Body Parameters:
```json
{
  "Good": true,
  "deleteFor": "self | everyone",
  "message": "Message removed for you"
}
```

---
## GET `/post-types/:roomId`

Fetches custom post types available in a channel.

### Success Response:
```json
{
  "Good": true,
  "customPostTypes": [
    { "name": "Announcement", "color": "#ea4335", "icon": "Megaphone" }
  ]
}
```

---
## POST `/post-types`

Adds a new custom post type to a channel.

### Parameters
- roomId (string)
- name (string)
- color (string)
- icon (string)

### Body Parameters:
```json
{
  "Good": true,
  "customPostTypes": [ ... ]
}
```

---
## POST `/post-types/delete`

Deletes a custom post type from a channel.

### Parameters
- roomId (string)
- name (string)

### Body Parameters:
```json
{
  "Good": true,
  "customPostTypes": [ ... ]
}
```

---
## POST `/mark-read`

Marks all messages in a room as read for the current user and clears force_unread.

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true,
  "modifiedCount": 5
}
```

---
## POST `/hide-room`

Hides a room for the current user (sets visible_from to current time).

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true
}
```

---
## POST `/mute-room`

Toggles the mute status of a room for the current user.

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true,
  "data": { "is_muted": true }
}
```

---
## POST `/mark-unread`

Force marks a room as unread for the current user.

### Parameters
- roomId (string)

### Body Parameters:
```json
{
  "Good": true
}
```

---
## POST `/invite`

Generates an invitation token, stores it, and sends an invite email.

### Parameters
- roomId (string)
- email (string)
- userId (number)
- permission (string)

### Body Parameters:
```json
{
  "Good": true,
  "inviteLink": "http://localhost:3000?chat_invite=..."
}
```

---
## POST `/generate-link`

Generates a fast, reusable invite link (without email).

### Parameters
- roomId (string)
- permission (string)
- allowedUserIds (array of numbers)

### Body Parameters:
```json
{
  "Good": true,
  "inviteLink": "http://localhost:3000?chat_invite=..."
}
```

---
## GET `/accept-invite/:token`

Accepts an invitation, adds user to room with specified permission.

### Success Response:
```json
{
  "Good": true,
  "room": { ... },
  "permission": "Full edit"
}
```

---
## POST `/update-permission`

Updates a member's access permission within a channel room.

### Parameters
- roomId (string)
- userId (number)
- permission (string)

### Body Parameters:
```json
{
  "Good": true,
  "memberPermissions": [ { "userId": 2, "permission": "View only" } ]
}
```

---
## GET `/room-permissions/:roomId`

Fetches all member permissions and the creator of a room.

### Success Response:
```json
{
  "Good": true,
  "memberPermissions": [ { "userId": 1, "permission": "Full edit" } ],
  "created_by": 1
}
```
