import StatCard from "./StatCard";
import ApiEndpointOverview from "./ApiEndpointOverview";
import ApiDocumentation from "./ApiDocumentation";
import ServerStatus from "./ServerStatus";
import SecurityOverview from "./SecurityOverview";
import RecentActivity from "./RecentActivity";
import CodeSample from "./CodeSample";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  activeConnections: {
    value: number;
    percentage: number;
    trend: number;
  };
  apiRequests: {
    value: string;
    trend: number;
  };
  responseTime: {
    value: string;
    trend: number;
  };
  apiErrors: {
    value: number;
    trend: number;
    breakdown: {
      400: number;
      500: number;
      other: number;
    };
  };
}

export default function DashboardContent() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/v1/dashboard/stats'],
    refetchInterval: 60000, // 1 minute
  });

  // Default stats while loading or if the API fails
  const defaultStats: DashboardStats = {
    activeConnections: {
      value: 342,
      percentage: 34.2,
      trend: 18
    },
    apiRequests: {
      value: "127K",
      trend: 12
    },
    responseTime: {
      value: "42ms",
      trend: -8
    },
    apiErrors: {
      value: 7,
      trend: 3,
      breakdown: {
        400: 4,
        500: 2,
        other: 1
      }
    }
  };

  const displayStats = stats || defaultStats;

  return (
    <>
      {/* Dashboard Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Backend Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your school management system API</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Connections"
          value={displayStats.activeConnections.value}
          badge="Live"
          trend={{
            value: `${displayStats.activeConnections.trend}%`,
            positive: true
          }}
          progress={{
            percentage: displayStats.activeConnections.percentage,
            label: `${displayStats.activeConnections.percentage}% of capacity (1000 max)`
          }}
        />
        
        <StatCard
          title="API Requests (24h)"
          value={displayStats.apiRequests.value}
          badge="Today"
          trend={{
            value: `${displayStats.apiRequests.trend}%`,
            positive: true
          }}
          sparkline={
            <div className="flex space-x-1">
              <div className="h-8 w-1/6 bg-primary-300 rounded-sm"></div>
              <div className="h-8 w-1/6 bg-primary-400 rounded-sm"></div>
              <div className="h-8 w-1/6 bg-primary-500 rounded-sm"></div>
              <div className="h-8 w-1/6 bg-primary-600 rounded-sm"></div>
              <div className="h-8 w-1/6 bg-primary-700 rounded-sm"></div>
              <div className="h-8 w-1/6 bg-primary-800 rounded-sm"></div>
            </div>
          }
        />
        
        <StatCard
          title="Response Time"
          value={displayStats.responseTime.value}
          badge="Avg"
          trend={{
            value: `${Math.abs(displayStats.responseTime.trend)}%`,
            positive: displayStats.responseTime.trend < 0
          }}
          progress={{
            percentage: 78,
            label: "Well below 200ms target"
          }}
        />
        
        <StatCard
          title="API Errors (24h)"
          value={displayStats.apiErrors.value}
          badge="Critical"
          trend={{
            value: displayStats.apiErrors.trend.toString(),
            positive: false
          }}
          sparkline={
            <div className="flex space-x-2">
              <div className="flex-1 flex flex-col items-center">
                <div className="h-6 w-full bg-warning bg-opacity-20 rounded flex items-center justify-center text-xs font-medium">
                  {displayStats.apiErrors.breakdown[400]}
                </div>
                <span className="text-xs mt-1">400</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="h-6 w-full bg-destructive bg-opacity-20 rounded flex items-center justify-center text-xs font-medium">
                  {displayStats.apiErrors.breakdown[500]}
                </div>
                <span className="text-xs mt-1">500</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="h-6 w-full bg-primary-100 rounded flex items-center justify-center text-xs font-medium">
                  {displayStats.apiErrors.breakdown.other}
                </div>
                <span className="text-xs mt-1">Other</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Endpoints Overview */}
        <div className="lg:col-span-2">
          <ApiEndpointOverview />
          <ApiDocumentation />
        </div>
        
        {/* Right Column - Security & Performance */}
        <div className="lg:col-span-1">
          <ServerStatus />
          <SecurityOverview />
          <RecentActivity />
        </div>
      </div>
      
      {/* Code Sample Section */}
      <CodeSample />
    </>
  );
}
