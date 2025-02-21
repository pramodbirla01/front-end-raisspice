"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Order } from '@/types/order';
import OrderDetails from '@/components/orders/OrderDetails';
import AuthGuard from '@/components/auth/AuthGuard';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Loader from '@/components/Loader';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !token) return;

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Order API response:', data);

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          throw new Error(data.error || 'Failed to fetch order');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load order';
        setError(errorMessage);

        // If order not found, redirect to orders list
        if (errorMessage.includes('Collection with the requested ID could not be found')) {
          router.push('/profile/orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token, router]);

  if (loading) {
    return <Loader isLoading={true} />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <OrderDetails order={order} />
        </div>
      </div>
    </AuthGuard>
  );
}
