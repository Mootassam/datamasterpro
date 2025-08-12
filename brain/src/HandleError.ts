class HandleErros {


    static async success(req, res, payload) {
        if (payload !== undefined) {
            res.status(200).send(payload);
        } else {
            res.sendStatus(200);
        }
    }


    static async Error(req, res, error) {
        if (error && [400, 401, 402, 403, 404].includes(error.code)) {
            res.status(error.code).send(error.message);
        } else {
            console.error(error);
            res.status(500).send(error.message);
        }
    }



}

export default HandleErros