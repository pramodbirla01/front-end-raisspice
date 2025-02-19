import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { ID, Models } from 'appwrite';
import crypto from 'crypto';

interface OrderDocument extends Models.Document {
    address: string;
    status: string;
    user_id: string;
    email: string;
    state: string;
    city: string;
    country: string;
    phone_number: string;
    payment_type: string;
    payment_status: string;
    shipping_status: string;
    first_name: string;
    last_name: string;
    pincode: number;
    total_price: number;        // Original total (before discount)
    payment_amount: number;     // Final amount after discount
    order_items: number;
    coupon_code?: string;
    coupon_discount?: number;    // Discount percentage
    coupon_price?: number;       // Actual discount amount in rupees
    product_id?: string[];
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    shiprocket_order_id?: string;
    shiprocket_shipment_id?: string;
    tracking_id?: string;
    refund_id?: string;
    refund_status?: string;
    refund_due?: string;
    cancellation_fee?: number;
    refund_amount?: number;
    label_url?: string;
    manifest_url?: string;
    idempotency_key: string;
    created_at: string;
}

export async function POST(request: Request) {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            orderData,
            amount,
            user_id 
        } = await request.json();

        // Enhanced validation
        if (!orderData || !user_id) {
            console.error('Missing data:', { orderData, user_id });
            throw new Error('Invalid request data');
        }

        // Ensure user_id is set
        orderData.user_id = user_id;

        // Verify payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            throw new Error('Invalid payment signature');
        }

        console.log('Creating order with verified data:', {
            user_id,
            amount,
            razorpay_order_id
        });

        // Create the order document with proper typing
        const orderDocument: Omit<OrderDocument, keyof Models.Document> = {
            user_id: orderData.user_id,
            address: orderData.address,
            status: 'confirmed',
            email: orderData.email,
            state: orderData.state,
            city: orderData.city,
            country: orderData.country,
            phone_number: orderData.phone_number,
            payment_type: 'ONLINE',
            payment_status: 'completed',
            shipping_status: 'processing',
            first_name: orderData.first_name,
            last_name: orderData.last_name,
            pincode: orderData.pincode,
            total_price: orderData.total_price,
            payment_amount: Number(amount),
            order_items: orderData.order_items,
            product_id: orderData.product_id,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            coupon_code: orderData.coupon_code,
            coupon_discount: orderData.coupon_discount,
            coupon_price: orderData.coupon_price,
            idempotency_key: orderData.idempotency_key || `rzp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString()
        };

        // Create order in Appwrite with explicit typing
        const order = await (databases.createDocument<OrderDocument>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
            ID.unique(),
            orderDocument
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
            error: error.message || 'Payment verification failed'
        }, { status: 500 });
    }
}
