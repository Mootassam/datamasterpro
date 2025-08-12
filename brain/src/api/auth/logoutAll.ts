import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError";

export default (io) => async (req, res) => {
    try {
        const payload = PhoneNumberController.logoutAll(io);
        await HandleErros.success(req, res, payload);
    } catch (error) {
        HandleErros.Error(req, res, error)
    }
}