
import data from './emailData'

class MultiCultureNames {

  static domains = [
    'gmail.com'
  ];
  static getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static getRandomNumber(length = 3) {
    return Math.floor(Math.random() * Math.pow(10, length));
  }

  static generateName(culture: string, gender: any): string {
    const cultureData = data[culture];
    if (!cultureData) throw new Error(`Culture '${culture}' not supported`);

    let firstNames: string[] = [];
    let lastNames: string[] = [];

    if (gender === 'other') {
      const male = cultureData.male?.firstNames || [];
      const female = cultureData.female?.firstNames || [];
      firstNames = [...male, ...female];
      lastNames = cultureData.male?.lastNames || []; // Use male last names as fallback
    } else {
      const genderData = cultureData[gender];
      if (!genderData || !genderData.firstNames) {
        throw new Error(`Gender '${gender}' not supported for culture '${culture}'`);
      }
      firstNames = genderData.firstNames;
      lastNames = genderData.lastNames || cultureData.male?.lastNames || [];
    }

    const first = this.getRandomElement(firstNames);
    const last = this.getRandomElement(lastNames);
    const domain = this.getRandomElement(this.domains);
    const number = this.getRandomNumber(2);
    const sep = this.getRandomElement(['', '.', '_']);

    const formats = [
      () => `${first}${sep}${last}${number}`,
      () => `${first}${sep}${last}`,
      () => `${first}${last}`,
      () => `${first}${number}`,
      () => `${first}`,
      () => `${last}${number}`,
      () => `${last}`,
      () => `${last}${sep}${first}`,
      () => `${first.charAt(0)}${sep}${last}${number}`,
      () => `${last}${sep}${first}${number}`
    ];

    const format = this.getRandomElement(formats);
    return `${format()}@${domain}`;
  }



  static generateFirstName(culture: string, gender: 'male' | 'female' = 'male'): string {
    const cultureData = (data as any)[culture.toLowerCase()];
    if (!cultureData) throw new Error(`Culture '${culture}' not supported`);

    const genderData = cultureData[gender];
    if (!genderData) throw new Error(`Gender '${gender}' not supported for culture '${culture}'`);

    return this.getRandomElement(genderData.firstNames);
  }

  static generateLastName(culture: string, gender: 'male' | 'female' = 'male'): string {
    const cultureData = (data as any)[culture.toLowerCase()];
    if (!cultureData) throw new Error(`Culture '${culture}' not supported`);

    const genderData = cultureData[gender];
    if (!genderData) throw new Error(`Gender '${gender}' not supported for culture '${culture}'`);

    return this.getRandomElement(genderData.lastNames);
  }
}

export default MultiCultureNames;

