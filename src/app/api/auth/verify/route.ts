import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/middleware/auth';
import { databases } from '@/lib/appwrite';

export async function GET(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);

        // Verify user exists in database
        const user = await (databases.getDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
            decoded.userId
        );

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 401 });
        }

        return NextResponse.json({ 
            success: true,
            userId: decoded.userId
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Invalid token'
        }, { status: 401 });
    }
}
