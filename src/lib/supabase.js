import { createClient } from '../utils/supabase/client';

export const supabase = createClient();

// ─── storage table schema (actual columns) ───────────────────────────────────
// id          bigint  PK
// created_at  timestamptz
// file_id     varchar
// user_id     varchar
// Extension   varchar
// size        varchar
// name        varchar   ← the file display name — THIS is what we read/write
// ─────────────────────────────────────────────────────────────────────────────

const normalizeUser = (user) => {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    ...user,
    $id: user.id,
    name: user.name || metadata.name || user.email?.split('@')[0] || 'User',
    user_metadata: metadata,
  };
};

export const client = {
  ping: async () => true
};

export const account = {
  create: async (_id, email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');
    return normalizeUser(data.user);
  },
  createEmailPasswordSession: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  },
  get: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('User not found');
    return normalizeUser(user);
  },
  deleteSession: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  createOAuth2Session: async (provider, success) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: success }
    });
    if (error) throw error;
  },
  updateName: async (name) => {
    const { data, error } = await supabase.auth.updateUser({ data: { name } });
    if (error) throw error;
    return normalizeUser(data.user);
  },
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return normalizeUser(data.user);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// telegram_conf helpers
// ─────────────────────────────────────────────────────────────────────────────

export const getTelegramConfig = async (userId) => {
  const { data, error } = await supabase
    .from('telegram_conf')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') {
      console.warn('[getTelegramConfig] table does not exist yet.');
      return null;
    }
    console.error('[getTelegramConfig] error:', error);
    return null;
  }
  return data ? { ...data, $id: data.id } : null;
};

export const saveTelegramConfig = async (userId, config) => {
  try {
    const existing = await getTelegramConfig(userId);

    const payload = {
      name: config.name,
      token: config.token,
      chat_id: config.chatId,
      user_id: userId
    };

    if (existing) {
      const { data, error } = await supabase
        .from('telegram_conf')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, $id: data.id };
    } else {
      const { data, error } = await supabase
        .from('telegram_conf')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { ...data, $id: data.id };
    }
  } catch (err) {
    console.error('[saveTelegramConfig] error:', err);
    throw err;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// storage table helpers
// The `name` column stores the human-readable filename (e.g. "photo_123.jpg").
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true when a name is a real user-visible filename, not a placeholder. */
const isRealName = (n) =>
  Boolean(n) &&
  n.trim().length > 0 &&
  !n.startsWith('telegram_') &&
  !n.startsWith('file_') &&
  !n.startsWith('tg_file');

/**
 * Save (insert or upsert) Telegram file metadata into the `storage` table.
 * The `name` column is the source of truth for the display filename.
 *
 * Rules:
 *  - Never overwrite a real existing name with a placeholder.
 *  - Always write a real name when we have one.
 */
export const saveTelegramFileMeta = async ({ messageId: _msgId, fileId, extension, size, userId, fileName }) => {
  if (!fileId) return null;

  const uid = String(userId);

  try {
    // Look up the existing row — select only the columns we need
    const { data: existing, error: findErr } = await supabase
      .from('storage')
      .select('id, name')
      .eq('file_id', fileId)
      .eq('user_id', uid)
      .limit(1)
      .maybeSingle();

    if (findErr && findErr.code !== 'PGRST116') {
      console.warn('[saveTelegramFileMeta] lookup warning:', findErr);
    }

    // Decide what to write into the `name` column:
    //   - Use incoming fileName if it's a real name
    //   - Don't downgrade a real existing name to a placeholder
    const incomingIsReal = isRealName(fileName);
    const existingIsReal = isRealName(existing?.name);

    const resolvedName = incomingIsReal
      ? fileName.trim()
      : existingIsReal
        ? existing.name  // keep what's already good
        : (fileName?.trim() || null); // placeholder or null — write as-is

    const payload = {
      file_id: fileId,
      Extension: extension || '',
      size: String(size) || '',
      user_id: uid,
      name: resolvedName,
    };

    if (existing) {
      // Don't overwrite a real name with a placeholder
      if (existingIsReal && !incomingIsReal) {
        delete payload.name;
      }

      const { data, error } = await supabase
        .from('storage')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, $id: data.id };
    } else {
      const { data, error } = await supabase
        .from('storage')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { ...data, $id: data.id };
    }
  } catch (err) {
    console.error('[saveTelegramFileMeta] error:', err);
    return null;
  }
};

