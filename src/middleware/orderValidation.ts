import { databases, Models } from "@/lib/appwrite";
import { Order } from "@/types/order"; // Add this import

interface ValidateOrderResult {
  isValid: boolean;
  error?: string;
  validatedData?: Partial<Order>;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  name: string;
}

export async function validateOrder(orderData: Partial<Order>, userId: string): Promise<ValidateOrderResult> {
  try {
    // Verify user exists using type assertion to fix callable error
    const user = await (databases.getDocument as any)(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      userId
    ) as Models.Document;

    if (!user) {
      return { isValid: false, error: 'User not found' };
    }

    // Validate required fields
    const requiredFields = [
      'address', 'phone_number', 'email', 'first_name',
      'last_name', 'city', 'state', 'pincode', 'total_price'
    ];

    for (const field of requiredFields) {
      if (!orderData[field as keyof Order]) {
        return { isValid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate amount is positive
    if (orderData.total_price && orderData.total_price <= 0) {
      return { isValid: false, error: 'Invalid order amount' };
    }

    const validatedData: Partial<Order> = {
      ...orderData,
      status: 'pending',
      user_id: userId,
      created_at: new Date().toISOString(),
      shipping_status: 'pending',
      payment_status: 'pending'
    };

    return {
      isValid: true,
      validatedData
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Order validation failed';
    return {
      isValid: false,
      error: errorMessage
    };
  }
}
