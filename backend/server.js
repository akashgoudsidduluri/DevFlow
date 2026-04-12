import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { initSocket } from "./utils/socketManager.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Init Socket.io
const io = new Server(httpServer, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

initSocket(io);

io.on('connection', (socket) => {
  // Client joins a project room to receive project-specific events
  socket.on('join_project', (projectId) => {
    socket.join(`project:${projectId}`);
  });
  socket.on('leave_project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/discussions", discussionRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT} with Socket.io`);
});