/**
 * Targeted patch: update only the `name` column for a single row.
 * Used by the backfill pass in App.jsx to repair rows saved before
 * the name was available.
 */
export const updateFileNameInDb = async (fileId, userId, fileName) => {
  if (!fileId || !userId || !fileName) return false;
  try {
    const { error } = await supabase
      .from('storage')
      .update({ name: fileName })
      .eq('file_id', String(fileId))
      .eq('user_id', String(userId));

    if (error) {
      console.warn('[updateFileNameInDb]', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[updateFileNameInDb] unexpected error:', err);
    return false;
  }
};

/**
 * Load all file metadata rows for a user.
 * Returns the `name` column as doc.name — App.jsx reads doc.name to build the display name.
 */
export const getTelegramFileMetaList = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('storage')
      .select('id, file_id, Extension, size, user_id, name, created_at')
      .eq('user_id', String(userId))
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({ ...d, $id: d.id }));
  } catch (err) {
    console.error('[getTelegramFileMetaList] error:', err);
    return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// login_logs table helpers
//
// Run this SQL once in the Supabase SQL editor to create the table:
//
//   CREATE TABLE IF NOT EXISTS login_logs (
//     id          bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
//     created_at  timestamptz DEFAULT now(),
//     user_id     text NOT NULL,
//     email       text,
//     event       text DEFAULT 'login',   -- 'login' | 'logout'
//     user_agent  text,
//     status      text DEFAULT 'success'  -- 'success' | 'failed'
//   );
// ─────────────────────────────────────────────────────────────────────────────

// Returns the inserted row, or null on no-table, or { rlsError: true } on permission denied.
export const saveLoginLog = async ({ userId, email, event = 'login', status = 'success' }) => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('login_logs')
      .insert({
        user_id: String(userId),
        email: email || null,
        event,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        status,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        console.warn('[saveLoginLog] login_logs table not found.');
        return null;
      }
      // RLS violation — Supabase returns code 42501 or PGRST301
      if (error.code === '42501' || error.code === 'PGRST301' || (error.message || '').includes('row-level security')) {
        console.error('[saveLoginLog] RLS is blocking the insert. Run: ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY; in Supabase SQL editor.');
        return { rlsError: true };
      }
      console.error('[saveLoginLog] error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[saveLoginLog] unexpected error:', err);
    return null;
  }
};

// Returns rows array, null if RLS blocks the query, or [] for empty table.
export const getLoginLogs = async (userId, limit = 50) => {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', String(userId))
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (error.code === '42P01') {
        console.warn('[getLoginLogs] login_logs table not found.');
        return null; // null = table missing
      }
      if (error.code === '42501' || error.code === 'PGRST301' || (error.message || '').includes('row-level security')) {
        console.error('[getLoginLogs] RLS is blocking reads. Run: ALTER TABLE login_logs DISABLE ROW LEVEL SECURITY; in Supabase SQL editor.');
        return null; // null = permission denied
      }
      console.error('[getLoginLogs] error:', error);
      return null;
    }
    return data || [];
  } catch (err) {
    console.error('[getLoginLogs] unexpected error:', err);
    return null;
  }
};

export const deleteLoginLog = async (id) => {
  if (!id) return false;
  try {
    const { error } = await supabase.from('login_logs').delete().eq('id', id);
    if (error) { console.warn('[deleteLoginLog]', error); return false; }
    return true;
  } catch (err) {
    console.warn('[deleteLoginLog] unexpected error:', err);
    return false;
  }
};

export const clearAllLoginLogs = async (userId) => {
  if (!userId) return false;
  try {
    const { error } = await supabase.from('login_logs').delete().eq('user_id', String(userId));
    if (error) { console.warn('[clearAllLoginLogs]', error); return false; }
    return true;
  } catch (err) {
    console.warn('[clearAllLoginLogs] unexpected error:', err);
    return false;
  }
};

/**
 * Delete a file's metadata row from the `storage` table.
 * Matches on file_id + user_id so we never delete another user's row.
 */
export const deleteTelegramFileMeta = async (fileId, userId) => {
  if (!fileId || !userId) return false;
  try {
    const { error } = await supabase
      .from('storage')
      .delete()
      .eq('file_id', String(fileId))
      .eq('user_id', String(userId));

    if (error) {
      console.error('[deleteTelegramFileMeta] error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[deleteTelegramFileMeta] unexpected error:', err);
    return false;
  }
};
