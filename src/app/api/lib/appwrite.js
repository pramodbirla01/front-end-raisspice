import { Client, Databases, ID, Query } from "node-appwrite";

let client;
let databases;

if (typeof window === 'undefined') {
  // Server-side initialization
  client = new Client();
  
  // Make sure to set all required parameters
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  
  databases = new Databases(client);
} else {
  // Client-side initialization
  client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
  
  databases = new Databases(client);
}

export { client, databases, ID, Query };
