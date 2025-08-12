import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError"

export default (io) => async (req, res, next) => {
    try {
        const payload = await PhoneNumberController.generatePhoneNumbers(
            req,
        );
        await HandleErros.success(req, res, payload)
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}