import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const codeExamples = {
  authentication: `// Example API authentication using JWT

// 1. Login request
const loginUser = async (email, password) => {
  try {
    const response = await fetch('https://api.example.com/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    
    // Store token in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// 2. Including JWT in requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': \`Bearer \${token}\`,
    },
  };
  
  const response = await fetch(url, authOptions);
  
  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return fetchWithAuth(url, options);
    }
  }
  
  return response;
};

// 3. Refresh token function
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  try {
    const response = await fetch('https://api.example.com/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Refresh failed, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return false;
    }
    
    localStorage.setItem('token', data.token);
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};`,

  dataRequests: `// Example data fetching with error handling

// 1. Get all users
const getUsers = async () => {
  try {
    const response = await fetchWithAuth('https://api.example.com/api/v1/utilisateurs');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch users');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// 2. Get user by ID
const getUserById = async (userId) => {
  try {
    const response = await fetchWithAuth(\`https://api.example.com/api/v1/utilisateurs/\${userId}\`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || \`Failed to fetch user \${userId}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(\`Error fetching user \${userId}:\`, error);
    throw error;
  }
};

// 3. Create a new user
const createUser = async (userData) => {
  try {
    const response = await fetchWithAuth('https://api.example.com/api/v1/utilisateurs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create user');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};`,

  errorHandling: `// Example error handling for API requests

// 1. Custom Error class
class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 2. Global fetch wrapper with error handling
const apiFetch = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    // Add authorization header if token exists
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': \`Bearer \${token}\`
      };
    }
    
    // Add default headers
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    const response = await fetch(url, options);
    
    // Handle 401 Unauthorized with token refresh
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request
        return apiFetch(url, options);
      } else {
        // Redirect to login
        window.location.href = '/login';
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }
    
    // Handle other errors
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData
      );
    }
    
    // If response is 204 No Content, return null
    if (response.status === 204) {
      return null;
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new ApiError('Network error. Please check your connection.', 0);
    }
    
    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle unknown errors
    throw new ApiError(error.message || 'Unknown error', 0);
  }
};`
};

export default function CodeSample() {
  const [activeTab, setActiveTab] = useState<"authentication" | "dataRequests" | "errorHandling">("authentication");
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeExamples[activeTab]);
    toast({
      title: "Code copied",
      description: "The code example has been copied to your clipboard",
    });
  };

  return (
    <div className="mt-6 bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Quick Implementation Examples</h2>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex space-x-2 mb-2 overflow-x-auto">
            <button 
              className={`px-3 py-1 text-sm rounded-md ${activeTab === "authentication" ? "bg-primary-600 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setActiveTab("authentication")}
            >
              Authentication
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${activeTab === "dataRequests" ? "bg-primary-600 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setActiveTab("dataRequests")}
            >
              Data Requests
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md ${activeTab === "errorHandling" ? "bg-primary-600 text-white" : "hover:bg-gray-100"}`}
              onClick={() => setActiveTab("errorHandling")}
            >
              Error Handling
            </button>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-gray-400 text-xs">
              {activeTab === "authentication" && "Authentication.js"}
              {activeTab === "dataRequests" && "DataRequests.js"}
              {activeTab === "errorHandling" && "ErrorHandling.js"}
            </div>
          </div>
          
          <div className="p-4 font-mono text-xs text-gray-300 overflow-x-auto max-h-[400px]">
            <pre>
              <code>{codeExamples[activeTab]}</code>
            </pre>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            {activeTab === "authentication" && "This example demonstrates a complete authentication flow with JWT, including login, token refresh, and authenticated requests. Implement this pattern to securely communicate with the School Management API."}
            {activeTab === "dataRequests" && "This example shows how to fetch, create, and update data using the School Management API with proper error handling and authentication."}
            {activeTab === "errorHandling" && "This example demonstrates robust error handling for API requests, including token refresh, network errors, and specific API error responses."}
          </p>
          <div className="mt-2 flex space-x-2">
            <button 
              className="text-primary-600 hover:text-primary-800 flex items-center"
              onClick={handleCopyCode}
            >
              <i className="fas fa-copy mr-1"></i> Copy Code
            </button>
            <button className="text-primary-600 hover:text-primary-800 flex items-center">
              <i className="fas fa-download mr-1"></i> Download Example
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
