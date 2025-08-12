import express, { Application } from "express";
import { createServer } from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import phoneRoutes from "./phone";
import authRoutes from "./auth";
import emailRoutes from './email'
import telegramRoutes from './telegram'
import PhoneNumberController from "../controllers/phoneNumberController";
import TelegramController from "../controllers/TelegramController";
const app = express();
const routes = express.Router();

// Create HTTP server and Socket.IO
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: { 
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : '*',
    methods: ['GET', 'POST']
  },

});

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: false, limit: "100mb" }));

// Load routes
phoneRoutes(routes, io);
authRoutes(routes, io);
emailRoutes(routes, io);
telegramRoutes(routes, io);

// Register API endpoints
app.use("/api", routes);

// Socket.IO connection with improved error handling
io.on("connection", (socket) => {
  console.log("A user connected");
  
  // Handle socket errors to prevent crashes
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    // Don't crash the server, just log the error
  });
  
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Handle cancel-connection event
  socket.on("cancel-connection", async (data) => {
    try {
      // Force disconnect the specific WhatsApp connection
      await PhoneNumberController.cancelAccountConnection(data.accountId, io);
    } catch (error) {
      console.error("Error cancelling connection:", error);
      socket.emit("display-error", {
        message: "Failed to cancel connection",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Handle cancel-telegram-connection event
  socket.on("cancel-telegram-connection", async (data) => {
    try {
      // Force disconnect the specific Telegram connection
      await TelegramController.cancelAccountConnection(data.accountId, io);
    } catch (error) {
      console.error("Error cancelling Telegram connection:", error);
      socket.emit("display-error", {
        message: "Failed to cancel Telegram connection",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Handle cancel-telegram-operation event
  socket.on("cancel-telegram-operation", async () => {
    try {
      await TelegramController.cancelCurrentOperation();
      socket.emit("operation-cancelled", {
        message: "Telegram operation cancelled successfully"
      });
    } catch (error) {
      console.error("Error cancelling Telegram operation:", error);
      socket.emit("display-error", {
        message: "Failed to cancel Telegram operation",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Add a global error handler for uncaught socket events
  socket.onAny((event, ...args) => {
    try {
      // Just a safety wrapper to prevent crashes from malformed events
      console.log(`Received event: ${event}`);
    } catch (error) {
      console.error(`Error handling socket event ${event}:`, error);
    }
  });
});

// Add global error handlers to prevent server crashes
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  console.error(error.name, error.message);
  // Keep the server running despite the error
});

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥', error);
  // Keep the server running despite the error
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  // res.status(500).send('Something broke!');
});

export default server;