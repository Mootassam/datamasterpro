import PhoneNumberController from "../../controllers/phoneNumberController";
import HandleErros from "../../HandleError"

export default (io) => async (req, res, next) => {
    try {

        const user = req.body.users;
        const config = req.body.config
        const payload = await PhoneNumberController.saveUsers(
          user,
          res,
          io,
          config,
        );
     
        await HandleErros.success(req, res, payload)
    } catch (error) {
        await HandleErros.Error(req, res, error)
    }
}