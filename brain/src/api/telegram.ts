import { Router } from "express";
import telegramRoutes from "../routes/telegramRoutes";

const setupTelegramRoutes = (router: Router, io) => {
  // Register Telegram routes with the router
  const telegramRouter = telegramRoutes(io);
  router.use("/telegram", telegramRouter);
};

export default setupTelegramRoutes;

