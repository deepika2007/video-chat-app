import React, { useMemo, type PropsWithChildren } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = React.createContext<ReturnType<typeof io> | null>(null);

export const useSocket = () => {
  return React.useContext(SocketContext);
}

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const socket = useMemo(() => io('http://localhost:3001'), []);
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
