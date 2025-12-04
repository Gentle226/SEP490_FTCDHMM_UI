'use client';

import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect, useRef } from 'react';

/**
 * Hook to manage SignalR connection to NotificationHub
 * Creates connection and manages lifecycle (connect/disconnect)
 * Auto-reconnects if connection is lost
 */
export const useNotificationSignalR = (userId: string | null) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY_MS = 3000;

  useEffect(() => {
    if (!userId) {
      return;
    }

    const connectToHub = async () => {
      try {
        // If connection already exists, check state
        if (connectionRef.current) {
          if (
            connectionRef.current.state === 'Connected' ||
            connectionRef.current.state === 'Connecting'
          ) {
            return;
          }
          // If disconnected, try reconnect
          if (connectionRef.current.state === 'Disconnected') {
            try {
              await connectionRef.current.start();
              reconnectAttemptsRef.current = 0;
              console.warn('[SignalR] Reconnected to NotificationHub');
              return;
            } catch (error) {
              console.error('[SignalR] Reconnection failed:', error);
            }
          }
        }

        // Create new connection
        const connection = new HubConnectionBuilder()
          .withUrl(`http://localhost:7116/hubs/notification`, {
            transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
            withCredentials: true, // Send cookies/credentials
            skipNegotiation: false, // Call /negotiate endpoint
          })
          .withAutomaticReconnect([0, 1000, 3000, 5000, 10000]) // Retry delays
          .configureLogging('information')
          .build();

        // Configure timeouts
        connection.serverTimeoutInMilliseconds = 60000; // 60s - wait for server response
        connection.keepAliveIntervalInMilliseconds = 15000; // 15s - send keepalive ping

        // Setup event listeners
        connection.onreconnecting((error) => {
          console.warn('[SignalR] Attempting to reconnect...', error);
        });

        connection.onreconnected((connectionId) => {
          reconnectAttemptsRef.current = 0;
          console.warn('[SignalR] Reconnected with connection ID:', connectionId);
        });

        connection.onclose((error) => {
          console.warn('[SignalR] Connection closed', error);
          // If not reached max attempts, schedule reconnect
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current += 1;
              console.warn(
                `[SignalR] Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`,
              );
              connectToHub();
            }, RECONNECT_DELAY_MS);
          }
        });

        // Connect
        await connection.start();
        connectionRef.current = connection;
        reconnectAttemptsRef.current = 0;

        console.warn('[SignalR] Connected to NotificationHub successfully');
      } catch (error) {
        console.error('[SignalR] Connection failed:', error);

        // Schedule reconnect
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectToHub();
          }, RECONNECT_DELAY_MS);
        }
      }
    };

    connectToHub();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (connectionRef.current && connectionRef.current.state === 'Connected') {
        connectionRef.current.stop().catch((error: unknown) => {
          console.error('[SignalR] Error stopping connection:', error);
        });
      }
    };
  }, [userId]);

  return connectionRef.current;
};
