import { databases } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { verifyToken } from '@/middleware/auth';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify user authentication
        const decoded = verifyToken(req, res);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { page = 1, limit = 10 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Get orders for the authenticated user
        const response = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            [
                Query.equal('user_id', decoded.userId),
                Query.limit(parseInt(limit)),
                Query.offset(offset),
                Query.orderDesc('created_at')
            ]
        );

        return res.status(200).json({
            success: true,
            orders: response.documents,
            total: response.total,
            page: parseInt(page),
            totalPages: Math.ceil(response.total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        if (error.message === 'Invalid token' || error.message === 'No token provided') {
            return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
}
