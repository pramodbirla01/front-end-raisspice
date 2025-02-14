import { databases, ID, Query } from "../lib/appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {  // Changed to use Next.js 13+ API route format
  try {
    const body = await req.json();
    const { full_name, email, password, phone } = body;

    console.log('Registration attempt:', { full_name, email, phone }); // Debug log

    // Input validation
    if (!full_name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check for existing user
    const existingUsers = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("email", email)]
    );

    if (existingUsers.documents.length > 0) {
      return new Response(
        JSON.stringify({ message: "Email already registered" }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    // Create user document
    const userId = ID.unique();
    const userData = {
      full_name,
      email,
      password: hashedPassword,
      phone: phone || null,
      email_verified: false,
      role: false,
      created_at: now,
      updated_at: now,
      last_login: now
    };

    console.log('Creating user with data:', { ...userData, password: '[REDACTED]' }); // Debug log

    const newUser = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      userId,
      userData
    );

    console.log('User created:', newUser.$id); // Debug log

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.$id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role
      },
      process.env.NEXT_PUBLIC_JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    return new Response(
      JSON.stringify({
        message: "Registration successful",
        token,
        user: {
          id: newUser.$id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          email_verified: newUser.email_verified
        }
      }),
      { 
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ 
        message: "Registration failed", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
