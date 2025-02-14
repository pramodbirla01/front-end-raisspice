import { databases } from "../lib/appwrite";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET);
    
    if (decoded.userId) {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        decoded.userId,
        { 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      );
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: "Error during logout",
      error: error.message 
    });
  }
}
