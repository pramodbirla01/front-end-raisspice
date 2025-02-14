import { databases, Query, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from "@/lib/appwrite";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token } = req.body;

  try {
    // Find user with reset token
    const userList = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("resetToken", token)]
    );

    if (userList.documents.length === 0) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = userList.documents[0];

    // Check if token has expired
    if (new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ message: "Error verifying reset token" });
  }
}
