import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';

interface ProductDocument extends Models.Document {
    weights: Array<{
        documentId: string;
        inventory: number;
    }>;
}

export async function POST(request: Request) {
    try {
        const { productId, variantId, quantity } = await request.json();

        // Log the request for debugging
        console.log('Stock check request:', { productId, variantId, quantity });

        // Get the current product
        const product = await (databases.getDocument<ProductDocument>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
            productId
        );

        // Find the variant
        const variant = product.weights.find(w => w.documentId === variantId);
        
        if (!variant) {
            console.error('Variant not found:', variantId);
            return NextResponse.json({
                success: false,
                error: 'Variant not found',
                currentStock: 0
            });
        }

        const hasStock = variant.inventory >= quantity;
        console.log('Stock check result:', {
            variantId,
            inventory: variant.inventory,
            requested: quantity,
            hasStock
        });

        return NextResponse.json({
            success: true,
            insufficientStock: !hasStock,
            currentStock: variant.inventory,
            requested: quantity
        });
    } catch (error) {
        console.error('Stock check error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to check stock',
            currentStock: 0
        });
    }
}
