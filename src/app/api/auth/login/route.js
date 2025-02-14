import { databases, Query } from "../../lib/appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, rememberMe } = await req.json();

    console.log('Login attempt for:', email);

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Query user by email
    const userList = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (userList.documents.length === 0) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = userList.documents[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
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

    // Generate JWT token with expiration based on rememberMe
    const expiresIn = rememberMe ? '30d' : '24h';
    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.$id,
        email: user.email,
        full_name: user.full_name,
        email_verified: user.email_verified,
        role: user.role,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ 
      message: "Login failed", 
      error: error.message 
    }, { status: 500 });
  }
}
