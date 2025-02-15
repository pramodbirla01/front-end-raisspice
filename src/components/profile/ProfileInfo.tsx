import React from 'react';
import { Customer } from '@/types/customer';

interface ProfileInfoProps {
  customer: Customer;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ customer }) => {
  const formatDate = (dateInput: string | Date | undefined): string => {
    if (!dateInput) return 'Not available';
    
    try {
      // Handle both string and Date inputs
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      
      // Validate the date
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      // Try fallback to $createdAt if available
      return customer.$createdAt ? 
        formatDate(customer.$createdAt) : 
        'Not available';
    }
  };

  // Convert the Date object to ISO string if it's a Date, or use it directly if it's already a string
  const createdAtString = customer.created_at instanceof Date 
    ? customer.created_at.toISOString() 
    : customer.created_at;

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
            {formatDate(createdAtString)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
