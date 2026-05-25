import { Client, Account, Databases, Query, ID } from "appwrite";

const client = new Client()
  .setEndpoint("https://nyc.cloud.appwrite.io/v1")
  .setProject("6a144a9e003449d7ae43");

const account = new Account(client);
const databases = new Databases(client);

// Database configuration
export const DB_ID = "6a144b56001acde432d0";
export const TELEGRAM_CONF_COLLECTION = "telegram_conf";
export const TELEGRAM_FILE_COLLECTION = "storage";
const LEGACY_TELEGRAM_FILE_COLLECTION = "storage";

const listFileMetaFromCollections = async (userId) => {
  const collectionIds = [TELEGRAM_FILE_COLLECTION, LEGACY_TELEGRAM_FILE_COLLECTION];
  const results = [];

  for (const collectionId of collectionIds) {
    try {
      const response = await databases.listDocuments(DB_ID, collectionId, [
        Query.equal('user_id', String(userId)),
        Query.limit(1000)
      ]);
      results.push(...(response.documents || []));
    } catch (err) {
      if (!err.message?.includes('Collection not found')) {
        console.warn(`⚠️ Could not read Telegram file metadata from ${collectionId}:`, err);
      }
    }
  }

  const seen = new Set();
  return results.filter((doc) => {
    if (String(doc.file_id || '').startsWith('local_')) return false;
    const key = `${doc.user_id || userId}:${doc.file_id || doc.$id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const upsertFileMeta = async (collectionId, payload, fileId, userId) => {
  let existing;

  try {
    existing = await databases.listDocuments(DB_ID, collectionId, [
      Query.equal('file_id', fileId),
      Query.equal('user_id', String(userId))
    ]);
  } catch (queryErr) {
    if (queryErr.message?.includes('Attribute not found') || queryErr.message?.includes('Index not found')) {
      console.warn(`⚠️ Missing index/attribute for ${collectionId}. Falling back to file_id only.`);
      try {
        existing = await databases.listDocuments(DB_ID, collectionId, [
          Query.equal('file_id', fileId)
        ]);
      } catch (fallbackErr) {
        if (fallbackErr.message?.includes('Attribute not found') || fallbackErr.message?.includes('Index not found')) {
          const all = await databases.listDocuments(DB_ID, collectionId, [Query.limit(1000)]);
          existing = { documents: all.documents.filter((doc) => doc.file_id === fileId) };
        } else {
          throw fallbackErr;
        }
      }
    } else {
      throw queryErr;
    }
  }

  if (existing?.documents?.length) {
    return await databases.updateDocument(DB_ID, collectionId, existing.documents[0].$id, payload);
  }

  return await databases.createDocument(DB_ID, collectionId, ID.unique(), payload);
};

// Get Telegram configuration from database
export const getTelegramConfig = async (userId) => {
  try {
    const response = await databases.listDocuments(DB_ID, TELEGRAM_CONF_COLLECTION, [
      Query.equal('user_id', userId)
    ]);
    
    if (response.documents && response.documents.length > 0) {
      return response.documents[0]; // Return first config doc
    }
    return null;
  } catch (err) {
    if (err.message?.includes('Attribute not found in schema: user_id')) {
      console.warn('⚠️ Missing "user_id" attribute in telegram_conf collection. Please add it in Appwrite console.');
      // Fallback query for now to prevent breaking while the user fixes the schema
      try {
        const fallback = await databases.listDocuments(DB_ID, TELEGRAM_CONF_COLLECTION, []);
        return fallback.documents?.[0] || null;
      } catch (fallbackErr) {
        console.error('Error fetching Telegram config fallback:', fallbackErr);
        return null;
      }
    }
    console.error('Error fetching Telegram config:', err);
    return null;
  }
};

// Save/Update Telegram configuration to database
export const saveTelegramConfig = async (userId, config) => {
  try {
    // First try to get existing config
    const existing = await getTelegramConfig(userId);
    
    if (existing) {
      // Update existing document
      return await databases.updateDocument(DB_ID, TELEGRAM_CONF_COLLECTION, existing.$id, {
        name: config.name,
        token: config.token,
        chat_id: config.chatId,
        user_id: userId
      });
    } else {
      // Create new document
      return await databases.createDocument(DB_ID, TELEGRAM_CONF_COLLECTION, ID.unique(), {
        name: config.name,
        token: config.token,
        chat_id: config.chatId,
        user_id: userId
      });
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
      size: size || '',
      user_id: String(userId)
    };

    try {
      return await upsertFileMeta(TELEGRAM_FILE_COLLECTION, payload, fileId, userId);
    } catch (primaryErr) {
      console.warn(`⚠️ Primary file collection ${TELEGRAM_FILE_COLLECTION} failed, trying legacy collection:`, primaryErr);
      return await upsertFileMeta(LEGACY_TELEGRAM_FILE_COLLECTION, payload, fileId, userId);
    }
  } catch (err) {
    console.error('Error saving Telegram file metadata:', err);
    return null;
  }
};

export const getTelegramFileMetaList = async (userId) => {
  try {
    return await listFileMetaFromCollections(userId);
  } catch (err) {
    console.error('Error loading Telegram file metadata:', err);
    return [];
  }
};

export { client, account, databases };
