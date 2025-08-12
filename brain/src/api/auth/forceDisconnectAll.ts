import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError";

export default (io ,req) => async (req, res) => {
    try {
        const accountId = req.body.accountId; // Assuming accountId is passed in the request body
        const payload = PhoneNumberController.forceDisconnectAll(io);
        await HandleErros.success(req, res, payload);
    } catch (error) {
        HandleErros.Error(req, res, error)
    }
}