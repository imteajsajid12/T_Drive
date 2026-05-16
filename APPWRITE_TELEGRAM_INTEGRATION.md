# Appwrite Telegram Configuration Integration

## Overview
This document describes the dynamic integration of Telegram bot configuration with Appwrite database, replacing static localStorage-only storage with a cloud-backed, persistent solution.

---

## Database Schema

### Collection: `telegram_conf`
Located in database `t_drive_db`

| Column | Type | Indexed | Default | Purpose |
|--------|------|---------|---------|---------|
| `$id` | string | ✓ | - | Unique document identifier (auto-generated) |
| `name` | text | ✗ | NULL | Telegram bot name (e.g., @imteaj_t_drive_bot) |
| `token` | text | ✗ | NULL | Telegram HTTP API token |
| `chat_id` | text | ✗ | NULL | User's Telegram chat ID |
| `$createdAt` | datetime | ✗ | - | Document creation timestamp |
| `$updatedAt` | datetime | ✗ | - | Last modification timestamp |

---

## Implementation Details

### 1. Appwrite Helper Functions (`src/lib/appwrite.js`)

#### `getTelegramConfig(userId)`
- **Purpose**: Fetch Telegram configuration from Appwrite database
- **Parameters**: 
  - `userId`: User's Appwrite ID
- **Returns**: Configuration object or null
- **Fallback**: Returns null on error (caught gracefully)

#### `saveTelegramConfig(userId, config)`
- **Purpose**: Save or update Telegram configuration to Appwrite
- **Parameters**:
  - `userId`: User's Appwrite ID
  - `config`: Object with `name`, `token`, `chatId`
- **Behavior**:
  - Creates new document if none exists
  - Updates existing document if found
- **Fallback**: Throws error on failure (caught in UI)

### 2. Settings Page Updates (`src/components/pages/SettingsPage.jsx`)

#### New State Variables
```javascript
const [isSaving, setIsSaving] = useState(false);      // Save operation in progress
const [isLoading, setIsLoading] = useState(true);     // Initial load in progress
const [configSource, setConfigSource] = useState('local'); // Track data origin
```

#### Load Flow (on mount or user change)
1. **Attempt Appwrite load**
   - Fetches from `getTelegramConfig(userId)`
   - If successful → Sets state with Appwrite data, marks as 'appwrite'
   - Updates localStorage as backup

2. **Fallback to localStorage**
   - If Appwrite fails → Loads from localStorage
   - Marks as 'local'
   - Continues with normal operation

3. **Visual feedback**
   - Shows "APPWRITE DATABASE" badge when synced from cloud
   - Shows "LOCAL STORAGE" badge when using local fallback
   - Loading spinner during initial fetch

#### Save Flow
1. **Validation**: Checks all fields are filled
2. **Appwrite save**: Calls `saveTelegramConfig(userId, config)`
3. **localStorage backup**: Always updates localStorage
4. **Error handling**:
   - If Appwrite fails → Falls back to localStorage, shows warning toast
   - If both succeed → Shows success toast with "Appwrite DATABASE" badge
5. **Visual feedback**:
   - Save button shows loading spinner
   - Changes to green checkmark on success
   - Badge updates to reflect current source

### 3. App.jsx Telegram Sync Updates

#### Modified `fullSyncWithTelegram()` Function
- **Before**: Only read from localStorage
- **After**: 
  - Attempts to load token/chatId from Appwrite first
  - Falls back to localStorage if Appwrite unavailable
  - Updates localStorage with latest Appwrite values

```javascript
// Try Appwrite first, fallback to localStorage
let tgToken = localStorage.getItem('tgBotToken');
let tgChatId = localStorage.getItem('tgChatId');

try {
  const appwriteConfig = await getTelegramConfig(userId);
  if (appwriteConfig) {
    tgToken = appwriteConfig.token || tgToken;
    tgChatId = appwriteConfig.chat_id || tgChatId;
    localStorage.setItem('tgBotToken', tgToken);
    localStorage.setItem('tgChatId', tgChatId);
  }
} catch (err) {
  console.warn('Could not load from Appwrite, using localStorage');
}
```

---

## User Experience

### Settings Page - Telegram Section

1. **Initial Load**
   - Shows loading spinner while fetching from Appwrite
   - Displays "APPWRITE DATABASE" badge if data found
   - Falls back to "LOCAL STORAGE" if Appwrite unavailable

2. **Editing**
   - User can modify bot name, token, and chat ID
   - Fields are disabled during loading

3. **Saving**
   - Button shows "Saving to Appwrite..." with spinner
   - On success: Green checkmark "Connected & Saved!"
   - On fallback: Yellow warning "Saved to local storage (Appwrite connection issue)"
   - Auto-resets success indicator after 2 seconds

