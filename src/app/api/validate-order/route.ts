import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/middleware/auth';
import { validateOrder } from '@/middleware/orderValidation';

export async function POST(request: NextRequest) {
    try {
        const token = getTokenFromRequest(request);
        const decoded = verifyToken(token);
        const orderData = await request.json();

        const validationResult = await validateOrder(orderData, decoded.userId);

        if (!validationResult.isValid) {
            return NextResponse.json({
                success: false,
                error: validationResult.error
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            validatedData: validationResult.validatedData
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || 'Validation failed'
        }, { status: 500 });
    }
}
