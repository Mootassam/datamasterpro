import express, { Request, Response, Router } from "express";
import PhoneNumberController from "../controllers/phoneNumberController";
const router: Router = express.Router();

// Initialize Socket.io (assuming it's already set up in your app)

// Route to generate phone numbers

const phoneNumberRoutes = (io: any) => {
  // router.post("/generate", async (req: Request, res: Response) => {
  //   try {
  //     const phoneNumbers = await PhoneNumberController.generatePhoneNumbers(
  //       req,
  //       res,
  //          );
  //     res.json(phoneNumbers);
  //   } catch (error) {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // router.post("/login", async (req: Request, res: Response) => {
  //   try {
  //     await PhoneNumberController.login(io);
  //     res.status(200).json({ message: "Login successful" });
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     res.status(500).json({ error: "Failed to login" });
  //   }
  // });








  // Logout route
  // router.post("/logout", async (req: Request, res: Response) => {
  //   try {
  //     await PhoneNumberController.logout(io);
  //     res.status(200).json({ message: "Logout successful" });
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     res.status(500).json({ error: "Failed to logout" });
  //   }
  // });

  //Get the details about the nubmer 
  // router.get("/getdetails/:id", async (req: Request, res: Response) => {
  //   try {
  //     const data = await PhoneNumberController.phoneDetail(req, res, io);
  //     res.status(200).json(data);
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //     res.status(500).json({ error: "Connection required. Please scan the QR code to access contact details." });
  //   }
  // });




  // Route to save users and check WhatsApp registration
  // router.post("/save", async (req, res: Response) => {

  //   try {
  //     const user = req.body.users;
  //     const config = req.body.config
  //     const result = await PhoneNumberController.saveUsers(
  //       req.body.users,
  //       res,
  //       io,
  //       config,
  //     );
  //     res.json(result);
  //   } catch (error) {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // Route to download CSV
  // router.post("/download", async (req: Request, res: Response) => {
  //   try {
  //     const results = await PhoneNumberController.downloadCSV(req, res);
  //   } catch (error) {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // Route to upload CSV
  // router.post("/upload", async (req: Request, res: Response) => {
  //   try {
  //     const data = await PhoneNumberController.uploadCSV(req, res, io);
  //     res.json({ data });
  //   } catch (error) {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });

  // router.post("/message", async (req: Request, res: Response) => {
  //   try {
  //     const donePromise = new Promise<void>((resolve) => {
  //       io.once("done", () => {
  //         resolve();
  //       });
  //     });
  //     await PhoneNumberController.sendChat(req, res, io);
  //     await donePromise;
  //     res.status(200).json({ message: "succuess" });
  //   } catch (error) {
  //     res.status(500).json({ error: "Internal server error" });
  //   }
  // });
  return router;
};

export default phoneNumberRoutes;
