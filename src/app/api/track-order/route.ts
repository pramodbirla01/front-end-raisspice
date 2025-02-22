import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';
import axios from 'axios';

// Define the order document interface
interface OrderDocument extends Models.Document {
    status: string;
    payment_status: string;
    shipping_status: string;
    tracking_id: string;
    shiprocket_order_id?: string; // Add this field
    $createdAt: string;
    $id: string;
}

// Cache token for 1 hour
let shiprocketToken: string | null = null;
let tokenExpiry: number | null = null;

async function getShiprocketToken() {
    // Check if token exists and is not expired
    if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
        return shiprocketToken;
    }

    try {
        const response = await axios.post(
            `${process.env.SHIPROCKET_API_URL}/auth/login`,
            {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            }
        );

        shiprocketToken = response.data.token;
        tokenExpiry = Date.now() + (3600 * 1000); // 1 hour expiry
        return shiprocketToken;
    } catch (error) {
        console.error('Shiprocket authentication failed:', error);
        throw new Error('Failed to authenticate with shipping provider');
    }
}

async function getOrderTracking(orderId: string, token: string) {
    try {
        const response = await axios.get(
            `${process.env.SHIPROCKET_API_URL}/courier/track/order/${orderId}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching order tracking:', error);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({
                success: false,
                error: 'Order ID is required'
            });
        }

        // Fix TypeScript error by using type assertion
        const order = await (databases.getDocument as any)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
            orderId
        ) as OrderDocument;

        // Initialize tracking events array
        let tracking_data = [
            {
                activity: 'Order Placed',
                date: order.$createdAt,
                location: 'Online Store',
                status: 'completed'
            }
        ];

        // Add order confirmation if payment is completed
        if (order.payment_status === 'completed') {
            tracking_data.push({
                activity: 'Payment Confirmed',
                date: order.$createdAt,
                location: 'Payment Gateway',
                status: 'completed'
            });
        }

        // If order has Shiprocket ID, get tracking from Shiprocket
        if (order.shiprocket_order_id) {
            try {
                const response = await fetch('/api/shiprocket', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const shipmentTracking = await response.json();
                
                if (shipmentTracking?.tracking_data?.shipment_track) {
                    const shiprocketEvents = shipmentTracking.tracking_data.shipment_track.map((track: any) => ({
                        activity: track.activity,
                        date: track.date,
                        location: track.location || 'In Transit',
                        status: track.status === 'delivered' ? 'completed' : 'current'
                    }));
                    tracking_data = [...tracking_data, ...shiprocketEvents];
                }
            } catch (error) {
                console.error('Error fetching Shiprocket tracking:', error);
            }
        }

        return NextResponse.json({
            success: true,
            tracking: {
                orderId: order.$id,
                status: order.status,
                shipping_status: order.shipping_status,
                tracking_id: order.tracking_id,
                tracking_data: tracking_data
            }
        });

    } catch (error) {
        console.error('Track order error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch order tracking details'
        }, { status: 500 });
    }
}
