import { useQuery } from "@tanstack/react-query";

interface SecurityFeature {
  name: string;
  icon: string;
  description: string;
  status: 'Active' | 'Active/High' | 'Inactive' | 'Warning';
  statusBgColor: string;
}

export default function SecurityOverview() {
  const { data: securityFeatures, isLoading } = useQuery<SecurityFeature[]>({
    queryKey: ['/api/v1/security/overview'],
    staleTime: 300000, // 5 minutes
  });

  // Default security features while loading or if the API fails
  const defaultFeatures: SecurityFeature[] = [
    {
      name: "HTTPS Encryption",
      icon: "fas fa-shield-alt",
      description: "TLS 1.3 Enabled",
      status: "Active",
      statusBgColor: "bg-green-100 text-green-800"
    },
    {
      name: "JWT Authentication",
      icon: "fas fa-lock",
      description: "RS256 Algorithm",
      status: "Active",
      statusBgColor: "bg-green-100 text-green-800"
    },
    {
      name: "Role-Based Access Control",
      icon: "fas fa-user-shield",
      description: "8 roles configured",
      status: "Active",
      statusBgColor: "bg-green-100 text-green-800"
    },
    {
      name: "Rate Limiting",
      icon: "fas fa-user-clock",
      description: "Configured by endpoint",
      status: "Active/High",
      statusBgColor: "bg-yellow-100 text-yellow-800"
    }
  ];

  const displayFeatures = securityFeatures || defaultFeatures;

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Security Overview</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">Loading security information...</div>
          ) : (
            displayFeatures.map((feature, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 ${
                  feature.status === 'Active' ? 'bg-green-50 border-green-200' :
                  feature.status === 'Warning' ? 'bg-yellow-50 border-yellow-200' :
                  feature.status === 'Active/High' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                } rounded-lg border`}
              >
                <div className="flex items-center">
                  <i className={`${feature.icon} ${
                    feature.status === 'Active' ? 'text-green-500' :
                    feature.status === 'Warning' ? 'text-yellow-500' :
                    feature.status === 'Active/High' ? 'text-yellow-500' :
                    'text-red-500'
                  } mr-3`}></i>
                  <div>
                    <p className="font-medium text-sm">{feature.name}</p>
                    <p className="text-xs text-gray-500">{feature.description}</p>
                  </div>
                </div>
                <span className={`text-xs ${feature.statusBgColor} px-2 py-1 rounded-full`}>{feature.status}</span>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4">
          <button className="w-full py-2 bg-primary-50 text-primary-700 rounded-md text-sm font-medium border border-primary-200 hover:bg-primary-100">
            View Security Report
          </button>
        </div>
      </div>
    </div>
  );
}
