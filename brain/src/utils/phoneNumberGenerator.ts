import CountryFormat from "./CountryFormat";
class PhoneNumberGenerator {
  static async generatePhoneNumbers(req: any) {
    let countryCode = req.body.country.value;
    const much = req.body.much;
    const state = req.body.state;
    const carrier = req.body.carrier.value
    const target = Number(much) || 0;
    const formatFunction = CountryFormat[countryCode];
    if (!formatFunction) {
      throw new Error("Invalid country code or format function");
    }

    // Use a Set so the same number is never returned twice.
    const unique = new Set<string>();
    // Safety cap: stop trying after many misses so we never loop forever
    // when the available key-space is smaller than the requested amount.
    const maxAttempts = Math.max(target * 50, 1000);
    let attempts = 0;

    while (unique.size < target && attempts < maxAttempts) {
      attempts++;
      const phoneNumber =
        countryCode === "US" || countryCode === "CA"
          ? await formatFunction(state)   // pass area code for US/CA
          : await formatFunction(carrier); // pass carrier for other countries
      if (phoneNumber) unique.add(String(phoneNumber));
    }

    return Array.from(unique);
  }
}

export default PhoneNumberGenerator;
