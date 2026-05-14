import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject("6a01f378001deb4cb842");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
