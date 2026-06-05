import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Update canonical link dynamically
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      // Clean up trailing slash to prevent duplicate content issues
      const cleanPath = pathname === '/' ? '' : pathname.replace(/\/$/, '');
      canonical.href = `https://sakharpuda.com${cleanPath}`;
    }
  }, [pathname]);

  return null;
}
