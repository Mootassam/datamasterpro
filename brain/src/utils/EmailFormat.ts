
import data from './emailData'

class MultiCultureNames {

  static domains = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com', 'yandex.com', 'mail.com'
  ];

  static businessPrefixes = [
    'info', 'contact', 'support', 'sales', 'admin', 'hello', 'team', 'jobs', 'career', 'office', 'hr', 'inquiry', 'media', 'press', 'help'
  ];

  static companySuffixes = [
    'Tech', 'Solutions', 'Group', 'Consulting', 'Systems', 'Global', 'Media', 'Labs', 'Digital', 'Studio', 'Ventures', 'Holdings', 'Inc', 'Corp', 'Ltd'
  ];

  static getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static getRandomNumber(length = 3) {
    return Math.floor(Math.random() * Math.pow(10, length));
  }

  static generateName(culture: string, gender: any, type: 'person' | 'company' = 'person', provider: string = 'all'): string {
    const cultureData = data[culture];
    if (!cultureData) throw new Error(`Culture '${culture}' not supported`);

    // Handle Company Generation
    if (type === 'company') {
        const lastName = this.getRandomElement(cultureData.male?.lastNames || []); // Use last names as base for company names
        const suffix = Math.random() > 0.5 ? this.getRandomElement(this.companySuffixes) : '';
        const companyName = `${lastName}${suffix}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const prefix = this.getRandomElement(this.businessPrefixes);
        
        // For companies, we usually generate a custom domain based on the company name
        const domain = `${companyName}.com`; 
        return `${prefix}@${domain}`;
    }

    // Handle Person Generation
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
    
    // Handle Provider Selection
    let domain;
    if (provider && provider !== 'all') {
        domain = provider;
    } else {
        domain = this.getRandomElement(this.domains);
    }
    
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
    // Sanitize to ensure valid email characters
    const emailUser = format().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    return `${emailUser}@${domain}`;
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

