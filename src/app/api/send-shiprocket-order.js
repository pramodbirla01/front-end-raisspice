import axios from 'axios';

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

function formatOrderForShiprocket(orderData) {
    try {
        // Validate and format phone number
        let phone = orderData.phone_number;
        if (phone.startsWith('+91')) {
            phone = phone.substring(3);
        }

        // Parse order items safely
        let orderItems = [];
        try {
            orderItems = JSON.parse(orderData.order_items);
        } catch (e) {
            console.error('Error parsing order items:', e);
            throw new Error('Invalid order items format');
        }

        const formattedOrder = {
            order_id: orderData.$id,
            order_date: new Date(orderData.$createdAt).toISOString().split('T')[0],
            billing_customer_name: `${orderData.first_name} ${orderData.last_name || ''}`.trim(),
            billing_last_name: orderData.last_name || '',
            billing_address: orderData.address,
            billing_city: orderData.city,
            billing_pincode: orderData.pincode,
            billing_state: orderData.state,
            billing_country: "India",
            billing_email: orderData.email,
            billing_phone: phone,
            shipping_is_billing: true,
            shipping_customer_name: `${orderData.first_name} ${orderData.last_name || ''}`.trim(),
            shipping_address: orderData.address,
            shipping_city: orderData.city,
            shipping_pincode: orderData.pincode,
            shipping_state: orderData.state,
            shipping_country: "India",
            shipping_email: orderData.email,
            shipping_phone: phone,
            order_items: orderItems.map(item => ({
                name: item.name,
                sku: item.productId || '',
                units: parseInt(item.quantity) || 1,
                selling_price: parseFloat(item.price) || 0,
                discount: 0,
                tax: 0,
                hsn: 0
            })),
            payment_method: orderData.payment_type === "Razorpay" ? "Prepaid" : "COD",
            sub_total: parseFloat(orderData.total_price) || 0,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5,
            pickup_location: "Primary",
            order_type: "Direct"
        };

        return formattedOrder;
    } catch (error) {
        console.error('Error formatting order:', error);
        throw new Error(`Failed to format order: ${error.message}`);
    }
}

async function createShiprocketOrder(orderData, token) {
    try {
        const formattedOrder = formatOrderForShiprocket(orderData);
        console.log('Sending order to Shiprocket:', JSON.stringify(formattedOrder, null, 2));
        
        const response = await axios.post(
            'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
            formattedOrder,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Shiprocket API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create Shiprocket order');
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { order } = req.body;
        if (!order) {
            return res.status(400).json({ error: 'Order data is required' });
        }

        const token = await getShiprocketToken();
        const shiprocketOrder = await createShiprocketOrder(order, token);

        return res.status(200).json({
            success: true,
            shiprocketOrder
        });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}
