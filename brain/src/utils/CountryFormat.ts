


const RuFormat = (carrier) => {
  const areaCode = "7"; // Russia country code

  // Ensure carrier is valid (90, 91, 92, etc.)
  if (!["90", "91", "92"].includes(carrier.toString())) {
    throw new Error("Carrier must be 90, 91, or 92 for Russia mobile numbers");
  }

  // Generate 8 random digits
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  return areaCode + carrier + number; 
  // Example: 791812345678
};




const Germany = (carrier) => {
  const areaCode = "49"; // Germany country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // Fixed: 7-digit number
  return areaCode + carrier + number;
};

const UnitedKingdom = (carrier) => {
  const areaCode = "44"; // UK country code (fixed comment)
  const number = Math.floor(Math.random() * 9000000) + 1000000; // Fixed: 7-digit number
  return areaCode + carrier + number;
};

// France: 9 digits total (1 digit carrier + 8 digits number)
const France = (carrier) => {
  const areaCode = "33"; // France country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 33 + carrier (1) + 8 = 11 digits
};

const Italy = (carrier = "3") => {
  const areaCode = "39"; // Italy country code


  // Weighted first digit for the subscriber number (after "3")
  const weightedFirstDigit = () => {
    const r = Math.random();
    if (r < 0.35) return "4";   // 35% chance
    if (r < 0.6) return "5";    // 25% chance
    if (r < 0.75) return "3";   // 15% chance
    if (r < 0.9) return "2";    // 15% chance
    return "6";                  // 10% chance for remaining
  };

  const firstDigit = weightedFirstDigit();

  // Generate remaining 8 digits
  const rest = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  const number = firstDigit + rest; // total 9 digits after carrier

  return areaCode + carrier + number; 
  // Example: 3934XXXXXXXX (12 digits total)
};

// Example usage



// Spain: 9 digits total (1 digit carrier + 8 digits number)
const Spain = (carrier) => {
  const areaCode = "34"; // Spain country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 34 + carrier (1) + 8 = 11 digits
};

// Poland: 9 digits total (1 digit carrier + 8 digits number)
const Poland = (carrier) => {
  const areaCode = "48"; // Poland country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 48 + carrier (1) + 8 = 11 digits
};

// Ukraine: 9 digits total (2 digit carrier + 7 digits number)
const Ukraine = (carrier) => {
  const areaCode = "380"; // Ukraine country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 380 + carrier (2) + 7 = 12 digits
};

// Romania: 9 digits total (1 digit carrier + 8 digits number)
const Romania = (carrier) => {
  const areaCode = "40"; // Romania country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 40 + carrier (1) + 8 = 11 digits
};

// Netherlands: 9 digits total (1 digit carrier + 8 digits number)
const Netherlands = (carrier) => {
  const areaCode = "31"; // Netherlands country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 31 + carrier (1) + 8 = 11 digits
};

// Belgium: 9 digits total (1 digit carrier + 8 digits number)
const Belgium = (carrier) => {  // Fixed typo in function name (Belgium -> Belgium)
  const areaCode = "32"; // Belgium country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 32 + carrier (1) + 8 = 11 digits
};
// Sweden: Typically 9 digits total (country code + 7-9 digit number)
const Sweden = (carrier) => {
  const areaCode = "46"; // Sweden country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 46 + carrier (1) + 8 = 11 digits
};

// Czechia: Typically 9 digits total
const Czechia = (carrier) => {
  const areaCode = "420"; // Czechia country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 420 + carrier (2) + 7 = 12 digits
};

// Greece: Typically 10 digits total
const Greece = (carrier) => {
  const areaCode = "30"; // Greece country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 30 + carrier (2) + 8 = 12 digits
};

// Portugal: Typically 9 digits total
const Portugal = (carrier) => {
  const areaCode = "351"; // Portugal country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 351 + carrier (1) + 8 = 12 digits
};

// Hungary: Typically 9 digits total
const Hungary = (carrier) => {
  const areaCode = "36"; // Hungary country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 36 + carrier (2) + 7 = 11 digits
};

// Austria: Typically 10-11 digits total
const Austria = (carrier) => {
  const areaCode = "43"; // Fixed: Austria country code (was 36)
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 43 + carrier (3) + 8 = 13 digits
};

// Switzerland: Typically 9 digits total
const Switzerland = (carrier) => {
  const areaCode = "41"; // Switzerland country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 41 + carrier (2) + 7 = 11 digits
};

// Serbia: Typically 8-9 digits total
const Serbia = (carrier) => {
  const areaCode = "381"; // Serbia country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 381 + carrier (1) + 7 = 11 digits
};

// Bulgaria: Typically 9 digits total
const Bulgaria = (carrier) => {
  const areaCode = "359"; // Bulgaria country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 359 + carrier (1) + 7 = 11 digits
};
// Denmark: 8 digits total (country code + 8 digit number)
const Denmark = (carrier) => {
  const areaCode = "45"; // Denmark country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 45 + carrier (0) + 8 = 10 digits
};

// Slovakia: 9 digits total
const Slovakia = (carrier) => {
  const areaCode = "421"; // Slovakia country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 421 + carrier (1) + 7 = 11 digits
};

// Finland: 9-10 digits total
const Finland = (carrier) => {
  const areaCode = "358"; // Finland country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 358 + carrier (1) + 8 = 12 digits
};

// Norway: 8 digits total
const Norway = (carrier) => {
  const areaCode = "47"; // Norway country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 47 + carrier (0) + 8 = 10 digits
};

// Ireland: 9 digits total
const Ireland = (carrier) => {
  const areaCode = "353"; // Ireland country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 353 + carrier (1) + 7 = 11 digits
};

// Croatia: 8-9 digits total
const Croatia = (carrier) => {
  const areaCode = "385"; // Croatia country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 385 + carrier (1) + 8 = 13 digits
};

// Moldova: 8 digits total
const Moldova = (carrier) => {
  const areaCode = "373"; // Moldova country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 373 + carrier (1) + 7 = 11 digits
};

// Bosnia: 8 digits total
const Bosnia = (carrier) => {
  const areaCode = "387"; // Bosnia country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 387 + carrier (1) + 7 = 11 digits
};

// Albania: 9 digits total (already correct)
const Albania = (carrier) => {
  const countryCode = "355"; // Albania country code
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `${countryCode}${carrier}${number}`; // e.g., 35568123456 (total 11 digits)
};



// Lithuania: Typically 8 digits total (country code + 8 digits)
const Lithuania = (carrier) => {
  const areaCode = "370"; // Lithuania country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 370 + carrier (0) + 8 = 11 digits
};

// Slovenia: Typically 8 digits total
const Slovenia = (carrier) => {
  const areaCode = "386"; // Slovenia country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 386 + carrier (0) + 8 = 11 digits
};

