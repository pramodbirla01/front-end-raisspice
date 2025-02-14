"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { updateUserAddresses, fetchUserAddresses } from '@/store/slices/customerSlice';
import AddressForm from './AddressForm';
import ClientOnly from '../common/ClientOnly';

export default function AddressBook() {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { currentCustomer } = useSelector((state: RootState) => state.customer);
  const addresses = currentCustomer?.address || [];

  useEffect(() => {
    if (currentCustomer?.id) {
      dispatch(fetchUserAddresses(currentCustomer.id));
    }
  }, [currentCustomer?.id, dispatch]);

  const handleAddAddress = async (address: string) => {
    if (!currentCustomer) return;
    
    const newAddresses = [...addresses, address];
    await dispatch(updateUserAddresses({
      userId: currentCustomer.id,
      addresses: newAddresses
    }));
    setShowForm(false);
  };

  const handleEditAddress = async (index: number, newAddress: string) => {
    if (!currentCustomer) return;
    
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = newAddress;
    await dispatch(updateUserAddresses({
      userId: currentCustomer.id,
      addresses: updatedAddresses
    }));
    setEditingIndex(null);
  };

  const handleDeleteAddress = async (index: number) => {
    if (!currentCustomer) return;
    
    const updatedAddresses = addresses.filter((_: string, i: number) => i !== index);
    await dispatch(updateUserAddresses({
      userId: currentCustomer.id,
      addresses: updatedAddresses
    }));
  };

  const parseAddress = (address: string) => {
    const [street, city, state, pincode, country, nearby = ''] = address.split(',').map(s => s.trim());
    return { street, city, state, pincode, country, nearby };
  };

  return (
    <ClientOnly>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Addresses ({addresses.length})</h2>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Add New Address
          </button>
        </div>

        {showForm && (
          <div className="mb-4">
            <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowForm(false)} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address, index) => (
            <div key={index} className="border rounded-lg p-4 shadow hover:shadow-md">
              {editingIndex === index ? (
                <AddressForm 
                  initialAddress={parseAddress(address)}
                  onSubmit={(newAddress) => handleEditAddress(index, newAddress)}
                  onCancel={() => setEditingIndex(null)}
                />
              ) : (
                <div className="flex justify-between">
                  <p className="text-gray-600">{address}</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setEditingIndex(index)}
                      className="block text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAddress(index)}
                      className="block text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ClientOnly>
  );
}
