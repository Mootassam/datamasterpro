import EmailController from "./EmailController";
import PhoneNumberController from "./phoneNumberController";
import TelegramController from "./TelegramController";

interface CancellationResult {
  success: boolean;
  message: string;
}

class CancelController {
  static async cancelProcess(service: string): Promise<CancellationResult> {
    if (!service) {
      return {
        success: false,
        message: "Service type is required",
      };
    }

    try {
      let cancelled = false;
      let message = "";

      switch (service.toLowerCase()) {
        case "whatsapp":
        case "bulkwhatsapp":
          PhoneNumberController.cancelCurrentOperation();
          cancelled = true; // Assume cancellation is always successful if method is called
          message = "WhatsApp verification cancelled successfully";
          break;

        case "email":
        case "bulkwhatsapp":
          cancelled = EmailController.cancelCurrentOperation();
          message = cancelled
            ? "Email verification cancelled successfully"
            : "No active Email process to cancel";
          break;

        case "telegram":
          cancelled = TelegramController.cancelCurrentOperation();
          message = cancelled
            ? "Telegram verification cancelled successfully"
            : "No active Telegram process to cancel";
          break;

        default:
          return {
            success: false,
            message: "Invalid service type",
          };
      }

      return { success: cancelled, message };
    } catch (error) {
      console.error(`Error cancelling ${service} process:`, error);
      return {
        success: false,
        message: "Failed to cancel process",
      };
    }
  }
}

export default CancelController;
