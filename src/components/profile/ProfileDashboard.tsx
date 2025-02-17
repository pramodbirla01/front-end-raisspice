import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { formatCurrency } from '@/utils/formatCurrency';
import { Order } from '@/types/order';

export default function ProfileDashboard() {
  const { allOrders } = useSelector((state: RootState) => state.orders);
  const totalSpent = allOrders.reduce((sum: number, order: Order) => sum + order.total_price, 0);
  const orderCount = allOrders.length;

  const getMemberStatus = (spent: number) => {
    if (spent >= 25000) return 'Premium';
    if (spent >= 10000) return 'Gold';
    if (spent >= 5000) return 'Silver';
    return 'Regular';
  };

  const getNextTier = (spent: number) => {
    if (spent >= 25000) return null;
    if (spent >= 10000) return { name: 'Premium', target: 25000 };
    if (spent >= 5000) return { name: 'Gold', target: 10000 };
    return { name: 'Silver', target: 5000 };
  };

  const memberStatus = getMemberStatus(totalSpent);
  const nextTier = getNextTier(totalSpent);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="group hover:scale-105 transition-all duration-300 ease-out">
        <div className="relative overflow-hidden bg-gradient-to-br from-red-800 to-red-700 rounded-xl p-6 text-white shadow-premium">
          <div className="absolute inset-0 bg-premium-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-white/80">Total Spent</h3>
            <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gold-200">
              {formatCurrency(totalSpent)}
            </p>
            <div className="mt-4 text-sm text-white/70">Lifetime purchases</div>
          </div>
        </div>
      </div>

      <div className="group hover:scale-105 transition-all duration-300 ease-out">
        <div className="relative overflow-hidden bg-gradient-to-br from-gold-400 to-premium-600 rounded-xl p-6 text-white shadow-premium">
          <div className="absolute inset-0 bg-premium-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-white/80">Member Status</h3>
            <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gold-200">
              {memberStatus}
            </p>
            <div className="mt-4">
              {nextTier && (
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500"
                    style={{ width: `${(totalSpent / nextTier.target) * 100}%` }}
                  ></div>
                </div>
              )}
              <p className="text-sm mt-2 text-white/70">
                {nextTier 
                  ? `${formatCurrency(nextTier.target - totalSpent)} until ${nextTier.name}`
                  : 'Highest tier achieved!'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="group hover:scale-105 transition-all duration-300 ease-out">
        <div className="relative overflow-hidden bg-gradient-to-br from-premium-700 to-premium-800 rounded-xl p-6 text-white shadow-premium">
          <div className="absolute inset-0 bg-premium-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-white/80">Total Orders</h3>
            <p className="text-4xl font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gold-200">
              {orderCount}
            </p>
            <div className="mt-4 text-sm text-white/70">Orders placed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
