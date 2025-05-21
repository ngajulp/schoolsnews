import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  badge?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  progress?: {
    percentage: number;
    label: string;
  };
  sparkline?: ReactNode;
}

export default function StatCard({
  title,
  value,
  badge,
  trend,
  progress,
  sparkline
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {badge && (
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">{badge}</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span 
            className={`${
              trend.positive 
                ? "bg-success bg-opacity-10 text-success" 
                : "bg-destructive bg-opacity-10 text-destructive"
            } px-2 py-1 text-xs rounded-full flex items-center`}
          >
            <i className={`fas fa-arrow-${trend.positive ? "up" : "down"} mr-1`}></i> {trend.value}
          </span>
        )}
      </div>
      {progress && (
        <div className="mt-4 h-10">
          <div className="relative h-2 bg-gray-200 rounded">
            <div 
              className="absolute h-2 bg-primary-500 rounded" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{progress.label}</p>
        </div>
      )}
      {sparkline && (
        <div className="mt-4">
          {sparkline}
        </div>
      )}
    </div>
  );
}
