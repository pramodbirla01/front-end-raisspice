import crypto from 'crypto';
import { Client, Databases, ID } from "node-appwrite";
import { generateOrderConfirmationEmail, sendEmail } from '@/utils/emailService';
import { verifyToken } from '@/middleware/auth';

// Initialize Appwrite
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
// pages/api/verify-payment.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
      // Verify the token if present
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const decoded = verifyToken(req, res);
          userId = decoded.userId;
        } catch (error) {
          console.log('Token verification failed:', error);
          // Continue without user ID if token is invalid
        }
      }

      const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderDetails
      } = req.body;

      // Validate required fields
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          success: false,
          error: 'Missing required payment verification parameters'
        });
      }

      if (!orderDetails || !orderDetails.items) {
        return res.status(400).json({
          success: false,
          error: 'Missing order details or items'
        });
      }

      const currency = orderDetails.currency || "INR";
      const conversionRate = currency === "USD" ? 83 : 1;

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(body)
          .digest('hex');

      const isValid = expectedSignature === razorpay_signature;

      if (!isValid) {
          return res.status(400).json({
              success: false,
              error: 'Invalid payment signature'
          });
      }

      // Create initial order with pending status
      const orderDoc = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        user_id: userId || orderDetails.user_id,
        email: orderDetails.email,
        status: 'pending',
        payment_type: 'Razorpay',
        currency: orderDetails.currency,
        total_price: orderDetails.totalAmount, // Use amount directly without conversion
        payment_currency: orderDetails.currency, // Use these fields instead of nested payment_details
        payment_amount: orderDetails.totalAmount,
        address: orderDetails.address.street + 
          (orderDetails.address.street2 ? ', ' + orderDetails.address.street2 : ''),
        payment_status: 'pending',
        shipping_status: 'pending',
        state: orderDetails.address.state,
        city: orderDetails.address.city,
        country: orderDetails.address.country,
        pincode: parseInt(orderDetails.address.postal_code) || 0,
        phone_number: orderDetails.customerDetails.phoneNumber,
        first_name: orderDetails.customerDetails.firstName,
        last_name: orderDetails.customerDetails.lastName,
        order_items: await createOrderDocument(orderDetails), // Use only order_items, remove items
        created_at: new Date().toISOString(),
        idempotency_key: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        coupon_code: orderDetails.couponCode || '',
        shiprocket_order_id: '',
        shiprocket_shipment_id: '',
        tracking_id: '',
        cancellation_fee: 0,
        refund_amount: 0,
        refund_id: '',
        refund_status: '',
        refund_due: '',
        label_url: '',
        manifest_url: ''
      };

      const order = await db.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
          ID.unique(),
          orderDoc
      );

      return res.status(200).json({
          success: true,
          message: 'Order created successfully',
          orderId: order.$id
      });

  } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({
          success: false,
          error: error.message || 'Payment verification failed',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
  }
}

async function createOrderDocument(orderDetails) {
    return JSON.stringify(orderDetails.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price, // Use original price without conversion
        currency: orderDetails.currency,
        quantity: parseInt(item.quantity),
        imgSrc: item.imgSrc || '',
        color: item.color || '',
        size: item.selectedSize || item.size || '', // Make sure size is included
        itemTotal: parseFloat(item.price) * parseInt(item.quantity),
        productDetails: {
            id: item.id,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
            selectedSize: item.selectedSize || item.size // Include size in product details
        }
    })));
}
