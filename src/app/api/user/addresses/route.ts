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

        const user = await (databases.getDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId
        );

        // Get the address array (it's stored in 'address' field, not 'addresses')
        const addressList = user.address || [];
        console.log('Raw addresses from database:', addressList);

        return NextResponse.json({
            success: true,
            addresses: addressList // Return the raw array of address strings
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
        const { addresses } = await request.json();

        // Convert Address objects to strings if they aren't already
        const addressStrings = addresses.map((addr: Address) => 
            typeof addr === 'string' ? addr : JSON.stringify(addr)
        );

        const updatedUser = await (databases.updateDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId,
            {
                address: addressStrings // Use 'address' field name to match schema
            }
        );

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
