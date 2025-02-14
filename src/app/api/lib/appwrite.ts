import { Client, Databases, ID, Query } from 'node-appwrite';

let client: Client;
let databases: Databases;

if (typeof window === 'undefined') {
  // Server-side initialization
  client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  
  databases = new Databases(client);
} else {
  // Client-side initialization
  client = new Client();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
  
  databases = new Databases(client);
}

export { databases, ID, Query };
export type { Databases };
