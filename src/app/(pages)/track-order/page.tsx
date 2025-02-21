'use client';

import { useState, useEffect } from 'react';
import TrackingTimeline from '@/components/orders/TrackingTimeline';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

interface TrackingData {
  status: string;
  tracking_data: Array<{
    activity: string;
    date: string;
    location: string;
  }>;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const trackOrder = async (id = orderId) => {
    if (!id) {
      toast.error('Please enter an order ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/track-order?orderId=${id}`);
      const data = await response.json();

      if (data.success) {
        setTrackingData(data.tracking);
        // Update URL with order ID
        router.push(`/track-order?orderId=${id}`);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to track order');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for order ID in URL params on mount
  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
      trackOrder(orderIdParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => trackOrder()}
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? 'Tracking...' : 'Track Order'}
            </button>
          </div>
        </div>

        {trackingData && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Order #{orderId}</h2>
              <p className="text-gray-600">Current Status: {trackingData.status}</p>
            </div>
            <TrackingTimeline events={trackingData.tracking_data || []} />
          </div>
        )}
      </div>
    </div>
  );
}
