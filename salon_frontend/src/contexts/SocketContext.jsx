import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        let socketUrl = '';
        const envUrl = import.meta.env.VITE_API_URL;

        if (envUrl && envUrl.startsWith('http')) {
            // Use configured API URL, removing trailing slash and /api suffix
            socketUrl = envUrl.replace('/api', '').replace(/\/$/, '');
        } else {
            // Fallback to current origin for production/same-host setups
            socketUrl = window.location.origin;
        }

        const newSocket = io(socketUrl, {
            autoConnect: true,
            transports: ['polling', 'websocket'] // Ensure fallback support
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
