import { useEffect, useRef, useState, useCallback } from 'react';

// Throttle function optimizada
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

export function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const observerRef = useRef(null);

  // Scroll handler simplificado
  const handleScroll = useCallback(throttle(() => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    const threshold = isMobile ? 0.2 : 0.3;
    
    const isVisible = rect.top < windowHeight * (1 - threshold) && rect.bottom > windowHeight * threshold;
    
    if (isVisible && !hasBeenVisible) {
      setVisible(true);
      setHasBeenVisible(true);
    }
  }, 16), [hasBeenVisible]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Intersection Observer simplificado
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isMobile = window.innerWidth <= 768;
          const threshold = isMobile ? 0.2 : 0.3;
          
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            setVisible(true);
            setHasBeenVisible(true);
          }
        });
      },
      {
        threshold: [0.2, 0.3, 0.5],
        rootMargin: '0px 0px -10% 0px'
      }
    );

    observer.observe(element);
    observerRef.current = observer;

    // Scroll event como fallback
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { ref, visible, hasBeenVisible };
}

export function ScrollReveal({ children, className = "", delay = 0, ...props }) {
  const { ref, visible } = useScrollReveal();

  const animationStyle = {
    transform: visible ? 'translateY(0)' : 'translateY(40px)',
    opacity: visible ? 1 : 0,
    transition: `all 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
  };

  return (
    <div
      ref={ref}
      className={className}
      style={animationStyle}
      {...props}
    >
      {children}
    </div>
  );
} 