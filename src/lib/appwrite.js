import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a01f378001deb4cb842");

const account = new Account(client);
const databases = new Databases(client);

// Database configuration
export const DB_ID = "6a048d110028f98d0213"; // TablesDB
export const TELEGRAM_CONF_COLLECTION = "telegram_conf";

// Get Telegram configuration from database
export const getTelegramConfig = async (userId) => {
  try {
    const response = await databases.listDocuments(DB_ID, TELEGRAM_CONF_COLLECTION, [
      // Query for documents with this user (if you store user_id)
    ]);
    
    if (response.documents && response.documents.length > 0) {
      return response.documents[0]; // Return first config doc
    }
    return null;
  } catch (err) {
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
        chat_id: config.chatId
      });
    } else {
      // Create new document
      return await databases.createDocument(DB_ID, TELEGRAM_CONF_COLLECTION, 'unique()', {
        name: config.name,
        token: config.token,
        chat_id: config.chatId
      });
    }
  } catch (err) {
    console.error('Error saving Telegram config:', err);
    throw err;
  }
};

export { client, account, databases };
