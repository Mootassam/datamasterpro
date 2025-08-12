class NumberGenerator {
    static generatePhoneNumbers() {
        const phoneNumbers = [] as string[];
        for (let i = 0; i < 1000; i++) {
          const phoneNumber = this.generatePhoneNumber();
          phoneNumbers.push(phoneNumber);
        }
        return phoneNumbers;
      }

      static generatePhoneNumber() {
        const areaCode = '+852'; // Hong Kong's country code
        const validFirstDigits = ['5', '6', '9'];
        const firstDigit = validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
        const number = Math.floor(Math.random() * 9000000) + 1000000; // Random 7-digit number
        return areaCode + firstDigit + number;
      }
}

export default NumberGenerator