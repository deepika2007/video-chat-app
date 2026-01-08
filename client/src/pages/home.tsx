import { Box, Button, TextField } from "@mui/material";
import { useSocket } from "../providers/SocketProvider";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";

export default function HomePage() {
    const socket = useSocket();
    const navigate = useNavigate();

    const [roomInfo, setRoomInfo] = useState({
        roomId: "",
        emailId: "",
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setRoomInfo(prev => ({
                ...prev,
                [name]: value,
            }));
        },
        []
    );

    const handleJoin = useCallback(() => {
        if (!socket) return;
        if (!roomInfo.roomId || !roomInfo.emailId) return;

        socket.emit("join-room", roomInfo);

        // ✅ Navigate immediately
        navigate(`/room/${roomInfo.roomId}`);
    }, [socket, roomInfo, navigate]);

    return (
        <Box className="join-box">
            <h1>Join Room</h1>

            <TextField
                label="Email"
                name="emailId"
                value={roomInfo.emailId}
                onChange={handleChange}
                fullWidth
            />

            <TextField
                label="Room ID"
                name="roomId"
                value={roomInfo.roomId}
                onChange={handleChange}
                fullWidth
                sx={{ mt: 2 }}
            />

            <Button
                variant="contained"
                onClick={handleJoin}
                sx={{ mt: 2 }}
            >
                Join
            </Button>
        </Box>
    );
}
