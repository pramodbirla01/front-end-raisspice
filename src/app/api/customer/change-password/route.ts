import { NextResponse } from 'next/server';
import { verifyToken } from '@/middleware/auth';
import { databases } from '@/lib/appwrite';
import { compare, hash } from 'bcryptjs';
import { Models } from 'appwrite';
import { TokenPayload } from '@/types/auth';

interface UserDocument extends Models.Document {
    password: string;
    email: string;
    updated_at?: string;
}

export async function POST(req: Request) {
    try {
        const { oldPassword, newPassword } = await req.json();
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token) as TokenPayload;

        if (!decoded || !decoded.userId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        try {
            // Get user from Appwrite with type assertion
            const user = await (databases.getDocument as (
                databaseId: string,
                collectionId: string,
                documentId: string
            ) => Promise<UserDocument>)(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                decoded.userId
            );

            if (!user) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            // Verify old password
            const isValid = await compare(oldPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
            }

            // Hash new password
            const hashedPassword = await hash(newPassword, 12);

            // Update password in Appwrite with type assertion
            await (databases.updateDocument as (
                databaseId: string,
                collectionId: string,
                documentId: string,
                data: Partial<UserDocument>
            ) => Promise<UserDocument>)(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
                decoded.userId,
                {
                    password: hashedPassword,
                    updated_at: new Date().toISOString()
                }
            );

            return NextResponse.json({ 
                message: 'Password updated successfully',
                success: true 
            }, { status: 200 });

        } catch (error) {
            console.error('Appwrite error:', error);
            return NextResponse.json({ 
                message: 'Database error occurred',
                success: false 
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ 
            message: 'Internal server error',
            success: false 
        }, { status: 500 });
    }
}
