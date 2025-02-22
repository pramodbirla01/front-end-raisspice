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

// Add these interfaces
export interface AppwriteUser extends Models.Document {
  email: string;
  password: string;
  resetToken: string | null;  // updated to allow null
  resetTokenExpiry: string | null;  // updated to allow null
  $id: string;
}

export interface DatabaseResponse<T> {
  documents: T[];
  total: number;
}

[{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'ATABASE_ID'.",
	"source": "ts",
	"startLineNumber": 46,
	"startColumn": 71,
	"endLineNumber": 46,
	"endColumn": 81
},{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'LECTION_ID'.",
	"source": "ts",
	"startLineNumber": 47,
	"startColumn": 87,
	"endLineNumber": 47,
	"endColumn": 97
},{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "2355",
	"severity": 8,
	"message": "A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.",
	"source": "ts",
	"startLineNumber": 146,
	"startColumn": 29,
	"endLineNumber": 146,
	"endColumn": 38
},{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "Cannot find name 'productId'.",
	"source": "ts",
	"startLineNumber": 161,
	"startColumn": 7,
	"endLineNumber": 161,
	"endColumn": 16
},{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "Declaration or statement expected.",
	"source": "ts",
	"startLineNumber": 165,
	"startColumn": 3,
	"endLineNumber": 165,
	"endColumn": 4
},{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "1005",
	"severity": 8,
	"message": "'try' expected.",
	"source": "ts",
	"startLineNumber": 165,
	"startColumn": 5,
	"endLineNumber": 165,
	"endColumn": 10
},{
	"resource": "/D:/raisspices-website-working/raisspices-website-working/src/lib/appwrite.ts",
	"owner": "typescript",
	"code": "1128",
	"severity": 8,
	"message": "Declaration or statement expected.",
	"source": "ts",
	"startLineNumber": 169,
	"startColumn": 1,
	"endLineNumber": 169,
	"endColumn": 2
}]

// Constants - Use NEXT_PUBLIC_ versions since those are what we have in .env.local
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const APPWRITE_USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!;

// Type for database operations
export type AppwriteDatabase = ServerDatabases | WebDatabases;

// Add these types for Appwrite responses
type AppwriteListResponse<T> = {
  documents: T[];
  total: number;
};

// Update TypedDatabase interface
type TypedDatabase = {
  listDocuments: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    queries?: string[]
  ) => Promise<AppwriteListResponse<T>>;
  
  updateDocument: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Partial<T>
  ) => Promise<T>;

  createDocument: <T extends Models.Document>(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: Partial<T>
  ) => Promise<T>;
};

// Update the getTypedDatabases function with proper type handling
export function getTypedDatabases(): TypedDatabase {
  const db = typeof window === 'undefined'
    ? new ServerDatabases(createServerClient())
    : new WebDatabases(createWebClient());

  const typedDb: TypedDatabase = {
    listDocuments: async <T extends Models.Document>(
      databaseId: string,
      collectionId: string,
      queries?: string[]
    ): Promise<AppwriteListResponse<T>> => {
      const response = await (db as any).listDocuments(
        databaseId,
        collectionId,
        queries
      );
      return {
        documents: response.documents as T[],
        total: response.total
      };
    },

    updateDocument: async <T extends Models.Document>(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Partial<T>
    ): Promise<T> => {
      return await (db as any).updateDocument(
        databaseId,
        collectionId,
        documentId,
        data
      ) as T;
    },

    createDocument: async <T extends Models.Document>(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Partial<T>
    ): Promise<T> => {
      return await (db as any).createDocument(
        databaseId,
        collectionId,
        documentId,
        data
      ) as T;
    }
  };

  return typedDb;
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
      process.env.APPWRITE_DATABASE_ID!,
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
    // Construct URL carefully to avoid duplicate parameters
    const baseUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID
    }/files/${fileId}/view`;

    const params = new URLSearchParams({
      project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
      mode: 'admin'
    });

    return `${baseUrl}?${params.toString()}`;
  } catch (error) {
    console.error('Error generating storage URL:', error);
    return '/placeholder-image.jpg';
  }
};

// Add this new helper function for debug purposes
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error validating image URL:', error);
    return false;
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
      process.env.APPWRITE_DATABASE_ID!,
      process.env.APPWRITE_USERS_COLLECTION_ID!,
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

