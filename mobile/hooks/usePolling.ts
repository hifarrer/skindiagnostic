import { useState, useEffect, useRef } from 'react';

interface UsePollingOptions {
  pollingFunction: () => Promise<any>;
  interval?: number;
  maxAttempts?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  enabled?: boolean;
}

export function usePolling({
  pollingFunction,
  interval = 2000,
  maxAttempts = 60,
  onSuccess,
  onError,
  enabled = true,
}: UsePollingOptions) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    attemptsRef.current = 0;
    setLoading(true);
    setError(null);

    const poll = async () => {
      try {
        const result = await pollingFunction();
        
        if (result.status === 'success') {
          setData(result);
          setLoading(false);
          onSuccess?.(result);
          return;
        }

        if (result.status === 'error') {
          setError(result);
          setLoading(false);
          // Pass the full payload so screens can show API error codes and messages.
          onError?.(result);
          return;
        }

        attemptsRef.current++;
        if (attemptsRef.current >= maxAttempts) {
          const timeoutError = 'Timeout: Task is taking longer than expected';
          setError(timeoutError);
          setLoading(false);
          onError?.(timeoutError);
          return;
        }

        timeoutRef.current = setTimeout(poll, interval);
      } catch (err) {
        setError(err);
        setLoading(false);
        onError?.(err);
      }
    };

    poll();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, pollingFunction, interval, maxAttempts, onSuccess, onError]);

  return { data, loading, error };
}

