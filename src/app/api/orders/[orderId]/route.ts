import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { getTokenFromRequest, verifyToken } from '@/middleware/auth';

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);
        const orderId = params.orderId;

        if (!process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID) {
            throw new Error('Orders collection ID is not configured');
        }

        console.log('Fetching order:', { orderId, collectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID });
        
        const order = await (databases.getDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID,
            orderId
        );

        // Verify user owns this order
        if (order.user_id !== decoded.userId) {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized to view this order'
            }, { status: 403 });
        }

        return NextResponse.json({
            success: true,
            order
        });

    } catch (error: any) {
        console.error('Error fetching order:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch order'
        }, { status: 500 });
    }
}
