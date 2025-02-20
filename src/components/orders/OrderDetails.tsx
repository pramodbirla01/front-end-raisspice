import { Order } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import CancelOrderButton from './CancelOrderButton';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  original_price: number;
  quantity: number;
  imgSrc: string;
  itemTotal: number;
  weight: number;
  variant_id: string;
}

interface OrderDetailsProps {
  order: Order & { $id: string };
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    // Try to get order items from localStorage using idempotency_key
    if (order.idempotency_key) {
      const storedItems = localStorage.getItem(order.idempotency_key);
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          setOrderItems(Array.isArray(parsedItems) ? parsedItems : []);
        } catch (error) {
          console.error('Error parsing stored order items:', error);
          setOrderItems([]);
        }
      }
    }
  }, [order.idempotency_key]);

  return (
    <div className="bg-white rounded-lg mt-[10%] shadow-lg p-6">
      <div className="border-b pb-4 mb-4">
        <h1 className="text-2xl font-semibold">Order #{order.$id}</h1>
        <p className="text-gray-600">
          Placed on {format(new Date(order.created_at), 'PPP')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Shipping Address</h2>
          <div className="text-gray-600">
            <p>{order.first_name} {order.last_name}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.state} {order.pincode}</p>
            <p>{order.country}</p>
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Order Summary</h2>
          <div className="text-gray-600">
            <div className="flex justify-between mb-1">
              <span>Status</span>
              <span className="font-medium capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Payment Method</span>
              <span className="font-medium">{order.payment_type}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{formatCurrency(order.payment_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-4">Order Items ({orderItems.length})</h2>
        {orderItems.length > 0 ? (
          <div className="space-y-4">
        {orderItems.map((item: OrderItem, index: number) => (
          <div key={item.id || index} className="flex items-center gap-4 border-b pb-4">
            <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={item.imgSrc} 
            alt={item.name} 
            className="w-full h-full object-cover" 
          />
            </div>
            <div className="flex-1">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-600">Weight: {item.weight}g</p>
          <div className="flex items-center gap-2">
            <p className="text-darkRed font-medium">
              {formatCurrency(item.price)}
            </p>
            {item.original_price > item.price && (
              <p className="text-sm text-gray-500 line-through">
            {formatCurrency(item.original_price)}
              </p>
            )}
          </div>
          <p className="text-gray-600">
            Quantity: {item.quantity}
          </p>
            </div>
            <div className="font-medium">
          {formatCurrency(item.itemTotal)}
            </div>
          </div>
        ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">
        <p>Total Order Amount: {formatCurrency(order.payment_amount)}</p>
        <p>Order ID: {order.$id}</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between font-semibold text-lg">
        <span>Total Amount:</span>
        <span className="text-darkRed">{formatCurrency(order.total_price)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
        <span>Coupon Discount:</span>
        <span className="text-darkRed">-{formatCurrency(order.coupon_price)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
        <span>Final Amount:</span>
        <span className="text-darkRed">{formatCurrency(order.payment_amount)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-t mt-6 pt-4">
        <div className="text-gray-600">
          Shipping Status: 
          <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
            order.shipping_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.shipping_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
            order.shipping_status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.shipping_status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.shipping_status}
          </span>
        </div>
        <CancelOrderButton 
          orderId={order.$id}
          shippingStatus={order.shipping_status}
          onCancelSuccess={() => {
            // Reload the order data
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
