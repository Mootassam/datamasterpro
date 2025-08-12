import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError";

export default (io) => async (req, res) => {
    try {
        const payload = await PhoneNumberController.getConnectedAccounts();

        await HandleErros.success(req, res, payload);
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}