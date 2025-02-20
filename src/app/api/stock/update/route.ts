import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';

interface ProductDocument extends Models.Document {
    weights: Array<{
        documentId: string;
        inventory: number;
        [key: string]: any;
    }>;
}

export async function POST(request: Request) {
    try {
        const { productId, variantId, quantity } = await request.json();

        // Get the current product document
        const product = await (databases.getDocument<ProductDocument>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
            productId
        );

        // Find and update the variant's inventory
        const weights = product.weights.map((weight) => {
            if (weight.documentId === variantId) {
                const newInventory = Math.max(0, weight.inventory - quantity);
                return { ...weight, inventory: newInventory };
            }
            return weight;
        });

        // Update the product document with new inventory
        const updatedProduct = await (databases.updateDocument<ProductDocument>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
            productId,
            { weights }
        );

        return NextResponse.json({
            success: true,
            inventory: weights.find((w) => w.documentId === variantId)?.inventory
        });
    } catch (error) {
        console.error('Stock update error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update stock' }, { status: 500 });
    }
}
