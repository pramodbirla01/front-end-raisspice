import { databases, Query } from "../lib/appwrite";
import { withAuth } from '../middleware/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Get user ID from auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get user's order IDs
    const userOrderIds = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      req.user.userId
    );

    if (!userOrderIds.orders || userOrderIds.orders.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch orders from order collection
    const orders = await Promise.all(
      userOrderIds.orders.map(async (orderId) => {
        try {
          return await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID,
            orderId
          );
        } catch (error) {
          console.error(`Error fetching order ${orderId}:`, error);
          return null;
        }
      })
    );

    // Filter out any failed fetches
    const validOrders = orders.filter(order => order !== null);

    return NextResponse.json({ orders: validOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Failed to fetch orders' }, { status: 500 });
  }
}
