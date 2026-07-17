import { useState } from "react";

const BASE = import.meta.env.BASE_URL; // "/acs-varshan/"

/**
 * LazyImage — reusable image component with:
 *  - Lazy loading (native)
 *  - Skeleton shimmer while loading
 *  - Smooth fade-in on load
 *  - Error fallback to placeholder
 *  - Consistent aspect ratio via container
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  fallbackSrc = `${BASE}images/ro-system.svg`,
  objectFit = "contain",
  onLoad: onLoadProp,
  onError: onErrorProp,
}) {
  const [status, setStatus] = useState("loading"); // loading | loaded | error

  const handleLoad = (e) => {
    setStatus("loaded");
    if (e.currentTarget.previousElementSibling) {
      e.currentTarget.previousElementSibling.style.display = "none";
    }
    onLoadProp?.(e);
  };

  const handleError = () => {
    setStatus("error");
    onErrorProp?.();
  };

  return (
    <div className={`lazy-image-container ${containerClassName}`}>
      {status === "loading" && <div className="lazy-image-skeleton" />}

      {status === "error" ? (
        <div className="lazy-image-fallback">
          <img
            src={fallbackSrc}
            alt={alt || "Image not available"}
            className="lazy-image-fallback-img"
            style={{ objectFit }}
            loading="lazy"
          />
          <span className="lazy-image-fallback-label">Image Coming Soon</span>
        </div>
      ) : (
        <img
          src={status === "error" ? fallbackSrc : src}
          alt={alt}
          className={`lazy-image-img ${status === "loaded" ? "lazy-loaded" : ""} ${className}`}
          style={{ objectFit }}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
