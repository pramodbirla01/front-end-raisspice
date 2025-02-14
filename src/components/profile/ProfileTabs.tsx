import React, { JSX } from 'react';

export type TabType = 'profile' | 'orders' | 'addresses';

interface TabItem {
  id: TabType;
  label: string;
  icon: JSX.Element;
}

interface ProfileTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: TabItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    id: 'addresses',
    label: 'Addresses',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
];

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 overflow-x-auto">
      <div className="max-w-5xl mx-auto">
        <nav className="-mb-px flex min-w-full sm:min-w-0" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex-1 sm:flex-none group inline-flex items-center justify-center
                py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm
                hover:bg-gray-50 rounded-t-lg transition-all duration-200 min-w-[80px] sm:min-w-[120px]
                ${activeTab === tab.id
                  ? 'border-red-800 text-red-800 bg-white shadow-inner-glow'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className={`
                sm:mr-2 transition-all duration-200 transform group-hover:scale-110
                ${activeTab === tab.id
                  ? 'text-red-800'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
