import { 
  Query, 
  APPWRITE_DATABASE_ID, 
  APPWRITE_USERS_COLLECTION_ID, 
  getTypedDatabases,
  AppwriteUser 
} from "@/lib/appwrite";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    const databases = getTypedDatabases();

    const userList = await databases.listDocuments<AppwriteUser>(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("resetToken", token)]
    );

    if (userList.documents.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const user = userList.documents[0];
    
    const tokenExpiry = new Date(user.resetTokenExpiry || '');
    if (tokenExpiry < new Date()) {
      return NextResponse.json(
        { message: "Reset token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await databases.updateDocument<AppwriteUser>(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        last_login: new Date().toISOString()
      }
    );

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
