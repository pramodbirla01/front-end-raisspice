import { databases } from "@/appwrite";
import { Query } from "node-appwrite";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get auth token from header
  const authToken = req.headers.authorization?.split(' ')[1];
  if (!authToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { page = 1, limit = 10, email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
      [
        Query.equal('email', email),
        Query.limit(parseInt(limit)),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
      ]
    );

    return res.status(200).json({
      orders: response.documents,
      total: response.total,
      page: parseInt(page),
      totalPages: Math.ceil(response.total / parseInt(limit))
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    });
  }
}
