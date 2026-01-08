import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useSocket } from "../providers/SocketProvider";
import PeerService from "../service/PeerService";

const RoomPage = () => {
    const socket = useSocket();

    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

    /* -------------------- STREAM HANDLING -------------------- */

    const getMyStream = useCallback(async () => {
        if (myStream) return myStream;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        setMyStream(stream);
        return stream;
    }, [myStream]);

    const sendStream = useCallback(() => {
        if (!myStream) return;

        const senders = PeerService.peer.getSenders();

        myStream.getTracks().forEach(track => {
            const alreadyAdded = senders.some((sender: any) => sender.track === track);
            if (!alreadyAdded) {
                PeerService.peer.addTrack(track, myStream);
            }
        });
    }, [myStream]);

    /* -------------------- SOCKET HANDLERS -------------------- */

    const handleNewUserJoined = useCallback(
        ({ socketId }: { socketId: string }) => {
            setRemoteSocketId(socketId);
        },
        []
    );


    const handleCall = useCallback(async () => {
        await getMyStream();
        const offer = await PeerService.getOffer();
        socket?.emit("call-user", { offer, to: remoteSocketId });
    }, [getMyStream, remoteSocketId, socket]);

    const handleIncomingCall = useCallback(
        async ({ from, offer }: any) => {
            await getMyStream();
            setRemoteSocketId(from);

            const ans = await PeerService.getAnswer(offer);
            socket?.emit("call-accepted", { ans, to: from });
        },
        [getMyStream, socket]
    );

    const handleCallAccepted = useCallback(
        async ({ ans }: any) => {
            await PeerService.setLocalDescription(ans);
            sendStream();
        },
        [sendStream]
    );

    /* -------------------- NEGOTIATION -------------------- */

    const handleNegotiationNeeded = useCallback(async () => {
        if (!remoteSocketId) return;

        const offer = await PeerService.getOffer();
        socket?.emit("peer:negotiationneeded", {
            offer,
            to: remoteSocketId,
        });
    }, [remoteSocketId, socket]);

    const handleNegotiationNeededIncoming = useCallback(
        async ({ from, offer }: any) => {
            const ans = await PeerService.getAnswer(offer);
            socket?.emit("peer:negotiationdone", { ans, to: from });
        },
        [socket]
    );

    const handleNegotiationFinal = useCallback(async ({ ans }: any) => {
        await PeerService.setLocalDescription(ans);
    }, []);

    /* -------------------- EFFECTS -------------------- */

    useEffect(() => {
        const peer = PeerService.peer;
        peer.addEventListener("negotiationneeded", handleNegotiationNeeded);
        peer.addEventListener("track", (e: RTCTrackEvent) => {
            setRemoteStream(e.streams[0]);
        });

        return () => {
            peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
        };
    }, [handleNegotiationNeeded]);

    useEffect(() => {
        socket?.on("user-joined", handleNewUserJoined);
        socket?.on("incoming:call", handleIncomingCall);
        socket?.on("call-accepted", handleCallAccepted);
        socket?.on("peer:negotiationneeded", handleNegotiationNeededIncoming);
        socket?.on("peer:negotiationfinal", handleNegotiationFinal);

        return () => {
            socket?.off("user-joined", handleNewUserJoined);
            socket?.off("incoming:call", handleIncomingCall);
            socket?.off("call-accepted", handleCallAccepted);
            socket?.off("peer:negotiationneeded", handleNegotiationNeededIncoming);
            socket?.off("peer:negotiationfinal", handleNegotiationFinal);
        };
    }, [
        socket,
        handleNewUserJoined,
        handleIncomingCall,
        handleCallAccepted,
        handleNegotiationNeededIncoming,
        handleNegotiationFinal,
    ]);

    useEffect(() => {
        if (videoRef.current && myStream) {
            videoRef.current.srcObject = myStream;
        }
    }, [myStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    /* -------------------- UI -------------------- */

    return (
        <Box>
            <Typography variant="h3">Room Page</Typography>
            <Typography>
                {remoteSocketId ? "Connected" : "Waiting for user to join..."}
            </Typography>

            <Button variant="contained" onClick={handleCall}>
                Call
            </Button>

            {myStream && (
                <Button variant="contained" onClick={sendStream}>
                    Send Stream
                </Button>
            )}

            {myStream && (
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: 400, marginTop: 16 }}
                />
            )}

            {remoteStream && (
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    style={{ width: 400, marginTop: 16 }}
                />
            )}
        </Box>
    );
};

export default RoomPage;
