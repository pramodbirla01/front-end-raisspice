import { databases } from "@/appwrite";
import { Query } from "node-appwrite";
import { verifyToken } from '@/middleware/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token and get user ID
    const decoded = verifyToken(req, res);
    const { page = 1 } = req.query;
    const limit = 10;

    // Use userId from decoded token
    const userId = decoded.userId;

    const offset = (parseInt(page) - 1) * limit;

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
      [
        Query.equal('user_id', userId), // Changed from email to user_id
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
      ]
    );

    return res.status(200).json({
      orders: response.documents,
      total: response.total,
      page: parseInt(page),
      totalPages: Math.ceil(response.total / limit)
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    if (error.message === 'Invalid token' || error.message === 'No token provided') {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}