4. **Data Migration**
   - If local config exists → Button shows warning: "Currently using local storage. Click to migrate to Appwrite database."
   - One-click migration on button click

---

## Data Flow Diagram

```
Settings Page
    ↓
User Enters Config
    ↓
Click "Connect Bot & Save"
    ↓
    ├─→ Save to Appwrite (primary)
    │   ├─→ Success: Update localStorage as backup
    │   │   └─→ Show "Connected & Saved!"
    │   └─→ Failure: Save to localStorage only
    │       └─→ Show "Saved to local storage (Appwrite issue)"
    │
    └─→ Telegram Sync
        ├─→ Load from Appwrite (if available)
        ├─→ Load from localStorage (fallback)
        └─→ Use for file sync operations
```

---

## Error Handling

### Graceful Degradation Strategy
1. **Appwrite unavailable**: Falls back to localStorage transparently
2. **Network errors**: Caught and logged, doesn't crash app
3. **Database errors**: Show user-friendly toast messages
4. **Missing data**: Defaults to empty values, doesn't break UI

### Error Messages
- "Please fill in all Telegram configuration fields." (Validation)
- "Telegram configuration saved to Appwrite!" (Success)
- "Saved to local storage (Appwrite connection issue)" (Fallback)
- "Telegram API error: [description]" (API failure)

---

## Testing Checklist

### ✅ Settings Page - Load Config
- [ ] On first visit: Should load from localStorage if Appwrite not set
- [ ] After saving: Should load from Appwrite on refresh
- [ ] Shows correct badge: "APPWRITE DATABASE" or "LOCAL STORAGE"
- [ ] Loading spinner shows during fetch
- [ ] Fields are disabled while loading

### ✅ Settings Page - Save Config
- [ ] All fields required: Should show validation error if empty
- [ ] Save button shows loading spinner and changes text
- [ ] Success: Shows green checkmark "Connected & Saved!"
- [ ] Failure: Falls back to localStorage, shows yellow warning
- [ ] Badge updates after save
- [ ] Data persists after page refresh

### ✅ Telegram Sync
- [ ] Sync button works with Appwrite-stored config
- [ ] Falls back to localStorage if Appwrite unavailable
- [ ] "Sync New" button fetches incremental updates
- [ ] "Full Sync" button fetches all messages
- [ ] Files appear in dashboard after sync
- [ ] Deleted files remove from both Telegram AND dashboard

### ✅ Cross-Device Sync
- [ ] Save config on Device A
- [ ] Load settings on Device B
- [ ] Should see same config from Appwrite (not localStorage)

---

## Configuration

### Database IDs (in `src/lib/appwrite.js`)
```javascript
export const DB_ID = "t_drive_db";
export const TELEGRAM_CONF_COLLECTION = "telegram_conf";
```

### Appwrite Endpoint (in `src/lib/appwrite.js`)
```javascript
const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a01f378001deb4cb842");
```

---

## Migration Path

### From localStorage to Appwrite
1. User visits Settings
2. Appwrite load fails (first time)
3. Uses localStorage values
4. Shows "LOCAL STORAGE" badge with warning
5. User clicks "Connect Bot & Save"
6. Config saved to Appwrite
7. Badge changes to "APPWRITE DATABASE"
8. Future loads use Appwrite (with localStorage backup)

---

## Security Considerations

⚠️ **Important**: 
- Store Telegram tokens securely in Appwrite database
- Never expose tokens in localStorage in production
- Consider encrypting sensitive fields at rest
- Use Appwrite security rules to restrict access to own user's config

---

## Future Enhancements

1. **Encryption**: Encrypt token field in Appwrite
2. **Audit logs**: Track config changes with timestamps
3. **Multi-bot support**: Allow multiple bot configurations
4. **Permission system**: Restrict config access by user role
5. **Rate limiting**: Add API rate limiting for sync operations
6. **Webhooks**: Use Telegram webhooks instead of polling

---

## Build & Deployment

```bash
# Build
npm run build

# Verify no errors
# ✓ Compiled successfully

# Deploy to Appwrite
npm run deploy  # (if configured)
```

---

## Related Files

- `src/lib/appwrite.js` - Appwrite functions
- `src/components/pages/SettingsPage.jsx` - Settings UI
- `src/App.jsx` - Main sync logic
- `src/components/modals/MediaPreview.jsx` - Delete operations
- `src/components/pages/Dashboard.jsx` - Sync buttons

---

**Last Updated**: May 14, 2026  
**Version**: 1.0.0
