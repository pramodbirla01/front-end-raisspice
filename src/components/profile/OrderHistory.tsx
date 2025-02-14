import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Order } from '@/types/order';

export default function OrderHistory() {
  const { currentCustomer } = useSelector((state: RootState) => state.customer);

  if (!currentCustomer?.orders || currentCustomer.orders.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No orders till now</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentCustomer.orders.map((order: Order) => (
        <div key={order.$id} className="border p-4 rounded">
          <div className="flex justify-between">
            <span>Order #{order.$id}</span>
            <span>{order.status}</span>
          </div>
          <div>
            <span>Total: ₹{order.total_price}</span>
          </div>
          {/* Add more order details as needed */}
        </div>
      ))}
    </div>
  );
}
