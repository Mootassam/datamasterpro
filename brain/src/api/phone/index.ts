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

}