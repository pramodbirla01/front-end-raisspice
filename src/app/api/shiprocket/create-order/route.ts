import { NextResponse } from 'next/server';
import axios from 'axios';
import { getShiprocketToken } from '@/lib/shiprocket';

export async function POST(request: Request) {
    try {
        const orderData = await request.json();
        const token = await getShiprocketToken();

        const response = await axios.post(
            `${process.env.SHIPROCKET_API_URL}/orders/create/adhoc`,
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return NextResponse.json({
            success: true,
            order: response.data
        });

    } catch (error: any) {
        console.error('Shiprocket order creation error:', error.response?.data || error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create shipping order'
        }, { status: 500 });
    }
}
