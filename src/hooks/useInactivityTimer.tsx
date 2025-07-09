import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInactivityTimerProps {
  timeout: number; // em milissegundos
  warningTime: number; // tempo em milissegundos antes do timeout para mostrar aviso
  onWarning: () => void;
  onTimeout: () => void;
  enabled?: boolean;
}

export const useInactivityTimer = ({
  timeout,
  warningTime,
  onWarning,
  onTimeout,
  enabled = true
}: UseInactivityTimerProps) => {
  const [isWarningShown, setIsWarningShown] = useState(false);
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  
  const warningTimeoutRef = useRef<NodeJS.Timeout>();
  const mainTimeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    setIsWarningShown(false);
    setTimeUntilExpiry(0);
    startTimeRef.current = Date.now();

    // Limpar timers existentes
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Timer para mostrar aviso
    warningTimeoutRef.current = setTimeout(() => {
      if (enabled) {
        setIsWarningShown(true);
        onWarning();
        
        // Iniciar contagem regressiva
        const warningStartTime = Date.now();
        intervalRef.current = window.setInterval(() => {
          const elapsed = Date.now() - warningStartTime;
          const remaining = warningTime - elapsed;
          
          if (remaining <= 0) {
            setTimeUntilExpiry(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else {
            setTimeUntilExpiry(Math.ceil(remaining / 1000));
          }
        }, 1000);
      }
    }, timeout - warningTime);

    // Timer principal para logout
    mainTimeoutRef.current = setTimeout(() => {
      if (enabled) {
        onTimeout();
      }
    }, timeout);
  }, [timeout, warningTime, onWarning, onTimeout, enabled]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const forceTimeout = useCallback(() => {
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsWarningShown(false);
    setTimeUntilExpiry(0);
    onTimeout();
  }, [onTimeout]);

  // Inicializar timer quando enabled for true
  useEffect(() => {
    if (enabled) {
      resetTimer();
    } else {
      // Limpar timers quando disabled
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsWarningShown(false);
      setTimeUntilExpiry(0);
    }

    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (mainTimeoutRef.current) clearTimeout(mainTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, resetTimer]);

  return {
    isWarningShown,
    timeUntilExpiry,
    resetTimer,
    extendSession,
    forceTimeout
  };
};