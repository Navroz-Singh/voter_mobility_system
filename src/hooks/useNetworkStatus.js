"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// Thresholds for connection quality
const GOOD_LATENCY_THRESHOLD = 300; // ms - connection considered good
const POOR_LATENCY_THRESHOLD = 1000; // ms - connection considered poor
const PING_INTERVAL = 5000; // 5 seconds between pings
const PING_TIMEOUT = 2000; // 2 second timeout for each ping
const MOVING_AVERAGE_SIZE = 3; // Number of pings to average

/**
 * Latency-based network quality detection hook
 * Replaces simple online/offline with actual connection quality measurement
 * 
 * @returns {{
 *   latency: number | null,
 *   isGoodConnection: boolean,
 *   isPoorConnection: boolean,
 *   lastCheckedAt: Date | null,
 *   isOnline: boolean // Backward compatibility
 * }}
 */
export function useNetworkStatus() {
  const [state, setState] = useState({
    latency: null,
    isGoodConnection: true, // Optimistic default
    isPoorConnection: false,
    lastCheckedAt: null,
  });

  const latencyHistoryRef = useRef([]);
  const abortControllerRef = useRef(null);
  const intervalRef = useRef(null);

  /**
   * Calculate moving average of latency values
   */
  const calculateMovingAverage = useCallback((history) => {
    if (history.length === 0) return null;
    const sum = history.reduce((acc, val) => acc + val, 0);
    return Math.round(sum / history.length);
  }, []);

  /**
   * Perform a single ping and measure latency
   */
  const measureLatency = useCallback(async () => {
    // Abort any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const startTime = performance.now();

    try {
      const response = await fetch("/api/ping", {
        method: "GET",
        cache: "no-store",
        signal: abortControllerRef.current.signal,
        // Set timeout via AbortController
        ...(typeof AbortSignal.timeout === "function" && {
          signal: AbortSignal.timeout(PING_TIMEOUT),
        }),
      });

      if (!response.ok) {
        throw new Error(`Ping failed: ${response.status}`);
      }

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      // Update history with moving average window
      const newHistory = [...latencyHistoryRef.current, latency].slice(
        -MOVING_AVERAGE_SIZE
      );
      latencyHistoryRef.current = newHistory;

      const avgLatency = calculateMovingAverage(newHistory);
      const isGoodConnection = avgLatency !== null && avgLatency <= GOOD_LATENCY_THRESHOLD;
      const isPoorConnection = avgLatency !== null && avgLatency >= POOR_LATENCY_THRESHOLD;

      setState({
        latency: avgLatency,
        isGoodConnection,
        isPoorConnection,
        lastCheckedAt: new Date(),
      });

      return { latency: avgLatency, isGoodConnection, isPoorConnection };
    } catch (error) {
      // Handle timeout or network errors
      if (error.name === "AbortError" || error.name === "TimeoutError") {
        // Timeout - treat as very poor connection
        const newHistory = [...latencyHistoryRef.current, PING_TIMEOUT].slice(
          -MOVING_AVERAGE_SIZE
        );
        latencyHistoryRef.current = newHistory;

        const avgLatency = calculateMovingAverage(newHistory);

        setState({
          latency: avgLatency,
          isGoodConnection: false,
          isPoorConnection: true,
          lastCheckedAt: new Date(),
        });

        return { latency: avgLatency, isGoodConnection: false, isPoorConnection: true };
      }

      // Network completely unavailable
      setState((prev) => ({
        ...prev,
        isGoodConnection: false,
        isPoorConnection: true,
        lastCheckedAt: new Date(),
      }));

      return { latency: null, isGoodConnection: false, isPoorConnection: true };
    }
  }, [calculateMovingAverage]);

  /**
   * Start periodic latency measurement
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial ping
    measureLatency();

    // Set up periodic pings
    intervalRef.current = setInterval(() => {
      measureLatency();
    }, PING_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [measureLatency]);

  // Return state with backward compatibility (isOnline maps to isGoodConnection)
  return {
    ...state,
    isOnline: state.isGoodConnection, // Backward compatibility
  };
}

/**
 * Export thresholds for external use (e.g., SyncManager)
 */
export const LATENCY_THRESHOLDS = {
  GOOD: GOOD_LATENCY_THRESHOLD,
  POOR: POOR_LATENCY_THRESHOLD,
};
