import { databases, Query, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from "@/lib/appwrite";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token, newPassword } = req.body;

  try {
    // Find user with reset token
    const userList = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("resetToken", token)]
    );

    if (userList.documents.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const user = userList.documents[0];

    // Verify token hasn't expired
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    await databases.updateDocument(
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

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
}
