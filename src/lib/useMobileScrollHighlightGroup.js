import { useEffect, useRef, useState } from 'react';

export function useMobileScrollHighlightGroup(groupId) {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('ontouchstart' in window || navigator.maxTouchPoints > 0)) return;
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.__activeMobileHighlight = groupId;
          window.dispatchEvent(new CustomEvent('mobile-highlight-change', { detail: groupId }));
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [groupId]);

  useEffect(() => {
    const handler = (e) => {
      setActive(e.detail === groupId);
    };
    window.addEventListener('mobile-highlight-change', handler);
    // Estado inicial
    setActive(window.__activeMobileHighlight === groupId);
    return () => window.removeEventListener('mobile-highlight-change', handler);
  }, [groupId]);

  return [ref, active];
}
