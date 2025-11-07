// zonta-site/src/context/LoadingContext.ts

import { createContext } from "react";

export interface LoadingContextValue {
  startLoading: () => void;
  stopLoading: () => void;
}

export const LoadingContext = createContext<LoadingContextValue | null>(null);
