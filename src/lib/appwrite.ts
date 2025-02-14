import { Client as WebClient, Databases as WebDatabases, Storage as WebStorage, Account as WebAccount, ID, Query, Models } from 'appwrite';
import { Client as ServerClient, Databases as ServerDatabases } from 'node-appwrite';

// Type Definitions
export interface UserDocument extends Models.Document {
  id: string;
  full_name: string;
  email: string;
  email_verified: boolean;
  resetToken?: string;
  resetTokenExpiry?: string;
  last_login?: string;
  created_at: string;
  password: string;
  phone?: number;
  updated_at?: string;
  role: boolean;
  addresses: AddressData[];
  orders: string[];
}

export interface AddressData {
  houseNo: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

// Appwrite Client Configuration
const createServerClient = (): ServerClient => {
  const client = new ServerClient();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  return client;
};

const createWebClient = (): WebClient => {
  const client = new WebClient();
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
  return client;
};

// Initialize clients based on environment
const client = typeof window === 'undefined' ? createServerClient() : createWebClient();
export const databases = typeof window === 'undefined' 
  ? new ServerDatabases(client as ServerClient)
  : new WebDatabases(client as WebClient);
export const storage = new WebStorage(client as WebClient);
export const account = new WebAccount(client as WebClient);

// Helper Functions
export const getProduct = async (productId: string) => {
  try {
    if (!productId || typeof productId !== 'string') {
      throw new Error('Valid product ID string is required');
    }

    const db = typeof window === 'undefined'
      ? new ServerDatabases(createServerClient())
      : new WebDatabases(createWebClient());

    // Type assertion to handle union type issue
    const document = await (db.getDocument as (
      databaseId: string,
      collectionId: string,
      documentId: string
    ) => Promise<Models.Document>)(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
      productId
    );

    return document;
  } catch (error: any) {
    console.error('Error in getProduct:', error);
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
};

export const getStorageFileUrl = (fileId: string): string => {
  if (!fileId || typeof fileId !== 'string') {
    return '/placeholder-image.jpg';
  }

  try {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID
    }/files/${fileId}/preview?project=${
      process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    }`;
  } catch (error) {
    console.error('Error generating storage URL:', error);
    return '/placeholder-image.jpg';
  }
};

export const updateUserAddresses = async (userId: string, addresses: AddressData[]) => {
  try {
    const db = typeof window === 'undefined'
      ? new ServerDatabases(createServerClient())
      : new WebDatabases(createWebClient());

    // Type assertion to handle union type issue
    const document = await (db.updateDocument as (
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: object
    ) => Promise<Models.Document>)(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      userId,
      { addresses }
    );

    return document;
  } catch (error: any) {
    console.error('Error updating addresses:', error);
    throw new Error(`Failed to update addresses: ${error.message}`);
  }
};

export { ID, Query };
export type { Models };

