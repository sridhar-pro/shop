import { useState, useEffect } from "react";

export default function useZoomLevel() {
  const [zoom, setZoom] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkZoom = () => {
      setIsDesktop(window.innerWidth >= 768);

      setZoom(window.devicePixelRatio || 1);
    };

    checkZoom();

    window.addEventListener("resize", checkZoom);
    window.addEventListener("orientationchange", checkZoom);

    return () => {
      window.removeEventListener("resize", checkZoom);
      window.removeEventListener("orientationchange", checkZoom);
    };
  }, []);

  return { zoom, isDesktop };
}
