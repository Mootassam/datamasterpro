import EmailController from "../../controllers/EmailController";
import HandleErros from "../../HandleError";

export default (io) => {
    return {
        // Start a bulk email campaign
        startCampaign: async (req, res) => {
            try {
                const campaignData = req.body;
                
                // Validate campaign data
                if (!campaignData.subject || !campaignData.content || 
                    !campaignData.senders || !campaignData.recipients || 
                    campaignData.senders.length === 0 || campaignData.recipients.length === 0) {
                    throw new Error('Invalid campaign data. Missing required fields.');
                }
                
                // Start the campaign
                const operationId = await EmailController.sendBulkEmail(campaignData, io);
                await HandleErros.success(req, res, { operationId });
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        },

        // Cancel an ongoing email campaign
        cancelCampaign: async (req, res) => {
            try {
                const { operationId } = req.params;
                const result = EmailController.cancelEmailSending(operationId);
                
                if (result) {
                    await HandleErros.success(req, res, { message: 'Campaign cancelled successfully' });
                } else {
                    throw new Error('Campaign not found or already completed');
                }
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        }
    };
};