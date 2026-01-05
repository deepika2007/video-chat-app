import { Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { SocketProvider } from './providers/SocketProvider.tsx';
import RoomPage from "./pages/Room.tsx";
import HomePage from "./pages/Home.tsx";

function App() {
  return (
    <SocketProvider>
      <Box className="app-container">
        <Box>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
          </Routes>
        </Box>
      </Box>
    </SocketProvider>
  )
}

export default App
