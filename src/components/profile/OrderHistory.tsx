import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchUserOrders } from '@/store/slices/orderSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import Link from 'next/link';
import Pagination from '../ui/Pagination';

export default function OrderHistory() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentCustomer } = useSelector((state: RootState) => state.customer);
  const { orders, loading, error, currentPage, totalPages } = useSelector((state: RootState) => state.orders);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      if (currentCustomer?.id) {
        setIsLoadingPage(true);
        try {
          await dispatch(fetchUserOrders({ 
            userId: currentCustomer.id,
            page: 1
          })).unwrap();
        } catch (error) {
          console.error('Failed to load orders:', error);
        } finally {
          setIsLoadingPage(false);
        }
      }
    };

    loadOrders();
  }, [currentCustomer?.id, dispatch]);

  const handlePageChange = async (page: number) => {
    if (currentCustomer?.id) {
      setIsLoadingPage(true);
      try {
        await dispatch(fetchUserOrders({ 
          userId: currentCustomer.id, 
          page 
        })).unwrap();
      } catch (error) {
        console.error('Failed to load page:', error);
      } finally {
        setIsLoadingPage(false);
      }
    }
  };

  if (loading || isLoadingPage) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  if (!orders.length) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
        <p className="mt-2 text-gray-600">Start shopping to create your first order!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.$id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.$id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(order.total_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.payment_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/profile/orders/${order.$id}`}
                    className="text-red-600 hover:text-red-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
