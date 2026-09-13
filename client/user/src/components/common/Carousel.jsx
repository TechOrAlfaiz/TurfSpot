import React, { useState, useEffect, useRef, useCallback } from "react";

// Configurable autoplay interval (increased rate to 2.5 seconds)
export const AUTOPLAY_INTERVAL_MS = 2500;

const Carousel = ({ slides = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true
  );

  const timerRef = useRef(null);
  const totalSlides = slides.length;

  // Existing slide-change logic reusing modulo indexing
  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Reset / restart autoplay timer from current moment
  const resetAutoplayTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isPaused && isTabVisible && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, AUTOPLAY_INTERVAL_MS);
    }
  }, [isPaused, isTabVisible, totalSlides, nextSlide]);

  // Autoplay management effect
  useEffect(() => {
    resetAutoplayTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resetAutoplayTimer]);

  // Page Visibility API: pause when tab is inactive, resume when active
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Manual navigation handlers
  const handleManualPrev = () => {
    prevSlide();
    resetAutoplayTimer();
  };

  const handleManualNext = () => {
    nextSlide();
    resetAutoplayTimer();
  };

  return (
    <div
      className="relative w-full h-[400px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentSlide
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={slide}
            className="w-full h-full object-cover"
            alt={`Turf ${index + 1}`}
          />
        </div>
      ))}
      {/* Left/Right arrows made invisible per user request */}
      <div className="hidden">
        <button
          onClick={handleManualPrev}
          className="btn btn-circle"
          aria-label="Previous slide"
        >
          ❮
        </button>
        <button
          onClick={handleManualNext}
          className="btn btn-circle"
          aria-label="Next slide"
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default Carousel;