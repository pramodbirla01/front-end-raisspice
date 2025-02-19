'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface CouponSectionProps {
    onApplyCoupon: (couponData: any) => void;
    totalAmount: number;
    onRemoveCoupon: () => void;
    appliedCoupon: any | null;
}

const CouponSection = ({ onApplyCoupon, totalAmount, onRemoveCoupon, appliedCoupon }: CouponSectionProps) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApplyCoupon = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/verify-coupon', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    couponCode: couponCode.toUpperCase(),
                    totalAmount,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            if (data.success) {
                const discountAmount = Math.round((totalAmount * data.coupon.discount) / 100);
                onApplyCoupon({
                    ...data.coupon,
                    discountAmount,              // Actual discount amount in rupees
                    finalPrice: totalAmount - discountAmount  // Final price after discount
                });
            }

            setCouponCode('');

        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (appliedCoupon) {
        return (
            <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-green-700 font-medium">
                            Coupon Applied: {appliedCoupon.code}
                        </p>
                        <p className="text-sm text-green-600">
                            You saved ₹{appliedCoupon.discountAmount}
                        </p>
                    </div>
                    <button
                        onClick={onRemoveCoupon}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 p-2 border rounded-lg"
                    disabled={loading}
                />
                <button
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || loading}
                    className="px-4 py-2 bg-darkRed text-white rounded-lg disabled:opacity-50"
                >
                    {loading ? 'Applying...' : 'Apply'}
                </button>
            </div>
            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default CouponSection;
