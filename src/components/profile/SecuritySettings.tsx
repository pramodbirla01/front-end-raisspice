import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

export default function SecuritySettings() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="bg-white shadow-premium rounded-xl p-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-800 to-gold-500 bg-clip-text text-transparent mb-6">
        Security Settings
      </h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
          </div>
          <button className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors">
            Enable 2FA
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Password</h3>
            <p className="text-sm text-gray-500">Last changed 30 days ago</p>
          </div>
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Change Password
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Login Sessions</h3>
            <p className="text-sm text-gray-500">Manage your active sessions</p>
          </div>
          <button className="px-4 py-2 border border-red-800 text-red-800 rounded-lg hover:bg-red-50 transition-colors">
            View Sessions
          </button>
        </div>
      </div>

      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            {/* Password change form */}
          </div>
        </div>
      )}
    </div>
  );
}
