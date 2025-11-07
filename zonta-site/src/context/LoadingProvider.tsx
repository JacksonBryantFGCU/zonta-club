// zonta-site/src/context/LoadingProvider.tsx

import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { LoadingContext } from "./LoadingContext";

NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.15 });

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const startLoading = () => NProgress.start();
  const stopLoading = () => NProgress.done();

  useEffect(() => {
    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}