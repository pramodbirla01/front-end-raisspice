"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { clearCart } from '../../../store/slices/cartSlice'; // Add this import
import AddressSelector from '@/components/checkout/AddressSelector';
import ClientOnly from '@/components/ClientOnly';
import { Customer, Address } from '@/types/customer';
import { Order } from '@/types/order';

interface CheckoutProduct {
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

interface CheckoutData {
  mode: 'buyNow' | 'cart';
  products: CheckoutProduct[];
}

const CheckoutPage = () => {
    const dispatch = useDispatch<AppDispatch>(); // Add this line
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const router = useRouter();
    const { currentCustomer, token } = useSelector((state: RootState) => state.customer);
    const { cart } = useSelector((state: RootState) => state.cart);
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
    const [userPhone, setUserPhone] = useState<string>('');
    const [addressError, setAddressError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

                    if (mode === 'buyNow') {
                        // Handle Buy Now checkout
                        const storedData = localStorage.getItem('buyNowData');
                        if (!storedData) throw new Error('No checkout data found');

                        const parsed = JSON.parse(storedData);
                        setCheckoutData({
                            mode: 'buyNow',
                            products: [parsed.product]
                        });
                    } 
                    else if (mode === 'cart') {
                        // Handle Cart checkout
                        if (!cart?.items?.length) {
                            router.push('/cart');
                            return;
                        }

                        const cartProducts = cart.items.map(item => ({
                            id: item.documentId,
                            name: item.name,
                            thumbnail: item.thumbnail,
                            category: [item.category.$id],
                            quantity: item.quantity,
                            selectedVariant: {
                                id: item.id,
                                title: item.weight.weight_Value,
                                sale_price: item.weight.sale_Price,
                                original_price: item.weight.original_Price
                            }
                        }));

                        setCheckoutData({
                            mode: 'cart',
                            products: cartProducts
                        });
                    } else {
                        router.push('/shop');
                    }

                    setLoading(false);
                } catch (error) {
                    console.error('Checkout error:', error);
                    setError(error instanceof Error ? error.message : 'Failed to initialize checkout');
                    router.push('/shop');
                }
            };