// Macedonia: Typically 8 digits total
const Macedonia = (carrier) => {
  const areaCode = "389"; // North Macedonia country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 389 + carrier (0) + 8 = 12 digits
};

// Latvia: Typically 8 digits total
const Latvia = (carrier) => {
  const areaCode = "371"; // Latvia country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 371 + carrier (0) + 8 = 11 digits
};

// Estonia: Typically 7-8 digits total
const Estonia = (carrier) => {
  const areaCode = "372"; // Estonia country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 372 + carrier (0) + 7 = 10 digits
};

// Luxembourg: Typically 9 digits total
const Luxembourg = (carrier) => {
  const areaCode = "352"; // Luxembourg country code
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8-digit number
  return areaCode + carrier + number; // Total: 352 + carrier (1) + 8 = 12 digits
};
// Montenegro: 382 + 2-digit carrier + 7-digit number = 12 digits
const Montenegro = (carrier) => {
  const areaCode = "382"; // Montenegro country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 7 digits
  return areaCode + carrier + number; // Total: 12 digits
};

// Malta: 356 + 2-digit carrier + 6-digit number = 11 digits
const Malta = (carrier) => {
  const areaCode = "356"; // Malta country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return areaCode + carrier + number; // Total: 11 digits
};

// Iceland: 354 + 3-digit carrier + 6-digit number = 12 digits
const Iceland = (carrier) => {
  const areaCode = "354"; // Iceland country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return areaCode + carrier + number; // Total: 12 digits
};

// Andorra: 376 + 1-digit carrier + 5-digit number = 10 digits
const Andorra = (carrier) => {
  const areaCode = "376"; // Andorra country code
  const number = Math.floor(Math.random() * 90000) + 10000; // 5 digits
  return areaCode + carrier + number; // Total: 10 digits
};

// Liechtenstein: 423 + 3-digit carrier + 7-digit number = 13 digits
const Liechtenstein = (carrier) => {
  const areaCode = "423"; // Liechtenstein country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
  return areaCode + carrier + number; // Total: 13 digits
};

// Monaco: 377 + 2-digit carrier + 6-digit number = 11 digits
const Monaco = (carrier) => {
  const areaCode = "377"; // Monaco country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return areaCode + carrier + number; // Total: 11 digits
};

// San Marino: 378 + 2-digit carrier + 6-digit number = 11 digits
const SanMarino = (carrier) => {  // Fixed function name from Marino
  const areaCode = "378"; // San Marino country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return areaCode + carrier + number; // Total: 11 digits
};

// Vatican City: 379 + 2-digit carrier + 6-digit number = 11 digits
const Holy = (carrier) => {  // Renamed to be clearer
  const areaCode = "379"; // Vatican City country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return areaCode + carrier + number; // Total: 11 digits
};

// Isle of Man: 44 + 2-digit carrier + 6-digit number = 11 digits
const Isle = (carrier) => {  // Renamed to be clearer
  const areaCode = "44"; // Isle of Man country code (UK numbering plan)
  const number = Math.floor(Math.random() * 900000) + 100000; // 6 digits
  return areaCode + carrier + number; // Total: 11 digits
};

const Faroe = (carrier) => {
  const areaCode = "298"; // Faroe Islands country code
  const number = Math.floor(Math.random() * 90000) + 10000; // 5-digit number
  return areaCode + carrier + number; // Total: 298 + carrier + 5 digits
};
// Usage: Faroe("5") → "298512345" (typically 6 digits total)
const Gibraltar = (carrier) => {
  const areaCode = "350"; // Gibraltar country code
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
  return areaCode + carrier + number; // Total: 350 + carrier + 6 digits
};
// Usage: Gibraltar("5") → "3505123456" (typically 8 digits total)

const InFormat = () => {
  const areaCode = "91"; // India country code

  // Generate a 10-digit mobile number starting with 6-9
  const firstDigit = ["6", "7", "8", "9"][Math.floor(Math.random() * 4)];
  const rest = Math.floor(Math.random() * 1000000000) // 9 digits
    .toString()
    .padStart(9, "0");

  const number = firstDigit + rest; // total 10 digits
  return areaCode + number; // E.164 format without '+'
};

// Example usage


// Usage: InFormat("9") → "919123456789" (typically 12 digits total)

const HkFormat = (carrier) => {
  const areaCode = "852"; // Hong Kong country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number; // Total: 852 + carrier + 7 digits
};
// Usage: HkFormat("6") → "85261234567" (typically 11 digits total)



/////////// Asia Countries //////////////
/////////////////////////////////////////

const Afghanistan = (carrier) => {
  const areaCode = "93"; // Country code
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0'); // 7-digit number
  return areaCode + carrier + number; // Total: 93 + carrier (2 digits) + 7 = 12 digits
};
// Example: Afghanistan("70") → "93701234567"

const Armenia = (carrier) => {
  const areaCode = "374"; // Country code
  const number = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // 5-digit number
  return areaCode + carrier + number; // Total: 374 + carrier (2 digits) + 5 = 10 digits
};
// Example: Armenia("91") → "3749112345"
const Azerbaijan = (carrier) => {
  const areaCode = "994"; // Country code
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6-digit number
  return areaCode + carrier + number; // Total: 994 + carrier (2 digits) + 6 = 12 digits
};
// Example: Azerbaijan("50") → "99450123456"


const Bangladesh = (carrier) => {
  const areaCode = "880"; // Country code
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0'); // 7-digit number
  return areaCode + carrier + number; // Total: 880 + carrier (2 digits) + 7 = 11 digits
};
// Example: Bangladesh("17") → "880171234567"
const Bhutan = (carrier) => {
  const areaCode = "975"; // Country code
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6-digit number
  return areaCode + carrier + number; // Total: 975 + carrier (2 digits) + 6 = 12 digits
};
// Example: Bhutan("17") → "97517123456"

const Brunei = (carrier) => {
  const areaCode = "673"; // Country code
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6-digit number
  return areaCode + carrier + number; // Total: 673 + carrier (1 digit) + 6 = 10 digits
};
// Example: Brunei("7") → "6737123456"

const Cambodia = (carrier) => {
  const areaCode = "855"; // Country code
  const number = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // 5-digit number
  return areaCode + carrier + number; // Total: 855 + carrier (2 digits) + 5 = 11 digits
};
// Example: Cambodia("12") → "8551212345"

const China = (carrier) => {
  const areaCode = "86"; // Country code
  const secondDigit = Math.floor(Math.random() * 10).toString(); // Random 0-9
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0'); // 8-digit number
  return areaCode + carrier + secondDigit + number; // Total: 86 + carrier (1 digit) + 1 + 8 = 11 digits
};
// Example: China("1") → "861123456789"

