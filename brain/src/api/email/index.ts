export default (app, io) => {
    // Original email routes
    app.post("/email/generate", require("./generate").default(io));
    app.post("/email/verify", require("./verify").default(io));
    
    // Email account management routes
    const accountRoutes = require("./accounts").default(io);
    app.get("/email/accounts", accountRoutes.getAccounts);
    app.post("/email/accounts", accountRoutes.addAccount);
    app.put("/email/accounts/:id", accountRoutes.updateAccount);
    app.delete("/email/accounts/:id", accountRoutes.deleteAccount);
    app.post("/email/accounts/test", accountRoutes.sendTestEmail);
    
    // Email settings routes
    const settingsRoutes = require("./settings").default(io);
    app.get("/email/settings", settingsRoutes.getSettings);
    app.put("/email/settings", settingsRoutes.updateSettings);
    
    // Email campaign routes
    const campaignRoutes = require("./campaign").default(io);
    app.post("/email/campaign", campaignRoutes.startCampaign);
    app.delete("/email/campaign/:operationId", campaignRoutes.cancelCampaign);
}