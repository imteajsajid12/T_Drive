import { createClient } from '../utils/supabase/client';

export const supabase = createClient();

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
  create: async (id, email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;
    if (!data.user) throw new Error("User creation failed");
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
  deleteSession: async (session) => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  createOAuth2Session: async (provider, success, failure) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: success
      }
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

export const getTelegramConfig = async (userId) => {
  const { data, error } = await supabase
    .from('telegram_conf')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01') {
      console.warn("Table does not exist yet.");
      return null;
    }
    console.error('Error fetching Telegram config:', error);
    return null;
  }
  if (data) {
     return { ...data, $id: data.id };
  }
  return null;
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
    console.error('Error saving Telegram config:', err);
    throw err;
  }
};

export const saveTelegramFileMeta = async ({ messageId, fileId, extension, size, userId }) => {
  try {
    if (!fileId) return null;

    const payload = {
      file_id: fileId,
      Extension: extension || '',
      size: String(size) || '',
      user_id: String(userId)
    };

    const { data: existing, error: findError } = await supabase
      .from('storage')
      .select('*')
      .eq('file_id', fileId)
      .eq('user_id', String(userId))
      .limit(1)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error(findError);
    }

    if (existing) {
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
    console.error('Error saving Telegram file metadata:', err);
    return null;
  }
};

export const getTelegramFileMetaList = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('storage')
      .select('*')
      .eq('user_id', String(userId));
      
    if (error) throw error;
    return (data || []).map(d => ({ ...d, $id: d.id }));
  } catch (err) {
    console.error('Error loading Telegram file metadata:', err);
    return [];
  }
};

/**
 * Delete a file's metadata row from the Supabase `storage` table.
 * Matches on file_id + user_id so we never accidentally delete another user's row.
 * Returns true on success, false on failure (non-throwing so callers can decide how to handle).
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
      console.error('Error deleting Telegram file metadata from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error deleting Telegram file metadata:', err);
    return false;
  }
};