            initializeCheckout();
        }
    }, [token, mode, router, cart, currentCustomer]);

    useEffect(() => {
        console.log('Current checkoutData:', checkoutData);
        console.log('Loading state:', loading);
    }, [checkoutData, loading]);

    const calculateTotals = () => {
        if (!checkoutData?.products) return { original: 0, sale: 0 };
        
        // Calculate totals and round to integers
        const totals = checkoutData.products.reduce((acc, product) => ({
            original: acc.original + (product.selectedVariant.original_price * product.quantity),
            sale: acc.sale + (product.selectedVariant.sale_price * product.quantity)
        }), { original: 0, sale: 0 });

        // Round to integers
        return {
            original: Math.round(totals.original),
            sale: Math.round(totals.sale)
        };
    };

    // Update the fetchUserAddresses function to properly type the parsed addresses
    const fetchUserAddresses = async () => {
        try {
            setAddressesLoading(true);
            console.log('Fetching addresses for user:', currentCustomer?.$id);

            const response = await fetch('/api/user/addresses', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('Raw address response:', data);

            if (data.success && Array.isArray(data.addresses)) {
                const parsedAddresses = data.addresses
                    .map((addrStr: string) => {
                        try {
                            if (typeof addrStr !== 'string') {
                                console.error('Invalid address format:', addrStr);
                                return null;
                            }

                            const parsed = JSON.parse(addrStr);
                            // Validate the parsed data has required fields
                            if (!parsed || typeof parsed !== 'object') {
                                console.error('Invalid parsed address:', parsed);
                                return null;
                            }

                            return {
                                id: parsed.id || `addr_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                                full_name: parsed.full_name,
                                mobile: parsed.mobile,
                                address_line1: parsed.address_line1,
                                address_line2: parsed.address_line2 || '',
                                city: parsed.city,
                                state: parsed.state,
                                pincode: parsed.pincode,
                                type: parsed.type || 'home',
                                is_default: parsed.is_default || false
                            } as Address;
                        } catch (e) {
                            console.error('Error parsing address:', e);
                            return null;
                        }
                    })
                    .filter((addr: Address | null): addr is Address => addr !== null);

                if (parsedAddresses.length > 0) {
                    setAddresses(parsedAddresses);
                    const defaultAddr = parsedAddresses.find((addr: Address) => addr.is_default) || parsedAddresses[0];
                    setSelectedAddress(defaultAddr);
                }
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setAddressError('Failed to load saved addresses');
        } finally {
            setAddressesLoading(false);
        }
    };

    useEffect(() => {
        if (currentCustomer?.$id && token) {
            fetchUserAddresses();
        }
    }, [currentCustomer?.$id, token]);

    const handlePaymentSubmit = async () => {
        try {
            setLoading(true);
            setAddressError(null);
            setError(null);
            
            if (!selectedAddress || !checkoutData?.products) {
                setAddressError('Please select or add a delivery address');
                setLoading(false);
                return;
            }

            const totalAmount = Math.round(calculateTotals().sale);
            const orderItemsKey = `order_items_${Date.now()}`;
            const orderItems = checkoutData.products.map(product => ({
                id: product.id,
                name: product.name,
                price: Math.round(product.selectedVariant.sale_price),
                original_price: Math.round(product.selectedVariant.original_price),
                quantity: product.quantity,
                imgSrc: product.thumbnail,
                itemTotal: Math.round(product.selectedVariant.sale_price * product.quantity),
                weight: product.selectedVariant.title,
                variant_id: product.selectedVariant.id
            }));

            localStorage.setItem(orderItemsKey, JSON.stringify(orderItems));

            const orderData = {
                address: selectedAddress.address_line1,
                status: 'pending',
                user_id: currentCustomer?.id,
                email: currentCustomer?.email || '',
                state: selectedAddress.state,
                city: selectedAddress.city,
                country: 'IN',
                phone_number: selectedAddress.mobile,
                payment_type: paymentMethod,
                first_name: selectedAddress.full_name.split(' ')[0],
                last_name: selectedAddress.full_name.split(' ').slice(1).join(' '),
                idempotency_key: orderItemsKey,
                created_at: new Date().toISOString(),
                pincode: parseInt(selectedAddress.pincode),
                total_price: totalAmount,
                order_items: totalAmount,
                payment_status: 'pending',
                shipping_status: 'pending',
                payment_amount: totalAmount
            };

            if (paymentMethod === 'COD') {
                // Handle COD order
                const response = await fetch('/api/create-cod-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ order: orderData })
                });

                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create order');
                }

                setOrderId(result.orderId);
                setShowConfirmation(true);
                
                if (mode === 'cart') {
                    dispatch(clearCart());
                }
            } else {
                // Handle Razorpay payment
                const response = await fetch('/api/create-razorpay-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        amount: totalAmount,
                        currency: 'INR',
                        items: orderItems,
                        orderData
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create Razorpay order');
                }

                const result = await response.json();
                
                return new Promise((resolve, reject) => {
                    const options = {
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        amount: result.amount,
                        currency: 'INR',
                        name: 'Rais Spices',
                        description: 'Purchase from Rais Spices',
                        order_id: result.id,
                        handler: async function(response: any) {
                            try {
                                const verifyResponse = await fetch('/api/verify-payment', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_signature: response.razorpay_signature,
                                        orderData,
                                        amount: totalAmount
                                    })
                                });

                                const verifyResult = await verifyResponse.json();

                                if (verifyResult.success) {
                                    // Clear cart if payment was successful
                                    if (mode === 'cart') {
                                        dispatch(clearCart());
                                    }
                                    
                                    // Show success confirmation
                                    setOrderId(verifyResult.orderId);
                                    setShowConfirmation(true);
                                    resolve(verifyResult);
                                } else {
                                    throw new Error('Payment verification failed');
                                }
                            } catch (error) {
                                setErrorMessage('Payment verification failed. Please try again or contact support.');
                                setShowErrorModal(true);
                                reject(error);
                            }
                        },
                        modal: {
                            ondismiss: function() {
                                setErrorMessage('Payment was cancelled');
                                setShowErrorModal(true);
                            }
                        },
                        prefill: {
                            name: `${orderData.first_name} ${orderData.last_name}`,
                            email: orderData.email,
                            contact: orderData.phone_number
                        },
                        theme: {
                            color: '#B91C1C'
                        }
                    };

                    const razorpay = new (window as any).Razorpay(options);
                    razorpay.open();
                });
            }
        } catch (error) {
            console.error('Payment failed:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (newAddress: Address) => {
        try {
            const addressWithId = {
                ...newAddress,
                id: `addr_${Date.now()}${Math.random().toString(36).substr(2, 9)}`
            };

            const updatedAddresses = [...addresses, addressWithId];
            
            // Update user's addresses in Appwrite
            const response = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    addresses: updatedAddresses.map(addr => JSON.stringify(addr))
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setAddresses(updatedAddresses);
                setSelectedAddress(addressWithId);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error saving address:', error);
            setAddressError('Failed to save address. Please try again.');
        }
    };

    const handleSelectAddress = (address: Address) => {
        setSelectedAddress(address);
    };

    useEffect(() => {
        const loadScript = async () => {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);
                document.body.appendChild(script);
            });
        };

        loadScript();
    }, []);

    const renderAddressSection = () => {
        if (addressesLoading) {
            return (
                <div className="bg-white p-8 rounded-2xl shadow-premium">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-500 border-t-transparent"></div>
                        <span className="text-gray-600">Loading addresses...</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white p-8 rounded-2xl shadow-premium">
                {addressError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {addressError}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}
                <AddressSelector
                    addresses={addresses}
                    onAddAddress={handleAddAddress}
                    onSelectAddress={setSelectedAddress}
                    selectedAddress={selectedAddress}
                    userPhone={userPhone}
                />
            </div>
        );
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

    if (error || !checkoutData?.products) {
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
        <ClientOnly>
            <div className="min-h-screen bg-gradient-to-b from-bgColor to-lightBgColor py-12">
                <div className="w-[90%] max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
                        Checkout
                    </h1>

                    <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-12">
                        {/* Left column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Contact Info */}
                            <div className="bg-white p-8 rounded-2xl shadow-premium">
                                <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
                                <p className="text-gray-600 mb-2">Email: {currentCustomer?.email}</p>
                                <p className="text-gray-600">Name: {currentCustomer?.full_name}</p>
                            </div>

                            {/* Address Section */}
                            {renderAddressSection()}

                            {/* Payment Section */}
                            <div
                                ref={paymentRef}
                                className="bg-white p-8 rounded-2xl shadow-premium"
                            >
                                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                    <span className="w-8 h-8 bg-darkRed text-white rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                                    Payment Method
                                </h2>
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="cod"
                                            name="payment"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'COD')}
                                            className="form-radio text-darkRed"
                                        />
                                        <label htmlFor="cod">Cash on Delivery</label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            id="online"
                                            name="payment"
                                            value="ONLINE"
                                            checked={paymentMethod === 'ONLINE'}
                                            onChange={(e) => setPaymentMethod(e.target.value as 'ONLINE')}
                                            className="form-radio text-darkRed"
                                        />
                                        <label htmlFor="online">Online Payment</label>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePaymentSubmit}
                                    disabled={loading}
                                    className="w-full p-4 bg-gradient-to-r from-darkRed to-darkestRed text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                                >
                                    {loading ? 'Processing...' : `Proceed with ${paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}`}
                                </motion.button>
                            </div>
                        </div>

                        {/* Right column - Order Summary */}
                        <div ref={summaryRef} className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-2xl shadow-premium sticky top-24">
                                <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                                <div className="space-y-4">
                                    {checkoutData?.products.map((product) => (
                                        <div key={`${product.id}-${product.selectedVariant.id}`} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="h-20 w-20 bg-white rounded-lg overflow-hidden">
                                                <img 
                                                    src={product.thumbnail} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {product.selectedVariant.title}g
                                                </p>
                                                <div className="mt-1">
                                                    <span className="text-darkRed font-medium">
                                                        ₹{product.selectedVariant.sale_price}
                                                    </span>
                                                    {product.selectedVariant.original_price > product.selectedVariant.sale_price && (
                                                        <span className="ml-2 text-sm text-gray-500 line-through">
                                                            ₹{product.selectedVariant.original_price}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                x{product.quantity}
                                            </div>
                                        </div>
                                    ))}

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

                {/* Payment Error Modal */}
                {showErrorModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg 
                                        className="w-8 h-8 text-red-500" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M6 18L18 6M6 6l12 12" 
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">Payment Failed</h2>
                                <p className="text-gray-600 mb-6">
                                    {errorMessage}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setShowErrorModal(false);
                                            setErrorMessage('');
                                        }}
                                        className="px-6 py-2 bg-darkRed text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                    <button
                                        onClick={() => router.push('/cart')}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Back to Cart
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Order Confirmation Modal */}
                {showConfirmation && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg 
                                        className="w-8 h-8 text-green-500" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M5 13l4 4L19 7" 
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">Order Confirmed!</h2>
                                <p className="text-gray-600 mb-4">
                                    Your order has been successfully placed.
                                    <br />
                                    Order ID: {orderId}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => router.push(`/profile/orders/${orderId}`)}
                                        className="px-4 py-2 bg-darkRed text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        View Order
                                    </button>
                                    <button
                                        onClick={() => router.push('/shop')}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </ClientOnly>
    );
};

export default CheckoutPage;