import { NextResponse } from 'next/server';
import { sendOrderCancellationEmail, verifyEmailConfig } from '@/utils/emailConfig';

export async function POST(request: Request) {
    try {
        console.log('Received cancellation email request');
        
        const body = await request.json();
        console.log('Request body:', body);

        const { email, orderDetails } = body;

        if (!email || !orderDetails) {
            console.error('Missing required fields');
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        const isEmailConfigValid = await verifyEmailConfig();
        if (!isEmailConfigValid) {
            throw new Error('Email configuration is invalid');
        }

        await sendOrderCancellationEmail(email, orderDetails);
        console.log('Cancellation email sent successfully to:', email);

        return NextResponse.json({ 
            success: true,
            message: 'Order cancellation email sent successfully'
        });
    } catch (error) {
        console.error('Error in send-cancel-order-email route:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to send cancellation email' 
        }, { status: 500 });
    }
}
