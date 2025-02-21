"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '@/store/store';
import { checkAuthStatus, fetchCustomerOrders } from '@/store/slices/customerSlice';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import AddressBook from '@/components/profile/AddressBook';
import OrderHistory from '@/components/profile/OrderHistory';
import ProfileDashboard from '@/components/profile/ProfileDashboard';
import ProfileTabs, { TabType } from '@/components/profile/ProfileTabs';
import AuthGuard from '@/components/auth/AuthGuard';
import { Address } from '@/types/customer';
import Cookies from 'js-cookie';
import Loader from '@/components/Loader';
import ProfileSettings from '@/components/profile/ProfileSettings';

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentCustomer, loading, token } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      const storedData = localStorage.getItem('customer_data');
      const authToken = Cookies.get('auth_token');

      console.log('Auth check:', { storedData, authToken, currentCustomer }); // Debug log

      if (storedData && authToken && !currentCustomer) {
        try {
          await dispatch(checkAuthStatus()).unwrap();
          // Log the current customer after auth check
          console.log('Customer after auth:', currentCustomer);
          // Fetch orders after authentication
          if (token) {
            await dispatch(fetchCustomerOrders(token));
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/login');
        }
      } else if (!authToken) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [mounted, currentCustomer, dispatch, router, token]);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null;

  if (loading) {
    return <Loader isLoading={true} />;
  }

  const renderTabContent = () => {
    if (!currentCustomer) return null;
    
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <ProfileDashboard />
            <ProfileInfo customer={currentCustomer} />
          </>
        );
      case 'orders':
        return <OrderHistory />;
      case 'addresses':
        return <AddressBook />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return null;
    }
  };

  if (!currentCustomer) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-bgColor to-lightBgColor py-4 sm:py-8 lg:py-16 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          <ProfileHeader customer={currentCustomer} />
          
          <div className="bg-white rounded-xl shadow-premium overflow-hidden">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-4 sm:p-6 lg:p-8">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
