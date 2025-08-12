import EmailController from "../../controllers/EmailController";
import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError"

export default (io) => async (req, res, next) => {
    try {

        const emails = req.body.email;
        const config = req.body.config

        const payload = await EmailController.verify(
            emails,
            res,
            io,
            config
        );
        await HandleErros.success(req, res, payload)
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}