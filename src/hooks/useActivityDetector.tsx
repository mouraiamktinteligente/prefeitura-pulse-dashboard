import { useEffect, useCallback, useRef } from 'react';

interface UseActivityDetectorProps {
  onActivity: () => void;
  throttleMs?: number;
}

export const useActivityDetector = ({ onActivity, throttleMs = 30000 }: UseActivityDetectorProps) => {
  const lastActivityRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleActivity = useCallback(() => {
    const now = Date.now();
    
    // Throttle: só executa se passou o tempo mínimo desde a última execução
    if (now - lastActivityRef.current >= throttleMs) {
      lastActivityRef.current = now;
      
      // Debounce: cancela execução anterior e agenda nova
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        onActivity();
      }, 1000); // Delay de 1 segundo para evitar chamadas excessivas
    }
  }, [onActivity, throttleMs]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Adicionar listeners para todos os eventos de atividade
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Limpar listeners e timeout ao desmontar
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleActivity]);

  return null;
};