// zonta-site/src/components/ProtectedRoute.tsx

import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      setIsValid(false);
      return;
    }

    try {
      // 🧠 Decode JWT payload
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      if (payload.exp && payload.exp < now) {
        console.warn(" Token expired. Logging out...");
        localStorage.removeItem("adminToken");
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch (err) {
      console.error(" Invalid token:", err);
      localStorage.removeItem("adminToken");
      setIsValid(false);
    }
  }, []);

  // Show temporary message during token check
  if (isValid === null) {
    return (
      <div className="flex items-center justify-center h-screen text-zontaRed text-lg">
        Checking authentication...
      </div>
    );
  }

  // Redirect to login if invalid or missing
  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  // Token is valid → render child components
  return <>{children}</>;
}
