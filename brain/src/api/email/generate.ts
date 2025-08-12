import EmailController from "../../controllers/EmailController";
import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError"

export default (io) => async (req, res, next) => {
    try {

        const number = req.body.much;
        const country = req.body.country.label;
        const gender = req.body.gender;



        const payload = await EmailController.generate(
            number,
            country,
            gender
        );

        await HandleErros.success(req, res, payload)
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}