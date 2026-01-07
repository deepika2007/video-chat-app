import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../providers/SocketProvider";
import { Box, Button, Typography } from "@mui/material";
import PeerService from "../service/PeerService";
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
        socket?.on('incoming:call', handleIncomingCall)
        socket?.on('call-accepted', handleCallAccepted)
        return () => {
            socket?.off('user-joined', handleNewUserJoined)
            socket?.off('incoming:call', handleIncomingCall)
            socket?.off('call-accepted', handleCallAccepted)

        }
    }, []);

    const handleCall = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const offer = await PeerService.getOffer();
        socket?.emit('call-user', { offer, to: remoteSocketId });
        setMyStream(stream);
    }, []);

    const handleIncomingCall = async (data: any) => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);

        const { from, offer } = data;
        setRemoteSocketId(from);
        const ans = await PeerService.getAnswer(offer);
        socket?.emit('call-accepted', { ans, to: from });
        console.log('Incoming call from:', from, 'with offer:', offer);
    }

    const handleCallAccepted = async (data: any) => {
        const { ans, from } = data;
        await PeerService.setLocalDescription(ans);

        for(const track of (myStream?.getTracks() || [])) {
            PeerService['peer'].addTrack(track, myStream!);
        }
        console.log('Call accepted with answer:', ans);
    }

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