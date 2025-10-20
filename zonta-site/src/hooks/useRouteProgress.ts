import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLoading } from "./useLoading";

export function useRouteProgress() {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    // Start progress bar when route changes
    startLoading();
    const timer = setTimeout(() => stopLoading(), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}
