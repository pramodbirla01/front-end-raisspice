import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';
import { getTokenFromRequest, verifyToken } from '@/middleware/auth';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);

        // Use type assertion to resolve the union type issue
        const user = await (databases.getDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId
        ) as Models.Document;

        return NextResponse.json({
            success: true,
            addresses: user.address || []
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);
        const { addresses } = await request.json();

        // Update the user document with type assertion
        const updatedUser = await (databases.updateDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId,
            {
                address: addresses
            }
        ) as Models.Document;

        return NextResponse.json({
            success: true,
            addresses: updatedUser.address
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
