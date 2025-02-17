import { NextApiRequest, NextApiResponse } from 'next';
import { databases, Models } from '@/lib/appwrite';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Verify the payment signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                error: 'Payment verification failed'
            });
        }

        // Update order status in database
        await (databases.updateDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
            orderId,
            {
                payment_status: 'completed',
                status: 'confirmed',
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        return res.status(500).json({
            success: false,
            error: 'Payment verification failed'
        });
    }
}
