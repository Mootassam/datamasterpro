import CountryFormat from "./CountryFormat";
class PhoneNumberGenerator {
  static async generatePhoneNumbers(req: any) {
    let countryCode = req.body.country.value;
    const much = req.body.much;
    const state = req.body.state;
    const carrier = req.body.carrier.value
    const phoneNumbers: string[] = [];
    const formatFunction = CountryFormat[countryCode];
    if (!formatFunction) {
      throw new Error("Invalid country code or format function");
    }
    for (let i = 0; i < much; i++) {
      let phoneNumber;
      if (countryCode === "US" || countryCode === "CA") {
        // Only pass state for the US
        phoneNumber = await formatFunction(state);
      } else {
        // For other countries, just use the country code (no state)
        phoneNumber = await formatFunction(carrier);
      }
      phoneNumbers.push(phoneNumber);
    }
    return phoneNumbers;
  }
}

export default PhoneNumberGenerator;
