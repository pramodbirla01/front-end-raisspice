import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const { amount, currency, orderData } = await request.json();

        // Always use the payment_amount which is the final amount after discount
        const finalAmount = orderData.payment_amount;

        // Validate amount
        if (!finalAmount || finalAmount <= 0) {
            return NextResponse.json({ 
                error: 'Invalid amount' 
            }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!
        });

        // Create Razorpay order with discounted amount
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(finalAmount * 100), // Convert to paise and ensure it's a whole number
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                total_price: orderData.total_price.toString(),
                coupon_code: orderData.coupon_code || 'NONE',
                discount_amount: (orderData.coupon_price || 0).toString(),
                final_amount: finalAmount.toString()
            }
        });

        return NextResponse.json({
            success: true,
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
