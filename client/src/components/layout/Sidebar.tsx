import { useState } from "react";
import { Link, useLocation } from "wouter";

interface NavItem {
  icon: string;
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Core",
    items: [
      { icon: "fas fa-chart-line", label: "Dashboard", path: "/" },
      { icon: "fas fa-code", label: "API Endpoints", path: "/api-endpoints" },
      { icon: "fas fa-shield-alt", label: "Authentication", path: "/authentication" },
      { icon: "fas fa-user-shield", label: "User Roles", path: "/user-roles" }
    ]
  },
  {
    title: "Resources",
    items: [
      { icon: "fas fa-graduation-cap", label: "Établissements", path: "/etablissements" },
      { icon: "fas fa-users", label: "Utilisateurs", path: "/utilisateurs" },
      { icon: "fas fa-user-graduate", label: "Apprenants", path: "/apprenants" },
      { icon: "fas fa-chalkboard-teacher", label: "Classes", path: "/classes" },
      { icon: "fas fa-book", label: "Matières", path: "/matieres" }
    ]
  },
  {
    title: "Monitoring",
    items: [
      { icon: "fas fa-heartbeat", label: "Health Checks", path: "/health-checks" },
      { icon: "fas fa-tachometer-alt", label: "Performance", path: "/performance" },
      { icon: "fas fa-exclamation-circle", label: "Error Logs", path: "/error-logs" }
    ]
  },
  {
    title: "Documentation",
    items: [
      { icon: "fas fa-book-open", label: "API Docs", path: "/api-docs" },
      { icon: "fas fa-code", label: "Swagger UI", path: "/swagger" }
    ]
  }
];

export default function Sidebar({ collapsed = false, setCollapsed }: { collapsed: boolean, setCollapsed: (collapsed: boolean) => void }) {
  const [location] = useLocation();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-primary-950 text-white transition-all duration-300 overflow-y-auto flex-shrink-0 h-screen`}>
      <div className="p-4 border-b border-primary-800">
        <div className="flex items-center space-x-2">
          <i className="fas fa-database text-primary-400"></i>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-semibold">SchoolAPI</h1>
              <p className="text-xs text-gray-400 mt-1">Backend Administration</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="mt-4">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="px-4 py-2">
            {!collapsed && <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">{group.title}</p>}
            <ul className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Link href={item.path}>
                    <a className={`flex items-center ${collapsed ? 'justify-center' : ''} px-4 py-2 text-sm ${location === item.path ? 'bg-primary-800' : 'text-gray-300 hover:bg-primary-800'} rounded-md`}>
                      <i className={`${item.icon} ${collapsed ? '' : 'w-5 h-5 mr-3'}`}></i>
                      {!collapsed && <span>{item.label}</span>}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      <div className="px-4 py-2 mt-8 mb-4">
        <Link href="/settings">
          <a className={`flex items-center ${collapsed ? 'justify-center' : ''} px-4 py-2 text-sm text-gray-300 hover:bg-primary-800 rounded-md`}>
            <i className={`fas fa-cog ${collapsed ? '' : 'w-5 h-5 mr-3'}`}></i>
            {!collapsed && <span>Settings</span>}
          </a>
        </Link>
        <Link href="/help">
          <a className={`flex items-center ${collapsed ? 'justify-center' : ''} px-4 py-2 text-sm text-gray-300 hover:bg-primary-800 rounded-md`}>
            <i className={`fas fa-question-circle ${collapsed ? '' : 'w-5 h-5 mr-3'}`}></i>
            {!collapsed && <span>Help</span>}
          </a>
        </Link>
      </div>
    </aside>
  );
}
