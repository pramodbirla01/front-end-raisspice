"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Password reset instructions have been sent to your email.');
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgColor py-28 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">Forgot Password</h2>
          <p className="mt-2 text-center text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full p-3 outline-none bg-[#f0ead4] border-none shadow-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}

          {message && (
            <div className="text-green-500 text-center text-sm">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center p-3 border border-transparent rounded-md shadow-sm font-medium text-white bg-red-800 hover:bg-black disabled:bg-gray-400"
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full text-center text-red-800 hover:underline"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;