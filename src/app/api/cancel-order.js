import { Client, Databases } from "node-appwrite";
import { sendEmail, generateOrderCancellationEmail } from '@/utils/emailService';
import Razorpay from 'razorpay';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function processRazorpayRefund(order) {
    try {
        // Only process refund if payment was made online
        if (order.payment_type === 'Razorpay' && order.payment_status === 'paid') {
            const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
                amount: order.total_price * 100, // Convert to paisa
                speed: 'normal',
                notes: {
                    orderId: order.$id,
                    reason: 'Order Cancellation'
                }
            });

            return {
                success: true,
                refundId: refund.id,
                status: refund.status
            };
        }
        return { success: true, message: 'No refund needed for non-online payment' };
    } catch (error) {
        console.error('Refund processing error:', error);
        throw new Error(`Refund failed: ${error.message}`);
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required' });
        }

        // Get order details
        const order = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            orderId
        );

        // Process refund if payment was online
        let refundResult = null;
        if (order.payment_type === 'Razorpay') {
            refundResult = await processRazorpayRefund(order);
        }

        // Update order status with refund information
        const updateData = {
            status: 'cancelled',
            refund_status: refundResult?.status || 'not_applicable',
            refund_id: refundResult?.refundId || '',
            refund_amount: order.payment_type === 'Razorpay' ? order.total_price : 0
        };

        const updatedOrder = await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            orderId,
            updateData
        );

        // Restore stock levels
        const items = JSON.parse(order.order_items);
        for (const item of items) {
            const product = await databases.getDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID,
                item.productId
            );

            await databases.updateDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID,
                item.productId,
                {
                    stock: product.stock + item.quantity
                }
            );
        }

        // Send cancellation email with refund information
        const emailHtml = generateOrderCancellationEmail({
            ...order,
            refund_status: updateData.refund_status,
            refund_id: updateData.refund_id,
            refund_amount: updateData.refund_amount
        });

        await sendEmail(
            order.email,
            `Order Cancelled - #${order.$id}`,
            emailHtml
        );

        return res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            refund: refundResult
        });

    } catch (error) {
        console.error('Order cancellation error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
