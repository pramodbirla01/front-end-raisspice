import { NextResponse } from 'next/server';
import { sendOrderCancellationEmail } from '@/utils/emailConfig';

export async function POST(request: Request) {
  try {
    const { email, orderDetails } = await request.json();
    
    if (!email || !orderDetails) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    await sendOrderCancellationEmail(email, orderDetails);

    return NextResponse.json({
      success: true,
      message: 'Cancellation email sent successfully'
    });
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send cancellation email'
    }, { status: 500 });
  }
}
