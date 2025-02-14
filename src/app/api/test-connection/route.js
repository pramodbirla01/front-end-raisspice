import { testConnection } from '../lib/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const isConnected = await testConnection();
    return NextResponse.json({ 
      success: true, 
      connected: isConnected 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
