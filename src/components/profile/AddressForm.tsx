import { useState, useEffect } from 'react';
import { Address } from '@/types/customer';

interface AddressFormProps {
  initialAddress?: Address;
  onSubmit: (address: Address) => void;
  onCancel: () => void;
}

export default function AddressForm({ initialAddress, onSubmit, onCancel }: AddressFormProps) {
  const [addressData, setAddressData] = useState<Omit<Address, 'id'>>({
    full_name: '',
    mobile: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    is_default: false
  });

  useEffect(() => {
    if (initialAddress) {
      setAddressData(initialAddress);
    }
  }, [initialAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress = {
      ...addressData,
      id: initialAddress?.id || `addr_${Date.now()}${Math.random().toString(36).substring(2)}`
    };
    onSubmit(newAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Full Name"
          value={addressData.full_name}
          onChange={(e) => setAddressData({ ...addressData, full_name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="Mobile Number"
          value={addressData.mobile}
          pattern="[0-9]{10}"
          onChange={(e) => setAddressData({ ...addressData, mobile: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Address Line 1"
          value={addressData.address_line1}
          onChange={(e) => setAddressData({ ...addressData, address_line1: e.target.value })}
          className="w-full p-2 border rounded md:col-span-2"
          required
        />
        <input
          type="text"
          placeholder="Address Line 2 (Optional)"
          value={addressData.address_line2}
          onChange={(e) => setAddressData({ ...addressData, address_line2: e.target.value })}
          className="w-full p-2 border rounded md:col-span-2"
        />
        <input
          type="text"
          placeholder="City"
          value={addressData.city}
          onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="State"
          value={addressData.state}
          onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Pincode"
          value={addressData.pincode}
          pattern="[0-9]{6}"
          onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <select
          value={addressData.type}
          onChange={(e) => setAddressData({ ...addressData, type: e.target.value as Address['type'] })}
          className="w-full p-2 border rounded"
        >
          <option value="home">Home</option>
          <option value="office">Office</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={addressData.is_default}
            onChange={(e) => setAddressData({ ...addressData, is_default: e.target.checked })}
          />
          Set as default address
        </label>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          {initialAddress ? 'Update' : 'Add'} Address
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
