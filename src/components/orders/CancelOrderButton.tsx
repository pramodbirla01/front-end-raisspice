import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import toast from 'react-hot-toast';

interface CancelOrderButtonProps {
  orderId: string;
  shippingStatus: string;
  onCancelSuccess: () => void;
}

export default function CancelOrderButton({ orderId, shippingStatus, onCancelSuccess }: CancelOrderButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { token } = useSelector((state: RootState) => state.customer);

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cancel-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        if (data.refundDetails?.refund_status === 'failed') {
          toast.error('Refund failed - our team will process it manually');
        } else if (data.refundDetails?.refund_id) {
          toast.success(`Refund initiated: ${data.refundDetails.refund_id}`);
        }
        onCancelSuccess();
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

  if (shippingStatus !== 'pending') {
    return (
      <button 
        disabled 
        className="px-4 py-2 text-white bg-black rounded"
      >
        {shippingStatus === 'cancelled' ? 'Order Cancelled' : `Order ${shippingStatus}`}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => dialogRef.current?.showModal()}
        disabled={isLoading}
        className={`px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Cancelling...' : 'Cancel Order'}
      </button>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 w-full h-full bg-black/50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current.close();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-auto" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-semibold mb-4 text-center">Are you sure you want to cancel this order?</h3>
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
              onClick={handleCancel}
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
