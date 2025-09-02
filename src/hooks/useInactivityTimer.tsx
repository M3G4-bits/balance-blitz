import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // timeout in milliseconds
  onTimeout: () => void;
  enabled?: boolean;
}

export const useInactivityTimer = ({ timeout, onTimeout, enabled = true }: UseInactivityTimerProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, timeout);
  }, [timeout, onTimeout, enabled]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearTimer();
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimerOnActivity = () => resetTimer();
    
    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimerOnActivity, true);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimerOnActivity, true);
      });
      clearTimer();
    };
  }, [resetTimer, clearTimer, enabled]);

  return { resetTimer, clearTimer };
};