const Georgia = (carrier) => {
  const areaCode = "995"; // Country code
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0'); // 7-digit number
  return areaCode + carrier + number; // Total: 995 + carrier (3 digits) + 7 = 14 digits
};
// Example: Georgia("555") → "9955551234567"
const Indonesia = (carrier) => {
  // Format: +62 [carrier code 2-3 digits] [7-8 digit number]
  // Example: +62 812 3456789 (Telkomsel)
  const areaCode = "62";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 62 + carrier (2-3 digits) + 7 digits
};

const Iran = (carrier) => {
  // Format: +98 [carrier code 2 digits] [7 digit number]
  // Example: +98 91 2345678 (Hamrahe Aval)
  const areaCode = "98";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 98 + carrier (2 digits) + 7 digits
};

const Iraq = (carrier) => {
  // Format: +964 [carrier code 2 digits] [7 digit number]
  // Example: +964 79 0123456 (Zain)
  const areaCode = "964";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 964 + carrier (2 digits) + 7 digits
};

const Israel = (carrier) => {
  // Format: +972 [carrier code 2 digits] [7 digit number]
  // Example: +972 52 1234567 (Cellcom)
  const areaCode = "972";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 972 + carrier (2 digits) + 7 digits
};

const Japan = (carrier) => {
  // Format: +81 [carrier code 2 digits] [8 digit number]
  // Example: +81 90 12345678 (NTT Docomo)
  const areaCode = "81";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + carrier + number; // 81 + carrier (2 digits) + 8 digits
};

const Jordan = (carrier) => {
  // Format: +962 [carrier code 2 digits] [7 digit number]
  // Example: +962 79 1234567 (Zain Jordan)
  const areaCode = "962";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 962 + carrier (2 digits) + 7 digits
};

const Kazakhstan = (carrier) => {
  // Format: +7 [carrier code 3 digits] [7 digit number]
  // Example: +7 701 1234567 (Kcell)
  const areaCode = "7";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 7 + carrier (3 digits) + 7 digits
};
const Kyrgyzstan = (carrier) => {
  // Format: +996 [carrier code 3 digits] [6 digits]
  // Example: +996 555 123456 (Beeline)
  const areaCode = "996";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier.padStart(3, '0') + number; // Total: 996 + 3 + 6 = 12 digits
};

const Laos = (carrier) => {
  // Format: +856 [carrier code 2 digits] [7 digits]
  // Example: +856 20 1234567 (LaoTelecom)
  const areaCode = "856";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 856 + 2 + 7 = 12 digits
};

const Lebanon = (carrier) => {
  // Format: +961 [carrier code 1-2 digits] [6-7 digits]
  // Example: +961 3 123456 (Alfa), +961 70 123456 (Touch)
  const areaCode = "961";
  const numberLength = carrier.length === 1 ? 7 : 6;
  const number = Math.floor(Math.random() * Math.pow(10, numberLength)).toString().padStart(numberLength, '0');
  return areaCode + carrier + number; // 961 + 1/2 + 6/7 = 10-12 digits
};

const Macau = (carrier) => {
  // Format: +853 [carrier code 1 digit] [7 digits]
  // Example: +853 6 1234567 (CTM)
  const areaCode = "853";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 853 + 1 + 7 = 11 digits
};

const Malaysia = (carrier) => {
  // Format: +60 [carrier code 1-2 digits] [7-8 digits]
  // Example: +60 12 3456789 (Maxis)
  const areaCode = "60";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + carrier + number; // 60 + 1/2 + 8 = 10-11 digits
};

const Maldives = (carrier) => {
  // Format: +960 [carrier code 1 digit] [6 digits]
  // Example: +960 7 123456 (Dhiraagu)
  const areaCode = "960";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number; // 960 + 1 + 6 = 10 digits
};

const Mongolia = (carrier) => {
  // Format: +976 [carrier code 2 digits] [6 digits]
  // Example: +976 99 123456 (Mobicom)
  const areaCode = "976";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number; // 976 + 2 + 6 = 11 digits
};

const Myanmar = (carrier) => {
  // Format: +95 [carrier code 1 digit] [7-8 digits]
  // Example: +95 9 12345678 (MPT)
  const areaCode = "95";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + carrier + number; // 95 + 1 + 8 = 12 digits
};

const Nepal = (carrier) => {
  // Format: +977 [carrier code 2 digits] [7 digits]
  // Example: +977 98 0123456 (Ncell)
  const areaCode = "977";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 977 + 2 + 7 = 12 digits
};

const NorthKorea = (carrier) => {
  // Format: +850 [carrier code 3 digits] [6 digits]
  // Example: +850 191 123456 (Koryolink)
  const areaCode = "850";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier.padStart(3, '0') + number; // 850 + 3 + 6 = 12 digits
};

const Pakistan = (carrier) => {
  // Format: +92 [carrier code 3 digits] [7 digits]
  // Example: +92 300 1234567 (Jazz)
  const areaCode = "92";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier.padStart(3, '0') + number; // 92 + 3 + 7 = 12 digits
};

const Palestine = (carrier) => {
  // Format: +970 [carrier code 2 digits] [7 digits]
  // Example: +970 59 1234567 (Jawwal)
  const areaCode = "970";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 970 + 2 + 7 = 12 digits
};

const Philippines = (carrier) => {
  console.log("Carrier:", carrier);

  const areaCode = "63";

  // Weighted choice for the first digit of subscriber number
  const weightedFirstDigit = () => {
    const r = Math.random();
    if (r < 0.6) return "8";   // 60% chance
    if (r < 0.85) return "5";  // 25% chance
    if (r < 0.95) return "9";  // 10% chance
    return Math.floor(Math.random() * 10).toString(); // 5% for other digits
  };

  // Generate subscriber number: first digit weighted, rest random
  const firstDigit = weightedFirstDigit();
  const rest = Math.floor(Math.random() * 1000000)  // 6 digits
    .toString()
    .padStart(6, "0");

  const number = firstDigit + rest; // total 7 digits
  return areaCode + carrier + number; 
  // Example: 63917 8xxxxxx
};




const Singapore = (carrier) => {
  // Format: +65 [8-digit number starting with 8/9]
  // Example: +65 81234567 (Singtel)
  const areaCode = "65";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier[0] + number; // 65 + 8/9 + 7 digits = 9 digits total
};

const SriLanka = (carrier) => {
  // Format: +94 [carrier digit 7] [7 digits]
  // Example: +94 77 1234567 (Dialog)
  const areaCode = "94";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 94 + 7 + 7 digits = 10 digits total
};

const Syria = (carrier) => {
  // Format: +963 [carrier digit 9] [7 digits]
  // Example: +963 93 1234567 (MTN)
  const areaCode = "963";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number; // 963 + 9 + 7 digits = 11 digits total
};

