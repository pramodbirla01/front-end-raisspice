
import { Client, Databases } from "node-appwrite";
import crypto from 'crypto';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const signature = req.headers['x-razorpay-signature'];
        const webhook_secret = process.env.NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET;
        
        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhook_secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({ error: 'Invalid webhook signature' });
        }

        const { payload } = req.body;
        const { order } = payload.payment.entity;

        // Extract currency information from order notes
        const originalCurrency = order.notes?.original_currency || "INR";
        const conversionRate = parseFloat(order.notes?.conversion_rate || "1");
        const originalAmount = parseFloat(order.notes?.original_amount || "0");

        // Update order in database
        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            order.receipt,
            {
                payment_status: payload.payment.entity.status,
                currency_info: {
                    original_currency: originalCurrency,
                    conversion_rate: conversionRate,
                    original_amount: originalAmount,
                    inr_amount: order.amount / 100, // Convert from paise to INR
                    usd_amount: originalCurrency === "USD" 
                        ? originalAmount 
                        : (order.amount / 100) / conversionRate
                },
                webhook_processed: new Date().toISOString()
            }
        );

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ 
            error: 'Webhook processing failed',
            details: error.message 
        });
    }
}