import React from 'react';
import { Customer } from '@/types/customer';

interface ProfileInfoProps {
  customer: Customer;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ customer }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p className="mt-1 text-lg">
            {customer.full_name || 'Not set'}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="mt-1 text-lg">{customer.email}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
          <p className="mt-1 text-lg">
            {formatDate(customer.created_at)}
          </p>
        </div>

        {/* {customer.phone && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="mt-1 text-lg">{customer.phone}</p>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default ProfileInfo;