const Taiwan = (carrier) => {
  // Format: +886 [9-digit number starting with 9]
  // Example: +886 912345678 (Chunghwa Telecom)
  const areaCode = "886";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + "9" + number; // 886 + 9 + 8 digits = 12 digits total
};

const Thailand = (carrier) => {
  // Format: +66 [8-digit number starting with 6/8/9]
  // Example: +66 81234567 (AIS)
  const areaCode = "66";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier[0] + number; // 66 + 6/8/9 + 7 digits = 9 digits total
};

const Timor = (carrier) => {
  // Format: +670 [7-digit number starting with 7]
  // Example: +670 7712345 (Timor Telecom)
  const areaCode = "670";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + "7" + number; // 670 + 7 + 6 digits = 10 digits total
};

const Turkey = (carrier) => {
  // Format: +90 [10-digit number starting with 5]
  // Example: +90 5012345678 (Turkcell)
  const areaCode = "90";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + "5" + number; // 90 + 5 + 8 digits = 11 digits total
};

const Vietnam = (carrier) => {
  // Format: +84 [9-digit number starting with 3/5/7/8/9]
  // Example: +84 912345678 (Viettel)
  const areaCode = "84";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + carrier[0] + number; // 84 + 3/5/7/8/9 + 8 digits = 11 digits total
};

const Yemen = (carrier) => {
  // Format: +967 [7-digit number starting with 7]
  // Example: +967 7123456 (Yemen Mobile)
  const areaCode = "967";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + "7" + number; // 967 + 7 + 6 digits = 10 digits total
};



//////////// USA COUNTRIES ////////////////
///////////////////////////////////////////

const UnitedStates = (state) => {
  const areaCode = "1"; // United States country code
  const number = Math.floor(Math.random() * 9000000) + 1000000; // Random 7-digit number
  return areaCode + state + number;
};

const Canada = (carrier) => {
  const areaCode = "1"; // Canda country code
  //   Toronto, Ontario	+1 (647) 555-5678
  // Vancouver, British Columbia	+1 (778) 555-4321
  // Montreal, Quebec	+1 (438) 555-7890
  // Ottawa, Ontario	+1 (343) 555-2109
  // Edmonton, Alberta	+1 (825) 555-7896


  const number = Math.floor(Math.random() * 9000000) + 100000; // Random 7-digit number
  return areaCode + carrier + number;
};


