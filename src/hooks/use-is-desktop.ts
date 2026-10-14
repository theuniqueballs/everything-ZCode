import * as React from 'react';

const DESKTOP_BREAKPOINT = 1024;

/**
 * True at Tailwind's `lg:` breakpoint and up — i.e. when the catalog's
 * two-column (list + preview) layout is actually visible.
 *
 * The site previously used useIsMobile (<768px) to decide between the
 * inline preview and an overlay, which left a dead zone at 768–1023px
 * (tablets, narrow windows, preview panes): clicking a config did nothing
 * visible. useIsDesktop closes that gap — anything below lg gets the
 * slide-out detail sheet.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = () => setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    mql.addEventListener('change', onChange);
    setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isDesktop;
}
