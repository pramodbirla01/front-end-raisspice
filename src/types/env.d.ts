declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_APPWRITE_ENDPOINT: string;
    NEXT_PUBLIC_APPWRITE_PROJECT_ID: string;
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: string;
    NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID: string;
    APPWRITE_API_KEY: string;
    JWT_SECRET: string;
    // ...add other environment variables as needed
  }
}
