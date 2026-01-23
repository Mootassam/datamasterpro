import EmailController from "../../controllers/EmailController";
import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError"

export default (io) => async (req, res, next) => {
    try {

        const number = req.body.much;
        const country = req.body.country.label;
        const gender = req.body.gender;
        const type = req.body.type;
        const provider = req.body.provider;

        const payload = await EmailController.generate(
            number,
            country,
            gender,
            type,
            provider
        );

        await HandleErros.success(req, res, payload)
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}