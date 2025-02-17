import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { getTokenFromRequest, verifyToken } from '@/middleware/auth';
import { Address } from '@/types/customer';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);

        console.log('Fetching addresses for user:', decoded.userId);

        // Use type assertion to resolve the union type issue
        const user = await (databases.getDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId
        ) as Models.Document;

        console.log('User document:', user);

        // Get the address array from the user document
        const addresses = user.address || [];
        console.log('Raw addresses:', addresses);

        return NextResponse.json({
            success: true,
            addresses
        });
    } catch (error: any) {
        console.error('Error in GET /api/user/addresses:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to fetch addresses'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);
        const { addresses }: { addresses: Address[] } = await request.json();

        // Ensure addresses are properly stringified
        const stringifiedAddresses = addresses.map((addr: any) => {
            return typeof addr === 'string' ? addr : JSON.stringify(addr);
        });

        // Update the user document with type assertion
        const updatedUser = await (databases.updateDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId,
            {
                address: stringifiedAddresses
            }
        ) as Models.Document;

        return NextResponse.json({
            success: true,
            addresses: updatedUser.address
        });
    } catch (error: any) {
        console.error('Error updating addresses:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to update addresses'
        }, { status: 500 });
    }
}
