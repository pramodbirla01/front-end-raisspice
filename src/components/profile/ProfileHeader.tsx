import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logoutCustomer } from '@/store/slices/customerSlice';
import { AppDispatch } from '@/store/store';
import { Customer } from '@/types/customer';

interface ProfileHeaderProps {
  customer: Customer;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ customer }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await dispatch(logoutCustomer());
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  // Updated date formatting function
  const formatMemberSince = (date?: Date | string): string => {
    if (!date) return 'Not available';
    
    try {
      // Handle both string and Date inputs
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Validate the date
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      // Try fallback to $createdAt if available
      return customer.$createdAt ? 
        formatMemberSince(customer.$createdAt) : 
        'Not available';
    }
  };

  const userInitials = customer.full_name ? getInitials(customer.full_name) : '??';
  const memberSince = formatMemberSince(customer.created_at);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-800 via-red-700 to-premium-800 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
      <div className="absolute inset-0 bg-premium-pattern opacity-10"></div>
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div className="space-y-2 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold backdrop-blur-sm">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gold-200 truncate">
                {customer.full_name || 'Name Not Set'}
              </h1>
              <p className="text-white/80 text-sm sm:text-base truncate">{customer.email}</p>
              <p className="text-white/60 text-sm">
                Member Since: {memberSince}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg 
              hover:bg-white/20 transition-all duration-300 ease-out
              hover:shadow-premium-button hover:scale-105 text-sm sm:text-base
              flex items-center justify-center gap-2"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Logout</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
