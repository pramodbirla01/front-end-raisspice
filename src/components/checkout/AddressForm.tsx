import React, { useState } from 'react';
import { Address } from '@/types/customer';

interface AddressFormProps {
    onSubmit: (address: Address) => void;
    initialData?: Partial<Address>;
    userPhone?: string;
    onUpdatePhone?: (phone: string) => void;
}

const AddressForm = ({ onSubmit, initialData, userPhone, onUpdatePhone }: AddressFormProps) => {
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        mobile: initialData?.mobile || userPhone || '',
        address_line1: initialData?.address_line1 || '',
        address_line2: initialData?.address_line2 || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        pincode: initialData?.pincode || '',
        type: initialData?.type || 'home' as const,
        is_default: initialData?.is_default || false
    });

    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    const validateForm = () => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};
        
        if (!formData.full_name) newErrors.full_name = 'Name is required';
        if (!formData.mobile) newErrors.mobile = 'Phone number is required';
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid phone number';
        if (!formData.address_line1) newErrors.address_line1 = 'Address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pincode) newErrors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Invalid pincode';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData as Address);
        }
    };

    const validatePhone = (phone: string) => {
        return /^\d{10}$/.test(phone);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPhone = e.target.value;
        setFormData(prev => ({ ...prev, mobile: newPhone }));
        if (validatePhone(newPhone) && onUpdatePhone) {
            onUpdatePhone(newPhone);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2 ">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                    />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="tel"
                        value={formData.mobile}
                        onChange={handlePhoneChange}
                        className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                        maxLength={10}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                    type="text"
                    value={formData.address_line1}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                />
                {errors.address_line1 && <p className="text-red-500 text-xs mt-1">{errors.address_line1}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                <input
                    type="text"
                    value={formData.address_line2}
                    onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                    />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'home' | 'office' }))}
                        className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-darkRed focus:ring-1 focus:ring-darkRed px-4 py-2"
                    >
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                    className="rounded border-gray-300 text-darkRed focus:ring-darkRed"
                />
                <label className="ml-2 text-sm text-gray-700">Set as default address</label>
            </div>

            <button
                type="submit"
                className="w-full bg-darkRed text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
                Save Address
            </button>
        </form>
    );
};

export default AddressForm;
