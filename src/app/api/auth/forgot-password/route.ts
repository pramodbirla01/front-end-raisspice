import { databases, Query } from '../../lib/appwrite'
import  { sendResetEmail} from '../../.././../utils/emailConfig'
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Check if email exists in Users collection
    const userList = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal("email", email)]
    );

    if (userList.documents.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link."
      });
    }

    const user = userList.documents[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

    // Update user with reset token
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      user.$id,
      {
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString()
      }
    );

    // Send reset email
    await sendResetEmail(email, resetToken);

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link."
    });

  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
