// pages/api/create-cod-order.js
import { Client, Databases, ID, Query } from "node-appwrite";
import { generateOrderConfirmationEmail, sendEmail } from '@/utils/emailService';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { items, customerDetails, shippingAddress, totalAmount, currency } = req.body;

        // Validate items have sizes
        const invalidItems = items.filter(item => !item.selectedSize);
        if (invalidItems.length > 0) {
            return res.status(400).json({
                error: "Missing size selection for some items",
                items: invalidItems.map(item => item.name)
            });
        }

        // Validate required fields
        if (!items || !customerDetails) {
            throw new Error('Missing required order data');
        }

        // Verify items exist in database and check stock
        await verifyProductsAndStock(items);

        // Check for duplicate orders (prevent double submission)
        await checkDuplicateOrder({ items, customerDetails, totalAmount });

        // Create detailed order items array with verification
        const orderItemsArray = await createVerifiedOrderItems(items, currency);

        // Generate unique idempotency key
        const idempotencyKey = generateIdempotencyKey();

        // Create the order document with verified data
        const document = await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            ID.unique(),
            {
                // Basic order info
                status: 'pending',
                payment_status: 'pending', // COD specific
                shipping_status: 'pending',
                payment_type: 'COD',
                currency: currency,
                total_price: totalAmount, // Use amount directly without conversion
                payment_currency: currency, // Use flat structure instead of nested
                payment_amount: totalAmount,
                
                // Customer info
                user_id: customerDetails.userId || '',
                email: sanitizeInput(customerDetails.email),
                first_name: sanitizeInput(customerDetails.firstName),
                last_name: sanitizeInput(customerDetails.lastName),
                phone_number: sanitizeInput(customerDetails.phoneNumber),
                
                // Address info
                address: `${sanitizeInput(shippingAddress.addressLine1)} ${sanitizeInput(shippingAddress.addressLine2) || ''}`.trim(),
                state: sanitizeInput(shippingAddress.state),
                city: sanitizeInput(shippingAddress.city),
                country: sanitizeInput(shippingAddress.country),
                pincode: parseInt(shippingAddress.zipCode) || 0,
                
                // Payment info
                razorpay_order_id: '',
                razorpay_payment_id: '',
                razorpay_signature: '',
                coupon_code: '', // Set default empty string
                
                // Shipping info
                shiprocket_order_id: '',
                shiprocket_shipment_id: '',
                tracking_id: '',
                
                // Refund and cancellation info
                cancellation_fee: 0,
                refund_amount: 0,
                refund_id: '',
                refund_status: '',
                refund_due: '',
                
                // Shipping labels
                label_url: '',
                manifest_url: '',
                
                // Metadata
                idempotency_key: generateIdempotencyKey(),
                created_at: new Date().toISOString(),
                order_items: await createVerifiedOrderItems(items, currency)
            }
        );

        // Send email directly after document creation
        if (document) {
            try {
                const emailHtml = generateOrderConfirmationEmail({
                    ...document,
                    trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/track_order?orderId=${document.$id}`
                });
                await sendEmail(
                    document.email,
                    `Order Confirmation - #${document.$id}`,
                    emailHtml
                );
                console.log('Order confirmation email with tracking sent successfully');
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Continue with order success even if email fails
            }
        }

        // Update product stock after successful order creation
        await updateProductStock(items);

        // Return success response with orderId for redirection
        return res.status(200).json({
            success: true,
            orderId: document.$id,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Order creation error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Helper Functions

async function verifyProductsAndStock(items) {
    try {
        for (const item of items) {
            const product = await databases.getDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID,
                item.id
            );

            if (!product) {
                throw new Error(`Product ${item.id} not found`);
            }

            // Verify stock availability
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            // Verify price matches database price
            const dbPrice = parseFloat(product.price);
            const orderPrice = parseFloat(item.price);
            if (Math.abs(dbPrice - orderPrice) > 0.01) { // Using small epsilon for float comparison
                throw new Error(`Price mismatch for product ${product.name}`);
            }
        }
    } catch (error) {
        throw new Error(`Product verification failed: ${error.message}`);
    }
}

async function checkDuplicateOrder(orderData) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    try {
        const duplicateOrders = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_ID,
            [
                Query.equal('email', orderData.customerDetails.email),
                Query.equal('total_price', parseFloat(orderData.totalAmount)),
                Query.greaterThan('created_at', fiveMinutesAgo)
            ]
        );

        if (duplicateOrders.total > 0) {
            throw new Error('Duplicate order detected. Please wait before trying again.');
        }
    } catch (error) {
        throw new Error(`Duplicate check failed: ${error.message}`);
    }
}

async function createVerifiedOrderItems(items, currency) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    const orderItems = items.map(item => {
        if (!item.id) {
            throw new Error(`Missing product ID for item: ${item.name}`);
        }

        // Ensure we're getting the size from the correct property
        const itemSize = item.selectedSize || item.size || '';
        if (!itemSize) {
            throw new Error(`Missing size for item: ${item.name}`);
        }

        return {
            productId: sanitizeInput(item.id),
            name: sanitizeInput(item.name).slice(0, 50),
            price: item.price, // Use original price without conversion
            currency: currency,
            quantity: parseInt(item.quantity),
            imgSrc: item.imgSrc || item.image || '',
            color: Array.isArray(item.color) ? item.color[0] : (item.color || '').slice(0, 20),
            size: itemSize.slice(0, 10),
            itemTotal: parseFloat(item.price) * parseInt(item.quantity),
            original_currency: currency,
            productDetails: {
                id: item.id,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity)
            }
        };
    });

    return JSON.stringify(orderItems);
}

async function updateProductStock(items) {
    for (const item of items) {
        const product = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID,
            item.id
        );

        await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PRODUCTS_ID,
            item.id,
            {
                stock: product.stock - item.quantity
            }
        );
    }
}

function generateIdempotencyKey() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeInput(input) {
    if (!input) return '';
    // Remove any potential XSS or injection attempts
    return String(input)
        .replace(/[<>]/g, '')
        .trim()
        .slice(0, 256); // Limit string length
}
