import { useState } from 'react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddressModal({ isOpen, onClose }: AddressModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Just close the modal for now since we're using dummy data
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Add New Address</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ...form fields... */}
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add Address
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
