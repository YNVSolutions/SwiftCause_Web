import * as React from "react";

// Mobile: 0–767px
const MOBILE_BREAKPOINT = 768;
// Tablet portrait should use mobile layout logic: 768–1049px and portrait orientation.
const TABLET_PORTRAIT_MAX = 1049;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const tabletPortraitMql = window.matchMedia(
      `(min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_PORTRAIT_MAX}px) and (orientation: portrait)`
    );
    const onChange = () => {
      const isPhone = window.innerWidth < MOBILE_BREAKPOINT;
      const isTabletPortrait = tabletPortraitMql.matches;
      setIsMobile(isPhone || isTabletPortrait);
    };
    mql.addEventListener("change", onChange);
    tabletPortraitMql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    onChange();
    return () => {
      mql.removeEventListener("change", onChange);
      tabletPortraitMql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
