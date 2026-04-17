import { useEffect, useRef } from "react";

export function useSSE(onData: (data: any) => void) {
  const onDataRef = useRef(onData);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    const token = `Bearer ${localStorage.getItem('access_token')}`;
    const url = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/sse_reminder.php?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    const playReminderSound = () => {
      try {
        const audio = new Audio("/sounds/reminder.mp3");
        audio.volume = 0.5;
        audio.play().catch((err) => {
          console.warn("Sound play blocked (user interaction required)", err);
        });
      } catch (err) {
        console.warn("Audio playback failed", err);
      }
    };

    eventSource.addEventListener('notifications', (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          playReminderSound();
          onDataRef.current(parsedData);
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    });

    eventSource.onopen = () => {
      console.log("SSE Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          playReminderSound();
          onDataRef.current(parsed);
        }
      } catch {}
    };

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, []);
}
