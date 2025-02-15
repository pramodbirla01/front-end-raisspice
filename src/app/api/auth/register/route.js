import { NextResponse } from 'next/server';
import { databases, Query } from "../../lib/appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function generateUserId(email) {
  // Create a timestamp-based prefix
  const timestamp = Date.now().toString(36);
  
  // Take first part of email (before @) and clean it
  const emailPrefix = email.split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  
  // Combine parts with a random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return `user_${timestamp}_${emailPrefix}_${randomSuffix}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { full_name, email, password } = body;

    // Input validation
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check for existing user
    const existingUsers = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (existingUsers.documents.length > 0) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate a structured user ID
    const userId = generateUserId(email);
    
    const userData = {
      id: userId,
      full_name,
      email,
      email_verified: false,
      password: await bcrypt.hash(password, 10),
      resetToken: '',
      resetTokenExpiry: null,
      last_login: now.toISOString(),
      created_at: now.toISOString(), // Store as ISO string for consistency
      updated_at: now.toISOString(),
      phone: null,
      role: false,
      address: []
    };

    // Create user document using the same userId
    const newUser = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      userId,
      userData
    );

    // Generate token
    const token = jwt.sign(
      { 
        userId: newUser.$id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '720h' }
    );

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser.$id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        email_verified: false,
        created_at: newUser.created_at || newUser.$createdAt,
        last_login: newUser.last_login
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({
      success: false,
      message: "Registration failed",
      error: error.message
    }, { status: 500 });
  }
}
