import { 
  Query, 
  APPWRITE_DATABASE_ID, 
  APPWRITE_USERS_COLLECTION_ID, 
  getTypedDatabases,
  AppwriteUser 
} from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import { sendResetEmail } from "@/utils/emailConfig";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const databases = getTypedDatabases();

    // Find user with typed listDocuments
    const userList = await databases.listDocuments<AppwriteUser>(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (userList.documents.length === 0) {
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    const user = userList.documents[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with typed updateDocument
    await databases.updateDocument<AppwriteUser>(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      {
        resetToken: resetToken as string,
        resetTokenExpiry: resetTokenExpiry.toISOString()
      }
    );

    // Send reset email
    try {
      await sendResetEmail(email, resetToken);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      // Continue execution - don't expose email sending failures to client
    }

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Failed to process request" },
      { status: 500 }
    );
  }
}
