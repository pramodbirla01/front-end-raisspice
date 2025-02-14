import { databases, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from "@/lib/appwrite";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.userId) {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log('Fetching user details:', {
      databaseId: APPWRITE_DATABASE_ID,
      collectionId: APPWRITE_USERS_COLLECTION_ID,
      userId: decoded.userId
    });

    // Fetch user details from database
    const user = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
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

    return res.status(200).json({ user: userData });

  } catch (error) {
    console.error('Error in /me endpoint:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(500).json({ 
      message: "Error fetching user details",
      error: error.message 
    });
  }
}
