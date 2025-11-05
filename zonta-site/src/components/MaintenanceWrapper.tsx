import { useLocation } from "react-router-dom";
import { usePublicSettings } from "../queries/publicSettingsQueries";

interface MaintenanceWrapperProps {
  children: React.ReactNode;
}

export default function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const { data: settings, isLoading } = usePublicSettings();
  const location = useLocation();

  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zontaRed mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow admin access even during maintenance
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Show maintenance page if enabled (only for public routes)
  if (settings?.maintenance.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zontaGold/10 to-zontaRed/10 p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zontaGold rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-zontaRed mb-4">
              Site Under Maintenance
            </h1>
          </div>
          
          {settings.maintenance.message && (
            <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">
              {settings.maintenance.message}
            </p>
          )}
          
          {!settings.maintenance.message && (
            <p className="text-lg text-gray-700 mb-6">
              We're currently performing scheduled maintenance. 
              Please check back soon!
            </p>
          )}
          
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Need immediate assistance? Contact us at{" "}
              <a 
                href="mailto:info@zontanaples.org" 
                className="text-zontaRed hover:underline"
              >
                info@zontanaples.org
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-3">
              <a 
                href="/admin/login" 
                className="text-zontaGold hover:underline"
              >
                Admin Access →
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normal operation - render children
  return <>{children}</>;
}
