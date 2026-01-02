import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home.tsx";
import { Box } from "@mui/material";

import { SocketProvider } from './providers/SocketProvider.tsx';

function App() {
  return (
    <SocketProvider>
      <Box className="app-container">
        <h1>Welcome to the Home Page</h1>
        <Box>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<h1>About Page</h1>} />
          </Routes>
        </Box>
      </Box>
    </SocketProvider>
  )
}

export default App
