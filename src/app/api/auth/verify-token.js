import jwt from "jsonwebtoken";
import { databases } from "../lib/appwrite";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Fetch user details from Appwrite Database
    const user = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER,
      decoded.userId
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove sensitive info before sending response
    const userData = {
      id: user.$id,
      full_name: user.full_name,
      email: user.email,
      email_verified: user.email_verified,
      last_login: user.last_login,
      created_at: user.created_at,
    };

    res.status(200).json({ user: userData });

  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
