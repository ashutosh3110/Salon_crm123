import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        let socketUrl = '';
        const envUrl = import.meta.env.VITE_API_URL;

        if (envUrl && envUrl.startsWith('http')) {
            let baseUrl = envUrl.replace('/api', '').replace(/\/$/, '');
            
            // Fix accidental double protocol typos
            if (baseUrl.toLowerCase().includes('://https://')) {
                baseUrl = baseUrl.replace(/:\/\/https:\/\//i, '://');
            } else if (baseUrl.toLowerCase().includes('://http://')) {
                baseUrl = baseUrl.replace(/:\/\/http:\/\//i, '://');
            }

            try {
                const parsed = new URL(baseUrl);
                // Hostname must contain at least one dot (e.g. localhost or domain.com)
                // and cannot be just 'https' or 'http'
                const isValidHost = parsed.hostname && 
                                   parsed.hostname !== 'https' && 
                                   parsed.hostname !== 'http' && 
                                   (parsed.hostname.includes('.') || parsed.hostname === 'localhost');

                if (!isValidHost) {
                    socketUrl = window.location.origin;
                } else {
                    socketUrl = baseUrl;
                }
            } catch (e) {
                socketUrl = window.location.origin;
            }
        } else {
            socketUrl = window.location.origin;
        }

        console.log('[Socket] Connecting to:', socketUrl, '(Original VITE_API_URL:', envUrl, ')');

        const newSocket = io(socketUrl, {
            autoConnect: true,
            transports: ['polling', 'websocket']
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
