import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { getTokenFromRequest, verifyToken } from '@/middleware/auth';

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);
        const { order } = await request.json();

        if (!process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID) {
            throw new Error('Orders collection ID is not configured');
        }

        console.log('Creating order with data:', order); // Debug log

        // Ensure all numeric fields are integers
        const orderDataWithIntegers = {
            ...order,
            total_price: Math.round(Number(order.total_price)),
            order_items: Math.round(Number(order.total_price)),
            payment_amount: Math.round(Number(order.payment_amount)),
            pincode: parseInt(order.pincode.toString())
        };

        const createdOrder = await (databases.createDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID,
            'unique()',
            orderDataWithIntegers
        );

        console.log('Order created:', createdOrder); // Debug log

        return NextResponse.json({
            success: true,
            orderId: createdOrder.$id
        });
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to create order'
        }, { status: 500 });
    }
}
