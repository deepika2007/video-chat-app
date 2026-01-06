import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../providers/SocketProvider";
import { Box, Button, Typography } from "@mui/material";
// import ReactPlayer from "react-player";

const RoomPage = () => {
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);


    const handleNewUserJoined = (data: any) => {
        const { id } = data;
        setRemoteSocketId(id);
    }
    useEffect(() => {
        socket?.on('user-joined', handleNewUserJoined)
        return () => {
            socket?.off('user-joined', handleNewUserJoined)
        }
    }, []);
    const handleCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
    }, []);

    useEffect(() => {
        if (videoRef.current && myStream) {
            videoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    return (
        <Box>
            <Typography variant="h3">Room Page</Typography>
            <Typography>{remoteSocketId ? "Connected" : "Waiting for user to join..."}</Typography>
            <Button variant="contained" onClick={handleCall}>Call</Button>
            {myStream && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: "400px", borderRadius: "8px", marginTop: "16px" }}
                />
            )}
        </Box>
    );
}

export default RoomPage;