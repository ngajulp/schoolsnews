import { useQuery } from "@tanstack/react-query";

interface ActivityEvent {
  id: string;
  type: 'error' | 'success' | 'info' | 'warning';
  icon: string;
  message: string;
  timestamp: string;
  timeAgo: string;
}

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery<ActivityEvent[]>({
    queryKey: ['/api/v1/activity/recent'],
    refetchInterval: 60000, // 1 minute
  });

  // Default activity events while loading or if the API fails
  const defaultActivities: ActivityEvent[] = [
    {
      id: "1",
      type: "error",
      icon: "fas fa-exclamation-triangle",
      message: "Failed login attempt from IP 192.168.1.42",
      timestamp: "2023-07-15T14:30:00Z",
      timeAgo: "2 minutes ago"
    },
    {
      id: "2",
      type: "info",
      icon: "fas fa-user-plus",
      message: "New user created: martin.dubois@ecole.fr",
      timestamp: "2023-07-15T14:15:00Z",
      timeAgo: "15 minutes ago"
    },
    {
      id: "3",
      type: "success",
      icon: "fas fa-check",
      message: "Database backup completed successfully",
      timestamp: "2023-07-15T13:30:00Z",
      timeAgo: "1 hour ago"
    },
    {
      id: "4",
      type: "warning",
      icon: "fas fa-exclamation",
      message: "API rate limit reached for endpoint: /api/v1/apprenants",
      timestamp: "2023-07-15T12:30:00Z",
      timeAgo: "2 hours ago"
    }
  ];

  const displayActivities = activities || defaultActivities;

  const getIconColors = (type: string) => {
    switch (type) {
      case 'error':
        return { bg: 'bg-red-100', text: 'text-red-500' };
      case 'success':
        return { bg: 'bg-green-100', text: 'text-green-500' };
      case 'info':
        return { bg: 'bg-blue-100', text: 'text-blue-500' };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-500' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading activity...</div>
          ) : (
            displayActivities.map((activity) => {
              const { bg, text } = getIconColors(activity.type);
              return (
                <div key={activity.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                      <i className={`${activity.icon} ${text} text-sm`}></i>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timeAgo}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="mt-4">
          <button className="w-full py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-100">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
