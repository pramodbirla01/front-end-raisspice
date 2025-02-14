"use client"

import ClientLayout from './ClientLayout';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
// import { AuthProvider } from '@/contexts/AuthContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ClientLayout>{children}</ClientLayout>
      </AuthProvider>
    </Provider>
  );
}
