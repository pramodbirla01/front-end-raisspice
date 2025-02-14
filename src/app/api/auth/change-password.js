import { databases, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from "@/lib/appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { currentPassword, newPassword } = req.body;
  const authHeader = req.headers.authorization;

  try {
    // Verify JWT token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
    const user = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      decoded.userId
    );

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update with new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      { password: hashedPassword }
    );

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
}
