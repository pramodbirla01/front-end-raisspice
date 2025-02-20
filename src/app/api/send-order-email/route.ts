import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail, verifyEmailConfig } from '@/utils/emailConfig';

export async function POST(request: Request) {
    try {
        // Log the incoming request
        console.log('Received email request');
        
        const body = await request.json();
        console.log('Request body:', body);

        const { email, orderDetails, products } = body;

        // Validate required fields
        if (!email || !orderDetails) {
            console.error('Missing required fields');
            return NextResponse.json({ 
                success: false, 
                error: 'Missing required fields' 
            }, { status: 400 });
        }

        // Verify email configuration
        const isEmailConfigValid = await verifyEmailConfig();
        if (!isEmailConfigValid) {
            throw new Error('Email configuration is invalid');
        }

        const formattedOrderDetails = {
            orderId: orderDetails.orderId,
            items: products.map((product: any) => ({
                name: product.name,
                quantity: product.quantity,
                price: product.selectedVariant.sale_price
            })),
            totalAmount: orderDetails.amount,
            shippingAddress: orderDetails.address
        };

        // Send email
        const emailResult = await sendOrderConfirmationEmail(email, formattedOrderDetails);
        console.log('Email sent result:', emailResult);

        return NextResponse.json({ 
            success: true,
            message: 'Order confirmation email sent successfully'
        });
    } catch (error) {
        console.error('Error in send-order-email route:', error);
        return NextResponse.json({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to send order confirmation email' 
        }, { status: 500 });
    }
}
