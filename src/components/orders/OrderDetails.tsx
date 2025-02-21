import { Order } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { format } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store'; // Fix: correct import path
import toast from 'react-hot-toast'; // Fix: use react-hot-toast instead of react-toastify
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector((state: RootState) => state.customer);

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

  const handleCancelOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId: order.$id })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        if (data.refundDetails?.refund_status === 'failed') {
          toast.error('Refund failed - our team will process it manually');
        } else if (data.refundDetails?.refund_id) {
          toast.success(`Refund initiated: ${data.refundDetails.refund_id}`);
        }
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order. Please try again.');
    } finally {
      setIsLoading(false);
      dialogRef.current?.close();
    }
  };

  return (
    <>
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
              order.shipping_status === 'cancelled' ? 'bg-black text-white' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.shipping_status}
            </span>
          </div>
          {order.shipping_status !== 'pending' ? (
            <button disabled className="px-4 py-2 text-white bg-black rounded">
              {order.shipping_status === 'cancelled' ? 'Order Cancelled' : `Order ${order.shipping_status}`}
            </button>
          ) : (
            <button
              onClick={() => dialogRef.current?.showModal()}
              disabled={isLoading}
              className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="backdrop:bg-black/50 w-full max-w-md p-0 rounded-lg shadow-xl"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Are you sure you want to cancel this order?
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            This action cannot be undone. If you paid online, a refund will be initiated.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => dialogRef.current?.close()}
              className="px-6 py-2 text-gray-600 border rounded hover:bg-gray-50"
            >
              No, Keep Order
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={isLoading}
              className={`px-6 py-2 text-white bg-red-600 rounded hover:bg-red-700
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Yes, Cancel Order'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
