import { databases, Query, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from "@/lib/appwrite";
import { sendEmail } from "@/utils/emailService";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;

  try {
    // Find user
    const userList = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (userList.documents.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userList.documents[0];
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      {
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString()
      }
    );

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    console.log("Reset link:", resetLink);
    await sendEmail(
      email,
      "Password Reset Request",
      emailContent
    );

    res.status(200).json({ 
      message: "Password reset instructions sent to your email" 
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ 
      message: "Failed to process password reset request" 
    });
  }
}
