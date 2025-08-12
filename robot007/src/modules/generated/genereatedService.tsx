import authAxios from "../shared/axios";
export default class GenerateService {
  static async getNumbers() {
    try {
      const response = await authAxios.get(
        "/phone/generate"
      );
      return response;
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }

  static async checkWhatsApp(numbers: any) {
    try {
      const reponse = await authAxios.post(
        "/phone/save",
        {
          users: numbers,
        }
      );
      return reponse;
    } catch (error) {
      console.log("====================================");
      console.log(error);
      console.log("====================================");
    }
  }
}
