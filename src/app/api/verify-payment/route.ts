import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            orderData,
            amount
        } = await request.json();

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return NextResponse.json({
                success: false,
                error: 'Payment verification failed'
            }, { status: 400 });
        }

        // Create order document only after successful verification
        const order = await (databases.createDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
            ID.unique(),
            {
                ...orderData,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                payment_status: 'completed',
                status: 'confirmed',
                shipping_status: 'processing',
                total_price: Number(amount),
                payment_amount: Number(amount),
                created_at: new Date().toISOString(),
            } as any
        );

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order.$id
        });

    } catch (error: any) {
        console.error('Payment verification error:', error);
        return NextResponse.json({
            success: false,
            error: 'Payment verification failed'
        }, { status: 500 });
    }
}
