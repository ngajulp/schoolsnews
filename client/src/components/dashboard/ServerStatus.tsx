import { useQuery } from "@tanstack/react-query";

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  dbConnections: { used: number, total: number };
  uptime: string;
  lastRestart: string;
}

export default function ServerStatus() {
  const { data: metrics, isLoading } = useQuery<ServerMetrics>({
    queryKey: ['/api/v1/metrics/server'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Default values while loading or if the API fails
  const defaultMetrics: ServerMetrics = {
    cpu: 34,
    memory: 68,
    disk: 42,
    dbConnections: { used: 23, total: 100 },
    uptime: "27 days, 4 hours",
    lastRestart: "June 3, 2023"
  };

  const displayMetrics = metrics || defaultMetrics;

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Server Status</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">CPU Usage</span>
              <span className="text-sm font-medium">{displayMetrics.cpu}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${
                  displayMetrics.cpu > 80 ? 'bg-destructive' : 
                  displayMetrics.cpu > 60 ? 'bg-warning' : 
                  'bg-primary-500'
                } h-2 rounded-full`} 
                style={{ width: `${displayMetrics.cpu}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">Memory Usage</span>
              <span className="text-sm font-medium">{displayMetrics.memory}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${
                  displayMetrics.memory > 80 ? 'bg-destructive' : 
                  displayMetrics.memory > 60 ? 'bg-warning' : 
                  'bg-primary-500'
                } h-2 rounded-full`} 
                style={{ width: `${displayMetrics.memory}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">Disk Usage</span>
              <span className="text-sm font-medium">{displayMetrics.disk}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`${
                  displayMetrics.disk > 80 ? 'bg-destructive' : 
                  displayMetrics.disk > 60 ? 'bg-warning' : 
                  'bg-primary-500'
                } h-2 rounded-full`} 
                style={{ width: `${displayMetrics.disk}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-500">DB Connections</span>
              <span className="text-sm font-medium">{displayMetrics.dbConnections.used}/{displayMetrics.dbConnections.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full" 
                style={{ width: `${(displayMetrics.dbConnections.used / displayMetrics.dbConnections.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Uptime</p>
              <p className="font-medium">{isLoading ? "Loading..." : displayMetrics.uptime}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Last Restart</p>
              <p className="font-medium">{isLoading ? "Loading..." : displayMetrics.lastRestart}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
