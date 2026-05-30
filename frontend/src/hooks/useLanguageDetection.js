import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';

export function useLanguageDetection(inputText, enabled = true, options = {}) {
  const debounceMs = options.debounceMs ?? 700;
  const sourcePage = options.sourcePage ?? 'typing';
  const debounceRef = useRef(null);
  const loggedThisTypingSessionRef = useRef(false);
  const [detected, setDetected] = useState(null);

  const detectNow = useCallback(async (text, requestOptions = {}) => {
    const cleanText = text?.trim() || '';
    if (cleanText.length < 10) return null;

    const shouldLog = requestOptions.shouldLog ?? false;
    const page = requestOptions.sourcePage ?? sourcePage;
    const { data } = await api.post('/detect-language', {
      text: cleanText,
      should_log: shouldLog,
      source_page: page,
    });
    setDetected(data);
    return data;
  }, [sourcePage]);

  useEffect(() => {
    if (!enabled || !inputText || inputText.trim().length < 10) {
      clearTimeout(debounceRef.current);
      setDetected(null);
      loggedThisTypingSessionRef.current = false;
      return undefined;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const shouldLog = !loggedThisTypingSessionRef.current;
        const result = await detectNow(inputText, {
          shouldLog,
          sourcePage,
        });
        if (result && shouldLog) {
          loggedThisTypingSessionRef.current = true;
        }
      } catch (error) {
        setDetected({ error: true });
      }
    }, debounceMs);

    return () => clearTimeout(debounceRef.current);
  }, [debounceMs, detectNow, enabled, inputText, sourcePage]);

  return { detected, detectNow };
}
