import authAxios from "../../modules/shared/axios";

// Email Account Management
export const getEmailAccounts = async () => {
  const response = await authAxios.get("/phone/email/accounts");
  return response.data;
};

export const addEmailAccount = async (accountData) => {
  const response = await authAxios.post("/phone/email/accounts", accountData);
  return response.data;
};

export const updateEmailAccount = async (accountId, accountData) => {
  const response = await authAxios.put(`/phone/email/accounts/${accountId}`, accountData);
  return response.data;
};

export const deleteEmailAccount = async (accountId) => {
  const response = await authAxios.delete(`/phone/email/accounts/${accountId}`);
  return response.data;
};

export const sendTestEmail = async (accountId, testEmailAddress) => {
  const response = await authAxios.post(`/phone/email/accounts/${accountId}/test`, { testEmailAddress });
  return response.data;
};

// Email Settings Management
export const getEmailSettings = async () => {
  const response = await authAxios.get("/phone/email/settings");
  return response.data;
};

export const updateEmailSettings = async (settingsData) => {
  const response = await authAxios.put("/phone/email/settings", settingsData);
  return response.data;
};

// Email Campaign Management
export const startEmailCampaign = async (campaignData) => {
  const response = await authAxios.post("/phone/email/campaign", campaignData);
  return response.data;
};

export const cancelEmailCampaign = async (operationId) => {
  const response = await authAxios.delete(`/phone/email/campaign/${operationId}`);
  return response.data;
};