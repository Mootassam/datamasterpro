export default (app, io) => {

    
    app.post("/generate", require("./generate").default(io));
    app.post("/save", require("./verify").default(io));
    app.post("/download", require("./download").default(io));
    app.post("/upload", require("./upload").default(io));
    app.post("/message", require("./bulkMessage").default(io));
    app.get("/getdetails/:id", require("./contactDetails").default(io))
    // app.post("/telegramcheck", require("./verifyTelegram").default(io));
    // app.post("/message/telegram", require("./TelegrambulkMessage").default(io));
    app.post("/cancel", require("./CancelProcess").default(io));

    // Proxy management endpoints (simple stubs)
    app.post("/phone/proxy/save", (req, res) => {
        try {
            const { host, port, type } = req.body || {};
            if (!host || !port) {
                return res.status(400).json({ error: "Host and port are required" });
            }
            const proxy = {
                ip: host,
                port: String(port),
                type: (type || 'socks5').toLowerCase(),
                country: 'unknown'
            };
            return res.status(200).json(proxy);
        } catch (e) {
            return res.status(500).json({ error: "Failed to save proxy" });
        }
    });

    app.post("/phone/proxy/test", (req, res) => {
        try {
            const { host, port, type } = req.body || {};
            if (!host || !port) {
                return res.status(400).json({ error: "Host and port are required" });
            }
            const proxy = {
                ip: host,
                port: String(port),
                type: (type || 'socks5').toLowerCase(),
                // Simulated country detection; in real implementation, perform a request through proxy
                country: 'us'
            };
            return res.status(200).json(proxy);
        } catch (e) {
            return res.status(500).json({ error: "Failed to test proxy" });
        }
    });

    app.post("/phone/proxy/delete", (req, res) => {
        try {
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: "Failed to delete proxy" });
        }
    });

}
