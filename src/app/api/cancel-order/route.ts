import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { verifyToken } from '@/middleware/auth';
import { Order } from '@/types/order';
import { Models, ID } from 'appwrite';
import Razorpay from 'razorpay';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

interface UpdateOrderData {
  status: 'cancelled';
  shipping_status: 'cancelled';
  refund_id?: string;
  refund_status?: string;
  refund_amount?: number;
}

interface RefundDetails {
  refund_id: string;
  refund_status: string;
  refund_amount: number;
  refund_due?: string;
  cancellation_fee: number;
}

interface ProductDocument extends Models.Document {
  quantity: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
  name?: string;
  price?: number;
}

// Helper function to generate unique refund ID
function generateRefundId(): string {
  return `ref_${ID.unique()}`;
}

export async function POST(request: Request) {
  try {
    // Verify auth token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { orderId } = await request.json();

    // Get order details using type assertion and generic parameter
    const order = await (databases.getDocument as <T extends Models.Document>(
      databaseId: string,
      collectionId: string,
      documentId: string
    ) => Promise<T>)(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
      orderId
    ) as Order;

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'Order is already cancelled'
      }, { status: 400 });
    }

    // Verify order belongs to user
    if (order.user_id !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Check if order can be cancelled
    if (order.shipping_status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Order cannot be cancelled - already shipped'
      }, { status: 400 });
    }

    let refundDetails: RefundDetails | null = null;

    // Process refund for online payments
    if (order.payment_type === 'ONLINE' && order.payment_status === 'completed' && order.razorpay_payment_id) {
      try {
        // Check if order was already refunded
        if (order.refund_id) {
          refundDetails = {
            refund_id: generateRefundId(), // Generate new unique ID
            refund_status: 'completed',
            refund_amount: order.refund_amount || order.payment_amount,
            refund_due: new Date().toISOString(),
            cancellation_fee: order.cancellation_fee || 0
          };
        } else {
          const cancellationFee = 0;
          const refundAmount = order.payment_amount - cancellationFee;

          try {
            const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
              amount: Math.round(refundAmount * 100),
              speed: 'normal',
              notes: {
                orderId: order.$id,
                reason: 'Order Cancellation'
              }
            });

            refundDetails = {
              refund_id: refund.id || generateRefundId(), // Use Razorpay ID or generate one
              refund_status: refund.status,
              refund_amount: refundAmount,
              refund_due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              cancellation_fee: cancellationFee
            };
          } catch (error: any) {
            // Handle Razorpay specific errors
            if (error.statusCode === 400 && error.error?.description?.includes('fully refunded')) {
              refundDetails = {
                refund_id: generateRefundId(), // Generate new unique ID
                refund_status: 'completed',
                refund_amount: order.payment_amount,
                refund_due: new Date().toISOString(),
                cancellation_fee: 0
              };
            } else {
              throw error;
            }
          }
        }
      } catch (error: any) {
        console.error('Refund processing error:', error);
        // Continue with cancellation even if refund fails
        refundDetails = {
          refund_id: generateRefundId(), // Generate new unique ID for failed refunds too
          refund_status: 'failed',
          refund_amount: 0,
          refund_due: new Date().toISOString(),
          cancellation_fee: 0
        };
      }
    }

    // Handle order items based on product_id array
    let orderItems: OrderItem[] = [];
    try {
      if (Array.isArray(order.product_id)) {
        // Create order items from product IDs
        orderItems = await Promise.all(order.product_id.map(async (productId) => {
          // Get product details
          const product = await (databases.getDocument as <T extends Models.Document>(
            databaseId: string,
            collectionId: string,
            documentId: string
          ) => Promise<T>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
            productId
          );

          return {
            productId,
            quantity: 1, // Default quantity if not specified
            name: product.name,
            price: product.price
          };
        }));
      } else {
        throw new Error('Product IDs not found in order');
      }
    } catch (error) {
      console.error('Error processing order items:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to process order items'
      }, { status: 400 });
    }

    console.log('Processing items for cancellation:', orderItems);

    // Update stock for each product in the order
    if (Array.isArray(order.product_id)) {
      for (const productId of order.product_id) {
        try {
          // Get current product stock
          const product = await (databases.getDocument as <T extends Models.Document>(
            databaseId: string,
            collectionId: string,
            documentId: string
          ) => Promise<T>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
            productId
          ) as ProductDocument;

          const currentStock = product.stock || 0;
          console.log('Current stock for product:', productId, currentStock);

          // Update product stock
          await (databases.updateDocument as <T extends Models.Document>(
            databaseId: string,
            collectionId: string,
            documentId: string,
            data: Partial<T>
          ) => Promise<T>)(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_PRODUCT_COLLECTION_ID!,
            productId,
            { 
              stock: currentStock + 1 // Return one item to stock
            }
          );

          console.log('Updated stock for product:', productId, 'New stock:', currentStock + 1);
        } catch (error) {
          console.error(`Error updating stock for product ${productId}:`, error);
        }
      }
    }

    // Update only valid order attributes
    const updateData = {
      status: 'cancelled' as const,
      shipping_status: 'cancelled' as const,
      ...(refundDetails ? {
        refund_id: refundDetails.refund_id,
        refund_status: refundDetails.refund_status,
        refund_amount: refundDetails.refund_amount,
        refund_due: refundDetails.refund_due,
        cancellation_fee: refundDetails.cancellation_fee
      } : {})
    };

    await (databases.updateDocument as <T extends Models.Document>(
      databaseId: string,
      collectionId: string,
      documentId: string,
      data: Partial<T>
    ) => Promise<T>)(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
      orderId,
      updateData
    );

    // After updating order status, send cancellation email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-cancel-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: order.email,
          orderDetails: {
            orderId: order.$id,
            refundDetails,
            items: orderItems,
            totalAmount: order.payment_amount
          }
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send cancellation email');
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
    }

    // Return success even if refund failed
    return NextResponse.json({
      success: true,
      message: refundDetails?.refund_status === 'failed' 
        ? 'Order cancelled but refund failed. Our team will process it manually.'
        : 'Order cancelled successfully',
      refundDetails
    });

  } catch (error: any) {
    console.error('Cancel order error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to cancel order'
    }, { status: 500 });
  }
}
