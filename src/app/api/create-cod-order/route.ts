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

        // Create order document with only the total amount in order_items
        const createdOrder = await (databases.createDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID,
            'unique()',
            {
                address: order.address,
                status: order.status,
                user_id: decoded.userId,
                email: order.email,
                state: order.state,
                city: order.city,
                country: order.country,
                phone_number: order.phone_number,
                payment_type: order.payment_type,
                first_name: order.first_name,
                last_name: order.last_name,
                idempotency_key: order.idempotency_key,
                created_at: new Date().toISOString(),
                pincode: order.pincode,
                total_price: order.total_price,
                order_items: Number(order.total_price), // Convert to number for double field
                payment_status: order.payment_status,
                shipping_status: order.shipping_status,
                payment_amount: order.payment_amount
            }
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
