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

export const importMembersToGroup = async (accountId: string, groupId: string, members: string[], config: any) => {
  const response = await authAxios.post("/telegram/import-members", {
    accountId,
    groupId,
    members,
    config
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

export const sendGroupMessages = async (
  accountId: string,
  groupIds: string[],
  message: string,
  imageFile?: File
) => {
  const formData = new FormData();
  formData.append("accountId", accountId);
  formData.append("message", message);
  formData.append("groupIds", JSON.stringify(groupIds));
  if (imageFile) {
    formData.append("image", imageFile);
  }
  const response = await authAxios.post("/telegram/send-group-messages", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};

export const sendGroupMessagesJson = async (
  accountId: string,
  groupIds: string[],
  message: string
) => {
  const response = await authAxios.post("/telegram/send-group-messages", {
    accountId,
    groupIds,
    message
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

// Dialog filters (folders)
export const getDialogFilters = async (accountId: string) => {
  const response = await authAxios.post("/telegram/dialog-filters", { accountId });
  return response.data;
};

// Group discovery and scraping
export const autoDiscoverTelegramGroups = async (accountId: string, keywords: string[], limit: number) => {
  const response = await authAxios.post("/telegram/auto-discover-groups", {
    accountId,
    keywords,
    limit
  });
  return response.data;
};

export const joinTelegramGroup = async (accountId: string, inviteLink: string) => {
  const response = await authAxios.post("/telegram/join-group", {
    accountId,
    inviteLink
  });
  return response.data;
};

export const scrapeTelegramMembers = async (accountId: string, inviteLink: string) => {
  const response = await authAxios.post("/telegram/scrape-members", {
    accountId,
    inviteLink
  });
  return response.data;
};

// Bulk messages to groups with optional image
export const sendBulkMessagesToTelegramGroups = async (
  accountId: string,
  groups: Array<{ id: string; access_hash?: string; title?: string; username?: string }>,
  message: string,
  config?: any,
  imageFile?: File
) => {
  const formData = new FormData();
  formData.append("accountId", accountId);
  formData.append("groups", JSON.stringify(groups));
  formData.append("message", message);
  if (config) formData.append("config", JSON.stringify(config));
  if (imageFile) formData.append("file", imageFile);
  const response = await authAxios.post("/telegram/send-messages-to-groups", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
};
