import { Client, Account, Databases, Query } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a01f378001deb4cb842");

const account = new Account(client);
const databases = new Databases(client);

// Database configuration
export const DB_ID = "6a048d110028f98d0213"; // TablesDB
export const TELEGRAM_CONF_COLLECTION = "telegram_conf";
export const TELEGRAM_FILE_COLLECTION = "storage";

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
      return await databases.createDocument(DB_ID, TELEGRAM_CONF_COLLECTION, 'unique()', {
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

    const docId = messageId ? `tg_${messageId}` : `tg_${userId}_${fileId}`;
    let existing;
    try {
      existing = await databases.listDocuments(DB_ID, TELEGRAM_FILE_COLLECTION, [
        Query.equal('file_id', fileId),
        Query.equal('user_id', String(userId))
      ]);
    } catch (queryErr) {
      if (queryErr.message?.includes('Attribute not found') || queryErr.message?.includes('Index not found')) {
        console.warn('⚠️ Missing "user_id" attribute or index. Doing fallback check using just file_id.');
        try {
          existing = await databases.listDocuments(DB_ID, TELEGRAM_FILE_COLLECTION, [
            Query.equal('file_id', fileId) // fallback
          ]);
        } catch(fallbackQueryErr) {
          if (fallbackQueryErr.message?.includes('Attribute not found') || fallbackQueryErr.message?.includes('Index not found')) {
             const all = await databases.listDocuments(DB_ID, TELEGRAM_FILE_COLLECTION, [Query.limit(1000)]);
             existing = { documents: all.documents.filter(d => d.file_id === fileId) };
          } else {
             throw fallbackQueryErr;
          }
        }
      } else {
        throw queryErr;
      }
    }

    const payload = {
      file_id: fileId,
      Extension: extension || '',
      size: size || '',
      user_id: String(userId)
    };

    if (existing?.documents?.length) {
      return await databases.updateDocument(DB_ID, TELEGRAM_FILE_COLLECTION, existing.documents[0].$id, payload);
    }

    return await databases.createDocument(DB_ID, TELEGRAM_FILE_COLLECTION, 'unique()', payload);
  } catch (err) {
    console.error('Error saving Telegram file metadata:', err);
    return null;
  }
};

export const getTelegramFileMetaList = async (userId) => {
  try {
    const response = await databases.listDocuments(DB_ID, TELEGRAM_FILE_COLLECTION, [
      Query.equal('user_id', String(userId)),
      Query.limit(1000)
    ]);
    return response.documents || [];
  } catch (err) {
    if (err.message?.includes('Attribute not found') || err.message?.includes('Index not found')) {
      console.warn('⚠️ Appwrite Index/Attribute error for user_id. Fetching all documents as fallback.');
      try {
        const fallback = await databases.listDocuments(DB_ID, TELEGRAM_FILE_COLLECTION, [Query.limit(1000)]);
        return fallback.documents.filter(doc => doc.user_id === String(userId)) || [];
      } catch (fallbackErr) {
        console.error('Fallback fetch failed:', fallbackErr);
        return [];
      }
    }
    console.error('Error loading Telegram file metadata:', err);
    return [];
  }
};

export { client, account, databases };
