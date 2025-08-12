import authAxios from "../../modules/shared/axios";

export const generatePhoneNumbers = async (
  country: any,
  much: any,
  state: any,
  carrier
) => {
  const response = await authAxios.post("/generate", {
    state: state,
    country: country,
    much: much,
    carrier: carrier,
  });
  return response.data;
};

export const cancelProcess = async (service) => {
  const response = await authAxios.post("/cancel", { service: service });
  return response.data;
};

export const Login = async () => {
  const response = await authAxios.post("/login");
  return response.data;
};

export const listAccouns = async () => {
  const response = await authAxios.get("/listAccounts");
  return response.data;
};

export const TelegramLogin = async (phoneNumbers) => {
  const response = await authAxios.post("/auth/telegram", { phoneNumbers });
  return response.data;
};

export const ConfirmCode = async (phoneNumbers, code, codehash) => {
  const response = await authAxios.post("/auth/telegram/confirmOTP", {
    phoneNumbers,
    code,
    codehash,
  });
  return response.data;
};

export const Logout = async (accountId) => {
  const response = await authAxios.post("/logout", { accountId });
  return response.data;
};

export const LogoutAll = async () => {
  const response = await authAxios.post("/logoutAll");
  return response.data;
};

export const StoreAPi = async (newApi) => {
  const response = await authAxios.post("phone/telegram/api/store", newApi);
  return response.data;
};

export const getAPi = async () => {
  const response = await authAxios.get("phone/telegram/api/get");
  return response.data;
};

export const deleteApiCred = async (id) => {
  const response = await authAxios.delete(`phone/telegram/api/delete/${id}`);
  return response.data;
};

export const allApi = async () => {
  const response = await authAxios.get("phone/telegram/api/all");
  return response.data;
};

export const TelegramLogout = async (id) => {
  const response = await authAxios.post("phone/logout/telegram", id);
  return response.data;
};

export const getDetail = async (number) => {
  const response = await authAxios.get(`/getdetails/${number}`);
  return response.data;
};

export const checkTelegramNumber = async (numbers: any, config) => {
  const response = await authAxios.post("/telegramcheck", {
    users: numbers,
    config,
  });
  return response.data;
};

export const getTelegramUser = async (UserId: any) => {
  const response = await authAxios.get(
    `/telegram/api/getUserDetails/${UserId}`
  );
  return response.data;
};

export const checkwhatsAppNumber = async (numbers: any, config) => {
  const response = await authAxios.post("/save", {
    users: numbers,
    config,
  });
  return response.data;
};

export const sendwhatsAppMessage = async (
  time: any,
  messages: any,
  phoneNumbers: any,
  useRandomDelay: boolean,
  selectedAccounts
) => {
  const response = await authAxios.post("/message", {
    time,
    messages,
    phoneNumbers,
    useRandomDelay,
    selectedAccounts,
  });
  return response.data;
};

export const sendTelegramMessage = async (
  time: any,
  messages: any,
  phoneNumbers: any
) => {
  const response = await authAxios.post("/message/telegram", {
    time,
    messages,
    phoneNumbers,
  });
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("csvFile", file);
  const response = await authAxios.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const downloadFile = async (data) => {
  const response = await authAxios.post(
    "/download",
    {
      phoneNumbers: data,
    },
    {
      responseType: "blob", // Set the response type to 'blob' to receive the file as a blob object
    }
  );
  const blob = new Blob([response.data], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "downloaded_numbers.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Email Generate

export const generateEmail = async (much: any, country, gender) => {
  const response = await authAxios.post("/email/generate", {
    much: much,
    country: country,
    gender: gender,
  });
  return response.data;
};

export const DisconnectAll = async () => {
  const response = await authAxios.post("/forceDisconnectAll");
  return response.data;
};

export const listGroups = async (accountId) => {
  const response = await authAxios.post("/getGroups", { accountId });
  return response.data;
};

export const exportGroupMembers = async (accountId, groupId) => {
  const response = await authAxios.post("/exportGroupMembers", {
    accountId,
    groupId,
  });
  const blob = new Blob([response.data], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "downloaded_numbers.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

//

// Email Verify
export const VerifyEmail = async (emails: any, config) => {
  const response = await authAxios.post("/email/verify", {
    email: emails,
    config,
  });
  return response.data;
};
