import { useState, useEffect } from 'react';

interface AddressData {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  nearby?: string;
}

interface AddressFormProps {
  initialAddress?: AddressData;
  onSubmit: (address: string) => void;
  onCancel: () => void;
}

export default function AddressForm({ initialAddress, onSubmit, onCancel }: AddressFormProps) {
  const [addressData, setAddressData] = useState<AddressData>({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    nearby: ''
  });

  useEffect(() => {
    if (initialAddress) {
      setAddressData(initialAddress);
    }
  }, [initialAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = [
      addressData.street,
      addressData.city,
      addressData.state,
      addressData.pincode,
      addressData.country,
      addressData.nearby
    ].filter(Boolean).join(', ');
    
    onSubmit(fullAddress);
    setAddressData({
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      nearby: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Street Address"
        value={addressData.street}
        onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
        className="w-full p-2 border rounded"
        required
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
        onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
        className="w-full p-2 border rounded"
        required
      />
      <div className="flex gap-2">
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
