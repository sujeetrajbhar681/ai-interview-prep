import { useCallback } from 'react';

const BASE = import.meta.env.VITE_API_URL || '';

const useStream = () => {
  const stream = useCallback(async (url, body, { onDelta, onDone, onError }) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onError?.(err.message || 'Request failed');
      return;
    }

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';
    let   lastEvent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          lastEvent = line.slice(7).trim();
          continue;
        }
        if (line.startsWith('data: ')) {
          try {
            const payload = JSON.parse(line.slice(6));
            if (lastEvent === 'delta')      onDelta?.(payload.text);
            else if (lastEvent === 'done')  onDone?.(payload);
            else if (lastEvent === 'error') onError?.(payload.message);
          } catch { /* skip malformed */ }
        }
      }
    }
  }, []);

  return { stream };
};

export default useStream;