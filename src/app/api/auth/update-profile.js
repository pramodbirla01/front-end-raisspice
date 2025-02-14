import { databases, APPWRITE_DATABASE_ID, APPWRITE_USERS_COLLECTION_ID } from "@/lib/appwrite";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    console.log("Update profile request:", req.body);
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded token:", { userId: decoded.userId });

    // Validate input
    if (!req.body.full_name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Format phone number - remove non-digits and convert to integer
    let phone = null;
    if (req.body.phone) {
      const phoneStr = req.body.phone.replace(/\D/g, '');
      phone = phoneStr ? parseInt(phoneStr, 10) : null;
    }

    // Fetch current user data first
    const currentUser = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      decoded.userId
    );

    console.log("Current user data:", currentUser);

    // Prepare update data
    const updateData = {
      full_name: req.body.full_name,
      phone: phone, // Now it's either null or an integer
      updated_at: new Date().toISOString()
    };

    console.log("Updating with formatted data:", updateData);

    // Update user profile
    const updatedUser = await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_USERS_COLLECTION_ID,
      decoded.userId,
      updateData
    );

    console.log("Update successful:", updatedUser);

    // Format phone back to string for response
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.$id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone ? updatedUser.phone.toString() : '',
        email_verified: updatedUser.email_verified
      }
    });

  } catch (error) {
    console.error("Profile update error details:", {
      error: error.message,
      stack: error.stack,
      code: error.code
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(500).json({ 
      message: "Failed to update profile",
      details: error.message 
    });
  }
}
