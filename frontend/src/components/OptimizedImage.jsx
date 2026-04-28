import React, { useState, useRef, useEffect } from "react";

/**
 * OptimizedImage — A performance-first image component.
 * 
 * Features:
 * - Intersection Observer lazy loading (loads only when entering viewport)
 * - Blur-up placeholder effect while loading
 * - Graceful fallback on error
 * - Smooth fade-in animation on load
 */
const OptimizedImage = ({
  src,
  alt = "",
  className = "",
  fallbackText = "Food",
  style = {},
  rootMargin = "200px", // Start loading 200px before entering viewport
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = (e) => {
    setError(true);
    e.target.onerror = null;
    e.target.src = `https://placehold.co/400x300?text=${encodeURIComponent(fallbackText)}`;
  };

  return (
    <div
      ref={imgRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f3f4f6",
        ...style,
      }}
    >
      {inView && (
        <img
          src={error ? `https://placehold.co/400x300?text=${encodeURIComponent(fallbackText)}` : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "opacity 0.4s ease-in-out",
            opacity: loaded || error ? 1 : 0,
          }}
          {...props}
        />
      )}

      {/* Skeleton pulse while loading */}
      {!loaded && !error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s ease-in-out infinite",
          }}
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
