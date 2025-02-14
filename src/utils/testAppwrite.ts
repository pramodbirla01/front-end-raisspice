import { Client, Databases } from 'appwrite';

export const testAppwriteConnection = async () => {
    try {
        const client = new Client()
            .setEndpoint('http://147.93.108.70:8080/v1')
            .setProject('67a0a23c00047d88f6fc');

        const databases = new Databases(client);

        const response = await databases.listDocuments(
            '67a1d4fb00157454a004',
            '67a1d512000f62d753b1',
            []
        );

        console.log('Test connection successful:', response);
        return true;
    } catch (error) {
        console.error('Test connection failed:', error);
        return false;
    }
};
