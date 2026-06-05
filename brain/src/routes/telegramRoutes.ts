import express, { Request, Response, Router } from "express";
import TelegramController from "../controllers/TelegramController";
import CampaignSchedulerController from "../controllers/CampaignSchedulerController";
import AccountTaskManager from "../controllers/AccountTaskManager";

const telegramRoutes = (io) => {
  const router: Router = express.Router();

  // ── Multi-account task engine ──────────────────────────────────────────────
  // Enqueue a task for a specific account (isolated, parallel across accounts).
  router.post("/tasks/start", async (req: Request, res: Response) => {
    try {
      const { accountId, type, label, payload } = req.body;
      if (!accountId || !type) {
        return res.status(400).json({ error: "accountId and type are required" });
      }
      const task = AccountTaskManager.enqueue(
        accountId,
        type,
        label || `${type} task`,
        { ...payload, accountId },
        io
      );
      res.status(200).json({ ok: true, task });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to start task" });
    }
  });

  // List all tasks for an account
  router.get("/tasks/:accountId", async (req: Request, res: Response) => {
    try {
      res.status(200).json(AccountTaskManager.getAccountTasks(req.params.accountId));
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to list tasks" });
    }
  });

  // List tasks for every account
  router.get("/tasks", async (_req: Request, res: Response) => {
    try {
      res.status(200).json(AccountTaskManager.getAllTasks());
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Failed to list tasks" });
    }
  });

  // Cancel / pause / resume a specific task
  router.post("/tasks/cancel", async (req: Request, res: Response) => {
    const { accountId, taskId } = req.body;
    const ok = AccountTaskManager.cancelTask(accountId, taskId, io);
    res.status(ok ? 200 : 404).json({ ok });
  });
  router.post("/tasks/pause", async (req: Request, res: Response) => {
    const { accountId, taskId } = req.body;
    const ok = AccountTaskManager.pauseTask(accountId, taskId, io);
    res.status(ok ? 200 : 404).json({ ok });
  });
  router.post("/tasks/resume", async (req: Request, res: Response) => {
    const { accountId, taskId } = req.body;
    const ok = AccountTaskManager.resumeTask(accountId, taskId, io);
    res.status(ok ? 200 : 404).json({ ok });
  });

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

  // Import members to group
  router.post("/import-members", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.importMembersToGroup(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Import members error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to import members" 
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
      await TelegramController.exportGroupMembers(req, res, io);
      // Response is handled in the controller as it streams a CSV file
    } catch (error) {
      console.error("Export group members error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export group members" 
      });
    }
  });
  
  router.post("/export-joined-links", async (req: Request, res: Response) => {
    try {
      await TelegramController.exportJoinedLinks(req, res);
    } catch (error) {
      console.error("Export joined links error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to export joined links" 
      });
    }
  });

  // Upload CSV file with phone numbers
  router.post("/upload-csv", TelegramController.getUploadMiddleware(), async (req: Request, res: Response) => {
    try {
      if (!('file' in req)) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const phoneNumbers = await TelegramController.processCSVFile(req.file as any);
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

  // Auto-discover groups
  router.post("/auto-discover-groups", async (req: Request, res: Response) => {
    try {
      const results = await TelegramController.autoDiscoverGroups(req, io);
      res.status(200).json(results);
    } catch (error) {
      console.error("Auto discover groups error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to auto discover groups" 
      });
    }
  });
  
  // Discover public groups or channels (with filters)
  router.post("/discover-public-groups", async (req: Request, res: Response) => {
    try {
      const results = await TelegramController.discoverPublicGroupsOrChannels(req, io);
      res.status(200).json(results);
    } catch (error) {
      console.error("Discover public groups error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to discover public groups" 
      });
    }
  });

  // Send bulk messages to groups
  router.post("/send-messages-to-groups", TelegramController.getUploadMiddleware(), async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.sendBulkMessagesToGroups(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Send messages to groups error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to send messages to groups" 
      });
    }
  });

  // Get dialog filters (folders)
  router.post("/dialog-filters", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.getDialogFilters(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Get dialog filters error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get dialog filters" 
      });
    }
  });

  // Join group
  router.post("/join-group", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.joinGroup(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Join group error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to join group" 
      });
    }
  });

  // Bulk join groups
  router.post("/join-bulk-groups", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.joinBulkGroups(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Join bulk groups error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to join bulk groups" 
      });
    }
  });

  // Scrape members
  router.post("/scrape-members", async (req: Request, res: Response) => {
    try {
      const result = await TelegramController.scrapeMembers(req, io);
      res.status(200).json(result);
    } catch (error) {
      console.error("Scrape members error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to scrape members" 
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

  // Campaign Scheduler Routes
  // Create scheduled campaign
  router.post("/scheduled-campaigns", async (req: Request, res: Response) => {
    try {
      const campaign = await CampaignSchedulerController.createScheduledCampaign(req as any, io);
      res.status(200).json({ message: "Campaign scheduled successfully", campaign });
    } catch (error) {
      console.error("Create scheduled campaign error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to schedule campaign" 
      });
    }
  });

  // Get all scheduled campaigns
  router.get("/scheduled-campaigns", async (req: Request, res: Response) => {
    try {
      const campaigns = await CampaignSchedulerController.getScheduledCampaigns();
      res.status(200).json(campaigns);
    } catch (error) {
      console.error("Get scheduled campaigns error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get scheduled campaigns" 
      });
    }
  });

  // Get specific scheduled campaign
  router.get("/scheduled-campaigns/:id", async (req: Request, res: Response) => {
    try {
      const campaign = await CampaignSchedulerController.getCampaignById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.status(200).json(campaign);
    } catch (error) {
      console.error("Get scheduled campaign error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to get scheduled campaign" 
      });
    }
  });

  // Cancel scheduled campaign
  router.delete("/scheduled-campaigns/:id", async (req: Request, res: Response) => {
    try {
      await CampaignSchedulerController.cancelCampaign(req.params.id, io);
      res.status(200).json({ message: "Campaign cancelled successfully" });
    } catch (error) {
      console.error("Cancel scheduled campaign error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to cancel campaign" 
      });
    }
  });

  // Pause scheduled campaign
  router.post("/scheduled-campaigns/:id/pause", async (req: Request, res: Response) => {
    try {
      await CampaignSchedulerController.pauseCampaign(req.params.id, io);
      res.status(200).json({ message: "Campaign paused successfully" });
    } catch (error) {
      console.error("Pause scheduled campaign error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to pause campaign" 
      });
    }
  });

  // Resume scheduled campaign
  router.post("/scheduled-campaigns/:id/resume", async (req: Request, res: Response) => {
    try {
      await CampaignSchedulerController.resumeCampaign(req.params.id, io);
      res.status(200).json({ message: "Campaign resumed successfully" });
    } catch (error) {
      console.error("Resume scheduled campaign error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to resume campaign" 
      });
    }
  });

  // Cancel running campaign
  router.post("/cancel-running-campaign", async (req: Request, res: Response) => {
    try {
      const { campaignId } = req.body;
      if (!campaignId) {
        return res.status(400).json({ error: "Campaign ID is required" });
      }
      const cancelled = await TelegramController.cancelRunningCampaign(campaignId);
      if (cancelled) {
        res.status(200).json({ message: "Campaign cancelled successfully" });
      } else {
        res.status(404).json({ error: "Campaign not found or already completed" });
      }
    } catch (error) {
      console.error("Cancel running campaign error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to cancel campaign" 
      });
    }
  });

  // ── Folder Management ────────────────────────────────────────────────────────

  // Create a new folder (dialog filter)
  router.post("/create-folder", async (req: Request, res: Response) => {
    try {
      const { accountId, folderName, peerIds = [] } = req.body;
      if (!accountId || !folderName) {
        return res.status(400).json({ error: "accountId and folderName are required" });
      }
      const result = await TelegramController.createFolder(accountId, folderName, peerIds, io);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Create folder error:", error);
      res.status(500).json({ error: String(error?.message || error) });
    }
  });

  // Move chats into an existing folder
  router.post("/move-to-folder", async (req: Request, res: Response) => {
    try {
      const { accountId, filterId, peerIds } = req.body;
      if (!accountId || filterId == null || !Array.isArray(peerIds)) {
        return res.status(400).json({ error: "accountId, filterId and peerIds are required" });
      }
      const result = await TelegramController.moveChatsToFolder(accountId, Number(filterId), peerIds, io);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Move to folder error:", error);
      res.status(500).json({ error: String(error?.message || error) });
    }
  });

  // Delete a folder (dialog filter)
  router.post("/delete-folder", async (req: Request, res: Response) => {
    try {
      const { accountId, filterId } = req.body;
      if (!accountId || filterId == null) {
        return res.status(400).json({ error: "accountId and filterId are required" });
      }
      const result = await TelegramController.deleteFolder(accountId, Number(filterId), io);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Delete folder error:", error);
      res.status(500).json({ error: String(error?.message || error) });
    }
  });

  // Archive a specific list of chats
  router.post("/archive-chats", async (req: Request, res: Response) => {
    try {
      const { accountId, peerIds } = req.body;
      if (!accountId || !Array.isArray(peerIds)) {
        return res.status(400).json({ error: "accountId and peerIds are required" });
      }
      const result = await TelegramController.archiveChats(accountId, peerIds, io);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Archive chats error:", error);
      res.status(500).json({ error: String(error?.message || error) });
    }
  });

  // Archive ALL groups and channels (keep only private chats)
  router.post("/archive-groups-channels", async (req: Request, res: Response) => {
    try {
      const { accountId } = req.body;
      if (!accountId) {
        return res.status(400).json({ error: "accountId is required" });
      }
      const result = await TelegramController.archiveAllGroupsAndChannels(accountId, io);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Archive all groups error:", error);
      res.status(500).json({ error: String(error?.message || error) });
    }
  });

  return router;
};

export default telegramRoutes;
