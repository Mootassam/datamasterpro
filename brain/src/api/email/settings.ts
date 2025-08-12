import EmailController from "../../controllers/EmailController";
import HandleErros from "../../HandleError";

export default (io) => {
    return {
        // Get email settings
        getSettings: async (req, res) => {
            try {
                const settings = EmailController.getSettings();
                await HandleErros.success(req, res, settings);
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        },

        // Update email settings
        updateSettings: async (req, res) => {
            try {
                const settingsData = req.body;
                const updatedSettings = EmailController.updateSettings(settingsData);
                await HandleErros.success(req, res, updatedSettings);
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        }
    };
};