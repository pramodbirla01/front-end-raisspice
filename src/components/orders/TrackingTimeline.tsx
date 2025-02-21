import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface TrackingEvent {
  activity: string;
  date: string;
  location: string;
  status?: 'completed' | 'current' | 'upcoming';
}

interface TrackingTimelineProps {
  events: TrackingEvent[];
  isLoading?: boolean;
}

export default function TrackingTimeline({ events, isLoading = false }: TrackingTimelineProps) {
  // Default timeline events for dummy display
  const dummyEvents: TrackingEvent[] = [
    {
      activity: 'Order Placed',
      date: new Date().toISOString(),
      location: 'Online',
      status: 'completed'
    },
    {
      activity: 'Order Confirmed',
      date: new Date().toISOString(),
      location: 'System',
      status: 'current'
    },
    {
      activity: 'Processing',
      date: '',
      location: 'Warehouse',
      status: 'upcoming'
    },
    {
      activity: 'Shipped',
      date: '',
      location: 'Logistics Partner',
      status: 'upcoming'
    },
    {
      activity: 'Out for Delivery',
      date: '',
      location: 'Local Courier',
      status: 'upcoming'
    },
    {
      activity: 'Delivered',
      date: '',
      location: 'Delivery Address',
      status: 'upcoming'
    }
  ];

  if (isLoading) {
    // ...existing loading state code...
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayEvents = events.length > 0 ? events : dummyEvents;

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-green-500',
          line: 'bg-green-500',
          icon: true
        };
      case 'current':
        return {
          dot: 'bg-blue-500',
          line: 'bg-gray-200',
          icon: false
        };
      default:
        return {
          dot: 'bg-gray-200',
          line: 'bg-gray-200',
          icon: false
        };
    }
  };

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {displayEvents.map((event, eventIdx) => {
          const styles = getStatusStyles(event.status);
          return (
            <li key={eventIdx}>
              <div className="relative pb-8">
                {eventIdx !== displayEvents.length - 1 && (
                  <span
                    className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${styles.line}`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${styles.dot}`}>
                      {styles.icon ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className={`text-sm font-medium ${event.status === 'completed' ? 'text-green-600' : 'text-gray-900'}`}>
                        {event.activity}
                      </p>
                      <p className="text-sm text-gray-500">{event.location}</p>
                    </div>
                    {event.date && (
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        {format(new Date(event.date), 'PPp')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