const Mexico = (carrier) => {
  const areaCode = "52";
  const validcarrieres = ["55", "81", "33", "656", "722", "744", "998", "444", "961", "229"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


const Belize = (carrier) => {
  const areaCode = "501";
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
  return areaCode + carrier + number;
};

const CostaRica = (carrier) => {
  const areaCode = "506";
  const validcarrieres = ["2", "4", "5", "6", "7", "8"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};

const ElSalvador = (carrier) => {
  const areaCode = "503";

  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};


const Guatemala = (carrier) => {
  const areaCode = "502";
  const validcarrieres = ["2", "3", "4", "5", "6", "7"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};

const Honduras = (carrier) => {
  const areaCode = "504";
  const validcarrieres = ["2", "3", "8", "9"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};

const Nicaragua = (carrier) => {
  const areaCode = "505";
  const validcarrieres = ["2", "5", "7", "8"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};

const Panama = (carrier) => {
  const countryCode = "507";
  const validcarrieres = ["833", "836", "838"];
  const lineNumber = Math.floor(Math.random() * 1000).toString().padStart(4, "0");
  return countryCode + carrier + lineNumber; // carrier (1 digit) + line number (7 digits) = 8 digits + countryCode
};


const Antigua = (carrier) => {
  const areaCode = "1268";
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7 digits
  return areaCode + carrier + number;
};

const Bahamas = (carrier) => {
  const areaCode = "+1242";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


// 
const Barbados = (carrier) => {
  const areaCode = "1246";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const Cuba = (carrier) => {
  const areaCode = "53";
  const validcarrieres = ["5", "7", "3"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};

const Dominica = (carrier) => {
  const areaCode = "1767";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


const DominicanRepublic = (carrier) => {
  const areaCode = "+1";
  const validcarrieres = ["809", "829", "849"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


const Grenada = (carrier) => {
  const areaCode = "1473";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


const Haiti = (carrier) => {
  const areaCode = "509";
  const validcarrieres = ["3", "4"];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number.toString().slice(1);
};

const Jamaica = (carrier) => {
  const areaCode = "1";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


const SaintNevis = (carrier) => {
  const areaCode = "1869";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


// const SaintNevis = (carrier) =>  {
//   const areaCode = "1"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };

const SaintLucia = (carrier) => {
  const areaCode = "1758";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};


const SaintVincent = (carrier) => {
  const areaCode = "1784";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const Tobago = (carrier) => {
  const areaCode = "1868";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const Argentina = (carrier) => {
  const areaCode = "54";
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return areaCode + carrier + number;
};

const Bolivia = (carrier) => {
  const areaCode = "591";
  const number = Math.floor(Math.random() * 10000000);
  return areaCode + carrier + number;
};


const Brazil = (carrier) => {
  const areaCode = "55";
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return areaCode + carrier + number;
};

const Chile = (carrier) => {
  const areaCode = "56";
  const number = Math.floor(Math.random() * 10000000);
  return areaCode + carrier + number;
};


const Colombia = (carrier) => {
  const areaCode = "57";
  const number = Math.floor(Math.random() * 1000000000);
  return areaCode + carrier + number;
};

const Ecuador = (carrier) => {
  const areaCode = "593";
  const number = Math.floor(Math.random() * 10000000);
  return areaCode + carrier + number;
};

const Guyana = (carrier) => {
  const areaCode = "592";
  const number = Math.floor(Math.random() * 1000000);
  return areaCode + carrier + number;
};


const Paraguay = (carrier) => {
  const areaCode = "595";
  const number = Math.floor(Math.random() * 8000000) + 1000000;
  return areaCode + carrier + number;
};


const Peru = (carrier) => {
  const areaCode = "51";
  const number = Math.floor(Math.random() * 80000000) + 10000000;
  return areaCode + carrier + number;
};


const Suriname = (carrier) => {
  const areaCode = "597";
  const number = Math.floor(Math.random() * 1000000);
  return areaCode + carrier + number;
};


const Uruguay = (carrier) => {
  const areaCode = "598";
  const number = Math.floor(Math.random() * 8000000) + 1000000;
  return areaCode + carrier + number;
};



const Venezuela = (carrier) => {
  const areaCode = "58";
  const number = Math.floor(Math.random() * 80000000) + 10000000;
  return areaCode + carrier + number;
};

// const Bahamas = (carrier) =>  {
//     const areaCode = "1"; // Hong Kong's country code
//       validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//     const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//     return areaCode + carrier + number;
//   };


// const Tobago = (carrier) =>  {
//   const areaCode = "1"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };
// const Barbados = (carrier) =>  {
//   const areaCode = "1"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };

// const Antigua = (carrier) =>  {
//   const areaCode = "1"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };

// const Panama = (carrier) =>  {
//   const areaCode = "507"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };

// const CostaRica = (carrier) =>  {
//   const areaCode = "506"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };

// const SaintLucia = (carrier) =>  {
//   const areaCode = "1"; // Hong Kong's country code
//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 900000) + 100000; // Random 7-digit number
//   return areaCode + carrier + number;
// };


// const Ghana = (carrier) =>  {
//   const areaCode = "233"; // Ghana country code


//     validFirstDigits[Math.floor(Math.random() * validFirstDigits.length)];
//   const number = Math.floor(Math.random() * 9000000) + 1000000; // Random 7-digit number
//   return areaCode + carrier + number;
// };

// const Liberia = (carrier) =>  { 
//   const areaCode = "231"; // Liberia country code

//   // Options for the second digit
//   // const secondOptions = ["77", "88"];

//   const secondOptions = ["88"];


//   // Randomly select the second option
//   const secondDigit = secondOptions[Math.floor(Math.random() * secondOptions.length)];

//   // Determine the valid next digits based on the second digit
//   // let nextDigits;
//   // if (secondDigit === "77") {
//   //   nextDigits = ["0", "2", "6", "7", "9"];
//   // } else if (secondDigit === "88") {
//   //   nextDigits = ["0", "5", "8"];
//   // }


//   let nextDigits;

//     nextDigits = ["0", "5", "8"];



//   // Randomly select the next digit
//   const nextDigit = nextDigits[Math.floor(Math.random() * nextDigits.length)];

//   // Generate a random 4-digit number (1000 to 9999)
//   const remainingNumber = Math.floor(Math.random() * 900000) + 100000; 

//   // Concatenate to form the full phone number
//   return `${areaCode}${secondDigit}${nextDigit}${remainingNumber}`;
// }




// Africa Region

const Algeria = (carrier) => {
  const areaCode = "213"; // Algeria country code

  // Generate 8 random digits
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  return areaCode + carrier + number; 
  // Example: 2137XXXXXXXX
};



const Angola = (carrier) => {
  const areaCode = "244";
  const validcarrieres = ["91", "92", "93", "94", "95", "96", "97", "99"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Benin = (carrier) => {
  const areaCode = "229";
  const validcarrieres = ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Botswana = (carrier) => {
  const areaCode = "267";
  const validcarrieres = ["71", "72", "73", "74", "75", "76", "77", "78"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const BurkinaFaso = (carrier) => {
  const areaCode = "226";
  const validcarrieres = ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Burundi = (carrier) => {
  const areaCode = "257";
  const validcarrieres = ["79", "71", "72", "75", "76", "77", "78"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Cameroon = (carrier) => {
  const areaCode = "237";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number;
};

const CapeVerde = (carrier) => {
  const areaCode = "238";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const CentralAfricanRepublic = (carrier) => {
  const areaCode = "236";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Chad = (carrier) => {
  const areaCode = "235";
  const validcarrieres = ["60", "63", "66", "68", "90", "93", "95", "99"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Comoros = (carrier) => {
  const areaCode = "269";
  const validcarrieres = ["32", "33", "34", "35"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const CongoBrazzaville = (carrier) => {
  const areaCode = "242";
  const validcarrieres = ["05", "06", "04"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const CongoKinshasa = (carrier) => {
  const areaCode = "243";
  const validcarrieres = ["81", "82", "84", "85", "89", "97", "99"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Djibouti = (carrier) => {
  const areaCode = "253";
  const validcarrieres = ["77"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Egypt = (carrier) => {
  const areaCode = "20";
  const validcarrieres = ["10", "11", "12", "15"];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number;
};

const EquatorialGuinea = (carrier) => {
  const areaCode = "240";
  const validcarrieres = ["222", "333", "551"];
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return areaCode + carrier + number;
};

const Eritrea = (carrier) => {
  const areaCode = "291";
  const validcarrieres = ["1", "7"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Eswatini = (carrier) => {
  const areaCode = "268";
  const validcarrieres = ["76", "78"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Ethiopia = (carrier) => {
  const areaCode = "251";
  const validcarrieres = ["91", "92", "93", "94", "96", "97", "98", "99"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};


const Gabon = (carrier) => {
  const areaCode = "241";
  const validcarrieres = ["06", "07"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Gambia = (carrier) => {
  const areaCode = "220";
  const validcarrieres = ["2", "3", "5", "6", "7", "9"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Ghana = (carrier) => {
  const areaCode = "233";
  const validcarrieres = ["20", "23", "24", "26", "27", "28", "50", "53", "54", "55", "56", "57", "58"];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};

const Guinea = (carrier) => {
  const areaCode = "224";
  const validcarrieres = ["60", "61", "62", "63", "64", "65"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const GuineaBissau = (carrier) => {
  const areaCode = "245";
  const validcarrieres = ["95", "96", "97"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const IvoryCoast = (carrier) => {
  const areaCode = "225";
  const validcarrieres = ["01", "05", "07", "25", "27"];
  const number = Math.floor(Math.random() * 8000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};

const Kenya = (carrier) => {
  const areaCode = "254";
  const validcarrieres = ["71", "72", "73", "74", "75", "76", "77", "78", "79"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Lesotho = (carrier) => {
  const areaCode = "266";
  const validcarrieres = ["50", "51", "52", "53", "54", "55", "56"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Liberia = (carrier) => {
  const areaCode = "231";
  const validcarrieres = ["77", "88", "55"];
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Libya = (carrier) => {
  const areaCode = "218";
  const validcarrieres = ["91", "92", "94", "95"];
  const number = Math.floor(Math.random() * 7000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};

const Madagascar = (carrier) => {
  const areaCode = "261";
  const validcarrieres = ["32", "33", "34"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Malawi = (carrier) => {
  const areaCode = "265";
  const validcarrieres = ["88", "99"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Mali = (carrier) => {
  const areaCode = "223";
  const validcarrieres = ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Mauritania = (carrier) => {
  const areaCode = "222";
  const validcarrieres = ["22", "26", "27"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Mauritius = (carrier) => {
  const areaCode = "230";
  const validcarrieres = ["5"];
  const number = Math.floor(Math.random() * 7000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};

const Morocco = (carrier) => {
  const areaCode = "212";
  const validcarrieres = ["6", "7"];
  const number = Math.floor(Math.random() * 80000000).toString().padStart(8, "0");
  return areaCode + carrier + number;
};

const Mozambique = (carrier) => {
  const areaCode = "258";
  const validcarrieres = ["82", "83", "84", "85", "86", "87"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Namibia = (carrier) => {
  const areaCode = "264";
  const validcarrieres = ["81", "85"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Niger = (carrier) => {
  const areaCode = "227";
  const validcarrieres = ["90", "91", "92", "93", "94", "95", "96", "97", "98"];
  const number = Math.floor(Math.random() * 600000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Nigeria = (carrier) => {
  const areaCode = "234";
  const validcarrieres = ["70", "80", "81", "90", "91"];
  const number = Math.floor(Math.random() * 8000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};



const Rwanda = (carrier) => {
  const areaCode = "250";
  const validcarrieres = ["72", "73", "78"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const SaoTomePrincipe = (carrier) => {
  const areaCode = "239";
  const validcarrieres = ["98", "99"];
  const number = Math.floor(Math.random() * 500000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Senegal = (carrier) => {
  const areaCode = "221";
  const validcarrieres = ["70", "76", "77", "78"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Seychelles = (carrier) => {
  const areaCode = "248";
  const validcarrieres = ["2", "4"];
  const number = Math.floor(Math.random() * 600000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const SierraLeone = (carrier) => {
  const areaCode = "232";
  const validcarrieres = ["30", "31", "33", "34", "35", "36", "37", "38", "39"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Somalia = (carrier) => {
  const areaCode = "252";
  const validcarrieres = ["61", "68", "69"];
  const number = Math.floor(Math.random() * 600000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const SouthAfrica = (carrier) => {
  const areaCode = "27";
  const validcarrieres = ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "71", "72", "73", "74", "76", "78", "79", "81", "82", "83", "84"];
  
  // Validate carrier
  if (!validcarrieres.includes(carrier)) {
    carrier = validcarrieres[Math.floor(Math.random() * validcarrieres.length)];
  }
  
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};

const SouthSudan = (carrier) => {
  const areaCode = "211";
  const validcarrieres = ["91", "92", "95", "97", "99"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Sudan = (carrier) => {
  const areaCode = "249";
  const validcarrieres = ["91", "92", "93", "94", "95", "96"];
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

// const Eswatini = (carrier) =>  {
//   const areaCode = "268";
//   const validcarrieres = ["76", "78"];
//   const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
//   return areaCode + carrier + number;
// };

const Tanzania = (carrier) => {
  const areaCode = "255";
  const validcarrieres = ["62", "65", "68", "69", "71", "73", "74", "75", "76", "77", "78"];
  const number = Math.floor(Math.random() * 800000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Togo = (carrier) => {
  const areaCode = "228";
  const number = Math.floor(Math.random() * 600000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Tunisia = (carrier) => {
  const areaCode = "216";
  const number = Math.floor(Math.random() * 7000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};

const Uganda = (carrier) => {
  const areaCode = "256";
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Zambia = (carrier) => {
  const areaCode = "260";
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};

const Zimbabwe = (carrier) => {
  const areaCode = "263";
  const number = Math.floor(Math.random() * 700000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};


const CaboVerde = (carrier) => {
  const areaCode = "238"; // Cabo Verde country code

  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0"); // 6 digits
  return areaCode + carrier + number;
};



//GULF COUNRIES 

const SaudiArabia = (carrier) => {
  const areaCode = "966";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};
const UnitedArabEmirates = (carrier) => {
  const areaCode = "971";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, "0");
  return areaCode + carrier + number;
};
const Kuwait = (carrier) => {
  const areaCode = "965";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};
const Qatar = (carrier) => {
  const areaCode = "974";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};
const Bahrain = (carrier) => {
  const areaCode = "973";
  const remainingLength = 8 - carrier.length;
  const number = Math.floor(Math.random() * Math.pow(10, remainingLength)).toString().padStart(remainingLength, "0");
  return areaCode + carrier + number;
};
const Oman = (carrier) => {
  const areaCode = "968";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return areaCode + carrier + number;
};



// Oceania real phone number formats

const Australia = (carrier) => {
  const areaCode = "61";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + carrier + number;
};


const NewZealand = (carrier) => {
  const areaCode = "64";
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return areaCode + carrier + number;
};

const Fiji = (carrier) => {
  const areaCode = "679";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const PapuaNewGuinea = (carrier) => {
  const areaCode = "675";
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return areaCode + carrier + number;
};

const Samoa = (carrier) => {
  const areaCode = "685";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};

const Tonga = (carrier) => {
  const areaCode = "676";
  const number = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return areaCode + carrier + number;
};

const Vanuatu = (carrier) => {
  const areaCode = "678";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};


const SolomonIslands = (carrier) => {
  const areaCode = "677";
  const number = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return areaCode + carrier + number;
};

const Micronesia = (carrier) => {
  const areaCode = "691";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // No strict mobile code
  return areaCode + carrier + number;
};

const Kiribati = (carrier) => {
  const areaCode = "686";
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // Shorter numbers
  return areaCode + carrier + number;
};

const Tuvalu = (carrier) => {
  const areaCode = "688";
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return areaCode + carrier + number;
};

const Nauru = (carrier) => {
  const areaCode = "674";
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return areaCode + carrier + number;
};

const MarshallIslands = (carrier) => {
  const areaCode = "692";
  const number = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return areaCode + carrier + number;
};


const Palau = (carrier) => {
  const areaCode = "680"; // Palau country code
  const number = Math.floor(Math.random() * 100000) + 10000; // 5-digit number
  return areaCode + carrier + number;
};

const Greenland = (carrier) => {
  const areaCode = "299";
  const number = Math.floor(Math.random() * 800000) + 200000; // Greenland numbers are 6 digits
  return areaCode + carrier + number;
};



const FrenchPolynesia = (carrier) => {
  const areaCode = "689";
  const number = Math.floor(Math.random() * 800000) + 200000; // 6-digit numbers
  return areaCode + carrier + number;
};
const NewCaledonia = (carrier) => {
  const areaCode = "687";
  const number = Math.floor(Math.random() * 800000) + 200000; // 6-digit numbers
  return areaCode + carrier + number;
};


const Guam = (carrier) => {
  const areaCode = "1671"; // +1-671
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit US format
  return areaCode + carrier + number;
};
const PuertoRico = (carrier) => {
  const areaCodes = ["1787", "1939"]; // +1-787 or +1-939
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};
const AmericanSamoa = (carrier) => {
  const areaCode = "1684"; // +1-684
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};
const NorthernMarianaIslands = (carrier) => {
  const areaCode = "1670"; // +1-670
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};
const Bermuda = (carrier) => {
  const areaCode = "1441"; // +1-441
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};
const CaymanIslands = (carrier) => {
  const areaCode = "1345"; // +1-345
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};
const BritishVirginIslands = (carrier) => {
  const areaCode = "1284"; // +1-284
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};
const TurksAndCaicosIslands = (carrier) => {
  const areaCode = "1649"; // +1-649
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const AlandIslands = (carrier) => {
  const areaCode = "35818"; // +358 18 (Finland code + local Åland)
  const number = Math.floor(Math.random() * 90000) + 10000; // 5-digit local number
  return areaCode + carrier + number;
};



const Aruba = (carrier) => {
  const areaCode = "297";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const Belarus = (carrier) => {
  const areaCode = "375";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const BonaireSintEustatiusSaba = (carrier) => {
  const areaCode = "599";
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const ChristmasIsland = (carrier) => {
  const areaCode = "618"; // +61 8
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return areaCode + carrier + number;
};

const CocosIslands = (carrier) => {
  const areaCode = "618"; // +61 8
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return areaCode + carrier + number;
};

const CookIslands = (carrier) => {
  const areaCode = "682";
  const number = Math.floor(Math.random() * 90000) + 10000; // 5 digits
  return areaCode + carrier + number;
};

const Curacao = (carrier) => {
  const areaCode = "5999"; // +599 9
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const Cyprus = (carrier) => {
  const areaCode = "357";
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return areaCode + carrier + number;
};

const FalklandIslands = (carrier) => {
  const areaCode = "500";
  const number = Math.floor(Math.random() * 90000) + 10000; // 5 digits
  return areaCode + carrier + number;
};

const FrenchGuiana = (carrier) => {
  const areaCode = "594";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

// const Grenada = (carrier) =>  {
//   const areaCode = "1473"; // +1 473
//   const number = Math.floor(Math.random() * 9000000) + 1000000;
//   return areaCode + carrier + number;
// };

const Guadeloupe = (carrier) => {
  const areaCode = "590";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

const Guernsey = (carrier) => {
  const areaCode = "441481"; // +44 1481
  const number = Math.floor(Math.random() * 900000) + 100000;
  return areaCode + carrier + number;
};

const Jersey = (carrier) => {
  const areaCode = "441534"; // +44 1534
  const number = Math.floor(Math.random() * 900000) + 100000;
  return areaCode + carrier + number;
};

const Martinique = (carrier) => {
  const areaCode = "596";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

const Mayotte = (carrier) => {
  const areaCode = "262";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

const Montserrat = (carrier) => {
  const areaCode = "1664"; // +1 664
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const Niue = (carrier) => {
  const areaCode = "683";
  const number = Math.floor(Math.random() * 9000) + 1000; // 4 digits
  return areaCode + carrier + number;
};

const NorfolkIsland = (carrier) => {
  const areaCode = "6723"; // +672 3
  const number = Math.floor(Math.random() * 90000) + 10000;
  return areaCode + carrier + number;
};

const Reunion = (carrier) => {
  const areaCode = "262";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

const SaintBarthelemy = (carrier) => {
  const areaCode = "590";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

const SaintHelena = (carrier) => {
  const areaCode = "290";
  const number = Math.floor(Math.random() * 90000) + 10000; // 5 digits
  return areaCode + carrier + number;
};

const SaintMartin = (carrier) => {
  const areaCode = "590";
  const number = Math.floor(Math.random() * 900000) + 100000; // 6-digit numbers
  return areaCode + carrier + number;
};

const SaintPierreMiquelon = (carrier) => {
  const areaCode = "508";
  const number = Math.floor(Math.random() * 900000) + 100000;
  return areaCode + carrier + number;
};

const SaintVincentGrenadines = (carrier) => {
  const areaCode = "1784"; // +1 784
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const SintMaarten = (carrier) => {
  const areaCode = "1721"; // +1 721
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const SvalbardJanMayen = (carrier) => {
  const areaCode = "47"; // Norway
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return areaCode + carrier + number;
};

const Tajikistan = (carrier) => {
  const areaCode = "992";
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return areaCode + carrier + number;
};

const Tokelau = (carrier) => {
  const areaCode = "690";
  const number = Math.floor(Math.random() * 9000) + 1000;
  return areaCode + carrier + number;
};

const Turkmenistan = (carrier) => {
  const areaCode = "993";
  const number = Math.floor(Math.random() * 90000000) + 10000000;
  return areaCode + carrier + number;
};

const Uzbekistan = (carrier) => {
  const areaCode = "998";
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return areaCode + carrier + number;
};

const VirginIslandsUS = (carrier) => {
  const areaCode = "1340"; // +1 340
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return areaCode + carrier + number;
};

const WallisFutuna = (carrier) => {
  const areaCode = "681";
  const number = Math.floor(Math.random() * 900000) + 100000;
  return areaCode + carrier + number;
};

const WesternSahara = (carrier) => {
  const areaCode = "212"; // Morocco
  const number = Math.floor(Math.random() * 900000000) + 100000000;
  return areaCode + carrier + number;
};

const Antarctica = (carrier) => {
  return "NoPhoneNumber"; // No mobile system
};

const BouvetIsland = (carrier) => {
  return "NoPhoneNumber"; // No phone system (uninhabited)
};

const BritishIndianOceanTerritory = (carrier) => {
  const areaCode = "246"; // Diego Garcia base
  const number = Math.floor(Math.random() * 9000) + 1000; // 4 digits
  return areaCode + carrier + number;
};

const FrenchSouthernTerritories = (carrier) => {
  return "NoPhoneNumber"; // No real civilian system
};

const HeardIslandMcDonaldIslands = (carrier) => {
  return "NoPhoneNumber"; // No civilian phones
};

const UnitedStatesMinorOutlyingIslands = (carrier) => {
  return "NoPhoneNumber"; // No public mobile network
};

const SouthGeorgiaSouthSandwichIslands = (carrier) => {
  return "NoPhoneNumber"; // No phone system
};

const Anguilla = (carrier) => {
  const areaCode = "1264"; // +1-264
  const number = Math.floor(Math.random() * 9000000) + 1000000; // 7-digit number
  return areaCode + carrier + number;
};
const CocosKeelingIslands = (carrier) => {
  const areaCode = "61"; // Cocos uses Australia's +61
  const number = Math.floor(Math.random() * 90000) + 10000; // 5-digit number
  return areaCode + carrier + number;
};
const SaintHelenaAscensionTristanDaCunha = (carrier) => {
  const areaCode = "290"; // +290 for Saint Helena
  const number = Math.floor(Math.random() * 9000) + 1000; // 4-digit number
  return areaCode + carrier + number;
};



const CountrFormat = {
  HK: HkFormat,
  IN: InFormat,
  RU: RuFormat,
  DE: Germany,
  GB: UnitedKingdom,
  IT: Italy,
  FR: France,
  ES: Spain,
  PL: Poland,
  UA: Ukraine,
  RO: Romania,
  NL: Netherlands,
  BE: Belgium,
  SE: Sweden,
  CZ: Czechia,
  GR: Greece,
  PT: Portugal,
  HU: Hungary,
  AT: Austria,
  CH: Switzerland,
  RS: Serbia,
  BG: Bulgaria,
  DK: Denmark,
  SK: Slovakia,
  FIL: Finland,
  NO: Norway,
  IE: Ireland,
  HR: Croatia,
  MD: Moldova,
  BA: Bosnia,
  AL: Albania,
  LT: Lithuania,
  SI: Slovenia,
  MK: Macedonia,
  LV: Latvia,
  EE: Estonia,
  LU: Luxembourg,
  ME: Montenegro,
  MT: Malta,
  IS: Iceland,
  AD: Andorra,
  LI: Liechtenstein,
  MC: Monaco,
  SM: SanMarino,
  VA: Holy,
  IM: Isle,
  FO: Faroe,
  GI: Gibraltar,
  AF: Afghanistan,
  AM: Armenia,
  AZ: Azerbaijan,
  BD: Bangladesh,
  BT: Bhutan,
  BN: Brunei,
  KH: Cambodia,
  CN: China,
  GE: Georgia,
  ID: Indonesia,
  IR: Iran,
  IQ: Iraq,
  IL: Israel,
  JP: Japan,
  JO: Jordan,
  KZ: Kazakhstan,
  KG: Kyrgyzstan,
  LA: Laos,
  LB: Lebanon,
  MO: Macau,
  MY: Malaysia,
  MV: Maldives,
  MN: Mongolia,
  MM: Myanmar,
  NP: Nepal,
  KP: NorthKorea,
  PK: Pakistan,
  PS: Palestine,
  PH: Philippines,
  SG: Singapore,
  LK: SriLanka,
  SY: Syria,
  TW: Taiwan,
  TH: Thailand,
  TL: Timor,
  TR: Turkey,
  VN: Vietnam,
  YE: Yemen,
  US: UnitedStates,
  CA: Canada,
  MX: Mexico,
  BS: Bahamas,
  BB: Barbados,
  AG: Antigua,
  KN: SaintNevis,
  LC: SaintLucia,
  TT: Tobago,
  CR: CostaRica,
  PA: Panama,
  DO: Dominica,
  DM: DominicanRepublic,
  CU: Cuba,
  JM: Jamaica,
  HT: Haiti,
  GT: Guatemala,
  HN: Honduras,
  NI: Nicaragua,
  SV: ElSalvador,
  BZ: Belize,

  // 🇸🇷 South America
  AR: Argentina,
  BO: Bolivia,
  BR: Brazil,
  CL: Chile,
  CO: Colombia,
  EC: Ecuador,
  GY: Guyana,
  PY: Paraguay,
  PE: Peru,
  SR: Suriname,
  UY: Uruguay,
  VE: Venezuela,





  // GH: Ghana,
  LR: Liberia,

  DZ: Algeria,
  AO: Angola,
  BJ: Benin,
  BW: Botswana,
  BF: BurkinaFaso,
  BI: Burundi,
  CV: CaboVerde,
  CM: Cameroon,
  CF: CentralAfricanRepublic,
  TD: Chad,
  KM: Comoros,
  CG: CongoBrazzaville,
  CD: CongoKinshasa,
  CI: IvoryCoast,
  DJ: Djibouti,
  EG: Egypt,
  GQ: EquatorialGuinea,
  ER: Eritrea,
  SZ: Eswatini,
  ET: Ethiopia,
  GA: Gabon,
  GM: Gambia,
  GH: Ghana,
  GN: Guinea,
  GW: GuineaBissau,
  KE: Kenya,
  LS: Lesotho,
  // LR: Liberia,
  LY: Libya,
  MG: Madagascar,
  MW: Malawi,
  ML: Mali,
  MR: Mauritania,
  MU: Mauritius,
  MA: Morocco,
  MZ: Mozambique,
  NA: Namibia,
  NE: Niger,
  NG: Nigeria,
  RW: Rwanda,
  ST: SaoTomePrincipe,
  SN: Senegal,
  SC: Seychelles,
  SL: SierraLeone,
  SO: Somalia,
  ZA: SouthAfrica,
  SS: SouthSudan,
  SD: Sudan,
  TZ: Tanzania,
  TG: Togo,
  TN: Tunisia,
  UG: Uganda,
  ZM: Zambia,
  ZW: Zimbabwe,
  SA: SaudiArabia,
  AE: UnitedArabEmirates,
  KW: Kuwait,
  QA: Qatar,
  BH: Bahrain,
  OM: Oman,

  AU: Australia,
  NZ: NewZealand,
  FJ: Fiji,
  PG: PapuaNewGuinea,
  WS: Samoa,
  TO: Tonga,
  VU: Vanuatu,
  SB: SolomonIslands,
  FM: Micronesia,
  KI: Kiribati,
  PW: Palau,
  TV: Tuvalu,
  NR: Nauru,
  MH: MarshallIslands,
  GL: Greenland,
  PF: FrenchPolynesia,
  NC: NewCaledonia,
  GU: Guam,
  PR: PuertoRico,
  AS: AmericanSamoa,
  MP: NorthernMarianaIslands,
  BM: Bermuda,
  KY: CaymanIslands,
  VG: BritishVirginIslands,
  TC: TurksAndCaicosIslands,

  //Missing country

  AI: Anguilla,
  AQ: Antarctica,
  AW: Aruba,
  BY: Belarus,
  BQ: BonaireSintEustatiusSaba,
  BV: BouvetIsland,
  IO: BritishIndianOceanTerritory,
  CX: ChristmasIsland,
  CC: CocosKeelingIslands,
  CK: CookIslands,
  CW: Curacao,
  CY: Cyprus,
  FK: FalklandIslands,
  GF: FrenchGuiana,
  TF: FrenchSouthernTerritories,
  GD: Grenada,
  GP: Guadeloupe,
  GG: Guernsey,
  HM: HeardIslandMcDonaldIslands,
  JE: Jersey,
  MQ: Martinique,
  YT: Mayotte,
  MS: Montserrat,
  NU: Niue,
  NF: NorfolkIsland,
  RE: Reunion,
  BL: SaintBarthelemy,
  SH: SaintHelenaAscensionTristanDaCunha,
  MF: SaintMartin,
  PM: SaintPierreMiquelon,
  VC: SaintVincentGrenadines,
  SX: SintMaarten,
  GS: SouthGeorgiaSouthSandwichIslands,
  SJ: SvalbardJanMayen,
  TJ: Tajikistan,
  TK: Tokelau,
  TM: Turkmenistan,
  UZ: Uzbekistan,
  VI: VirginIslandsUS,
  WF: WallisFutuna,
  EH: WesternSahara,
  // Already included:



};
export default CountrFormat;
