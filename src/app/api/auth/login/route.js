import { NextResponse } from 'next/server';
import { databases, Query } from "../../lib/appwrite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

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
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    try {
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        user.$id,
        { last_login: new Date().toISOString() }
      );
    } catch (updateError) {
      console.error("Error updating last login:", updateError);
      // Continue with login even if update fails
    }

    const token = jwt.sign(
      {
        userId: user.$id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '720h' }
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.$id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        email_verified: user.email_verified,
        created_at: user.created_at || user.$createdAt, // Add this line to include creation date
        last_login: user.last_login
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      message: "Login failed",
      error: error.message
    }, { status: 500 });
  }
}
