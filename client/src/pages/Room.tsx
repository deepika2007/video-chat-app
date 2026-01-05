import { useEffect } from "react";
import { useSocket } from "../providers/SocketProvider";

const RoomPage = () => {

    const socket = useSocket();

    const handleNewUserJoined = (data: any) => {
        const { emailId, id } = data;
        console.log("New user joined: ", emailId, id);
    }
    useEffect(() => {
        socket?.on('user-joined', handleNewUserJoined)

        return () => {
            socket?.off('user-joined', handleNewUserJoined)
        }
    }, []);
    return (
        <div>
            <h1>Room Page</h1>
        </div>
    );
}

export default RoomPage;