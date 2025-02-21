"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { updateUserAddresses, fetchUserAddresses } from '@/store/slices/customerSlice';
import AddressForm from './AddressForm';
import ClientOnly from '../common/ClientOnly';
import { Address } from '@/types/customer';
import ConfirmDialog from '../common/ConfirmDialog';

export default function AddressBook() {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; address: Address | null }>({
    show: false,
    address: null
  });
  const [error, setError] = useState<string | null>(null);
  
  const dispatch = useDispatch<AppDispatch>();
  const { currentCustomer } = useSelector((state: RootState) => state.customer);
  const addressStrings = currentCustomer?.address || [];
  
  // Parse string addresses into Address objects
  const addresses: Address[] = addressStrings.map(addr => {
    try {
      return typeof addr === 'string' ? JSON.parse(addr) : addr;
    } catch (e) {
      console.error('Error parsing address:', e);
      return null;
    }
  }).filter((addr): addr is Address => addr !== null);

  useEffect(() => {
    if (currentCustomer?.id) {
      dispatch(fetchUserAddresses(currentCustomer.id));
    }
  }, [currentCustomer?.id, dispatch]);

  const handleAddAddress = async (address: Address) => {
    if (!currentCustomer || addresses.length >= 4) return;
    setError(null);
    
    const newAddress = {
      ...address,
      id: `addr_${Date.now()}${Math.random().toString(36).substring(2)}`
    };
    
    try {
      const newAddresses = [...addresses, newAddress];
      await dispatch(updateUserAddresses({
        userId: currentCustomer.id,
        addresses: newAddresses.map(addr => JSON.stringify(addr))
      })).unwrap();
      
      // Refresh addresses after update
      if (currentCustomer.id) {
        await dispatch(fetchUserAddresses(currentCustomer.id));
      }
      
      setShowForm(false);
    } catch (error: any) {
      console.error('Error adding address:', error);
      setError(error.message || 'Failed to add address');
    }
  };

  const handleEditAddress = async (newAddress: Address) => {
    if (!currentCustomer) return;
    
    const updatedAddresses = addresses.map(addr => 
      addr.id === newAddress.id ? newAddress : addr
    );
    await dispatch(updateUserAddresses({
      userId: currentCustomer.id,
      addresses: updatedAddresses.map(addr => JSON.stringify(addr))
    }));
    setEditingAddress(null);
  };

  const handleDeleteConfirm = async () => {
    if (!currentCustomer || !deleteConfirm.address) return;
    
    const updatedAddresses = addresses.filter(addr => addr.id !== deleteConfirm.address?.id);
    await dispatch(updateUserAddresses({
      userId: currentCustomer.id,
      addresses: updatedAddresses.map(addr => JSON.stringify(addr))
    }));
    setDeleteConfirm({ show: false, address: null });
  };

  const canAddAddress = addresses.length < 4;

  return (
    <ClientOnly>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Addresses ({addresses.length}/4)</h2>
          {canAddAddress && (
            <button 
              onClick={() => setShowForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add New Address
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white p-4 rounded-lg shadow">
            <AddressForm 
              onSubmit={handleAddAddress} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 shadow hover:shadow-md">
              {editingAddress?.id === address.id ? (
                <AddressForm 
                  initialAddress={address}
                  onSubmit={handleEditAddress}
                  onCancel={() => setEditingAddress(null)}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{address.full_name}</p>
                      <p className="text-sm text-gray-600">{address.mobile}</p>
                    </div>
                    <div className="space-x-2">
                      <button 
                        onClick={() => setEditingAddress(address)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ show: true, address })}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  <p className="text-gray-700">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                      {address.type}
                    </span>
                    {address.is_default && (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <ConfirmDialog
          isOpen={deleteConfirm.show}
          title="Delete Address"
          message="Are you sure you want to delete this address?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm({ show: false, address: null })}
        />
      </div>
    </ClientOnly>
  );
}
