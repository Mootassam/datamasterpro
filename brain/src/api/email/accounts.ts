import EmailController from "../../controllers/EmailController";
import HandleErros from "../../HandleError";

export default (io) => {
    return {
        // Get all email accounts
        getAccounts: async (req, res) => {
            try {
                const accounts = EmailController.getAccounts();
                await HandleErros.success(req, res, accounts);
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        },

        // Add a new email account
        addAccount: async (req, res) => {
            try {
                const accountData = req.body;
                
                // Test the account connection first
                const isValid = await EmailController.testAccount(accountData);
                if (!isValid) {
                    throw new Error('Failed to connect to email server with provided credentials');
                }
                
                const newAccount = await EmailController.addAccount(accountData);
                await HandleErros.success(req, res, newAccount);
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        },

        // Update an existing email account
        updateAccount: async (req, res) => {
            try {
                const { id } = req.params;
                const accountData = req.body;
                
                // If SMTP settings changed, test the connection
                if (accountData.smtpHost || accountData.smtpPort || accountData.password || accountData.security) {
                    const isValid = await EmailController.testAccount({
                        ...EmailController.getAccounts().find(acc => acc.id === id),
                        ...accountData
                    });
                    
                    if (!isValid) {
                        throw new Error('Failed to connect to email server with provided credentials');
                    }
                }
                
                const updatedAccount = await EmailController.updateAccount(id, accountData);
                await HandleErros.success(req, res, updatedAccount);
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        },

        // Delete an email account
        deleteAccount: async (req, res) => {
            try {
                const { id } = req.params;
                await EmailController.deleteAccount(id);
                await HandleErros.success(req, res, { message: 'Account deleted successfully' });
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        },

        // Send a test email
        sendTestEmail: async (req, res) => {
            try {
                const { accountId, testEmail } = req.body;
                const result = await EmailController.sendTestEmail(accountId, testEmail);
                await HandleErros.success(req, res, result);
            } catch (error) {
                await HandleErros.Error(req, res, error);
            }
        }
    };
};