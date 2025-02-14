"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/store/slices/customerSlice';

export default function ForgotPasswordPage(){
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await requestPasswordReset(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Password reset request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bgColor py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full ">
                {/* Logo and Title */}
                <div className="login_heading flex flex-col gap-2">
                    <h1 className='text-center text-4xl font-bold'>Forgot Password</h1>
                    <ul className='flex justify-center gap-3'>
                        <li className='text-red-800'>Home</li>
                        <li>Reset Password</li>
                    </ul>
                </div>

                {/* Reset Password Form */}
                <div className="mt-8 space-y-8 bg-bgColor p-8 rounded-lg shadow-md">
                    <div className="mb-8">
                        <h3 className="text-3xl text-center font-semibold mb-2">Reset Password</h3>
                        <p className="text-center text-gray-600">
                            Enter your email address to request password reset.
                        </p>
                    </div>

                    <form className=" space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Enter your email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none block w-full p-3 outline-none border-none bg-[#f0ead4] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-center">{error}</div>}
                        {success && (
                            <div className="text-green-500 text-center">
                                Password reset instructions have been sent to your email
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                        >
                            {loading ? 'Sending...' : 'Send Mail'}
                        </button>

                        <div className="text-center text-sm">
                            <span className="text-gray-600">Remember Password? </span>
                            <Link href="/login" className="text-red-800 underline font-medium hover:text-rose-500">
                                Login
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};