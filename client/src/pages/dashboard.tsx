import Layout from "@/components/layout/Layout";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { isAuthenticated } from "@/lib/auth";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      setLocation("/login");
    }
  }, [setLocation]);

  if (!isAuthenticated()) {
    return null; // Don't render anything while redirecting
  }

  return (
    <Layout>
      <DashboardContent />
    </Layout>
  );
}
