import { Box, Button, TextField } from '@mui/material';
import { useSocket } from '../providers/SocketProvider';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
    const socket = useSocket();
    const navigate = useNavigate();
    const [roomInfo, setRoomInfo] = React.useState<{ roomId: string; emailId: string } | null>(null);

    const handleJoinedRoom = useCallback(({ emailId, roomId }: { emailId: string, roomId: string }) => {
        navigate(`/room/${roomId}`);
        console.log('Joined room successfully', { emailId, roomId });
    }, []);

    useEffect(() => {
        socket?.on('join room', handleJoinedRoom);
        return () => {
            socket?.off('join room', handleJoinedRoom);
        }
    }, []);

    const handleChange = (e: React.FormEvent) => {
        const { name, value } = e.target as HTMLInputElement;
        setRoomInfo((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleJoin = () => {
        if (!socket || !roomInfo) return;

        socket.emit('join room', {
            emailId: roomInfo.emailId,
            roomId: roomInfo.roomId,
        });
    }

    return (
        <Box className='join-box'>
            <h1>Welcome to the Home Page</h1>
            <TextField
                id="outlined-basic"
                label="Email"
                variant="outlined"
                name={'emailId'}
                value={roomInfo?.emailId || ''}
                onChange={(e) => handleChange(e)}
            />
            <TextField
                id="outlined-basic"
                label="Room ID"
                variant="outlined"
                name={'roomId'}
                value={roomInfo?.roomId || ''}
                onChange={(e) => handleChange(e)}
            />
            <Button variant="contained" onClick={handleJoin}>Join</Button>
        </Box>
    );
}
