// src/pages/api/products.js
import { Client, Databases } from 'appwrite';

const client = new Client();
client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Databases(client);

export default async function handler(req, res) {
  const { search, category, color } = req.query;
  
  try {
    const filters = [];
    if (category) filters.push(`category=${category}`);
    if (color) filters.push(`color=${color}`);
    if (search) filters.push(`product_name=${search}`);

    const productResults = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID,
      {
        filters: filters.join(','),
      }
    );

    res.status(200).json(productResults.documents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
