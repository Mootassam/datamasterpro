export default (app, io) => {

  // app.post("/auth/telegram", require("./authTelegram").default(io));
  // app.post("/auth/telegram/confirmOTP", require("./confirmOTP").default(io));
  app.post("/logout", require("./logoutWhatsApp").default(io));
  app.post("/login", require("./authWhatsApp").default(io));
  app.get("/listAccounts", require("./listAccounts").default(io));
  // app.post("/logout/telegram", require("./lgoutTelegram").default(io));
  // app.post("/telegram/api/store", require("./storeApiCredentials").default(io));
  // app.get("/telegram/api/get", require("./getApiCredentials").default(io));
  // app.get("/telegram/api/all", require("./AllApiCredentials").default(io));
  // app.delete("/telegram/api/delete/:id", require("./deleteApiCredentials").default(io));
  // app.get("/telegram/api/getUserDetails/:id", require("./getUserDetails").default(io));
  app.post("/logoutAll", require('./logoutAll').default(io))
  app.post("/forceDisconnectAll", require('./forceDisconnectAll').default(io))
  app.post("/getGroups", require('./getGroups').default(io))
  app.post("/exportGroupMembers", require('./exportGroupMembers').default(io))





}