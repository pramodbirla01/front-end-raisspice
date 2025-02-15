"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AddressFormData {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    nearby?: string;
}

interface AddressSelectorProps {
    addresses: string[];
    onAddAddress: (address: string) => void;
    onSelectAddress: (address: string) => void;
    selectedAddress?: string;
}

const AddressSelector = ({ addresses, onAddAddress, onSelectAddress, selectedAddress }: AddressSelectorProps) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<AddressFormData>({
        name: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        nearby: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedAddress = `${formData.name}, ${formData.street}, ${formData.city}, ${formData.state}, ${formData.pincode}, ${formData.country}${formData.nearby ? `, near ${formData.nearby}` : ''}`;
        onAddAddress(formattedAddress);
        setShowForm(false);
        setFormData({
            name: '',
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            nearby: ''
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Select Delivery Address</h3>
                <button
                    onClick={() => setShowForm(true)}
                    className="text-darkRed hover:text-red-700"
                >
                    + Add New Address
                </button>
            </div>

            {/* Address List - With Key for Better Hydration */}
            <div className="grid grid-cols-1 gap-4">
                {addresses.map((address, index) => (
                    <motion.div
                        key={`address-${index}-${address.substring(0, 10)}`}
                        onClick={() => onSelectAddress(address)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedAddress === address
                                ? 'border-darkRed bg-red-50'
                                : 'border-gray-200 hover:border-darkRed'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <p className="text-sm">{address}</p>
                    </motion.div>
                ))}
            </div>

            {/* Form Modal - Only render when needed */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                >
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    value={formData.street}
                                    onChange={e => setFormData({...formData, street: e.target.value})}
                                    className="p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    className="p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={e => setFormData({...formData, state: e.target.value})}
                                    className="p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Pincode"
                                    value={formData.pincode}
                                    onChange={e => setFormData({...formData, pincode: e.target.value})}
                                    className="p-2 border rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Nearby Landmark (Optional)"
                                    value={formData.nearby}
                                    onChange={e => setFormData({...formData, nearby: e.target.value})}
                                    className="p-2 border rounded"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-darkRed text-white rounded hover:bg-red-700"
                                >
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AddressSelector;
