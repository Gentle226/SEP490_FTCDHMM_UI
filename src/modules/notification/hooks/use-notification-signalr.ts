'use client';

import { HttpTransportType, HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { useEffect, useRef, useState } from 'react';

/**
 * Hook để quản lý kết nối SignalR đến NotificationHub
 * Tạo kết nối và quản lý vòng đời (kết nối/ngắt kết nối)
 * Tự động kết nối lại nếu mất kết nối
 */
export const useNotificationSignalR = (userId: string | null) => {
  // Use state instead of ref to trigger re-renders when connection is established
  const [connection, setConnection] = useState<HubConnection | null>(null);
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
        // Nếu kết nối đã tồn tại, kiểm tra trạng thái
        if (connectionRef.current) {
          if (
            connectionRef.current.state === 'Connected' ||
            connectionRef.current.state === 'Connecting'
          ) {
            return;
          }
          // Nếu ngắt kết nối, cố gắng kết nối lại
          if (connectionRef.current.state === 'Disconnected') {
            try {
              await connectionRef.current.start();
              reconnectAttemptsRef.current = 0;
              console.warn('[SignalR] Kết nối lại đến NotificationHub');
              return;
            } catch (error) {
              console.error('[SignalR] Kết nối lại thất bại:', error);
            }
          }
        }

        // Tạo kết nối mới - phải truyền userId để server thêm vào group
        const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, ''); // Remove trailing slashes
        const hubUrl = `${apiBaseUrl}/hubs/notification?userId=${userId}`;

        const connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            transport: HttpTransportType.LongPolling,
            withCredentials: true, // Gửi cookies/thông tin xác thực
            skipNegotiation: false, // Gọi endpoint /negotiate
          })
          .withAutomaticReconnect([0, 1000, 3000, 5000, 10000]) // Retry delays
          .configureLogging('information')
          .build();

        // Cấu hình timeout
        connection.serverTimeoutInMilliseconds = 60000; // 60s - chờ phản hồi từ server
        connection.keepAliveIntervalInMilliseconds = 15000; // 15s - gửi ping keepalive

        // Thiết lập listeners sự kiện
        connection.onreconnecting((error) => {
          console.warn('[SignalR] Đang cố gắng kết nối lại...', error);
        });

        connection.onreconnected((connectionId) => {
          reconnectAttemptsRef.current = 0;
          console.warn('[SignalR] Đã kết nối lại với ID kết nối:', connectionId);
        });

        connection.onclose((error) => {
          console.warn('[SignalR] Kết nối đã đóng', error);
          // Nếu chưa đạt tối đa lần thử, lên lịch kết nối lại
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current += 1;
              console.warn(
                `[SignalR] Lên lịch lần cố gắng kết nối lại ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`,
              );
              connectToHub();
            }, RECONNECT_DELAY_MS);
          }
        });

        // Kết nối
        await connection.start();
        connectionRef.current = connection;
        setConnection(connection); // Trigger re-render so listeners can attach
        reconnectAttemptsRef.current = 0;

        console.warn('[SignalR] Kết nối đến NotificationHub thành công');
      } catch (error) {
        console.error('[SignalR] Kết nối thất bại:', error);

        // Lên lịch kết nối lại
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connectToHub();
          }, RECONNECT_DELAY_MS);
        }
      }
    };

    connectToHub();

    // Dọn dẹp khi unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (connectionRef.current && connectionRef.current.state === 'Connected') {
        connectionRef.current.stop().catch((error: unknown) => {
          console.error('[SignalR] Error stopping connection:', error);
        });
      }
      setConnection(null);
    };
  }, [userId]);

  return connection;
};
