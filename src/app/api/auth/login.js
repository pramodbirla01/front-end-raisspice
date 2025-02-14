import { databases, Query } from "../lib/appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email }); // Debug log

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Query user by email
    const userList = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (userList.documents.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userList.documents[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login timestamp
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      user.$id,
      { 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      process.env.NEXT_PUBLIC_JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (excluding sensitive information)
    const userData = {
      id: user.$id,
      email: user.email,
      full_name: user.full_name,
      email_verified: user.email_verified,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at
    };

    console.log('Login successful:', userData.id); // Debug log

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      message: "Login failed", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
