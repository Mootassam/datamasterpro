import CancelController from "../../controllers/CancellationController";
import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError"

export default (io) => async (req, res, next) => {
    try {
        const service = req.body.service
        const payload = await CancelController.cancelProcess(service);
        await HandleErros.success(req, res, payload)
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}