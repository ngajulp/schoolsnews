import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    roles: string[];
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/v1/auth/login", credentials);
  const data = await response.json();
  
  // Store tokens in localStorage
  localStorage.setItem("token", data.token);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("user", JSON.stringify(data.user));
  
  // Dispatch storage event for other components to react
  window.dispatchEvent(new Event("storage"));
  
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/v1/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear stored tokens
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    // Dispatch storage event for other components to react
    window.dispatchEvent(new Event("storage"));
  }
}

export function getUser() {
  const userJson = localStorage.getItem("user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token");
}
