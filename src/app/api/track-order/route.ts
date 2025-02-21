import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Models } from 'appwrite';
import axios from 'axios';

// Define the order document interface
interface OrderDocument extends Models.Document {
    status: string;
    payment_status: string;
    shiprocket_shipment_id?: string;
    shipping_status?: string;
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

async function getShipmentTracking(shipmentId: string, token: string) {
    try {
        const response = await axios.get(
            `${process.env.SHIPROCKET_API_URL}/courier/track/shipment/${shipmentId}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching shipment tracking:', error);
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

        // Get order from Appwrite with explicit typing and parentheses
        const order = await (databases.getDocument<OrderDocument>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
            orderId
        );

        // Initialize tracking events array
        const tracking_data = [
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

        // If order has shipment details, get tracking from Shiprocket
        if (order.shiprocket_shipment_id) {
            try {
                const token = await getShiprocketToken();
                if (token) { // Add null check for token
                    const shipmentTracking = await getShipmentTracking(
                        order.shiprocket_shipment_id,
                        token
                    );

                    if (shipmentTracking?.tracking_data?.length > 0) {
                        // Map Shiprocket tracking data to our format
                        const shiprocketEvents = shipmentTracking.tracking_data.map(
                            (event: any) => ({
                                activity: event.activity,
                                date: event.date,
                                location: event.location,
                                status: 'completed'
                            })
                        );
                        tracking_data.push(...shiprocketEvents);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch shipping details:', error);
            }
        }

        // Add processing status
        if (order.status === 'processing') {
            tracking_data.push({
                activity: 'Order Processing',
                date: new Date().toISOString(),
                location: 'Warehouse',
                status: 'current'
            });
        }

        return NextResponse.json({
            success: true,
            tracking: {
                orderId: order.$id,
                status: order.status,
                shipping_status: order.shipping_status,
                tracking_data: tracking_data.sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
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
