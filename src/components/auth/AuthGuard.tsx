"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { checkAuthStatus } from '@/store/slices/customerSlice';
import Cookies from 'js-cookie';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { currentCustomer, loading } = useSelector((state: RootState) => state.customer);

    // Wait for client-side hydration to complete
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const checkAuth = async () => {
            const storedData = localStorage.getItem('customer_data');
            const authToken = Cookies.get('auth_token');

            if (storedData && authToken) {
                const parsedData = JSON.parse(storedData);
                if (!currentCustomer) {
                    try {
                        await dispatch(checkAuthStatus());
                    } catch (error) {
                        if (requireAuth) {
                            router.push('/login');
                        }
                    }
                }
            } else if (requireAuth) {
                router.push('/login');
            }
        };

        checkAuth();
    }, [isClient, currentCustomer, dispatch, requireAuth, router]);

    // Return null during SSR to prevent hydration mismatch
    if (!isClient) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-800"></div>
            </div>
        );
    }

    return <>{children}</>;
}
