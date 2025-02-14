import Razorpay from "razorpay";
import { Client, Databases } from "node-appwrite";

export const config = {
    api: {
        bodyParser: true,
    },
};

// Initialize Appwrite
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { amount, currency, items } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ 
                error: "Amount and currency are required" 
            });
        }

        // Validate currency
        if (currency !== "INR" && currency !== "USD") {
            return res.status(400).json({ 
                error: "Only INR and USD currencies are supported" 
            });
        }

        // Convert amount to smallest currency unit (paise/cents)
        const multiplier = currency === "INR" ? 100 : 100;
        const amountInSmallestUnit = Math.round(parseFloat(amount) * multiplier);

        if (isNaN(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
            return res.status(400).json({ 
                error: "Invalid amount" 
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const orderOptions = {
            amount: amountInSmallestUnit,
            currency: currency,
            receipt: `receipt_${Date.now()}`,
            notes: {
                original_currency: currency,
                original_amount: amount.toString(),
                items: JSON.stringify(items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })))
            }
        };

        console.log('Creating Razorpay order with options:', orderOptions);

        const order = await razorpay.orders.create(orderOptions);

        if (!order || !order.id) {
            throw new Error('Failed to create Razorpay order');
        }

        return res.status(200).json({
            success: true,
            id: order.id,
            amount: amountInSmallestUnit,
            currency: currency,
            order: order
        });

    } catch (error) {
        console.error("Razorpay Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to create Razorpay order"
        });
    }
}
