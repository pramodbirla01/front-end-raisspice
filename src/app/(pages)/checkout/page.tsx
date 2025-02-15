"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import AddressSelector from '@/components/checkout/AddressSelector';

interface BuyNowProduct {
  id: string;
  name: string;
  thumbnail: string;
  category: string[];
  quantity: number;
  selectedVariant: {
    id: string;
    title: number;
    sale_price: number;
    original_price: number;
  };
}

interface BuyNowData {
  product: BuyNowProduct;
}

interface Address {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postal_code: string;
    province: string;
    country_code: string;
    phone: string;
}

const CheckoutPage = () => {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const router = useRouter();
    const { currentCustomer, token } = useSelector((state: RootState) => state.customer);
    const [buyNowData, setBuyNowData] = useState<BuyNowData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');
    const [address, setAddress] = useState<Address>({
        first_name: '',
        last_name: '',
        address_1: '',
        city: '',
        postal_code: '',
        province: '',
        country_code: 'in',
        phone: ''
    });
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [addresses, setAddresses] = useState<string[]>([]);

    const sectionVariants = {
        visible: { 
            opacity: 1, 
            y: 0
        }
    };

    const contactRef = useRef(null);
    const deliveryRef = useRef(null);
    const paymentRef = useRef(null);
    const summaryRef = useRef(null);

    const contactInView = useInView(contactRef, { once: true });
    const deliveryInView = useInView(deliveryRef, { once: true });
    const paymentInView = useInView(paymentRef, { once: true });
    const summaryInView = useInView(summaryRef, { once: true });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const initializeCheckout = async () => {
                try {
                    if (!token) {
                        router.push('/login');
                        return;
                    }

                    if (mode !== 'buyNow') {
                        router.push('/shop');
                        return;
                    }

                    const storedData = localStorage.getItem('buyNowData');
                    if (!storedData) {
                        console.error('No stored data found');
                        router.push('/shop');
                        return;
                    }

                    try {
                        const parsed = JSON.parse(storedData);
                        console.log('Successfully parsed data:', parsed);

                        if (!parsed?.product?.name || !parsed?.product?.thumbnail) {
                            throw new Error('Invalid product data structure');
                        }

                        setBuyNowData(parsed);
                        setLoading(false);

                        if (currentCustomer?.email) {
                            setEmail(currentCustomer.email);
                        }

                        if (currentCustomer?.address) {
                            setAddresses(currentCustomer.address);
                        }
                    } catch (parseError) {
                        console.error('Parse error:', parseError);
                        router.push('/shop');
                    }
                } catch (error) {
                    console.error('Checkout error:', error);
                    setError(error instanceof Error ? error.message : 'Failed to initialize checkout');
                    router.push('/shop');
                }
            };

            initializeCheckout();
        }
    }, [token, mode, router, currentCustomer]);

    useEffect(() => {
        console.log('Current buyNowData:', buyNowData);
        console.log('Loading state:', loading);
    }, [buyNowData, loading]);

    useEffect(() => {
        if (currentCustomer) {
            setEmail(currentCustomer.email || '');
            if (currentCustomer.address) {
                setAddress(prev => ({
                    ...prev,
                    ...currentCustomer.address
                }));
            }
        }
    }, [currentCustomer]);

    const calculateTotals = () => {
        if (!buyNowData) return { 
            original: 0,
            sale: 0
        };
        
        const { product } = buyNowData;
        return {
            original: product.selectedVariant.original_price * product.quantity,
            sale: product.selectedVariant.sale_price * product.quantity
        };
    };

    const handlePaymentSubmit = async () => {
        try {
            setLoading(true);
            
            router.push('/order-confirmation');
        } catch (error) {
            console.error('Payment failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (newAddress: string) => {
        try {
            const updatedAddresses = [...addresses, newAddress];
            setAddresses(updatedAddresses);
            setSelectedAddress(newAddress);
            
            // Update in backend if needed
            if (currentCustomer?.id) {
                await fetch(`/api/users/${currentCustomer.id}/addresses`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ addresses: updatedAddresses })
                });
            }
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleSelectAddress = (address: string) => {
        setSelectedAddress(address);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-bgColor to-lightBgColor py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (error || !buyNowData?.product) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-bgColor to-lightBgColor py-12 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'No product data found'}</p>
                    <button 
                        onClick={() => router.push('/shop')}
                        className="text-darkRed underline"
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-bgColor to-lightBgColor py-12">
            <div className="w-[90%] max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
                    Checkout
                </h1>

                <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-premium">
                            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                            <p className="text-gray-600 mb-2">Email: {currentCustomer?.email}</p>
                            <p className="text-gray-600">Name: {currentCustomer?.full_name}</p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-premium">
                            {typeof window !== 'undefined' && (
                                <AddressSelector
                                    addresses={addresses}
                                    onAddAddress={handleAddAddress}
                                    onSelectAddress={handleSelectAddress}
                                    selectedAddress={selectedAddress}
                                />
                            )}
                        </div>

                        <div
                            ref={paymentRef}
                            className="bg-white p-8 rounded-2xl shadow-premium"
                        >
                            <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                <span className="w-8 h-8 bg-darkRed text-white rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                                Payment Method
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePaymentSubmit}
                                disabled={loading}
                                className="w-full p-4 bg-gradient-to-r from-darkRed to-darkestRed text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                            >
                                {loading ? 'Processing...' : 'Complete Payment'}
                            </motion.button>
                        </div>
                    </div>

                    <div
                        ref={summaryRef}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white p-8 rounded-2xl shadow-premium sticky top-24">
                            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                    <div className="h-20 w-20 bg-white rounded-lg overflow-hidden">
                                        <img 
                                            src={buyNowData.product.thumbnail} 
                                            alt={buyNowData.product.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{buyNowData.product.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {buyNowData.product.selectedVariant.title}g
                                        </p>
                                        <div className="mt-1">
                                            <span className="text-darkRed font-medium">
                                                ₹{buyNowData.product.selectedVariant.sale_price}
                                            </span>
                                            {buyNowData.product.selectedVariant.original_price > buyNowData.product.selectedVariant.sale_price && (
                                                <span className="ml-2 text-sm text-gray-500 line-through">
                                                    ₹{buyNowData.product.selectedVariant.original_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        x{buyNowData.product.quantity}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4 border-t pt-6">
                                {calculateTotals().original > calculateTotals().sale && (
                                    <div className="flex justify-between text-gray-600">
                                        <span>Original Price</span>
                                        <span className="line-through">₹{calculateTotals().original}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-xl">
                                    <span>Total</span>
                                    <span>₹{calculateTotals().sale}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;