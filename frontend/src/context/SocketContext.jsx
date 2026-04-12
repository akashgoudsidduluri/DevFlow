import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Initialize socket connection with proper error handling
        socketRef.current = io('http://localhost:5000', {
            withCredentials: true,
            transports: ['polling', 'websocket'], // Use polling first to avoid initial websocket startup warnings
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        // Connection event listeners
        socketRef.current.on('connect', () => {
            console.log('Socket.io connected:', socketRef.current.id);
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.warn('Socket.io disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.warn('Socket.io connection error:', error);
        });

        socketRef.current.on('error', (error) => {
            console.warn('Socket.io error:', error);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
