import axios from 'axios';
import { databases } from '@/appwrite'; // Add Appwrite import

const SHIPROCKET_EMAIL = 'flyyourtechteam1@gmail.com';
const SHIPROCKET_PASSWORD = 'PWISYOYOfyt@2024';

async function getShiprocketToken() {
    try {
        const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD
        });
        return response.data.token;
    } catch (error) {
        console.error('Error fetching Shiprocket token:', error);
        throw new Error('Failed to authenticate with Shiprocket');
    }
}

const getTrackingStatus = async (orderId, token) => {
    try {
        // First try to get tracking details from Shiprocket
        const orderResponse = await axios.get(
            `https://apiv2.shiprocket.in/v1/external/orders/show/${orderId}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        // If order found, try to get detailed tracking
        if (orderResponse.data) {
            try {
                const shipmentId = orderResponse.data.shipments[0]?.id;
                if (shipmentId) {
                    const trackingResponse = await axios.get(
                        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
                        {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }
                    );
                    return {
                        ...orderResponse.data,
                        detailed_tracking: trackingResponse.data
                    };
                }
            } catch (trackingError) {
                console.warn('Could not fetch detailed tracking:', trackingError);
            }
            return orderResponse.data;
        }
        throw new Error('Order not found');
    } catch (error) {
        if (error.response?.status === 404) {
            throw new Error('Order not found in shipping system');
        }
        if (error.response?.status === 401) {
            throw new Error('Authentication failed with shipping provider');
        }
        throw new Error(error.message || 'Failed to fetch tracking details');
    }
};

const getOrderStatus = async (orderId) => {
    try {
        // First try to get order status from your database
        const order = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            orderId
        );

        // If order not found, throw error
        if (!order) {
            throw new Error('Order not found in our system');
        }

        // Return basic tracking info if order hasn't been shipped yet
        if (order.status === 'pending' || order.status === 'processing') {
            return {
                status: order.status,
                order_id: orderId,
                tracking_data: [{
                    activity: `Order ${order.status}`,
                    date: new Date(order.$createdAt).toLocaleString(),
                    location: 'Processing Center'
                }]
            };
        }

        // For shipped orders, get shipping details from Shiprocket
        if (order.shiprocket_order_id) {
            const token = await getShiprocketToken();
            try {
                const shippingDetails = await getTrackingStatus(order.shiprocket_order_id, token);
                return {
                    ...shippingDetails,
                    order_id: orderId
                };
            } catch (error) {
                console.error('Shiprocket tracking error:', error);
                // Fallback to basic order info if shipping details unavailable
                return {
                    status: order.status,
                    order_id: orderId,
                    tracking_data: [{
                        activity: `Order ${order.status}`,
                        date: new Date(order.$updatedAt).toLocaleString(),
                        location: 'Processing Center'
                    }]
                };
            }
        }

        return {
            status: order.status,
            order_id: orderId,
            tracking_data: []
        };
    } catch (error) {
        console.error('Error getting order status:', error);
        throw new Error('Order not found in our system');
    }
};

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId } = req.query;
        if (!orderId) {
            return res.status(400).json({ 
                success: false,
                error: 'Order ID is required to track your shipment' 
            });
        }

        const trackingDetails = await getOrderStatus(orderId);

        return res.status(200).json({
            success: true,
            tracking: trackingDetails
        });
    } catch (error) {
        console.error('Tracking API Error:', error);
        
        const errorMessage = {
            'Order not found in our system': 'We couldn\'t find this order. Please verify the order ID.',
            'Order not found in shipping system': 'This order hasn\'t been shipped yet.',
            'Authentication failed with shipping provider': 'We\'re having trouble connecting to our shipping partner. Please try again later.',
            'Failed to fetch tracking details': 'Unable to retrieve tracking information at this moment. Please try again later.'
        }[error.message] || 'An unexpected error occurred while tracking your order. Please try again later.';

        return res.status(error.response?.status || 500).json({
            success: false,
            error: errorMessage,
            technicalError: error.message
        });
    }
}
