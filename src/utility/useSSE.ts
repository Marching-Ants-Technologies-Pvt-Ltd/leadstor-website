import { useEffect } from "react";

export function useSSE(onData: (data: any) => void) {
  useEffect(() => {
    const token = `Bearer ${localStorage.getItem('access_token')}`;

    const url = `${process.env.NEXT_PUBLIC_LEADSTOR_REST}/sse_reminder.php?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(url);

    // Play sound when new notifications arrive
    const playReminderSound = () => {
      try {
        const audio = new Audio("/sounds/reminder.mp3");   // ← Put your sound file here
        audio.volume = 0.5;        // Adjust volume (0.0 to 1.0)
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
          // Play sound only for new ones
          playReminderSound();
          onData(parsedData);
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    });

    eventSource.onopen = () => {
      console.log("✅ SSE Connected");
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          playReminderSound();
          onData(parsed);
        }
      } catch {}
    };

    eventSource.onerror = (err) => {
      console.error("❌ SSE Error:", err);
      // Optional: eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [onData]);   // ← Added onData as dependency (good practice)
}