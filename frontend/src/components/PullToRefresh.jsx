import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export default function PullToRefresh({ onRefresh, children }) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const pullThreshold = 80;

  const handleTouchStart = (e) => {
    // Only enable pull-to-refresh if we are at the top of the page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;
    const y = e.touches[0].clientY;
    const diff = y - startY;

    if (diff > 0) {
      // Pulling down
      // Use a damping factor so it gets harder to pull the further you go
      const dampedDiff = Math.min(diff * 0.4, pullThreshold + 20);
      setCurrentY(dampedDiff);
      
      // Prevent default scrolling if we are actively pulling down
      if (e.cancelable) {
        // e.preventDefault() is called via native event listener to satisfy passive event issues
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (currentY >= pullThreshold && !isRefreshing) {
      setIsRefreshing(true);
      setCurrentY(pullThreshold / 2); // Snap back to a loading height
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setCurrentY(0);
      }
    } else {
      // Didn't pull far enough, reset
      setCurrentY(0);
    }
  };

  useEffect(() => {
    const container = document.getElementById('pull-to-refresh-container');
    const moveHandler = (e) => {
      if (!isPulling || isRefreshing) return;
      const y = e.touches[0].clientY;
      if (y - startY > 0 && e.cancelable) {
        e.preventDefault();
      }
    };

    if (container) {
      container.addEventListener('touchmove', moveHandler, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('touchmove', moveHandler);
      }
    };
  }, [isPulling, isRefreshing, startY]);

  return (
    <div 
      id="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full relative"
    >
      {/* Indicator */}
      <div 
        className="absolute top-0 left-0 w-full flex justify-center items-center overflow-hidden z-[100] pointer-events-none"
        style={{ 
          height: `${currentY}px`,
          opacity: currentY / pullThreshold
        }}
      >
        <div className={`p-2 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
             style={{ transform: `rotate(${currentY * 3}deg)` }}
        >
          <FiRefreshCw className="text-cyan-500 w-5 h-5" />
        </div>
      </div>

      {/* Main Content (shifts down slightly when pulling) */}
      <div 
        className="transition-transform duration-200 w-full flex flex-col items-center"
        style={{ transform: `translateY(${currentY}px)` }}
      >
        {children}
      </div>
    </div>
  );
}