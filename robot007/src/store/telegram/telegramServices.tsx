import authAxios from "../../modules/shared/axios";

// Account management
export const getTelegramAccounts = async () => {
  const response = await authAxios.get("/telegram/accounts");
  return response.data;
};

export const telegramLogin = async (phoneNumber: string) => {
  const response = await authAxios.post("/telegram/logins", { phoneNumber });
  return response.data;
};

export const confirmOTP = async (accountId: string, phoneCode: string, phoneCodeHash: string) => {
  const response = await authAxios.post("/telegram/confirm-otp", {
    accountId,
    phoneCode,
    phoneCodeHash
  });
  return response.data;
};

export const confirm2FA = async (accountId: string, password: string) => {
  const response = await authAxios.post("/telegram/confirm-2fa", {
    accountId,
    password
  });
  return response.data;
};

export const telegramLogout = async (accountId: string) => {
  const response = await authAxios.post("/telegram/logout", { accountId });
  return response.data;
};

export const telegramLogoutAll = async () => {
  const response = await authAxios.post("/telegram/logout-all");
  return response.data;
};

// Phone number verification
export const verifyPhoneNumbers = async (phoneNumbers: string[], config: any) => {
  const response = await authAxios.post("/telegram/verify-numbers", {
    phoneNumbers,
    config
  });
  return response.data;
};

// Group management
export const getTelegramGroups = async (accountId: string) => {
  const response = await authAxios.post("/telegram/groups", { accountId });
  return response.data;
};

export const exportGroupMembers = async (accountId: string, groupId: string) => {

  const response = await authAxios.post("/telegram/export-group-members", {
    accountId,
    groupId
  });
  return response.data;
};

// File upload
export const uploadCSVFile = async (file: File) => {
  const formData = new FormData();
  formData.append("csvFile", file);
  
  const response = await authAxios.post("/telegram/upload-csv", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

// Messaging
export const sendTelegramMessages = async (accountId: string, phoneNumbers: string[], message: string, config: any) => {
  const response = await authAxios.post("/telegram/send-messages", {
    accountId,
    phoneNumbers,
    message,
    config
  });
  return response.data;
};

export const cancelScheduledMessage = async (messageId: string) => {
  const response = await authAxios.post("/telegram/cancel-message", { messageId });
  return response.data;
};

export const getScheduledMessages = async () => {
  const response = await authAxios.get("/telegram/scheduled-messages");
  return response.data;
};

// Operation management
export const cancelCurrentOperation = async () => {
  const response = await authAxios.post("/telegram/cancel-operation");
  return response.data;
};

// Helper function to download CSV data
export const downloadCSV = (data: any, filename: string = "telegram_data.csv") => {
  const blob = new Blob([data], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};