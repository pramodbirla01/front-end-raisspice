import { databases } from "@/lib/appwrite";
import { ID } from "appwrite";
import { verifyToken } from '@/middleware/auth';
import { validateOrder } from '@/middleware/orderValidation';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify user authentication
        const decoded = verifyToken(req, res);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const orderData = req.body;

        // Validate order data
        const validationResult = await validateOrder(orderData, decoded.userId);
        if (!validationResult.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: validationResult.error 
            });
        }

        // Create order with validated data
        const order = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            ID.unique(),
            validationResult.validatedData
        );

        // Update product stock
        const orderItems = JSON.parse(orderData.order_items);
        await Promise.all(orderItems.map(async (item) => {
            const product = await databases.getDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID,
                item.id
            );

            await databases.updateDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID,
                item.id,
                {
                    stock: product.stock - item.quantity
                }
            );
        }));

        return res.status(200).json({
            success: true,
            orderId: order.$id,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to create order'
        });
    }
}
