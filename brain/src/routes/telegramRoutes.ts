import express, { Request, Response, Router } from "express";
import TelegramController from "../controllers/TelegramController";
import { Server } from "socket.io";

const telegramRoutes = (io: Server) => {
  const router: Router = express.Router();

  // Login route - Send verification code
  router.post("/logins", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.login(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to login" 
      });
    }
  });

  // Confirm OTP route
  router.post("/confirm-otp", async (req: Request, res: Response) => {
    try {
      await TelegramController.confirmOTP(req, io);
      res.status(200).json({ message: "OTP confirmed successfully" });
    } catch (error) {
      console.error("OTP confirmation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to confirm OTP" 
      });
    }
  });

  // Confirm 2FA route
  router.post("/confirm-2fa", async (req: Request, res: Response) => {
    try {
      await TelegramController.confirm2FA(req, io);
      res.status(200).json({ message: "2FA confirmed successfully" });
    } catch (error) {
      console.error("2FA confirmation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to confirm 2FA" 
      });
    }
  });

  // Logout route
  router.post("/logout", async (req: Request, res: Response) => {
    try {
      const { accountId } = req.body;
      await TelegramController.logout(accountId, io);
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to logout" 
      });
    }
  });

  // Logout all accounts route
  router.post("/logout-all", async (req: Request, res: Response) => {
    try {
      await TelegramController.logoutAll(io);
      res.status(200).json({ message: "All accounts logged out successfully" });
    } catch (error) {
      console.error("Logout all error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to logout all accounts" 
      });
    }
  });

  // Get connected accounts
  router.get("/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await TelegramController.getConnectedAccounts();
      res.status(200).json(accounts);
    } catch (error) {
      console.error("Get accounts error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get accounts" 
      });
    }
  });

  // Verify phone numbers
  router.post("/verify-numbers", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.saveUsers(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Verify numbers error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to verify numbers" 
      });
    }
  });

  // Get groups for an account
  router.post("/groups", async (req: Request, res: Response) => {
    try {
      const groups = await TelegramController.getGroups(req);
      res.status(200).json(groups);
    } catch (error) {
      console.error("Get groups error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get groups" 
      });
    }
  });

  // Export group members
  router.post("/export-group-members", async (req: Request, res: Response) => {
    try {
      await TelegramController.exportGroupMembers(req, res);
      // Response is handled in the controller as it streams a CSV file
    } catch (error) {
      console.error("Export group members error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export group members" 
      });
    }
  });

  // Upload CSV file with phone numbers
  router.post("/upload-csv", TelegramController.getUploadMiddleware(), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const phoneNumbers = await TelegramController.processCSVFile(req.file);
      res.status(200).json({ phoneNumbers });
    } catch (error) {
      console.error("Upload CSV error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process CSV file" 
      });
    }
  });

  // Send bulk messages
  router.post("/send-messages", async (req: Request, res: Response) => {
    try {
      await TelegramController.sendBulkMessages(req, io);
      res.status(200).json({ message: "Messages scheduled successfully" });
    } catch (error) {
      console.error("Send messages error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to schedule messages" 
      });
    }
  });

  // Cancel scheduled message
  router.post("/cancel-message", async (req: Request, res: Response) => {
    try {
      await TelegramController.cancelScheduledMessage(req, io);
      res.status(200).json({ message: "Message cancelled successfully" });
    } catch (error) {
      console.error("Cancel message error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to cancel message" 
      });
    }
  });

  // Get scheduled messages
  router.get("/scheduled-messages", async (req: Request, res: Response) => {
    try {
      const messages = await TelegramController.getScheduledMessages();
      res.status(200).json(messages);
    } catch (error) {
      console.error("Get scheduled messages error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get scheduled messages" 
      });
    }
  });

  // Cancel current operation
  router.post("/cancel-operation", async (req: Request, res: Response) => {
    try {
      await TelegramController.cancelCurrentOperation();
      res.status(200).json({ message: "Operation cancelled successfully" });
    } catch (error) {
      console.error("Cancel operation error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to cancel operation" 
      });
    }
  });

  return router;
};

export default telegramRoutes;