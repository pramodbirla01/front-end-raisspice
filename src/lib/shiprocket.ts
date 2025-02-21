import axios from 'axios';

let shiprocketToken: string | null = null;
let tokenExpiry: number | null = null;

export async function getShiprocketToken() {
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

export async function formatOrderForShiprocket(order: any) {
    return {
        order_id: order.$id,
        order_date: new Date(order.$createdAt).toISOString().split('T')[0],
        pickup_location: "Primary",
        billing_customer_name: `${order.first_name} ${order.last_name}`,
        billing_address: order.address,
        billing_city: order.city,
        billing_pincode: order.pincode,
        billing_state: order.state,
        billing_country: "India",
        billing_email: order.email,
        billing_phone: order.phone_number,
        shipping_is_billing: true,
        order_items: JSON.parse(order.order_items),
        payment_method: order.payment_type === "ONLINE" ? "Prepaid" : "COD",
        sub_total: order.payment_amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
    };
}
