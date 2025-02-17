import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

export async function POST(request: Request) {
    try {
        const { amount, currency, items, orderData } = await request.json();

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!
        });

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency: currency,
            receipt: `receipt_${Date.now()}`
        });

        // Create pending order in database
        const order = await (databases.createDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
            ID.unique(),
            {
                ...orderData,
                razorpay_order_id: razorpayOrder.id,
                status: 'pending',
                payment_status: 'pending'
            }
        );

        return NextResponse.json({
            success: true,
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: order.$id
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
