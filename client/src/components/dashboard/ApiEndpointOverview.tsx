import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Endpoint {
  endpoint: string;
  method: string;
  rateLimit: string;
  requests: number;
  avgResponse: string;
  status: 'Healthy' | 'Warning' | 'Error';
}

export default function ApiEndpointOverview() {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const { data: endpoints, isLoading } = useQuery<Endpoint[]>({
    queryKey: ['/api/v1/metrics/endpoints'],
    staleTime: 60000, // 1 minute
  });
  
  const filters = ['All', 'Users', 'Classes', 'Apprenants', 'More'];
  
  const filteredEndpoints = endpoints || [
    {
      endpoint: '/api/v1/auth/login',
      method: 'POST',
      rateLimit: '10/min',
      requests: 12488,
      avgResponse: '38ms',
      status: 'Healthy',
    },
    {
      endpoint: '/api/v1/utilisateurs',
      method: 'GET',
      rateLimit: '100/min',
      requests: 8245,
      avgResponse: '124ms',
      status: 'Healthy',
    },
    {
      endpoint: '/api/v1/classes',
      method: 'GET',
      rateLimit: '100/min',
      requests: 6721,
      avgResponse: '87ms',
      status: 'Healthy',
    },
    {
      endpoint: '/api/v1/apprenants',
      method: 'GET',
      rateLimit: '50/min',
      requests: 5832,
      avgResponse: '156ms',
      status: 'Warning',
    },
    {
      endpoint: '/api/v1/matieres',
      method: 'GET',
      rateLimit: '100/min',
      requests: 4217,
      avgResponse: '45ms',
      status: 'Healthy',
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">API Endpoints Overview</h2>
          <button className="text-sm text-primary-600 hover:text-primary-800">View All</button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm mb-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1 ${
                  activeFilter === filter
                    ? "bg-primary-600 text-white"
                    : "hover:bg-gray-100"
                } rounded-md whitespace-nowrap`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-2">Endpoint</th>
                <th className="px-4 py-2">Method</th>
                <th className="px-4 py-2">Rate Limit</th>
                <th className="px-4 py-2">Requests (24h)</th>
                <th className="px-4 py-2">Avg. Response</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center">Loading...</td>
                </tr>
              ) : (
                filteredEndpoints.map((endpoint, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 font-mono text-xs">{endpoint.endpoint}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 ${
                        endpoint.method === 'GET' 
                          ? 'bg-green-100 text-green-800' 
                          : endpoint.method === 'POST'
                            ? 'bg-blue-100 text-blue-800'
                            : endpoint.method === 'PUT'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                      } rounded text-xs`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-4 py-3">{endpoint.rateLimit}</td>
                    <td className="px-4 py-3">{endpoint.requests.toLocaleString()}</td>
                    <td className="px-4 py-3">{endpoint.avgResponse}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 ${
                        endpoint.status === 'Healthy' 
                          ? 'bg-green-100 text-green-800' 
                          : endpoint.status === 'Warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      } rounded-full text-xs`}>
                        {endpoint.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
