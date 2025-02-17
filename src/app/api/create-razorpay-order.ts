import { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';
import { databases } from '@/lib/appwrite';
import { ID } from 'appwrite';

// Define the correct types for Razorpay order
interface RazorpayOrderOptions {
    amount: number;
    currency: string;
    receipt: string;
    notes?: {
        [key: string]: string;
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, currency, items, orderData } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ 
                error: 'Amount and currency are required' 
            });
        }

        // Validate currency
        if (currency !== 'INR' && currency !== 'USD') {
            return res.status(400).json({ 
                error: 'Only INR and USD currencies are supported' 
            });
        }

        // Convert amount to smallest currency unit (paise/cents)
        const multiplier = currency === 'INR' ? 100 : 100;
        const amountInSmallestUnit = Math.round(parseFloat(amount) * multiplier);

        if (isNaN(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
            return res.status(400).json({ 
                error: 'Invalid amount' 
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!
        });

        const orderOptions: RazorpayOrderOptions = {
            amount: amountInSmallestUnit,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                original_currency: currency,
                original_amount: amount.toString(),
                items: JSON.stringify(items.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })))
            }
        };

        console.log('Creating Razorpay order with options:', orderOptions);

        const razorpayOrder = await razorpay.orders.create(orderOptions);

        if (!razorpayOrder || !razorpayOrder.id) {
            throw new Error('Failed to create Razorpay order');
        }

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

        return res.status(200).json({
            success: true,
            id: razorpayOrder.id,
            amount: amountInSmallestUnit,
            currency: currency,
            orderId: order.$id
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create order'
        });
    }
}
