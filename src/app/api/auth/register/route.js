const { databases, ID, Query } = require("../../lib/appwrite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // Test connection first
    const testResult = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.limit(1)]
    );
    
    console.log('Connection test successful:', testResult);

    if (!process.env.APPWRITE_API_KEY) {
      console.error('APPWRITE_API_KEY is not configured');
      return NextResponse.json({ 
        message: "Server configuration error" 
      }, { status: 500 });
    }

    const body = await req.json();
    const { full_name, email, password } = body;

    console.log('Registration attempt for:', email);

    // Input validation
    if (!full_name || !email || !password) {
      console.log('Registration failed: Missing required fields');
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for existing user
    const existingUsers = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (existingUsers.documents.length > 0) {
      console.log('Registration failed: Email already exists');
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // Generate document ID
    const documentId = ID.unique();

    // Create user document with matching ID fields
    const userData = {
      id: documentId,           // This matches the document ID
      full_name: full_name,    // For profile display
      email: email,
      password: hashedPassword,
      email_verified: false,
      resetToken: '',
      resetTokenExpiry: null,
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      phone: null,
      role: false
    };

    console.log('Creating user with ID:', documentId);

    const newUser = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      documentId,  // Use same ID for document
      userData
    );

    console.log('User registered successfully:', newUser.$id);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.$id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      message: "Registration successful",
      token,
      user: {
        id: newUser.$id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        email_verified: newUser.email_verified
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      type: error.type
    });
    
    return NextResponse.json({
      message: "Registration failed",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        type: error.type
      } : undefined
    }, { status: 500 });
  }
}
