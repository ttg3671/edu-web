import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useAppSettings } from '../useAppSettings';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const SOCKET_URL = import.meta.env.VITE_BASE_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const currentUser = useSelector((state) => state.user.currentUser);
  const { deviceId } = useAppSettings();

  useEffect(() => {
    if (currentUser) {
      const newSocket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket'],
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        // Register the device with the backend
        if (deviceId) {
          newSocket.emit('register', { deviceID: deviceId });
        }
      });

      newSocket.on('connect_error', (err) => {
        // Silent connect error - suppresses console noise
      });

      newSocket.on('message', (data) => {
        // Silent message - handle global messages here if needed
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [currentUser, deviceId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

