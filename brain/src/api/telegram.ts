import { Router } from "express";
import { Server } from "socket.io";
import telegramRoutes from "../routes/telegramRoutes";

const setupTelegramRoutes = (router: Router, io: Server) => {
  // Register Telegram routes with the router
  const telegramRouter = telegramRoutes(io);
  router.use("/telegram", telegramRouter);
};

export default setupTelegramRoutes;