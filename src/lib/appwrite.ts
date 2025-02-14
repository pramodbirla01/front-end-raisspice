import { Client as WebClient, Databases as WebDatabases, Storage as WebStorage, ID, Query, Models } from 'appwrite';
import { Client as ServerClient, Databases as ServerDatabases } from 'node-appwrite';

// Define UserDocument type here to keep all Appwrite types in one place
export interface UserDocument extends Models.Document {
  addresses: AddressData[];
}

export interface AddressData {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Define a type that includes all shared methods between web and server databases
export type AppwriteDatabases = {
  updateDocument: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Partial<T>
  ) => Promise<T>;
  // Add other methods as needed
};

let client: WebClient | ServerClient;
let databases: WebDatabases | ServerDatabases;

try {
  if (typeof window === 'undefined') {
    // Server-side initialization
    client = new ServerClient();
    (client as ServerClient)
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');
    databases = new ServerDatabases(client as ServerClient);
  } else {
    // Client-side initialization
    client = new WebClient();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
    databases = new WebDatabases(client);
  }
} catch (error) {
  console.error('Error initializing Appwrite client:', error);
  // Initialize with default values to prevent undefined errors
  client = typeof window === 'undefined' ? new ServerClient() : new WebClient();
  databases = typeof window === 'undefined' 
    ? new ServerDatabases(client as ServerClient)
    : new WebDatabases(client as WebClient);
}

const storage = new WebStorage(client as WebClient);

// Helper function to create a new web client
const createWebClient = (): WebClient => {
  const newClient = new WebClient();
  newClient
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');
  return newClient;
};

// Add this helper function
export const getProduct = async (productId: string) => {
  try {
    console.log('getProduct called with ID:', productId);
    
    if (!productId) {
      throw new Error('Product ID is required');
    }

    if (typeof window === 'undefined') {
      // Server-side
      const serverDb = new ServerDatabases(new ServerClient());
      return await serverDb.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
        productId
      );
    } else {
      // Client-side
      const webDb = new WebDatabases(createWebClient());
      return await webDb.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
        productId
      );
    }
  } catch (error: any) {
    console.error('Error in getProduct:', error);
    // Rethrow with more context
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

// Helper function to get storage file URL
export const getStorageFileUrl = (fileId: string): string => {
    if (!fileId || typeof fileId !== 'string') {
        console.log('Invalid file ID:', fileId); // Debug log
        return '/placeholder-image.jpg';
    }

    try {
        const url = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${
            process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID
        }/files/${fileId}/preview?project=${
            process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
        }`;
        console.log('Generated URL:', url); // Debug log
        return url;
    } catch (error) {
        console.error('Error generating storage URL:', error);
        return '/placeholder-image.jpg';
    }
};

// Add this helper function
export const updateUserAddresses = async (userId: string, addresses: AddressData[]) => {
  try {
    if (typeof window === 'undefined') {
      // Server-side
      const serverDb = new ServerDatabases(client as ServerClient);
      return await serverDb.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        userId,
        { addresses }
      );
    } else {
      // Client-side
      const webDb = new WebDatabases(client as WebClient);
      return await webDb.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        userId,
        { addresses }
      );
    }
  } catch (error: any) {
    console.error('Error updating addresses:', error);
    throw new Error(`Failed to update addresses: ${error.message}`);
  }
};

export { databases, storage, ID, Query, createWebClient };
export type { Models };

import { Client, Databases, Storage, Account } from 'appwrite';

// Initialize the Appwrite client
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

// Initialize Appwrite services
export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export { client };
export { ID } from 'appwrite';

