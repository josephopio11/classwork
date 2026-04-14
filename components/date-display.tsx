"use client";

import { useEffect, useState } from "react";

// force dynamic
export const dynamic = () => {
  return {
    getInitialProps: async () => {
      return {
        dynamic: true,
        revalidate: 1,
        // revalidate every second
        revalidateMode: "incremental",
        fallback: <div>Loading...</div>,
        loadingIndicator: <div>Loading...</div>,
        unstable: true,
        // unstable: true,
        // revalidate every 5 seconds
        // revalidateMode: "interval",
        // revalidateInterval: 5000,
      };
    },
  };
};

export default function DateDisplay() {
  const [liveTime, setLiveTime] = useState("");

  // Get current date in the format "Month Day, Year" (e.g., "March 23, 2025")
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString("en-MY", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });
      setLiveTime(currentTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span>
      {currentDate} - {liveTime}
    </span>
  );
}
