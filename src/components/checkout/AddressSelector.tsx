'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Address } from '@/types/customer';
import AddressForm from './AddressForm';
import ClientOnly from '@/components/ClientOnly';

interface AddressSelectorProps {
    addresses: Address[];
    selectedAddress?: Address | null;
    onSelectAddress: (address: Address) => void;
    onAddAddress: (address: Address) => void;
    userPhone?: string;
    hideExistingAddresses?: boolean; // Add this prop
}

const AddressSelector = ({ 
    addresses, 
    selectedAddress, 
    onSelectAddress, 
    onAddAddress, 
    userPhone,
    hideExistingAddresses = false // Add default value
}: AddressSelectorProps) => {
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        // Auto-select first address if none selected and addresses exist
        if (!selectedAddress && addresses.length > 0) {
            onSelectAddress(addresses[0]);
        }
    }, [addresses, selectedAddress, onSelectAddress]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="w-8 h-8 bg-darkRed text-white rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Shipping Address
            </h2>

            {/* Only show existing addresses if not hidden */}
            {!hideExistingAddresses && (
                <div className="space-y-4">
                    {addresses.map((address, index) => (
                        <div
                            key={index}
                            className={`border p-4 rounded-lg cursor-pointer transition-all ${
                                selectedAddress?.address_line1 === address.address_line1 
                                ? 'border-darkRed bg-red-50' 
                                : 'border-gray-200 hover:border-red-300'
                            }`}
                            onClick={() => onSelectAddress(address)}
                        >
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-medium">{address.full_name}</p>
                                    <p className="text-sm text-gray-600">{address.mobile}</p>
                                    <p className="text-sm text-gray-600">
                                        {address.address_line1}
                                        {address.address_line2 && `, ${address.address_line2}`}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {address.city}, {address.state} - {address.pincode}
                                    </p>
                                </div>
                                {address.is_default && (
                                    <span className="text-xs bg-red-100 text-darkRed px-2 py-1 rounded">Default</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add new address button or form */}
            {!showAddForm ? (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 text-darkRed hover:text-red-700 font-medium flex items-center"
                >
                    <span className="mr-2">+</span> Add New Address
                </button>
            ) : (
                <div className="border py-5 p-4 rounded-lg   fixed inset-0 bg-white z-50 max-w-3xl mx-auto top-[11%] mt-40 shadow-2xl overflow-y-auto">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-medium">Add New Address</h3>
                        <button 
                            onClick={() => setShowAddForm(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    <AddressForm
                        onSubmit={(address) => {
                            onAddAddress(address);
                            setShowAddForm(false);
                        }}
                        userPhone={userPhone}
                    />
                </div>
            )}
        </div>
    );
};

export default function AddressSelectorWrapper(props: AddressSelectorProps) {
    return (
        <ClientOnly>
            <AddressSelector {...props} />
        </ClientOnly>
    );
}
