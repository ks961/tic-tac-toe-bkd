// packages
import http from "http";
import cors from "cors";
import express from "express";
import { socket } from "socket";
import { Server, Socket } from "socket.io";
import { connectRedis } from "models/redis";

// configs
import { frontendUrl } from "config/frontend";

// routes
import otpRoutes from "./routes/public/otp";
import LoginRoutes from "./routes/public/login";
import SingupRoutes from "./routes/public/singup";
import VerifyTokenRoutes from "./routes/public/verifytoken";

const app = express();
const PORT = process.env.PORT ?? 3000;

const server = http.createServer(app);

export type PoolId = string;
export type AnotherPlayerSocket = Socket;

const corsOptions = {
    origin: frontendUrl,
    credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const io = new Server(server, {
    cors: {
        origin: frontendUrl
    }
});

app.use("/otp", otpRoutes);
app.use("/login", LoginRoutes);
app.use("/signup", SingupRoutes);
app.use(VerifyTokenRoutes);


connectRedis().then(() => {
    socket(io);

    server.listen(PORT);
})