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
            
            // Fix accidental double protocol typos like https://https://domain.com
            if (baseUrl.toLowerCase().includes('://https://')) {
                baseUrl = baseUrl.replace(/:\/\/https:\/\//i, '://');
            } else if (baseUrl.toLowerCase().includes('://http://')) {
                baseUrl = baseUrl.replace(/:\/\/http:\/\//i, '://');
            }

            try {
                const parsed = new URL(baseUrl);
                // If hostname is just 'https' or 'http', something is wrong
                if (parsed.hostname === 'https' || parsed.hostname === 'http' || !parsed.hostname.includes('.')) {
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
