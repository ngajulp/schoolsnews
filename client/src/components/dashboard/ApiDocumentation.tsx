import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface ApiEndpointGroup {
  name: string;
  count: number;
  isExpanded: boolean;
  endpoints: Array<{
    method: string;
    path: string;
    description: string;
    tags?: string[];
  }>;
}

export default function ApiDocumentation() {
  const [groups, setGroups] = useState<ApiEndpointGroup[]>([
    {
      name: "Authentication",
      count: 3,
      isExpanded: true,
      endpoints: [
        { 
          method: "POST", 
          path: "/api/v1/auth/login", 
          description: "Authenticate user and return JWT token",
          tags: ["JWT"] 
        },
        { 
          method: "POST", 
          path: "/api/v1/auth/refresh", 
          description: "Refresh JWT token before expiration",
          tags: ["JWT"] 
        },
        { 
          method: "POST", 
          path: "/api/v1/auth/logout", 
          description: "Invalidate current JWT token",
          tags: ["JWT"] 
        },
      ]
    },
    {
      name: "Utilisateurs",
      count: 5,
      isExpanded: false,
      endpoints: []
    },
    {
      name: "Apprenants",
      count: 4,
      isExpanded: false,
      endpoints: []
    }
  ]);

  // This would normally fetch API documentation from the backend
  const { data, isLoading } = useQuery({
    queryKey: ['/api/v1/docs'],
    staleTime: Infinity,
    enabled: false, // Disable the query for now as we're using mock data
  });

  const toggleExpand = (index: number) => {
    setGroups(groups.map((group, i) => 
      i === index ? { ...group, isExpanded: !group.isExpanded } : group
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">API Documentation</h2>
          <div className="flex space-x-2">
            <a 
              href="/swagger" 
              target="_blank" 
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Swagger UI
            </a>
            <a 
              href="/api/v1/swagger.json" 
              target="_blank" 
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              OpenAPI JSON
            </a>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Endpoints Groups */}
          {isLoading ? (
            <div className="text-center py-4">Loading API documentation...</div>
          ) : (
            groups.map((group, groupIndex) => (
              <div key={groupIndex} className="border border-gray-200 rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <button 
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => toggleExpand(groupIndex)}
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{group.name}</span>
                      <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{group.count} endpoints</span>
                    </div>
                    <i className={`fas fa-chevron-${group.isExpanded ? 'down' : 'right'} text-gray-500`}></i>
                  </button>
                </div>
                {group.isExpanded && (
                  <div className="px-4 py-3">
                    <div className="space-y-2">
                      {group.endpoints.map((endpoint, endpointIndex) => (
                        <div key={endpointIndex} className="flex items-start py-2 border-b border-gray-100 last:border-b-0">
                          <span className={`px-2 py-1 ${
                            endpoint.method === 'GET' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-green-100 text-green-800'
                          } rounded text-xs mr-2`}>
                            {endpoint.method}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap">
                              <p className="font-mono text-xs">{endpoint.path}</p>
                              {endpoint.tags?.map((tag, tagIndex) => (
                                <span key={tagIndex} className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{endpoint.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
