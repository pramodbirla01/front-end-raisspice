"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store/store';
import { updateCartEmail, updateCartAddresses, fetchShippingOptions, addShippingMethod, completeCart } from '../../../store/slices/orderSlice';

const CheckoutPage = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { cart } = useSelector((state: RootState) => state.cart);
    const { loading, shippingOptions } = useSelector((state: RootState) => state.order);

    const [email, setEmail] = useState('');
    const [address, setAddress] = useState({
        first_name: '',
        last_name: '',
        address_1: '',
        city: '',
        postal_code: '',
        province: '',
        country_code: 'in',
        phone: ''
    });
    const [billingAddressSame, setBillingAddressSame] = useState(true);

    useEffect(() => {
        // Redirect if no cart or empty cart
        if (!cart || cart.items.length === 0) {
            router.push('/cart');
        }
        
        const cartId = localStorage.getItem('cart_id');
        if (cartId) {
            dispatch(fetchShippingOptions(cartId));
        }
    }, [cart, router]);

    const handleEmailSubmit = async () => {
        if (!cart) return;
        try {
            await dispatch(updateCartEmail({ 
                cartId: cart.id, 
                email 
            })).unwrap();
        } catch (error) {
            console.error('Failed to update email:', error);
        }
    };

    const handleAddressSubmit = async () => {
        if (!cart) return;
        try {
            await dispatch(updateCartAddresses({ 
                cartId: cart.id, 
                address 
            })).unwrap();
            // After address is set, fetch shipping options
            dispatch(fetchShippingOptions(cart.id));
        } catch (error) {
            console.error('Failed to update address:', error);
        }
    };

    const handleShippingMethodSelect = async (optionId: string) => {
        if (!cart) return;
        try {
            await dispatch(addShippingMethod({ 
                cartId: cart.id, 
                optionId 
            })).unwrap();
        } catch (error) {
            console.error('Failed to add shipping method:', error);
        }
    };

    const handlePaymentSubmit = async () => {
        if (!cart) return;
        try {
            await dispatch(completeCart(cart.id)).unwrap();
            router.push('/order-confirmation');
        } catch (error) {
            console.error('Failed to complete order:', error);
        }
    };

    // Refs for each section
    const contactRef = useRef(null);
    const deliveryRef = useRef(null);
    const paymentRef = useRef(null);
    const billingRef = useRef(null);
    const summaryRef = useRef(null);

    // Check if sections are in view
    const contactInView = useInView(contactRef, { once: true });
    const deliveryInView = useInView(deliveryRef, { once: true });
    const paymentInView = useInView(paymentRef, { once: true });
    const billingInView = useInView(billingRef, { once: true });
    const summaryInView = useInView(summaryRef, { once: true });

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-bgColor to-lightBgColor py-12">
            <div className="w-[90%] max-w-7xl mx-auto">
                <motion.h1 
                    className="text-3xl font-bold text-gray-800 text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Checkout
                </motion.h1>

                <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-12">
                    {/* Left Column - Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Contact Section */}
                        <motion.div
                            ref={contactRef}
                            variants={sectionVariants}
                            initial="hidden"
                            animate={contactInView ? "visible" : "hidden"}
                            className="bg-white p-8 rounded-2xl shadow-premium"
                        >
                            <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                <span className="w-8 h-8 bg-darkRed text-white rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                                Contact Information
                            </h2>
                            <input
                                type="email"
                                placeholder="Email or mobile phone number"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={handleEmailSubmit}
                                className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-darkRed transition-all duration-300 outline-none"
                            />
                        </motion.div>

                        {/* Delivery Section */}
                        <motion.div
                            ref={deliveryRef}
                            variants={sectionVariants}
                            initial="hidden"
                            animate={deliveryInView ? "visible" : "hidden"}
                            className="bg-white p-8 rounded-2xl shadow-premium"
                        >
                            <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                <span className="w-8 h-8 bg-darkRed text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                                Shipping Address
                            </h2>
                            
                            <div className="space-y-6">
                                <select 
                                    name="country" 
                                    className="w-full p-4 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-darkRed transition-all duration-300 outline-none"
                                >
                                    <option value="India">India</option>
                                </select>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Name inputs */}
                                    <input
                                        placeholder="First name"
                                        value={address.first_name}
                                        onChange={(e) => setAddress({...address, first_name: e.target.value})}
                                        className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-darkRed transition-all duration-300 outline-none"
                                    />
                                    <input
                                        placeholder="Last name"
                                        value={address.last_name}
                                        onChange={(e) => setAddress({...address, last_name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                    />
                                </div>
                                <input
                                    placeholder="Address"
                                    value={address.address_1}
                                    onChange={(e) => setAddress({...address, address_1: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                />
                                <input
                                    placeholder="Apartment, suite, etc. (optional)"
                                    className="w-full p-3 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                />
                                <div className="grid grid-cols-3 gap-4">
                                    <input
                                        placeholder="City"
                                        value={address.city}
                                        onChange={(e) => setAddress({...address, city: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                    />
                                    <input
                                        placeholder="State"
                                        value={address.province}
                                        onChange={(e) => setAddress({...address, province: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                    />
                                    <input
                                        placeholder="PIN code"
                                        value={address.postal_code}
                                        onChange={(e) => setAddress({...address, postal_code: e.target.value})}
                                        className="w-full p-3 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                    />
                                </div>
                                <input
                                    placeholder="Phone"
                                    value={address.phone}
                                    onChange={(e) => setAddress({...address, phone: e.target.value})}
                                    className="w-full p-3 border border-gray-300 rounded-md bg-bgColor placeholder-black"
                                />
                                <button
                                    onClick={handleAddressSubmit}
                                    className="w-full p-3 bg-blue-600 text-white rounded-md"
                                >
                                    Save Address
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={deliveryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="shipping_Method flex flex-col gap-2"
                        >
                            <h2 className='text-lg'>Shipping Method</h2>
                            <div className="space-y-2">
                                {shippingOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleShippingMethodSelect(option.id)}
                                        className="w-full p-4 border rounded-md"
                                    >
                                        {option.name} - ₹{option.amount}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Payment Section */}
                        <motion.div
                            ref={paymentRef}
                            variants={sectionVariants}
                            initial="hidden"
                            animate={paymentInView ? "visible" : "hidden"}
                            className="bg-white p-8 rounded-2xl shadow-premium"
                        >
                            <h2 className="text-2xl font-semibold mb-6 flex items-center">
                                <span className="w-8 h-8 bg-darkRed text-white rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                                Payment Method
                            </h2>
                            {/* Add your payment form here */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePaymentSubmit}
                                disabled={loading}
                                className="w-full p-4 bg-gradient-to-r from-darkRed to-darkestRed text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                            >
                                {loading ? 'Processing...' : 'Complete Payment'}
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <motion.div
                        ref={summaryRef}
                        variants={sectionVariants}
                        initial="hidden"
                        animate={summaryInView ? "visible" : "hidden"}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white p-8 rounded-2xl shadow-premium sticky top-24">
                            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {cart?.items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="h-20 w-20 bg-white rounded-lg overflow-hidden">
                                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-sm text-gray-600">{item.variant_title}</p>
                                            <p className="text-darkRed font-medium mt-1">₹{item.unit_price * item.quantity}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">x{item.quantity}</div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-6 space-y-4 border-t pt-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cart?.subtotal || 0}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{cart?.tax_total || 0}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹{cart?.shipping_total || 0}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-4 border-t">
                                    <span>Total</span>
                                    <span>₹{cart?.total || 0}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;