import { useCallback, useEffect, useState } from "react";

interface UseTourNavigationOptions {
  isTourOpen: boolean;
  onPopStateExit?: () => void;
}

export function useTourNavigation({
  isTourOpen,
  onPopStateExit,
}: UseTourNavigationOptions) {
  const [isTourActive, setIsTourActive] = useState(false);

  const startTour = useCallback(() => {
    setIsTourActive(true);
    if (typeof window !== "undefined") {
      window.history.pushState({ tour: true }, "", window.location.href);
    }
  }, []);

  const stopTour = useCallback((options?: { pushState?: boolean }) => {
    setIsTourActive(false);
    if (options?.pushState !== false && typeof window !== "undefined") {
      window.history.pushState({ tour: false }, "", window.location.href);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      if (!isTourOpen) return;
      stopTour();
      onPopStateExit?.();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isTourOpen, onPopStateExit, stopTour]);

  return { isTourActive, startTour, stopTour };
}
