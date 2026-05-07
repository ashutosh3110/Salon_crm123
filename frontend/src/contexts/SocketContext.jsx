import { createContext, useContext } from 'react';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    // Socket is disabled as per user request
    return (
        <SocketContext.Provider value={null}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return null;
};
