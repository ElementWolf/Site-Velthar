import { useEffect, useRef, useState } from 'react';

export function useMobileScrollHighlight() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Solo activar en pantallas touch
    if (typeof window === 'undefined' || !('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, active];
}
