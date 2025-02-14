'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (token) {
      setShowModal(true);
    }
  }, [token]);

  const handleSuccess = () => {
    setShowModal(false);
    router.push('/login?reset=success');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800">Invalid Reset Link</h1>
          <p className="mt-2">This password reset link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <ResetPasswordModal
          token={token}
          onClose={() => router.push('/login')}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default ResetPasswordPage;
