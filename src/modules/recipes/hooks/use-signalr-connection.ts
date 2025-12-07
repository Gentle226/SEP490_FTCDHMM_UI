'use client';

import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect, useRef } from 'react';

/**
 * Hook để quản lý SignalR connection tới CommentHub
 * Tạo connection và quản lý lifecycle (connect/disconnect)
 * Tự động reconnect nếu bị mất connection
 */
export const useSignalRConnection = (recipeId: string | null) => {
  const connectionRef = useRef<HubConnection | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY_MS = 3000;

  useEffect(() => {
    if (!recipeId) {
      return;
    }

    const connectToHub = async () => {
      try {
        // Nếu connection đã tồn tại, kiểm tra state
        if (connectionRef.current) {
          if (
            connectionRef.current.state === 'Connected' ||
            connectionRef.current.state === 'Connecting'
          ) {
            return;
          }
          // Nếu disconnected, try reconnect
          if (connectionRef.current.state === 'Disconnected') {
            try {
              await connectionRef.current.start();
              reconnectAttemptsRef.current = 0;
              console.warn('[SignalR] Reconnected to CommentHub');
              return;
            } catch (error) {
              console.error('[SignalR] Reconnection failed:', error);
            }
          }
        }

        // Tạo connection mới
        const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, ''); // Remove trailing slashes
        const hubUrl = `${apiBaseUrl}/hubs/comments?recipeId=${recipeId}`;

        const connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
            withCredentials: true, // Gửi cookies/credentials
            skipNegotiation: false, // Gọi /negotiate endpoint
          })
          .withAutomaticReconnect([0, 1000, 3000, 5000, 10000]) // Retry delays
          .configureLogging('information')
          .build();

        // Configure timeouts để tránh timeout
        connection.serverTimeoutInMilliseconds = 60000; // 60s - chờ server response
        connection.keepAliveIntervalInMilliseconds = 15000; // 15s - gửi keepalive ping

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
          // Nếu chưa đạt max attempts, schedule reconnect
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

        // Kết nối
        await connection.start();
        connectionRef.current = connection;
        reconnectAttemptsRef.current = 0;

        console.warn('[SignalR] Connected to CommentHub successfully');
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
  }, [recipeId]);

  return connectionRef.current;
};
