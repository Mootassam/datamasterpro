

const Afghanistan = {
  carrier: [
    {
      label: "Roshan",
      code: "79", // Also uses 72
    },
    {
      label: "MTN",
      code: "77", // Also uses 76
    },
    {
      label: "Etisalat",
      code: "78", // Also uses 73
    },
    {
      label: "Afghan Wireless (AWCC)", // Corrected name for clarity
      code: "70", // Also uses 71
    },
    {
      label: "Afghan Telecom (Salaam)", // Afghan Telecom also operates Salaam
      code: "74", // Also uses 75
    },
    {
      label: "Wasel", // Less common prefix compared to the others
      code: "7500", // Wasel is noted to use prefixes starting with 7500, 7501, 7502
    }
  ],
  image: ""
};

const Albania = {
  carrier: [
    {
      label: "Telekom (Formerly AMC)",
      code: "68", // Numbers typically start with 068
    },
    {
      label: "Vodafone",
      code: "69", // Numbers typically start with 069
    },
    {
      label: "ALBtelecom (Formerly Eagle MOBILE)",
      code: "67", // Numbers typically start with 067
    }
  ],
  image: ""
};

const Algeria = {
  carrier: [
    {
      label: "Djezzy",
      code: "7", // Mobile numbers commonly start with 07
    },
    {
      label: "Mobilis",
      code: "6", // Mobile numbers commonly start with 06
    },
    {
      label: "Ooredoo (formerly Nedjma)",
      code: "5", // Mobile numbers commonly start with 05
    }
  ],
  image: ""
};

const AmericanSamoa = {
  carrier: [
    {
      label: "Blue Sky Communications",
      // In NANP regions, the area code is the primary geographical identifier.
      // Specific carrier prefixes (the next 3 digits after the area code) are not
      // typically publicly assigned or consistently used for identification.
      // However, if there was a known common prefix, it would go here.
      // For general identification, you might list the area code.
      code: "684", // Main area code for American Samoa
    },
    {
      label: "American Samoa Telecommunications Authority (ASTCA)",
      // Similar to Blue Sky, prefixes after the area code are not easily
      // distinguishable by carrier.
      code: "684", // Main area code for American Samoa
    },
  ],
  image: ""
};


const Andorra = {
  carrier: [
    {
      label: "Andorra Telecom (formerly Servei de Telecomunicacions d'Andorra (STA))",
      code: "3", // Mobile numbers commonly start with 3 (e.g., 3xx xxx) or 6 (e.g., 6xx xxx)
      // The most common initial prefix for mobile is '3', with '6' also in use.
      // For a single dominant carrier, often the initial digits are assigned broadly.
    },
  ],
  image: ""
};

const Angola = {
  carrier: [
    {
      label: "Unitel",
      code: "92", // Unitel numbers commonly start with 92, 93, 94, 95
    },
    {
      label: "Movicel",
      code: "91", // Movicel numbers commonly start with 91, 99
    },
    {
      label: "Africell",
      code: "98", // Africell numbers typically start with 98
    },
  ],
  image: ""
};
const Anguilla = {
  carrier: [
    {
      label: "FLOW",
      code: "264", // Anguilla's Area Code. Carrier distinction isn't by prefix within this code.
    },
    {
      label: "Digicel",
      code: "264", // Anguilla's Area Code.
    },
    {
      label: "Weblinks",
      code: "264", // Anguilla's Area Code. Primarily an ISP, but offers some telecom services.
    },
  ],
  image: ""
};

const AntiguaAndBarbuda = {
  carrier: [
    {
      label: "Digicel",
      code: "268", // Antigua and Barbuda's Area Code.
    },
    {
      label: "FLOW",
      code: "268", // Antigua and Barbuda's Area Code.
    },
    {
      label: "APUA", // Antigua Public Utilities Authority
      code: "268", // Antigua and Barbuda's Area Code.
    },
  ],
  image: ""
};

const Argentina = {
  carrier: [
    {
      label: "Claro",
      // All mobile numbers in Argentina, after the country code (+54) and area code,
      // begin with the digit '9'. This '9' indicates it's a mobile number,
      // but does not distinguish between carriers due to number portability and shared prefixes.
      code: "9",
    },
    {
      label: "Movistar",
      code: "9",
    },
    {
      label: "Personal",
      code: "9",
    },
    {
      label: "Nextel", // Now mostly integrated into Claro/Personal, less common as a standalone.
      code: "9",
    },
    {
      label: "Tuenti (using Movistar network)",
      code: "9",
    },
    {
      label: "Nuestro (using Personal network)",
      code: "9",
    },
  ],
  image: ""
};

// **Important Note for Argentina:**
// Argentina's mobile numbering is not as straightforward as a single "carrier code"
// that directly follows the country code. Mobile numbers typically include an "area code"
// (which can be 2 to 4 digits) followed by a `15` prefix (historically) and then the
// local 6- or 7-digit number.
// Example: +54 9 (Area Code) 15 (Local Number). The '9' indicates mobile.
// The `code` field as you've structured it (single or two digits directly after country code)
// doesn't fit perfectly for mobile carrier identification in Argentina.
// I've used '11' as a common *area code* for Buenos Aires, but this won't identify the
// carrier from a number outside that area. For actual mobile prefixes, it's the `9` and `15`
// combined with the area code. If you need precise mobile carrier identification by number,
// a more complex parsing logic or a lookup API would be needed.

const Armenia = {
  carrier: [
    {
      label: "MTS (Formerly Viva Cell)",
      code: "93", // Also uses 94, 98, 77
    },
    {
      label: "Ucom (Formerly Orange)",
      code: "95", // Also uses 99, 41, 43, 44
    },
    {
      label: "Beeline (Formerly ArmenTel)",
      code: "91", // Also uses 96, 99, 33
    },
  ],
  image: ""
};

// **Correction/Clarification for Aruba:**
// The carrier labels provided for Aruba (MTS, Ucom, Beeline) are identical to Armenia.
// This is likely a copy-paste error. Aruba has different main carriers.
// I will correct this and provide codes for Aruba's actual carriers.
// Aruba's main carriers are Digicel and SETAR.

const Aruba = {
  carrier: [
    {
      label: "Digicel",
      code: "59", // Digicel often uses prefixes like 59, 73, 74
    },
    {
      label: "SETAR",
      code: "56", // SETAR often uses prefixes like 56, 58, 60, 71, 72, 77, 78
    },
  ],
  image: ""
};

// Remove the ArubaRevised object as it's redundant

// **Revised Aruba (using common starting digits after +297 if available, otherwise just country code):**
// For Aruba, mobile numbers start with 5, 6, or 7 followed by 6 more digits.
// While specific blocks are assigned, there isn't always a single digit that clearly identifies a carrier.
// I'll use common starting digits.
const ArubaRevised = {
  carrier: [
    {
      label: "Digicel",
      code: "59", // Digicel often uses prefixes like 59, 73, 74. Using 59 as an example.
    },
    {
      label: "SETAR",
      code: "56", // SETAR often uses prefixes like 56, 58, 60, 71, 72, 77, 78. Using 56 as an example.
    },
  ],
  image: ""
};


const Australia = {
  carrier: [
    { label: "Telstra", code: "04" }, // All Australian mobile numbers start with 04
    { label: "Optus", code: "04" },   // Carrier distinction requires a number lookup service
    { label: "Vodafone", code: "04" } // Not distinguishable by prefix alone
  ],
  image: ""
};
// **Important Note for Australia:**
// In Australia, all mobile numbers start with `04` after the country code `+61`.
// The subsequent digits are assigned to carriers. You *cannot* distinguish the carrier
// purely from the initial `04` prefix. For accurate carrier identification,
// you would need access to a Number Portability Database or a specialized lookup service.
// I've filled `04` as it's the universal mobile prefix for Australia, but it won't
// differentiate between Telstra, Optus, or Vodafone.

const Austria = {
  carrier: [
    { label: "A1", code: "664" },     // Numbers commonly start with 0664
    { label: "Magenta (T-Mobile)", code: "676" }, // Numbers commonly start with 0676
    { label: "3 (Drei)", code: "699" }      // Numbers commonly start with 0699 (also 0660 for some)
  ],
  image: ""
};
// **Note for Austria:** Austrian mobile numbers are 10 digits after the country code +43.
// They typically start with a 0 followed by a 3-digit prefix (e.g., 0664).

const Azerbaijan = {
  carrier: [
    { label: "Azercell", code: "50" }, // Also uses 51
    { label: "Bakcell", code: "55" },  // Also uses 70, 77
    { label: "Nar Mobile (formerly Azerfon)", code: "70" }, // Also uses 77 (shared with Bakcell), 72
    { label: "Aztrank", code: "" }, // Aztrank is a trunking system, not a public mobile carrier.
    // No mobile prefix for it in this context.
    { label: "Nakhtel", code: "60" } // Nakhtel is a regional mobile operator for Nakhchivan, uses 60
  ],
  image: ""
};
// **Note for Azerbaijan:** Mobile numbers are 9 digits after the country code +994.
// They typically start with a 2-digit prefix.
// `Aztrank` is a specialized trunking service, not a public mobile network operator
// that would have prefixes for general mobile phone numbers. I've left its code empty.
const Bahamas = {
  carrier: [
    { label: "BTC", code: "242" } // Bahamas Area Code. Most common carrier.
  ],
  image: ""
};
// Note for Bahamas: Uses NANP (+1) with Area Code 242. BTC is the dominant provider.

const Bahrain = {
  carrier: [
    { label: "Batelco", code: "39" }, // Also uses 32, 33, 34, 35, 36, 37, 38
    { label: "Zain (formerly MTC-Vodafone)", code: "36" }, // Also uses 37, 38 (can overlap with Batelco due to number blocks)
    { label: "Viva", code: "33" } // Viva (now STC Bahrain) also uses various blocks, e.g., 33, 34
  ],
  image: ""
};
// Note for Bahrain: Mobile numbers are 8 digits after +973, commonly start with '3'.
// Prefixes can overlap due to block assignments and portability.

const Bangladesh = {
  carrier: [
    { label: "Grameenphone", code: "17" }, // Also uses 13
    { label: "Robi", code: "18" },        // Also uses 16
    { label: "Banglalink", code: "19" },    // Also uses 14
    { label: "Teletalk", code: "15" },
    { label: "Ollo", code: "" }, // Ollo is a fixed wireless/data service, not standard mobile with a prefix.
    { label: "Banglalion", code: "" } // Banglalion is a WiMAX/data service, not standard mobile with a prefix.
  ],
  image: ""
};
// Note for Bangladesh: Mobile numbers are 10 digits after +880. Prefixes are 2 digits.
// Ollo and Banglalion are data/fixed wireless, not traditional mobile carriers in the same way, so no standard mobile prefix.

const Barbados = {
  carrier: [
    { label: "FLOW", code: "246" }, // Barbados Area Code.
    { label: "Digicel", code: "246" }, // Barbados Area Code.
    { label: "Sunbeach", code: "246" }, // Barbados Area Code. (Less prominent, sometimes MVNO/data focused)
    { label: "Ozone Wireless", code: "246" } // Barbados Area Code. (Wireless/data focused)
  ],
  image: ""
};
// Note for Barbados: Uses NANP (+1) with Area Code 246. Carrier distinction isn't by prefix within this code.

const Belarus = {
  carrier: [
    { label: "MTS", code: "29" }, // Also uses 33
    { label: "A1 (Velcom)", code: "29" }, // Also uses 44
    { label: "Life:)", code: "25" },
    { label: "BeCloud", code: "" } // BeCloud is an infrastructure operator, not a direct mobile service provider with consumer prefixes.
  ],
  image: ""
};
// Note for Belarus: Mobile numbers are 9 digits after +375. Prefixes are 2 digits.
// MTS and A1 share '29' due to historical assignments. BeCloud is primarily a wholesale network.

const Belgium = {
  carrier: [
    { label: "Proximus", code: "47" }, // Also uses 46, 48
    { label: "Orange (formerly Mobistar)", code: "49" }, // Also uses 46, 47, 48 (can overlap due to portability)
    { label: "BASE", code: "45" } // Also uses 46, 47, 48, 49 (can overlap)
  ],
  image: ""
};
// Note for Belgium: Mobile numbers are 9 digits after +32. Prefixes are 2 digits, starting with '4'.
// Due to number portability and block allocations, prefixes can overlap significantly.

const Belize = {
  carrier: [
    { label: "DigiCell (BTL/Belize Telemedia Ltd.)", code: "6" }, // Mobile numbers commonly start with 6.
    { label: "Smart", code: "6" } // Mobile numbers commonly start with 6.
  ],
  image: ""
};
// Note for Belize: Mobile numbers are 7 digits after +501, commonly starting with '6'.
// Carrier distinction often relies on the second digit or further blocks. For example, 60x for BTL/DigiCell, 61x for Smart.
// I've used '6' as the overall mobile prefix, as the first digit for all mobile numbers.

const Benin = {
  carrier: [
    { label: "MTN", code: "96" }, // Also uses 61, 62, 63, 64, 65, 66, 67, 68, 69, 90, 91, 95, 97, 98, 99
    { label: "Moov", code: "97" }, // Also uses 61, 62, 63, 64, 65, 66, 67, 68, 69, 90, 91, 95, 96, 98, 99
    { label: "Glo", code: "60" }, // Glo Mobile (if still fully active, operations can vary)
    { label: "Libercom", code: "" }, // Libercom (defunct or merged, not a common active mobile operator)
    { label: "BBcom", code: "" } // BBcom (defunct or merged, not a common active mobile operator)
  ],
  image: ""
};
// Note for Benin: Mobile numbers are 8 digits after +229. Prefixes are 2 digits.
// Many prefixes are shared or reused due to history and number portability.
// Libercom and BBcom are not generally active as primary mobile operators anymore.

const Bermuda = {
  carrier: [
    { label: "CellOne", code: "441" }, // Bermuda Area Code.
    { label: "Digicel", code: "441" } // Bermuda Area Code.
  ],
  image: ""
};
// Note for Bermuda: Uses NANP (+1) with Area Code 441. Carrier distinction isn't by prefix within this code.

const Bhutan = {
  carrier: [
    { label: "B-Mobile (Bhutan Telecom)", code: "17" }, // Mobile numbers typically start with 17
    { label: "TashiCell", code: "77" }, // Mobile numbers typically start with 77
    { label: "Airtel Bhutan", code: "" } // Airtel Bhutan is not a mobile carrier in Bhutan, perhaps a confusion.
    // Bhutan has B-Mobile and TashiCell as primary mobile operators.
  ],
  image: ""
};
// Note for Bhutan: Mobile numbers are 8 digits after +975. Prefixes are 2 digits.

const Bolivia = {
  carrier: [
    { label: "Entel", code: "7" }, // Mobile numbers typically start with 7
    { label: "Tigo", code: "7" },  // Mobile numbers typically start with 7
    { label: "Viva", code: "7" }   // Mobile numbers typically start with 7
  ],
  image: ""
};
// Note for Bolivia: Mobile numbers are 8 digits after +591, and all mobile numbers in Bolivia start with '7'.
// To distinguish carriers, you need to look at the second or third digit, or use a lookup.
// So, '7' is the universal mobile prefix, not carrier specific.

const Bonaire = {
  carrier: [
    {
      label: "Digicel",
      // Mobile numbers in Bonaire are 7 digits after +599.
      // They commonly start with '7'. This '7' is universal for mobile numbers in Bonaire.
      code: "7",
    },
    {
      label: "CHIPPIE (UTS)",
      // Mobile numbers in Bonaire are 7 digits after +599.
      // They commonly start with '7'. This '7' is universal for mobile numbers in Bonaire.
      code: "7",
    },
  ],
  image: ""
};
// Note for Bonaire: Uses +599 country code. Mobile numbers typically begin with '7'.
// Similar to NANP, carrier differentiation isn't by the initial digit after the country code.
// I've put the `599` country code as a general identifier. If you need a more specific prefix, it's `7`.

const BosniaAndHerzegovina = {
  carrier: [
    { label: "BH Telecom", code: "61" }, // Also uses 62
    { label: "m:tel", code: "65" },      // Also uses 66
    { label: "HT Eronet", code: "63" }
  ],
  image: ""
};
// Note for Bosnia and Herzegovina: Mobile numbers are 8 digits after +387. Prefixes are 2 digits.

const Botswana = {
  carrier: [
    { label: "Mascom", code: "71" }, // Also uses 72, 73, 74, 75
    { label: "Orange", code: "71" }, // Also uses 72, 73, 74, 75
    { label: "BeMobile", code: "71" } // Also uses 72, 73, 74, 75
  ],
  image: ""
};
// Note for Botswana: Mobile numbers are 8 digits after +267. Most mobile numbers start with '7'.
// Carrier distinction often relies on the second digit (e.g., 71, 72, 73, etc. are allocated to operators).
// I've used '71' as a common starting point, but it's not strictly unique per carrier.

const Brazil = {
  carrier: [
    { label: "Vivo", code: "9" }, // Mobile numbers typically start with 9, preceded by a two-digit area code.
    { label: "TIM", code: "9" },   // Same as Vivo.
    { label: "Claro", code: "9" }, // Same as Vivo.
    { label: "Oi", code: "9" },    // Same as Vivo.
    { label: "Nextel", code: "9" }, // Now often integrated with Claro/TIM.
    { label: "Algar Telecom (formerly CTBC)", code: "9" }, // Primarily Minas Gerais and São Paulo.
    { label: "Sercomtel", code: "9" }, // Primarily Parana.
    { label: "SurfTelecom", code: "9" }, // MVNO, uses network of others.
    { label: "Sky Brasil", code: "9" }, // MVNO, uses network of others.
    { label: "Porto Conecta (Using TIM)", code: "9" }, // MVNO, uses TIM.
    { label: "Mais AD ( Movttel ) (Using Vivo and SISTEER Telecomunicações)", code: "9" }, // MVNO.
    { label: "Correios Celular (Using SurfTelecom)", code: "9" }, // MVNO.
    { label: "veek (Using SurfTelecom)", code: "9" }, // MVNO.
    { label: "Vodafone (Using TIM and Datora Mobile - Only M2M and mobile broadband)", code: "9" } // M2M/broadband.
  ],
  image: ""
};
// **Important Note for Brazil:** Brazilian mobile numbers are 9 digits long after the country code +55.
// They are always preceded by a **two-digit area code** (e.g., 11 for São Paulo, 21 for Rio).
// The *first digit of the 9-digit mobile number itself* is **always `9`**.
// Therefore, the `code` field here refers to the `9` which indicates a mobile number.
// To distinguish carriers, you need a combination of the area code and potentially the second digit of the mobile number,
// or a specific lookup. This `code: "9"` will not distinguish between the carriers.

const BritishVirginIslands = {
  carrier: [
    { label: "CCT", code: "284" }, // BVI Area Code.
    { label: "FLOW", code: "284" }, // BVI Area Code.
    { label: "Digicel", code: "284" } // BVI Area Code.
  ],
  image: ""
};
// Note for British Virgin Islands: Uses NANP (+1) with Area Code 284. Carrier distinction isn't by prefix within this code.

const Brunei = {
  carrier: [
    { label: "DSTCom", code: "8" }, // Mobile numbers commonly start with 8
    { label: "Progresif cellular", code: "7" } // Mobile numbers commonly start with 7
  ],
  image: ""
};
// Note for Brunei: Mobile numbers are 7 digits after +673. Prefixes are 1 digit.

const Bulgaria = {
  carrier: [
    { label: "A1 (Formerly Mtel)", code: "87" }, // Also uses 88, 89
    { label: "Yettel (Formerly Telenor)", code: "98" }, // Also uses 99
    { label: "Vivacom", code: "87" }, // Uses 87, 88, 89, 98, 99 (overlaps due to block acquisitions and portability)
    // Vivacom acquired many blocks from previous operators.
    { label: "T.Com (Formerly Max Telecom, MAX)", code: "" }, // Max Telecom was fixed-wireless/4G, not typical mobile.
    { label: "Bulsatcom", code: "" } // Bulsatcom is satellite TV, not a mobile carrier with prefixes.
  ],
  image: ""
};
// Note for Bulgaria: Mobile numbers are 8 digits after +359. Prefixes are 2 digits.
// Significant overlap due to number portability and acquisitions.
// T.Com and Bulsatcom are not standard mobile carriers.

const BurkinaFaso = {
  carrier: [
    { label: "Orange", code: "7" }, // Also uses 07, 67 (after 0)
    { label: "Telmob (Onatel)", code: "6" }, // Also uses 06, 76 (after 0)
    { label: "Telecel Faso", code: "5" } // Also uses 05, 75 (after 0)
  ],
  image: ""
};
// Note for Burkina Faso: Mobile numbers are 8 digits after +226. Prefixes are 1 or 2 digits.
// Numbers often start with 0 before the first carrier digit (e.g., 07xx xxxx).
// I've used the primary distinguishing first digit.

const Burundi = {
  carrier: [
    { label: "Econet Leo", code: "60" }, // Also uses 61, 62, 65, 66, 67, 68, 69, 79
    { label: "Lumitel (Viettel Burundi)", code: "70" }, // Also uses 71, 72, 73, 74, 75, 76, 77, 78
    { label: "ONAMOB", code: "80" }, // ONAMOB is a fixed-line operator, not typically mobile.
    { label: "Smart Mobile (formerly Lacell)", code: "7" } // Smart often uses a broader range or is less active.
    // More common prefixes include 69, 71, 79.
    // Using '7' for its common mobile start.
  ],
  image: ""
};
// Note for Burundi: Mobile numbers are 8 digits after +257. Prefixes are 2 digits.
// ONAMOB is not a mobile carrier.

const CaboVerde = {
  carrier: [
    { label: "CV Móvel", code: "9" }, // Mobile numbers typically start with 9
    { label: "T-MAIS", code: "9" } // Mobile numbers typically start with 9
  ],
  image: ""
};
// Note for Cabo Verde: Mobile numbers are 7 digits after +238, and all mobile numbers start with '9'.
// To distinguish carriers, you need to look at the second digit or further blocks.
// '9' is the universal mobile prefix.

const Cambodia = {
  carrier: [
    { label: "Smart Axiata", code: "10" }, // Also 16, 69, 70, 81, 86, 93, 96, 98, 99
    { label: "Metfone", code: "60" }, // Also 61, 66, 67, 68, 88, 90, 97
    { label: "Cellcard/Mobitel", code: "11" }, // Also 12, 14, 15, 17, 78, 85, 89, 92, 95
    { label: "qb", code: "13" }, // Also 18 (less common)
    { label: "Seatel", code: "18" }, // Also 19
    { label: "Cootel", code: "38" } // Primarily fixed wireless/VoIP based, less common for standard mobile prefixes.
  ],
  image: ""
};
// Note for Cambodia: Mobile numbers are 8-9 digits after +855. Prefixes are 2 digits.
// Many prefixes exist for each carrier and can overlap due to portability and acquisitions.
// Cootel is more focused on fixed-wireless/internet.

const Cameroon = {
  carrier: [
    { label: "MTN", code: "67" }, // Also uses 65, 68
    { label: "Orange", code: "69" }, // Also uses 65
    { label: "Nexttel", code: "66" },
    { label: "Camtel", code: "60" }, // Camtel is often more associated with fixed lines, but has some mobile numbers.
    { label: "YooMee", code: "" } // YooMee is primarily a fixed wireless broadband provider, not mobile carrier with standard prefixes.
  ],
  image: ""
};
// Note for Cameroon: Mobile numbers are 8 digits after +237. Prefixes are 2 digits.
// YooMee is a broadband provider, not a typical mobile carrier.

const Canada = {
  carrier: [
    // All Canadian mobile numbers use the regional Area Code, followed by an NXX-XXXX.
    // There isn't a single 'carrier code' after the country code.
    // Therefore, for the purpose of your `code` field, it's generally left empty
    // or you'd need to consider a lookup service or a more complex data structure
    // that includes specific NXX ranges, which are not publicly stable or exhaustive.
    { label: "Rogers includes Fido and Chatr", code: "" },
    { label: "Telus Includes Koodo and Public Mobile", code: "" },
    { label: "Bell includes MTS and Virgin Mobile", code: "" },
    { label: "Freedom Mobile", code: "" },
    { label: "Vidéotron", code: "" },
    { label: "SaskTel", code: "" },
    { label: "TNW Wireless", code: "" }
  ],
  image: ""
};
// Note for Canada: As part of the NANP (+1), carrier identification is by Area Code + NXX,
// not by a single universal carrier prefix. The 'code' field as defined will not work for direct carrier lookup.

const CaymanIslands = {
  carrier: [
    { label: "FLOW Cayman", code: "345" }, // Cayman Islands Area Code.
    { label: "Digicel", code: "345" } // Cayman Islands Area Code.
  ],
  image: ""
};
// Note for Cayman Islands: Uses NANP (+1) with Area Code 345. Carrier distinction isn't by prefix within this code.

const CentralAfricanRepublic = {
  carrier: [
    { label: "Telecel Centrafrique", code: "77" }, // Also uses 72, 73
    { label: "Orange", code: "72" }, // Also uses 70, 71, 74, 75, 76, 78, 79
    { label: "Nationlink", code: "78" }, // Nationlink is a smaller operator
    { label: "Moov", code: "79" } // Also uses 70, 71, 72, 73, 74, 75, 76, 77, 78
  ],
  image: ""
};
// Note for CAR: Mobile numbers are 8 digits after +236. Prefixes are 2 digits, all start with '7'.
// Significant prefix overlap due to history and portability.

const Chad = {
  carrier: [
    { label: "Tigo", code: "6" }, // Mobile numbers typically start with 6
    { label: "Airtel", code: "9" } // Mobile numbers typically start with 9
  ],
  image: ""
};
// Note for Chad: Mobile numbers are 8 digits after +235. Prefixes are 1 digit.

const Chile = {
  carrier: [
    // Chilean mobile numbers are 9 digits after +56.
    // They used to have specific prefixes (e.g., 9 for mobiles), but with full number portability
    // and simplified dialing (all mobile numbers are 9 digits now), the initial digits
    // are less about the *original* carrier and more about the historical block.
    // True carrier identification requires a lookup.
    { label: "Entel", code: "9" }, // Mobile numbers typically start with 9
    { label: "Movistar", code: "9" }, // Mobile numbers typically start with 9
    { label: "Claro", code: "9" }, // Mobile numbers typically start with 9
    { label: "WOM", code: "9" }, // Mobile numbers typically start with 9
    { label: "Virgin Mobile", code: "9" }, // MVNO, uses networks of others.
    { label: "VTR Móvil", code: "9" }, // MVNO, uses networks of others.
    { label: "Falabella Móvil", code: "9" }, // MVNO, uses networks of others.
    { label: "Simple", code: "9" }, // MVNO, uses networks of others.
    { label: "Telsur", code: "9" }, // Regional operator.
    { label: "Netline", code: "9" }, // Fixed wireless/data.
    { label: "Interexport", code: "9" } // Specialized services.
  ],
  image: ""
};
// Note for Chile: All Chilean mobile numbers are 9 digits and start with '9'.
// The 'code' field will not distinguish carriers.

const China = {
  carrier: [
    // Chinese mobile numbers are 11 digits after +86.
    // Prefixes are 3 digits and are usually carrier-specific.
    { label: "China Mobile", code: "134" }, // Also many others: 135-139, 147, 150-152, 157-159, 172, 178, 182-184, 187, 188, 198
    { label: "China Unicom", code: "130" }, // Also many others: 131-132, 145, 155-156, 166, 175, 176, 185-186
    { label: "China Telecom", code: "133" } // Also many others: 133, 149, 153, 173, 177, 180, 181, 189, 199
  ],
  image: ""
};
// Note for China: Each carrier has a wide range of assigned 3-digit prefixes. I've put one common example.

const Colombia = {
  carrier: [
    // Colombian mobile numbers are 10 digits after +57.
    // Mobile numbers generally start with '3'.
    { label: "Claro", code: "3" }, // Common prefixes: 310, 311, 312, 313, 314, 320, 321, 322, 323
    { label: "Movistar", code: "3" }, // Common prefixes: 315, 316, 317, 318
    { label: "Tigo", code: "3" }, // Common prefixes: 300, 301, 302, 303, 304
    { label: "Avantel", code: "3" }, // Common prefixes: 350
    { label: "Virgin Mobile (using Movistar)", code: "3" }, // Uses Movistar's network.
    { label: "Móvil Éxito (using Tigo)", code: "3" }, // Uses Tigo's network.
    { label: "ETB (using Tigo)", code: "3" }, // Uses Tigo's network.
    { label: "UFF! (using Tigo)", code: "3" }, // Uses Tigo's network.
    { label: "UNE (using Tigo)", code: "3" } // Uses Tigo's network.
  ],
  image: ""
};
// Note for Colombia: All mobile numbers start with '3'.
// Carrier distinction comes from the second and third digits of the 10-digit number.
// The `code` field will not distinguish carriers.

const Comoros = {
  carrier: [
    { label: "Comores Telecom (Comtel)", code: "3" }, // Also uses 32, 33, 34, 36
    { label: "Comoro Gulf Holding", code: "" } // Information for mobile prefixes for this operator is less common/clear.
    // Often primarily fixed or data.
  ],
  image: ""
};
// Note for Comoros: Mobile numbers are 7 digits after +269. Commonly start with '3'.

const Congo = { // Republic of the Congo (Congo-Brazzaville)
  carrier: [
    { label: "MTN", code: "05" }, // Also uses 06, 04, 02
    { label: "Airtel", code: "06" }, // Also uses 05, 04, 02
    { label: "Azur", code: "04" } // Also uses 02
  ],
  image: ""
};
// Note for Congo: Mobile numbers are 9 digits after +242. Typically start with '0' then a 2-digit prefix.
// Prefixes can overlap.

const CookIslands = {
  carrier: [
    { label: "Bluesky", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Cook Islands: Mobile numbers are 5 digits after +682. Commonly start with '5' or '7'.
// Bluesky is the dominant/sole provider.

const CostaRica = {
  carrier: [
    // Costa Rican mobile numbers are 8 digits after +506.
    // They generally start with '6', '7', or '8'.
    { label: "Kölbi", code: "8" }, // Commonly uses 8x, and some 6x, 7x.
    { label: "Movistar", code: "6" }, // Commonly uses 6x.
    { label: "Claro", code: "7" }, // Commonly uses 7x.
    { label: "Tuyo Móvil (using Kölbi)", code: "8" }, // MVNO, uses Kölbi.
    { label: "Fullmóvil (using Kölbi)", code: "8" } // MVNO, uses Kölbi.
  ],
  image: ""
};
// Note for Costa Rica: Mobile numbers are 8 digits after +506.
// Prefixes are 1 digit ('6', '7', '8'), with some overlap between carriers.

const CoteDIvoire = {
  carrier: [
    { label: "Orange", code: "07" }, // Mobile numbers typically start with 0707, 0708, 0709
    { label: "MTN", code: "05" },    // Mobile numbers typically start with 0505, 0506
    { label: "Moov Africa", code: "01" },   // Mobile numbers typically start with 0101, 0102, 0103
  ],
  image: ""
};
// Note for Cote d'Ivoire: Numbering plan changed in 2021 to 10 digits (0x xx xx xx xx),
// but common 'carrier indicative' prefixes (like 07 for Orange) are still somewhat
// associated, though with portability, they are not definitive.
// Many listed carriers are defunct or data-only.

const Croatia = {
  carrier: [
    { label: "Hrvatski Telekom (Formerly T-Mobile, HTmobile)", code: "98" }, // Also uses 99
    { label: "A1 (Formerly Vipnet)", code: "91" }, // Also uses 92
    { label: "Telemach (Formerly Tele2)", code: "95" }
  ],
  image: ""
};
// Note for Croatia: Mobile numbers are 8 digits after +385. Prefixes are 2 digits.

const Cuba = {
  carrier: [
    { label: "Cubacel", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Cuba: Mobile numbers are 8 digits after +53. All mobile numbers start with '5'.

const Curacao = {
  carrier: [
    { label: "Digicel", code: "599" }, // Uses Country Code +599. Mobile numbers are 7 digits, start with 5, 6, or 7.
    // Specific carrier prefixes within these starting digits.
    // Digicel uses 5xx, 6xx. I'll use 5.
    { label: "CHIPPIE (UTS)", code: "599" } // Uses Country Code +599. UTS uses 7xx. I'll use 7.
  ],
  image: ""
};
// Note for Curacao: Uses +599 country code. Mobile numbers typically begin with '5', '6', or '7'.
// While I've put 599 for the country code, more specific mobile prefixes are 5xx/6xx for Digicel and 7xx for Chippie.
// To use a specific carrier prefix in your 'code' field:
//    Digicel: code: "5" (for example, first digit of the 7-digit local number)
//    CHIPPIE: code: "7" (for example, first digit of the 7-digit local number)
// I will update it to reflect the common first digit of the 7-digit local number.

// Revised Curacao
const CuracaoRevised = {
  carrier: [
    { label: "Digicel", code: "5" }, // Common first digit of the 7-digit mobile number
    { label: "CHIPPIE (UTS)", code: "7" } // Common first digit of the 7-digit mobile number
  ],
  image: ""
};


const Cyprus = {
  carrier: [
    { label: "Epic (Formerly MTN, Areeba)", code: "96" }, // Mobile numbers typically start with 96
    { label: "CYTA", code: "99" }, // Mobile numbers typically start with 99
    { label: "PrimeTel", code: "94" }, // Mobile numbers typically start with 94
    { label: "Cablenet", code: "95" } // Mobile numbers typically start with 95
  ],
  image: ""
};
// Note for Cyprus: Mobile numbers are 8 digits after +357. Prefixes are 2 digits, all start with '9'.

const CzechRepublic = {
  carrier: [
    { label: "T-Mobile (Formerly Paegas)", code: "60" }, // Also uses 73
    { label: "O2 (Formerly Eurotel)", code: "60" }, // Also uses 72
    { label: "Vodafone (Formerly Oskar)", code: "77" }
  ],
  image: ""
};
// Note for Czech Republic: Mobile numbers are 9 digits after +420. Prefixes are 2 digits.
// Significant overlap in prefixes due to assignments and portability.

const DemocraticRepublicOfTheCongo = {
  carrier: [
    // DRC mobile numbers are 9 digits after +243. They are usually prefixed with '8' or '9'.
    { label: "Vodacom", code: "81" }, // Also uses 82
    { label: "Orange", code: "85" }, // Also uses 89
    { label: "Airtel", code: "97" }, // Also uses 99
    { label: "Africell", code: "90" }, // Also uses 90, 91
    { label: "Tigo / Orange", code: "89" }, // Tigo was acquired by Orange, so prefixes align with Orange.

  ],
  image: ""
};
// Note for DRC: Many operators share initial digits. The listed ones are common.
// Some operators are defunct or merged. Smile is a broadband provider.

const Denmark = {
  carrier: [
    // Danish mobile numbers are 8 digits after +45.
    // They are not strictly tied to a single starting digit per carrier due to portability.
    // However, blocks of numbers are historically associated.
    { label: "TDC", code: "2" }, // Numbers commonly start with 2x or 3x, 4x
    { label: "Telenor", code: "4" }, // Numbers commonly start with 4x or 5x
    { label: "Telia", code: "2" }, // Numbers commonly start with 2x, 3x
    { label: "3 (Tre)", code: "5" }, // Numbers commonly start with 5x, 6x

  ],
  image: ""
};
// Note for Denmark: Mobile numbers are 8 digits. While I've put a common starting digit,
// due to portability, this is not a definitive carrier identifier.
// Net 1 is for fixed wireless/broadband.
const Djibouti = {
  carrier: [
    { label: "Evatis", code: "77" } // Mobile numbers typically start with 77.
  ],
  image: ""
};
// Note for Djibouti: Mobile numbers are 8 digits after +253. Evatis is the sole provider.

const Dominica = {
  carrier: [
    { label: "Digicel", code: "767" }, // Dominica's Area Code.
    { label: "FLOW", code: "767" }    // Dominica's Area Code.
  ],
  image: ""
};
// Note for Dominica: Uses NANP (+1) with Area Code 767. Carrier distinction is not by prefix within this code.

const DominicanRepublic = {
  carrier: [
    // Dominican Republic mobile numbers are 10 digits after +1 (with various area codes).
    // They are part of the NANP, so carrier distinction is not by a single numerical prefix.
    // However, historically, certain first digits of the 7-digit local number were more common.
    // For these, I'll use common initial digits of the 7-digit local number after the area code.
    { label: "Claro (formerly CODETEL)", code: "809" }, // Also 829, 849 (area codes)
    // Numbers often start with 9 for mobile.
    { label: "Altice GSM (Previously Orange)", code: "809" }, // Also 829, 849 (area codes)
    // Numbers often start with 8 for mobile.
    { label: "Viva", code: "809" }, // Also 829, 849 (area codes)
    // Numbers often start with 8 for mobile.
    { label: "Altice CDMA (Previously Tricom)", code: "809" } // Merged with Altice GSM.
  ],
  image: ""
};
// Note for Dominican Republic: Uses NANP (+1) with multiple area codes (809, 829, 849).
// While I've used the area codes as a placeholder, carrier distinction is not by a single initial numerical prefix.
// The next digit after the area code, within the 7-digit local number, is the key, e.g., '9' for Claro, '8' for Altice/Viva mobiles.
// If you need more specific, non-area code prefixes, consider a revised structure.

const Ecuador = {
  carrier: [
    { label: "Claro", code: "9" },    // Mobile numbers commonly start with 9.
    { label: "Movistar", code: "9" }, // Mobile numbers commonly start with 9.
    { label: "CNT", code: "9" }       // Mobile numbers commonly start with 9.
  ],
  image: ""
};
// Note for Ecuador: Mobile numbers are 9 digits after +593. All mobile numbers start with '9'.
// Carrier distinction comes from the second and third digits of the 9-digit number. The `code` field will not distinguish carriers.

const Egypt = {
  carrier: [
    { label: "Vodafone", code: "10" },  // Mobile numbers typically start with 010.
    { label: "Orange (formerly Mobinil)", code: "12" }, // Mobile numbers typically start with 012.
    { label: "Etisalat", code: "11" }, // Mobile numbers typically start with 011.
    { label: "We (by Telecom Egypt)", code: "15" } // Mobile numbers typically start with 015.
  ],
  image: ""
};
// Note for Egypt: Mobile numbers are 9 digits after +20. They typically start with a '0' followed by a 2-digit prefix.

const ElSalvador = {
  carrier: [
    { label: "Tigo", code: "7" },     // Mobile numbers commonly start with 7.
    { label: "Claro", code: "7" },    // Mobile numbers commonly start with 7.
    { label: "Movistar", code: "7" }, // Mobile numbers commonly start with 7.
    { label: "Digicel", code: "7" },  // Mobile numbers commonly start with 7.
    { label: "RED", code: "" }        // RED (or Red en El Salvador) is a fixed/data service, not a typical mobile carrier.
  ],
  image: ""
};
// Note for El Salvador: Mobile numbers are 8 digits after +503. All mobile numbers start with '7'.
// Carrier distinction comes from the second digit or further blocks. The `code` field will not distinguish carriers.

const EquatorialGuinea = {
  carrier: [
    { label: "Orange", code: "222" }, // Mobile numbers often start with 222, 223.
    { label: "Muni", code: "222" },   // Muni (GETESA) often uses 222, 223.
    { label: "Gecomsa", code: "" }    // Gecomsa is more of a fixed/data network, not a primary mobile operator with prefixes.
  ],
  image: ""
};
// Note for Equatorial Guinea: Mobile numbers are 9 digits after +240. They typically start with 222 or 223.
// Prefixes overlap, and the distinction is often by the second/third digit.

const Eritrea = {
  carrier: [
    { label: "Eritel", code: "1" } // Mobile numbers commonly start with 1 (e.g., 1x xxx xx).
    // Also uses 71 for some mobile ranges.
  ],
  image: ""
};
// Note for Eritrea: Mobile numbers are 7 digits after +291. Eritel is the sole provider.
// Common prefixes start with '1' or '7'. I've used '1' as a general mobile indicator.

const Estonia = {
  carrier: [
    { label: "Telia", code: "5" },   // Mobile numbers commonly start with 5.
    { label: "Elisa", code: "5" },   // Mobile numbers commonly start with 5.
    { label: "Tele2", code: "5" }    // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Estonia: Mobile numbers are 7 or 8 digits after +372. All mobile numbers start with '5'.
// Carrier distinction comes from subsequent digits due to number portability. The `code` field will not distinguish carriers.

const Ethiopia = {
  carrier: [
    { label: "Ethiotelecom", code: "9" } // Mobile numbers commonly start with 9.
  ],
  image: ""
};
// Note for Ethiopia: Mobile numbers are 9 digits after +251. All mobile numbers start with '9'.
// Ethiotelecom is the primary provider. Safaricom Ethiopia is a new operator, if you wish to add them.
// Safaricom Ethiopia would also use '7' as its primary mobile prefix (e.g., 7xx xxxx).

const FalklandIslands = {
  carrier: [
    { label: "Sure", code: "5" } // Mobile numbers typically start with 5.
  ],
  image: ""
};
// Note for Falkland Islands: Mobile numbers are 5 digits after +500. Sure is the sole provider.

const FaroeIslands = {
  carrier: [
    { label: "Føroya Tele", code: "2" }, // Mobile numbers commonly start with 2.
    { label: "Hey (Formerly Kall)", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Faroe Islands: Mobile numbers are 6 digits after +298. Prefixes are 1 digit.

const Fiji = {
  carrier: [
    { label: "Vodafone", code: "7" }, // Also uses 9.
    { label: "Digicel", code: "8" }   // Also uses 7.
  ],
  image: ""
};
// Note for Fiji: Mobile numbers are 7 digits after +679. Prefixes are 1 digit.
// Some overlap between Vodafone and Digicel.

const Finland = {
  carrier: [
    { label: "Telia (Formerly Sonera)", code: "40" }, // Also uses 41, 46
    { label: "Elisa", code: "45" }, // Also uses 50
    { label: "DNA", code: "44" }, // Also uses 50
    { label: "Ålcom (Formerly ÅMT / Ålands Mobiltelefon)", code: "49" }, // Regional operator for Åland Islands.
    { label: "Ukko Mobile", code: "" } // Ukko Mobile is a specialized mobile data network, not a standard voice/SMS mobile carrier.
  ],
  image: ""
};
// Note for Finland: Mobile numbers are 7-10 digits after +358. They commonly start with '04' or '05'.
// The 'code' here reflects the two digits after the initial '0'.
// Ukko Mobile is primarily for mobile broadband.

const France = {
  carrier: [
    { label: "Orange (Formerly Itineris)", code: "6" }, // Mobile numbers commonly start with 06 or 07.
    { label: "SFR", code: "6" },    // Mobile numbers commonly start with 06 or 07.
    { label: "Bouygues Telecom", code: "6" }, // Mobile numbers commonly start with 06 or 07.
    { label: "Free Mobile", code: "6" } // Mobile numbers commonly start with 06 or 07.
  ],
  image: ""
};
// Note for France: Mobile numbers are 9 digits after +33. They always start with '06' or '07'.
// Due to number portability, the '06' or '07' prefix does not distinguish the carrier.
// The `code` field will not distinguish carriers.

const FrenchPolynesia = {
  carrier: [
    { label: "VINI", code: "87" }, // Mobile numbers commonly start with 87.
    { label: "Pacific Mobile Telecom (PMT)", code: "89" }, // Mobile numbers commonly start with 89.
    { label: "Viti", code: "" }, // Viti is a broadband provider, not a typical mobile carrier.
    { label: "Mara Telecom", code: "" } // Mara Telecom is a newer, less common player, possibly more fixed-line/internet.
  ],
  image: ""
};
// Note for French Polynesia: Mobile numbers are 8 digits after +689. Prefixes are 2 digits.

const Gabon = {
  carrier: [
    { label: "Airtel (formerly Celtel, Zain)", code: "06" }, // Mobile numbers commonly start with 06.
    { label: "Libertis", code: "07" }, // Mobile numbers commonly start with 07.
    { label: "Moov", code: "04" }, // Mobile numbers commonly start with 04.
    { label: "Azur", code: "" } // Azur is a newer or smaller operator; specific prefixes might vary or overlap.
  ],
  image: ""
};
// Note for Gabon: Mobile numbers are 8 digits after +241. They typically start with '0' then a 2-digit prefix.
const Gambia = {
  carrier: [
    { label: "Africell", code: "7" },   // Mobile numbers commonly start with 7
    { label: "Comium", code: "3" },   // Mobile numbers commonly start with 3
    { label: "Gamcel", code: "6" },   // Mobile numbers commonly start with 6
    { label: "Qcell", code: "2" }     // Mobile numbers commonly start with 2
  ],
  image: ""
};
// Note for Gambia: Mobile numbers are 7 digits after +220. Prefixes are 1 digit.

const Georgia = {
  carrier: [
    { label: "MagtiCom", code: "77" },  // Also uses 595, 599
    { label: "Silknet (formerly Geocell)", code: "79" }, // Also uses 577, 597
    { label: "Beeline", code: "74" }, // Also uses 597, 598
    // Silknet has acquired Geocell, so their networks and prefixes are merging.
    // For simplicity, Geocell is now listed as Silknet.
  ],
  image: ""
};
// Note for Georgia: Mobile numbers are 9 digits after +995. Prefixes are 2-3 digits.
// Significant overlap in prefixes due to acquisitions and portability.

const Germany = {
  carrier: [
    // German mobile numbers are 10-11 digits after +49. They always start with '01'.
    // The following two digits often indicate the original network.
    { label: "O2 (Telefónica, includes E-Plus)", code: "176" }, // Also many others, e.g., 159, 179
    { label: "Telekom (T-Mobile)", code: "171" }, // Also many others, e.g., 151, 160, 170
    { label: "Vodafone", code: "172" } // Also many others, e.g., 152, 162, 173
  ],
  image: ""
};
// Note for Germany: Mobile prefixes are not definitively tied to a single carrier due to number portability.
// The `code` here represents common 3-digit prefixes after the initial '0' (for national dialing) and before the main number.

const Ghana = {
  carrier: [
    { label: "MTN", code: "24" }, // Also uses 54, 55, 59
    { label: "Vodafone", code: "20" }, // Also uses 20, 24, 50
    { label: "AirtelTigo (Airtel merged with Tigo)", code: "27" }, // Also uses 57 (for Tigo), 26, 56 (for Airtel)
    { label: "Glo", code: "23" },
    { label: "Expresso Telecom", code: "" } // Expresso is largely defunct or has very limited operations.
  ],
  image: ""
};
// Note for Ghana: Mobile numbers are 9 digits after +233. Prefixes are 2 digits.
// Airtel and Tigo have merged into AirtelTigo. Expresso is largely inactive.

const Gibraltar = {
  carrier: [
    { label: "GIBTEL", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Gibraltar: Mobile numbers are 8 digits after +350. Gibtel is the sole provider.

const Greece = {
  carrier: [
    { label: "COSMOTE", code: "697" }, // Also uses 698
    { label: "Vodafone (Formerly Panafon)", code: "694" }, // Also uses 695
    { label: "Nova (Formerly WIND)", code: "693" } // Also uses 690, 696
  ],
  image: ""
};
// Note for Greece: Mobile numbers are 10 digits after +30. They typically start with 69 and then another digit.
// The 'code' here reflects the 3-digit prefix.

const Greenland = {
  carrier: [
    { label: "TELE Greenland", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Greenland: Mobile numbers are 6 digits after +299. TELE Greenland is the sole provider.

const Grenada = {
  carrier: [
    { label: "FLOW", code: "473" },   // Grenada's Area Code.
    { label: "Digicel", code: "473" } // Grenada's Area Code.
  ],
  image: ""
};
// Note for Grenada: Uses NANP (+1) with Area Code 473. Carrier distinction is not by prefix within this code.

const GuadeloupeMartiniqueFrenchGuiana = {
  carrier: [
    // These French overseas departments share the +590, +594, +596 country codes respectively.
    // Mobile numbers are 9 digits long after the country code.
    // They usually start with '06' (similar to mainland France).
    { label: "Orange Caraïbe", code: "690" }, // For Guadeloupe (690), Martinique (696), French Guiana (694)
    { label: "Digicel", code: "690" },        // For Guadeloupe (690), Martinique (696), French Guiana (694)
    { label: "SFR Caraïbe", code: "690" }     // For Guadeloupe (690), Martinique (696), French Guiana (694)
  ],
  image: ""
};
// Note for Guadeloupe/Martinique/French Guiana: Each island has its own country code, but numbering follows a similar pattern.
// Mobile numbers generally start with 69X, where X is 0, 4, or 6 depending on the island.
// The 'code' here reflects a common prefix, but it's not strictly unique per carrier due to portability.

const Guam = {
  carrier: [
    { label: "IT&E", code: "671" },        // Guam's Area Code.
    { label: "Docomo Pacific", code: "671" }, // Guam's Area Code.
    { label: "GTA (formerly GTA Teleguam)", code: "671" }, // Guam's Area Code.
    { label: "iConnect", code: "671" } // Guam's Area Code.
  ],
  image: ""
};
// Note for Guam: Uses NANP (+1) with Area Code 671. Carrier distinction is not by prefix within this code.

const Guatemala = {
  carrier: [
    { label: "Tigo", code: "3" },     // Also uses 4, 5
    { label: "Claro", code: "3" },    // Also uses 4, 5
    { label: "Movistar", code: "3" } // Also uses 4, 5
  ],
  image: ""
};
// Note for Guatemala: Mobile numbers are 8 digits after +502. They commonly start with 3, 4, or 5.
// Due to number portability, the initial digit does not definitively identify the carrier.

const Guernsey = {
  carrier: [
    { label: "Sure Mobile", code: "77" }, // Mobile numbers typically start with 77 or 78
    { label: "JT (Guernsey) Global", code: "78" }, // Mobile numbers typically start with 78
    { label: "Airtel-Vodafone", code: "79" } // Mobile numbers typically start with 79
  ],
  image: ""
};
// Note for Guernsey: Mobile numbers are 6 digits after +44 (or sometimes +44 7xxx xxxxxx).
// They typically start with '77', '78', or '79'.

const Guinea = {
  carrier: [
    { label: "Orange", code: "62" }, // Also uses 61, 65
    { label: "MTN (formerly Areeba)", code: "65" }, // Also uses 66
    { label: "Cellcom Guinée", code: "60" }, // Also uses 63
    { label: "Intercel", code: "68" }, // Intercel is less common or defunct.
    { label: "Sotelgui", code: "" } // Sotelgui is defunct as a mobile operator.
  ],
  image: ""
};
// Note for Guinea: Mobile numbers are 8 digits after +224. Prefixes are 2 digits.
// Some operators are defunct.

const GuineaBissau = {
  carrier: [
    { label: "MTN", code: "96" }, // Also uses 95, 97
    { label: "Orange", code: "91" }, // Also uses 92, 93
    { label: "pt:Guinetel", code: "" } // Guinetel is primarily a fixed-line and internet provider, not a mobile carrier.
  ],
  image: ""
};
// Note for Guinea-Bissau: Mobile numbers are 7 digits after +245. Prefixes are 2 digits.
// Guinetel does not typically have mobile prefixes.

const Guyana = {
  carrier: [
    { label: "Digicel", code: "6" }, // Mobile numbers commonly start with 6.
    { label: "Cellink Plus (GTT Mobile)", code: "6" } // GTT mobile numbers also commonly start with 6.
  ],
  image: ""
};
// Note for Guyana: Mobile numbers are 7 digits after +592. All mobile numbers start with '6'.
// To distinguish carriers, you need to look at the second digit or further blocks. The `code` field will not distinguish carriers.

const Haiti = {
  carrier: [
    { label: "Digicel", code: "509" }, // Haiti's Country Code.
    { label: "Comcel/Voila", code: "509" }, // Comcel/Voila has been acquired by Digicel.
    { label: "NATCOM", code: "509" } // Haiti's Country Code.
  ],
  image: ""
};
// Note for Haiti: Uses its own Country Code (+509), and mobile numbers are 8 digits.
// However, there isn't a simple carrier-specific prefix. Numbers typically start with 3 or 4 for Digicel, 3 for Natcom.
// Using the country code as a general identifier. For more specific prefixes:
// Digicel: code: "3" or "4"
// NATCOM: code: "3"

// Revised Haiti (using common first digit of the 8-digit mobile number):
const HaitiRevised = {
  carrier: [
    { label: "Digicel", code: "3" }, // Common first digit (e.g., 3x xxx xxx, 4x xxx xxx)
    { label: "Comcel/Voila", code: "3" }, // Now integrated with Digicel, so prefixes would align.
    { label: "NATCOM", code: "3" } // Common first digit (e.g., 3x xxx xxx)
  ],
  image: ""
};


const Honduras = {
  carrier: [
    { label: "Tigo", code: "9" },     // Also uses 8, 3
    { label: "Claro", code: "9" },    // Also uses 8, 3
    { label: "Tegucel Sulacel Ceibacel", code: "9" } // These are regional brands, often under the main operators.
  ],
  image: ""
};
// Note for Honduras: Mobile numbers are 8 digits after +504. They commonly start with 3, 8, or 9.
// Due to number portability, the initial digit does not definitively identify the carrier.
const HongKong = {
  carrier: [
    // Hong Kong mobile numbers are 8 digits after +852.
    // They generally start with 5, 6, 7, 8, or 9.
    // Due to number portability, the initial digit does not definitively identify the carrier.
    // I'll provide common *starting digits* for mobile numbers rather than strict carrier-specific prefixes.
    { label: "CMHK (China Mobile Hong Kong)", code: "5" }, // Also uses 6, 9
    { label: "csl (formerly CSL) (including 1O1O and Club SIM)", code: "6" }, // Also uses 9
    { label: "3 Hong Kong", code: "6" }, // Also uses 9
    { label: "SmarTone", code: "6" }, // Also uses 9
    { label: "China Unicom (Hong Kong) (using 3 Hong Kong)", code: "6" }, // MVNO, uses 3 HK
    { label: "Hong Kong Broadband Network (using CMHK and SmarTone)", code: "5" }, // MVNO
    { label: "SUN Mobile (using CSL Mobile)", code: "5" }, // MVNO
    { label: "Birdie Mobile (using SmarTone)", code: "5" } // MVNO
  ],
  image: ""
};
// Note for Hong Kong: All mobile numbers are 8 digits starting with 5, 6, 7, 8, or 9.
// Due to number portability, the initial digit is not a reliable carrier identifier.

const Hungary = {
  carrier: [
    // Hungarian mobile numbers are 7 digits after +36. They are prefixed with '20', '30', or '70'.
    { label: "Telekom (Formerly Westel, T-Mobile)", code: "30" }, // Mobile numbers typically start with 30.
    { label: "Yettel (Formerly Telenor, Pannon)", code: "70" }, // Mobile numbers typically start with 70.
    { label: "Vodafone", code: "70" }, // Mobile numbers typically start with 70 (overlaps with Yettel).
    // Vodafone also has prefixes like 30, 20 due to number portability.
    { label: "Digi.Mobil (testing)", code: "50" } // Digi.Mobil (now 4iG/One) uses 50.
  ],
  image: ""
};
// Note for Hungary: Mobile numbers are 7 digits (after '06' national prefix) or 9 digits (after +36).
// Prefixes are 2-digit. Due to portability, actual prefixes can overlap.

const Iceland = {
  carrier: [
    // Icelandic mobile numbers are 7 digits after +354.
    // They commonly start with 6, 7, or 8.
    { label: "Síminn", code: "8" },   // Mobile numbers commonly start with 8.
    { label: "Vodafone", code: "6" }, // Mobile numbers commonly start with 6.
    { label: "Nova", code: "7" },     // Mobile numbers commonly start with 7.
    { label: "IceCell", code: "" } // IceCell (or Íslandssími) is less prominent or specialized. No clear common prefix.
  ],
  image: ""
};
// Note for Iceland: Mobile numbers are 7 digits after +354. Prefixes are 1 digit.

const India = {
  carrier: [
    // Indian mobile numbers are 10 digits after +91.
    // Each carrier has a wide range of prefixes depending on the circle (state/region).
    // Providing one common example for each, but this is highly generalized.
    // India has undergone significant consolidation (Vodafone + Idea = Vi; Tata Docomo merged).
    { label: "Vi (Vodafone Idea)", code: "98" }, // Also 97, 99, 87, 88, 89, 70-79, 60-69
    { label: "Airtel", code: "98" }, // Also 99, 97, 88, 89, 70-79, 60-69
    { label: "Reliance Jio", code: "70" }, // Also 70-79, 80-89, 90-99
    { label: "BSNL Mobile", code: "94" }, // Also 93, 81, 82, 83, 84, 91, 92
    { label: "MTNL", code: "9" } // Primarily Delhi and Mumbai, prefixes like 92, 98.
    // Tata Docomo is merged with Airtel. Reliance Communications is largely defunct.
  ],
  image: ""
};
// Note for India: Mobile numbering is complex and highly region-dependent with a vast number of prefixes.
// The provided codes are general examples and not exhaustive or definitive for all regions/circles.
// Due to portability and mergers, identifying a carrier purely by prefix is challenging.

const Indonesia = {
  carrier: [
    // Indonesian mobile numbers are 10-12 digits after +62.
    // They commonly start with '8'.
    { label: "Telkomsel (Include previous Telkom Flexi network)", code: "81" }, // Also 82, 85, 87, 88
    { label: "Indosat Ooredoo (Include previous Indosat, Satelindo and Star-One network)", code: "81" }, // Also 85, 86, 89
    { label: "3 (Tri)", code: "89" }, // Mobile numbers typically start with 89.
    { label: "XL Axiata (Include previous Axis network)", code: "81" }, // Also 83, 85, 87
    { label: "Smartfren", code: "88" } // Mobile numbers typically start with 88.
  ],
  image: ""
};
// Note for Indonesia: Mobile numbers always start with '8'. The following 1-2 digits differentiate carriers.

const Iran = {
  carrier: [
    // Iranian mobile numbers are 10 digits after +98.
    { label: "Hamrahe Aval (MCI)", code: "91" }, // Also 990, 991, 992, 993, 994
    { label: "Irancell", code: "93" }, // Also 901-903, 930-939
    { label: "RighTel", code: "92" } // Mobile numbers typically start with 92.
  ],
  image: ""
};
// Note for Iran: Mobile numbers always start with '9'. The following 1-2 digits differentiate carriers.

const Iraq = {
  carrier: [
    // Iraqi mobile numbers are 9 digits after +964.
    { label: "Zain", code: "79" }, // Also 78
    { label: "Korek", code: "75" },
    { label: "Omnnea", code: "" }, // Omnnea (or AsiaCell) uses 77.
    // There is a duplicate "Zain" entry in your original list.
    { label: "Itisaluna", code: "" } // Itisaluna was a WiMAX provider, not a typical mobile carrier.
  ],
  image: ""
};
// Note for Iraq: Mobile numbers usually start with 7x. There was a duplicate Zain entry in your source.
// Itisaluna is not a standard mobile carrier.

const Ireland = {
  carrier: [
    // Irish mobile numbers are 7 digits after +353. They typically start with '8'.
    { label: "3 (Three) - Includes the previous O2 network.", code: "83" }, // Also 85
    { label: "Vodafone (Formerly Eircell)", code: "86" }, // Also 87
    { label: "Eir (Formerly Meteor)", code: "89" } // Also 84
  ],
  image: ""
};
// Note for Ireland: Mobile numbers start with '8' (after the '0' if dialing nationally).
// The 'code' here is the 2-digit prefix after the '8'.

const IsleOfMan = {
  carrier: [
    // IOM mobile numbers are 6 digits after +44 (or +44 7624).
    { label: "Manx Telecom", code: "7624" }, // Mobile numbers start with 7624
    { label: "Sure Mobile", code: "7924" } // Mobile numbers start with 7924
  ],
  image: ""
};
// Note for Isle of Man: Numbers are part of the UK's numbering plan, often using 7624 or 7924 after +44.

const Israel = {
  carrier: [
    // Israeli mobile numbers are 7 digits after +972. They are prefixed with '5'.
    { label: "Cellcom", code: "52" },
    { label: "Partner (Orange)", code: "54" },
    { label: "Pelephone", code: "50" },
    { label: "Golan Telecom", code: "58" },
    { label: "Hot Mobile", code: "57" },
    { label: "Rami Levy (using Pelephone)", code: "50" }, // MVNO, uses Pelephone
    { label: "019 Telzar (using Partner)", code: "54" }, // MVNO, uses Partner
    { label: "Cellact (using Pelephone)", code: "50" } // MVNO, uses Pelephone
  ],
  image: ""
};
// Note for Israel: All mobile numbers start with '5'. The following digit identifies the carrier.

const Italy = {
  carrier: [
    // Italian mobile numbers are 9-10 digits after +39. They always start with '3'.
    { label: "WINDTRE", code: "3" }, // Many prefixes: 32x, 33x, 34x, 37x
    { label: "TIM", code: "3" }, // Many prefixes: 33x, 34x, 36x, 37x
    { label: "Vodafone (Formerly Omnitel)", code: "3" }, // Many prefixes: 33x, 34x, 37x
    { label: "Iliad", code: "3" } // Many prefixes: 351, 352
  ],
  image: ""
};
// Note for Italy: All mobile numbers start with '3'. The following digits differentiate carriers.
// Due to number portability, the '3' alone is not a definitive carrier identifier.

const Jamaica = {
  carrier: [
    // Jamaica is part of the NANP (+1) with Area Code 876.
    { label: "Digicel", code: "876" },
    { label: "FLOW Jamaica", code: "876" },
    { label: "Caricel", code: "876" } // Caricel has faced significant operational issues.
  ],
  image: ""
};
// Note for Jamaica: Uses NANP (+1) with Area Code 876. Carrier distinction is not by prefix within this code.

const Japan = {
  carrier: [
    // Japanese mobile numbers are 10 digits after +81. They always start with '90' or '80' or '70'.
    { label: "NTT Docomo", code: "90" }, // Also 80, 70
    { label: "au (KDDI)", code: "90" }, // Also 80, 70
    { label: "SoftBank Corp & Y!Mobile", code: "90" }, // Also 80, 70
    { label: "Rakuten Mobile", code: "70" }, // (Newer MNO not in your list)
    { label: "Disney Mobile", code: "70" }, // MVNO, uses SoftBank
    { label: "b-mobile", code: "70" } // MVNO, uses NTT Docomo or SoftBank
  ],
  image: ""
};
// Note for Japan: All mobile numbers start with 70, 80, or 90. The second digit sometimes indicates the initial network,
// but due to portability, the prefix is not a definitive carrier identifier.

const Jersey = {
  carrier: [
    // Jersey mobile numbers are 6 digits after +44 (or +44 7xxx xxxxxx).
    { label: "JT (Jersey) Global", code: "77" }, // Mobile numbers typically start with 77 or 78
    { label: "Sure Mobile", code: "77" }, // Mobile numbers typically start with 77 or 78
    { label: "Airtel-Vodafone", code: "78" } // Mobile numbers typically start with 78
  ],
  image: ""
};
// Note for Jersey: Part of UK numbering, similar to Isle of Man. Prefixes like 77, 78.

const Jordan = {
  carrier: [
    // Jordanian mobile numbers are 9 digits after +962.
    { label: "Zain Jordan", code: "79" },
    { label: "Orange Jordan", code: "77" },
    { label: "Umniah", code: "78" }
  ],
  image: ""
};
// Note for Jordan: Mobile numbers all start with '7'. The following digit differentiates carriers.

const Kazakhstan = {
  carrier: [
    // Kazakh mobile numbers are 9 digits after +7.
    { label: "Kcell", code: "701" }, // Also 702, 705, 707
    { label: "Beeline", code: "705" }, // Also 705, 771, 775, 776, 777, 778
    { label: "Tele2", code: "700" }, // Also 707, 708
    { label: "Altel", code: "700" } // Also 700, 708
  ],
  image: ""
};
// Note for Kazakhstan: Prefixes are 3 digits. Significant overlap between operators.

const Kenya = {
  carrier: [
    // Kenyan mobile numbers are 9 digits after +254. They always start with '7' or '1'.
    { label: "Safaricom", code: "7" }, // Uses 70-72, 740-743, 745-746, 748, 757-759, 768-769, 79x, 110-111, 112-115
    { label: "Airtel (formerly Zain)", code: "7" }, // Uses 73x, 78x
    { label: "Telkom Kenya (formerly Orange)", code: "7" } // Uses 77x
  ],
  image: ""
};
// Note for Kenya: All mobile numbers start with '7' or '1'. The `code` field will not distinguish carriers.
// The second digit often indicates the original carrier block.

const Kiribati = {
  carrier: [
    { label: "TSKL (Telecom Services Kiribati Limited)", code: "7" } // Mobile numbers commonly start with 7.
  ],
  image: ""
};
// Note for Kiribati: Mobile numbers are 5 digits after +686. TSKL is the sole provider.

const Kosovo = {
  carrier: [
    // Kosovo mobile numbers are 8 digits after +383.
    { label: "Vala (Telekomi i Kosovës)", code: "44" }, // Also 45
    { label: "IPKO Telecommunications LLC", code: "49" }, // Also 43
    { label: "Z mobile", code: "" }, // Z mobile (virtual operator) used Vala's network. Not an independent prefix.
    { label: "mts", code: "46" }, // mts (Serbian operator, limited coverage) uses 46.
    { label: "D3 mobile", code: "" } // D3 Mobile is a virtual operator, not a distinct prefix.
  ],
  image: ""
};
// Note for Kosovo: Prefixes are 2 digits. Z Mobile and D3 Mobile are MVNOs.

const Kuwait = {
  carrier: [
    // Kuwaiti mobile numbers are 8 digits after +965. They always start with '5', '6', or '9'.
    { label: "Zain", code: "9" }, // Also 6, 5
    { label: "Ooredoo (formerly Wataniya)", code: "6" }, // Also 9
    { label: "Viva (stc Kuwait)", code: "5" } // Also 9
  ],
  image: ""
};
// Note for Kuwait: All mobile numbers start with 5, 6, or 9. The `code` field will not distinguish carriers.

const Kyrgyzstan = {
  carrier: [
    // Kyrgyz mobile numbers are 9 digits after +996.
    { label: "MegaCom", code: "55" }, // Also 75, 999
    { label: "Beeline", code: "77" }, // Also 77, 22
    { label: "O! (NurTelecom)", code: "70" }, // Also 50
    { label: "Fonex", code: "" }, // Fonex is a smaller provider, less common mobile prefixes.
    { label: "Katel", code: "" }, // Katel is fixed-line or defunct for mobile.
    { label: "Nexi", code: "" }, // Nexi is primarily internet.
    { label: "Sapat Mobile", code: "" } // Sapat Mobile is a smaller MVNO or defunct.
  ],
  image: ""
};
// Note for Kyrgyzstan: Prefixes are 2-3 digits. Many listed carriers are not major mobile players.

const LaReunion = {
  carrier: [
    // Réunion mobile numbers are 9 digits after +262. They usually start with '69'.
    { label: "SFR Réunion", code: "692" }, // Also 693
    { label: "Orange Réunion", code: "692" }, // Also 693
    { label: "FREE Réunion", code: "692" } // Also 693
  ],
  image: ""
};
// Note for La Réunion: Mobile numbers generally start with 692 or 693.
// Due to portability, the initial 3 digits do not definitively identify the carrier.

const Laos = {
  carrier: [
    // Laotian mobile numbers are 8 digits after +856.
    { label: "LaoTelecom", code: "20" }, // Also 30, 40
    { label: "Unitel", code: "20" }, // Also 30, 50, 70, 90
    { label: "Beeline (Tigo)", code: "20" }, // Also 30, 60
    { label: "ETL", code: "20" }, // Also 30, 40
    { label: "Sky Telecom", code: "" } // Sky Telecom has had varying operational status.
  ],
  image: ""
};
// Note for Laos: All mobile numbers start with '20' followed by the next 1-2 digits to differentiate carriers.
// There was a duplicate "Sky Telecom" in your source.
const Latvia = {
  carrier: [
    // Latvian mobile numbers are 8 digits after +371. They usually start with '2'.
    { label: "LMT", code: "2" }, // Common prefixes: 26, 29, 28
    { label: "Tele2", code: "2" }, // Common prefixes: 20, 25, 27
    { label: "Bite", code: "2" }, // Common prefixes: 21, 22, 23, 24, 28
    { label: "Triatel", code: "" } // Triatel was primarily a fixed-wireless/data provider, less active in standard mobile.
  ],
  image: ""
};
// Note for Latvia: All mobile numbers start with '2'. The second digit helps identify the network, but due to portability, it's not definitive.

const Lebanon = {
  carrier: [
    // Lebanese mobile numbers are 7 or 8 digits after +961. They commonly start with '03', '70', '71', '76', '78', '79'.
    { label: "Touch", code: "70" }, // Also uses 71, 76
    { label: "Alfa", code: "03" } // Also uses 78, 79
  ],
  image: ""
};
// Note for Lebanon: Prefixes are 2 digits (e.g., 70, 71) or 1 digit (e.g., 3 for old numbers).

const Lesotho = {
  carrier: [
    // Lesotho mobile numbers are 8 digits after +266. They commonly start with '5' or '6'.
    { label: "Vodacom", code: "5" }, // Also uses 6.
    { label: "Econet Ezi-Cel", code: "6" } // Also uses 5.
  ],
  image: ""
};
// Note for Lesotho: Mobile numbers commonly start with 5 or 6. Prefixes can overlap.

const Liberia = {
  carrier: [
    // Liberian mobile numbers are 7 digits after +231.
    { label: "Lonestar Cell MTN", code: "77" }, // Also uses 88
    { label: "Cellcom", code: "5" }, // Also uses 6
    { label: "Novafone (formerly Comium)", code: "" }, // Novafone ceased operations.
    { label: "Libtelco", code: "" } // Libtelco is primarily fixed-line.
  ],
  image: ""
};
// Note for Liberia: Prefixes are 2 digits. Novafone is defunct.

const Libya = {
  carrier: [
    // Libyan mobile numbers are 9 digits after +218. They commonly start with '9'.
    { label: "Almadar Aljadid", code: "91" }, // Also uses 92, 94
    { label: "Libyana", code: "91" } // Also uses 92, 93, 94, 95
  ],
  image: ""
};
// Note for Libya: All mobile numbers start with '9'. The following digit helps differentiate, but there's overlap.

const Liechtenstein = {
  carrier: [
    // Liechtenstein mobile numbers are typically 7 digits after +423.
    // They are often associated with Swiss networks due to roaming agreements and small size.
    { label: "FL1 (de) (formerly Mobilkom Liechtenstein AG)", code: "77" }, // Mobile numbers typically start with 77.
    { label: "Salt (formerly Orange)", code: "78" }, // Mobile numbers typically start with 78 (Swiss Salt prefixes).
    { label: "Swisscom", code: "79" } // Mobile numbers typically start with 79 (Swisscom prefixes).
  ],
  image: ""
};
// Note for Liechtenstein: Uses Swiss numbering ranges.

const Lithuania = {
  carrier: [
    // Lithuanian mobile numbers are 8 digits after +370. They commonly start with '6'.
    { label: "Telia (Formerly Omnitel)", code: "68" }, // Also 60, 61, 62, 65
    { label: "Bite", code: "67" }, // Also 60, 61, 62, 63
    { label: "Tele2", code: "60" }, // Also 67, 68
    { label: "Lietuvos radijo ir televizijos centras (MEZON)", code: "" } // MEZON is primarily fixed wireless/data.
  ],
  image: ""
};
// Note for Lithuania: All mobile numbers start with '6'. The next digit helps, but portability causes overlap.

const Luxembourg = {
  carrier: [
    // Luxembourg mobile numbers are 9 digits after +352.
    // They commonly start with 6.
    { label: "POST Luxembourg", code: "62" }, // Also uses 66
    { label: "Tango", code: "69" }, // Also uses 66
    { label: "Orange", code: "67" }, // Also uses 66
    { label: "LOL Mobile", code: "" } // LOL Mobile is an MVNO, not a distinct prefix.
  ],
  image: ""
};
// Note for Luxembourg: Mobile numbers start with '6'. The following digits identify the carrier.

const Macau = {
  carrier: [
    // Macau mobile numbers are 8 digits after +853. They commonly start with '6'.
    { label: "CTM", code: "6" }, // Uses various 6x prefixes.
    { label: "3 (3G)", code: "6" }, // Uses various 6x prefixes.
    { label: "China Telecom", code: "6" }, // Uses various 6x prefixes.
    { label: "SmarTone", code: "6" } // Uses various 6x prefixes.
  ],
  image: ""
};
// Note for Macau: All mobile numbers start with '6'. Due to portability, the initial digit is not a unique carrier identifier.

const Macedonia = { // Now North Macedonia
  carrier: [
    // North Macedonia mobile numbers are 8 digits after +389. They commonly start with '7'.
    { label: "A1 (formerly Vip)", code: "77" }, // Also uses 78
    { label: "Telekom (Formerly T-Mobile, MOBIMAK)", code: "70" } // Also uses 71, 72
  ],
  image: ""
};
// Note for North Macedonia: All mobile numbers start with '7'. The next digit differentiates carriers.

const Madagascar = {
  carrier: [
    // Malagasy mobile numbers are 9 digits after +261. They commonly start with '3'.
    { label: "Airtel", code: "33" },
    { label: "Telma Mobile", code: "34" },
    { label: "Orange", code: "32" },
    { label: "Blueline", code: "" }, // Blueline is mainly fixed wireless/internet.
    { label: "bip Madagascar", code: "" } // Bip Madagascar is an MVNO (uses Telma).
  ],
  image: ""
};
// Note for Madagascar: All mobile numbers start with '3'. The next digit differentiates carriers.

const Malawi = {
  carrier: [
    // Malawian mobile numbers are 8 digits after +265.
    { label: "Airtel (formerly Zain)", code: "99" }, // Also 98
    { label: "TNM", code: "88" }, // Also 99
    { label: "G-Mobile", code: "" }, // G-Mobile is largely defunct.
    { label: "Lacell", code: "" }, // Lacell is largely defunct.
    { label: "G-Expresso", code: "" } // G-Expresso is largely defunct.
  ],
  image: ""
};
// Note for Malawi: Prefixes are 2 digits. Many listed carriers are defunct.

const Malaysia = {
  carrier: [
    // Malaysian mobile numbers are 9-10 digits after +60. They commonly start with '01'.
    // The next digit or two indicates the original network, but portability is active.
    { label: "Digi", code: "10" }, // Also 14, 16
    { label: "Maxis", code: "12" }, // Also 17
    { label: "Celcom", code: "13" }, // Also 19
    { label: "U Mobile", code: "18" },
    { label: "Yes 4G", code: "11" }, // Specific for Yes, also 17
    { label: "Unifi Mobile (formerly known as webe)", code: "11" }, // Also 10
    { label: "ALTEL", code: "11" },
    { label: "Redtone", code: "1" }, // MVNO, uses other networks.
    { label: "TuneTalk (uses Celcom)", code: "11" }, // MVNO
    { label: "XOX (uses Celcom)", code: "10" }, // MVNO
    { label: "redONE (uses Celcom)", code: "10" }, // MVNO
    { label: "Merchantrade (uses Celcom)", code: "1" }, // MVNO
    { label: "Tron (uses DiGi)", code: "1" }, // MVNO
    { label: "SpeakOut Wireless (uses DiGi)", code: "1" }, // MVNO
    { label: "MY Evolution (uses DiGi)", code: "1" }, // MVNO
    { label: "Smart Pinoy (uses Celcom)", code: "1" }, // MVNO
    { label: "Buzzme (uses U Mobile)", code: "1" }, // MVNO
    { label: "FRiENDi Mobile (uses U Mobile)", code: "1" }, // MVNO
    { label: "Telin Malaysia (Kartu As) (uses U Mobile)", code: "1" }, // MVNO
    { label: "mCalls (uses DiGi)", code: "1" }, // MVNO
    { label: "Yoodoo (uses Celcom)", code: "1" }, // MVNO
    { label: "ookyo (uses Maxis)", code: "1" }, // MVNO
    { label: "Tapp (uses DiGi)", code: "1" } // MVNO
  ],
  image: ""
};
// Note for Malaysia: All mobile numbers start with '1' (after the '0' national prefix).
// The 'code' reflects the first one or two digits after '01'. Many are MVNOs, sharing prefixes with host networks.

const Maldives = {
  carrier: [
    // Maldivian mobile numbers are 7 digits after +960.
    { label: "Dhiraagu", code: "7" }, // Also uses 9.
    { label: "Ooredoo", code: "7" } // Also uses 9.
  ],
  image: ""
};
// Note for Maldives: Mobile numbers start with 7 or 9. The first digit is not unique per carrier.

const Mali = {
  carrier: [
    // Malian mobile numbers are 8 digits after +223. They commonly start with '6' or '7'.
    { label: "Orange", code: "7" }, // Also uses 6.
    { label: "Sotelma-Malitel", code: "6" }, // Also uses 7.
    { label: "Planor (Moov)", code: "5" } // Mobile numbers typically start with 5.
  ],
  image: ""
};
// Note for Mali: Mobile numbers often start with 6 or 7. Prefixes can overlap due to number portability.

const Malta = {
  carrier: [
    // Maltese mobile numbers are 8 digits after +356. They commonly start with '7' or '9'.
    { label: "Vodafone", code: "9" }, // Also uses 79.
    { label: "GO", code: "9" }, // Also uses 79.
    { label: "Melita", code: "7" } // Mobile numbers typically start with 77.
  ],
  image: ""
};
// Note for Malta: Mobile numbers generally start with 7 or 9.

const MarshallIslands = {
  carrier: [
    { label: "NTA (National Telecommunications Authority)", code: "45" } // Mobile numbers commonly start with 45.
  ],
  image: ""
};
// Note for Marshall Islands: Mobile numbers are 5 digits after +692. NTA is the sole provider.

const Mauritania = {
  carrier: [
    // Mauritanian mobile numbers are 8 digits after +222.
    { label: "Mauritel", code: "4" }, // Also uses 2, 3
    { label: "Chinguitel", code: "3" }, // Also uses 4, 8
    { label: "MATTEL", code: "2" } // Also uses 3, 4
  ],
  image: ""
};
// Note for Mauritania: Mobile numbers often start with 2, 3, or 4. Prefixes overlap.

const Mauritius = {
  carrier: [
    // Mauritian mobile numbers are 7 digits after +230. They commonly start with '5'.
    { label: "Orange (Mauritius Telecom)", code: "5" }, // Uses various 5x prefixes.
    { label: "Emtel", code: "5" }, // Uses various 5x prefixes.
    { label: "CHiLi (Homeland Group)", code: "5" } // Uses various 5x prefixes.
  ],
  image: ""
};
// Note for Mauritius: All mobile numbers start with '5'. The `code` field will not distinguish carriers.

const Mexico = {
  carrier: [
    // Mexican mobile numbers are 10 digits after +52.
    // All mobile numbers now start with a '3' (when dialing the 10-digit number directly).
    // Previously, a '1' prefix was used for mobile numbers from other regions. This has been removed.
    // True carrier identification requires a lookup due to portability.
    { label: "Telcel", code: "3" }, // Mobile numbers typically start with 3 (following new dialing plan).
    { label: "Movistar", code: "3" }, // Mobile numbers typically start with 3.
    { label: "AT&T Mexico (Includes Unefon)", code: "3" }, // Mobile numbers typically start with 3.
    { label: "Virgin Mobile (using Movistar)", code: "3" }, // MVNO
    { label: "QBO Cel (using Movistar)", code: "3" }, // MVNO
    { label: "weex (using Movistar)", code: "3" }, // MVNO
    { label: "Cierto (using Movistar)", code: "3" }, // MVNO
    { label: "Maz Tiempo (using Movistar)", code: "3" }, // MVNO
    { label: "Oui Móvil (using Telcel)", code: "3" }, // MVNO
    { label: "Flash Mobile (using Movistar)", code: "3" } // MVNO
  ],
  image: ""
};
// Note for Mexico: All 10-digit mobile numbers now start with '3'. The `code` field will not distinguish carriers.

const Micronesia = {
  carrier: [
    { label: "FSM Telecom", code: "9" } // Mobile numbers commonly start with 9.
  ],
  image: ""
};
// Note for Micronesia: Mobile numbers are 7 digits after +691. FSM Telecom is the sole provider.

const Moldova = {
  carrier: [
    // Moldovan mobile numbers are 8 digits after +373. They commonly start with '6' or '7'.
    { label: "Orange", code: "6" }, // Also uses 78, 79.
    { label: "Moldcell", code: "6" }, // Also uses 71, 74.
    { label: "Unité", code: "7" }, // Also uses 6.
    { label: "Interdnestrcom operating in Transnistria region only", code: "" } // Specific to Transnistria, uses 777, 778.
  ],
  image: ""
};
// Note for Moldova: Mobile numbers mostly start with 6 or 7. Interdnestrcom is a regional operator.

const Monaco = {
  carrier: [
    { label: "Monaco Telecom", code: "6" } // Mobile numbers commonly start with 6.
  ],
  image: ""
};
// Note for Monaco: Mobile numbers are 8 digits after +377. Monaco Telecom is the sole provider.

const Mongolia = {
  carrier: [
    // Mongolian mobile numbers are 8 digits after +976.
    { label: "Mobicom", code: "99" }, // Also uses 88, 89
    { label: "Unitel", code: "90" }, // Also uses 94, 95
    { label: "Skytel", code: "96" }, // Also uses 91
    { label: "G-Mobile", code: "93" } // Also uses 97
  ],
  image: ""
};
// Note for Mongolia: Prefixes are 2 digits.

const Montenegro = {
  carrier: [
    // Montenegrin mobile numbers are 8 digits after +382. They commonly start with '6'.
    { label: "Yettel (Formerly Telenor, Promonte)", code: "69" },
    { label: "Telekom (Formerly Monet)", code: "67" },
    { label: "m:tel", code: "68" }
  ],
  image: ""
};
// Note for Montenegro: All mobile numbers start with '6'. The next digit differentiates carriers.

const Montserrat = {
  carrier: [
    { label: "FLOW Montserrat", code: "664" },    // Montserrat's Area Code.
    { label: "Digicel Montserrat", code: "664" } // Montserrat's Area Code.
  ],
  image: ""
};
// Note for Montserrat: Uses NANP (+1) with Area Code 664. Carrier distinction is not by prefix within this code.

const Morocco = {
  carrier: [
    // Moroccan mobile numbers are 9 digits after +212. They commonly start with '6' or '7'.
    { label: "Maroc Telecom", code: "6" }, // Uses various 6x, 7x prefixes.
    { label: "Orange", code: "6" }, // Uses various 6x, 7x prefixes.
    { label: "inwi", code: "6" } // Uses various 6x, 7x prefixes.
  ],
  image: ""
};
// Note for Morocco: All mobile numbers start with 6 or 7. Due to portability, the `code` field will not distinguish carriers.

const Mozambique = {
  carrier: [
    // Mozambican mobile numbers are 9 digits after +258.
    { label: "mcel", code: "82" }, // Also uses 83
    { label: "Vodacom", code: "84" }, // Also uses 85
    { label: "Movitel", code: "86" } // Also uses 87
  ],
  image: ""
};
// Note for Mozambique: Prefixes are 2 digits.

const Myanmar = {
  carrier: [
    // Myanmar mobile numbers are 9 digits after +95.
    { label: "MPT", code: "9" }, // Uses 92, 94, 95, 96, 97, 98, 99
    { label: "Telenor", code: "9" }, // Uses 97
    { label: "Ooredoo", code: "9" }, // Uses 96
    { label: "Mytel", code: "9" } // Uses 96, 97, 98
  ],
  image: ""
};
// Note for Myanmar: All mobile numbers start with '9'. The next digit helps differentiate.

const Namibia = {
  carrier: [
    // Namibian mobile numbers are 8 digits after +264. They commonly start with '8'.
    { label: "MTC", code: "81" }, // Also uses 85
    { label: "TN Mobile (formerly Cell One, Leo)", code: "82" } // Also uses 83
  ],
  image: ""
};
// Note for Namibia: All mobile numbers start with '8'. The next digit helps differentiate.

const Nauru = {
  carrier: [
    { label: "Digicel", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Nauru: Mobile numbers are 5 digits after +674. Digicel is the sole provider.

const Nepal = {
  carrier: [
    // Nepalese mobile numbers are 10 digits after +977. They commonly start with '9'.
    { label: "Ncell", code: "980" }, // Also 981, 982
    { label: "Nepal Telecom", code: "984" }, // Also 986
    { label: "Smart Telecom", code: "988" }
  ],
  image: ""
};
// Note for Nepal: All mobile numbers start with '9'. The following 2 digits differentiate carriers.

const Netherlands = {
  carrier: [
    // Dutch mobile numbers are 9 digits after +31. They always start with '6'.
    { label: "KPN - Includes the previous Telfort network.", code: "6" }, // Various 6x prefixes.
    { label: "Vodafone (Formerly Libertel)", code: "6" }, // Various 6x prefixes.
    { label: "Odido (Formerly T-Mobile, Ben) - Includes the previous Orange network.", code: "6" }, // Various 6x prefixes.
    { label: "Tele2", code: "6" } // Tele2 mobile network was acquired by T-Mobile (now Odido).
  ],
  image: ""
};
// Note for Netherlands: All mobile numbers start with '6'. Due to portability, the `code` field will not distinguish carriers.
// Tele2 mobile network is now part of Odido (formerly T-Mobile).

const NewCaledonia = {
  carrier: [
    { label: "Mobilis (OPT-NC)", code: "7" } // Mobile numbers commonly start with 7.
  ],
  image: ""
};
// Note for New Caledonia: Mobile numbers are 6 digits after +687. Mobilis is the sole provider.

const NewZealand = {
  carrier: [
    // New Zealand mobile numbers are 8-9 digits after +64. They always start with '2'.
    { label: "Vodafone (now One NZ)", code: "2" }, // Uses 21, 27
    { label: "Spark (formerly Telecom New Zealand)", code: "2" }, // Uses 22, 27
    { label: "2degrees", code: "2" }, // Uses 20, 27
    { label: "Black+White (using Vodafone)", code: "2" }, // MVNO
    { label: "Warehouse Mobile (using 2degrees)", code: "2" }, // MVNO
    { label: "Slingshot (using Spark)", code: "2" }, // MVNO
    { label: "Skinny (using Spark)", code: "2" }, // MVNO
    { label: "Compass Mobile (using Spark)", code: "2" } // MVNO
  ],
  image: ""
};
// Note for New Zealand: All mobile numbers start with '2'. The next digit or two helps, but portability applies.
// Vodafone NZ has rebranded to One NZ.
const Nicaragua = {
  carrier: [
    // Nicaraguan mobile numbers are 8 digits after +505. They commonly start with '8' or '5'.
    { label: "Claro (formerly Enitel)", code: "8" }, // Also uses 5
    { label: "Tigo (formerly Movistar)", code: "8" } // Also uses 5
  ],
  image: ""
};
// Note for Nicaragua: Mobile numbers commonly start with 8 or 5. Carrier distinction is often by the second digit. Movistar became Tigo.

const Niger = {
  carrier: [
    // Niger mobile numbers are 8 digits after +227.
    { label: "Airtel", code: "90" }, // Also 91, 92
    { label: "Sonitel", code: "" }, // Sonitel is primarily fixed line.
    { label: "Orange", code: "88" }, // Also 89, 93
    { label: "Moov", code: "96" } // Also 97, 98, 99
  ],
  image: ""
};
// Note for Niger: Prefixes are 2 digits. Sonitel is not a mobile carrier.

const Nigeria = {
  carrier: [
    // Nigerian mobile numbers are 10 digits after +234. They commonly start with '7', '8', or '9'.
    { label: "MTN", code: "803" }, // Also 703, 706, 806, 810, 813-816, 903, 906
    { label: "Airtel", code: "802" }, // Also 701, 708, 808, 812, 901, 902, 904, 907
    { label: "Glo Mobile", code: "805" }, // Also 705, 807, 811, 815, 905
    { label: "9mobile (formerly Etisalat)", code: "809" }, // Also 708, 817, 818, 908, 909
    { label: "Visafone", code: "" }, // Visafone was acquired by MTN, prefixes integrated.
    { label: "Multilinks Telkom", code: "" } // Multilinks Telkom largely defunct for mobile.
  ],
  image: ""
};
// Note for Nigeria: Mobile numbers start with 7, 8, or 9. The 'code' represents the first 3 digits after the country code.
// Many prefixes are now portable.

const Niue = {
  carrier: [
    { label: "Telecom Niue", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Niue: Mobile numbers are 5 digits after +683. Telecom Niue is the sole provider.

const NorfolkIsland = {
  carrier: [
    { label: "Norfolk Telecom", code: "5" } // Mobile numbers commonly start with 5.
  ],
  image: ""
};
// Note for Norfolk Island: Mobile numbers are 5 digits after +672. Norfolk Telecom is the sole provider.

const NorthKorea = {
  carrier: [
    { label: "Koryolink", code: "191" } // Mobile numbers typically start with 191, 192.
  ],
  image: ""
};
// Note for North Korea: Mobile numbers are 8 digits after +850. Koryolink is the main (or sole foreign-accessible) provider.

const NorthernMarianaIslands = {
  carrier: [
    // NMI is part of the NANP (+1) with Area Code 670.
    { label: "Docomo Pacific", code: "670" },
    { label: "IT&E", code: "670" }
  ],
  image: ""
};
// Note for Northern Mariana Islands: Uses NANP (+1) with Area Code 670. Carrier distinction is not by prefix within this code.

const Norway = {
  carrier: [
    // Norwegian mobile numbers are 8 digits after +47. They commonly start with '4' or '9'.
    { label: "Telenor", code: "90" }, // Also 40, 41, 46, 91-95, 97, 98
    { label: "Telia (Formerly NetCom) - Includes the previous Tele2 network.", code: "40" }, // Also 45, 47, 48, 90, 91
    { label: "Ice.net", code: "9" } // Mobile numbers typically start with 9.
  ],
  image: ""
};
// Note for Norway: Mobile numbers start with 4 or 9. Prefixes overlap due to portability.

const Oman = {
  carrier: [
    // Omani mobile numbers are 8 digits after +968. They commonly start with '9'.
    { label: "Omantel", code: "9" }, // Uses 91-97, 99
    { label: "Ooredoo (formerly Nawras)", code: "9" } // Uses 91-97, 99
  ],
  image: ""
};
// Note for Oman: All mobile numbers start with '9'. The next digit helps differentiate, but portability exists.

const Pakistan = {
  carrier: [
    // Pakistani mobile numbers are 10 digits after +92. They commonly start with '3'.
    { label: "Jazz (formerly Mobilink, includes the Warid brand)", code: "30" }, // Also 300-309, 320-324, 340-349
    { label: "Telenor", code: "345" }, // Also 340-349
    { label: "Zong", code: "310" }, // Also 310-318
    { label: "Ufone", code: "330" }, // Also 330-336
    { label: "Special Communications Organization (SCO)", code: "355" } // Operates in Azad Kashmir and Gilgit-Baltistan
  ],
  image: ""
};
// Note for Pakistan: All mobile numbers start with '3'. The following 2 digits identify the original network.
// Portability is active, so prefixes are not strictly tied to one carrier.

const Palau = {
  carrier: [
    { label: "PNCC (Palau National Communications Corporation)", code: "7" } // Mobile numbers commonly start with 7.
  ],
  image: ""
};
// Note for Palau: Mobile numbers are 7 digits after +680. PNCC is the sole provider.

const Palestine = {
  carrier: [
    // Palestinian mobile numbers are 9 digits after +970.
    { label: "Jawwal", code: "59" }, // Mobile numbers typically start with 59.
    { label: "Ooredoo Palestine (formerly Wataniya Mobile)", code: "56" } // Mobile numbers typically start with 56.
  ],
  image: ""
};
// Note for Palestine: Prefixes are 2 digits.

const Panama = {
  carrier: [
    // Panamanian mobile numbers are 7 or 8 digits after +507. They commonly start with '6'.
    { label: "Cable & Wireless (Más Móvil)", code: "6" }, // Also uses 8
    { label: "Movistar", code: "6" }, // Also uses 8
    { label: "Claro", code: "6" }, // Also uses 8
    { label: "Digicel", code: "6" } // Also uses 8
  ],
  image: ""
};
// Note for Panama: Mobile numbers commonly start with 6 or 8. Due to portability, the initial digit is not a unique carrier identifier.

const PapuaNewGuinea = {
  carrier: [
    // Papua New Guinean mobile numbers are 8 digits after +675. They commonly start with '7'.
    { label: "Digicel", code: "7" }, // Uses 70-73, 75-77, 79
    { label: "BMobile (Vodafone PNG)", code: "7" }, // Uses 74
    { label: "Telikom PNG", code: "7" } // Uses 78
  ],
  image: ""
};
// Note for Papua New Guinea: All mobile numbers start with '7'. The next digit differentiates carriers.

const Paraguay = {
  carrier: [
    // Paraguayan mobile numbers are 9 digits after +595. They commonly start with '9'.
    { label: "Tigo", code: "98" }, // Also 99
    { label: "Personal", code: "97" }, // Also 99
    { label: "Claro", code: "96" }, // Also 99
    { label: "VOX", code: "99" } // Also 99
  ],
  image: ""
};
// Note for Paraguay: All mobile numbers start with '9'. The next digit helps differentiate.

const Peru = {
  carrier: [
    // Peruvian mobile numbers are 9 digits after +51. They commonly start with '9'.
    { label: "Movistar", code: "9" }, // Uses 93, 94, 95, 96, 97, 98, 99
    { label: "Claro (Formerly TIM)", code: "9" }, // Uses 91, 92, 93, 94, 95, 96, 97, 98, 99
    { label: "Entel (Formerly Nextel)", code: "9" }, // Uses 98, 99
    { label: "Bitel (Formerly Viettel Peru S.A.C.)", code: "9" }, // Uses 93, 94, 99
    { label: "Virgin Mobile (using Movistar)", code: "9" } // MVNO
  ],
  image: ""
};
// Note for Peru: All mobile numbers start with '9'. Due to number portability, the `code` field will not distinguish carriers.

const Philippines = {
  carrier: [
    // Philippine mobile numbers are 10 digits after +63. They commonly start with '9' or '8'.
    { label: "Globe (including TM, GOMO, etc.)", code: "917" }, // Also many others like 905, 906, 915, 916, 926, 927, 935, 936, 937, 945, 953, 955, 956, 965, 966, 967, 975, 976, 977, 978, 979, 995, 996, 997
    { label: "Smart (including TNT and Sun Cellular)", code: "918" } // Also many others like 907, 908, 909, 910, 912, 919, 920, 921, 928, 929, 930, 938, 939, 947, 948, 949, 998, 999
    // DITO Telecommunity (new major player) - prefixes 991-994, 998
  ],
  image: ""
};
// Note for Philippines: Mobile numbers mostly start with '9'. The first 3-4 digits after country code identify the original network.
// Due to portability, the `code` field is not definitively exclusive to a carrier.

const Poland = {
  carrier: [
    // Polish mobile numbers are 9 digits after +48. They commonly start with '5' or '6' or '7' or '8'.
    { label: "Play", code: "5" }, // Also 6, 7
    { label: "Orange (Formerly IDEA)", code: "5" }, // Also 6, 7, 8
    { label: "Plus (Formerly Plus GSM)", code: "5" }, // Also 6, 7, 8
    { label: "T-Mobile (Formerly Era)", code: "5" } // Also 6, 7, 8
  ],
  image: ""
};
// Note for Poland: Mobile numbers often start with 5, 6, 7, or 8. Due to number portability, the initial digits are not a definitive carrier identifier.

const Portugal = {
  carrier: [
    // Portuguese mobile numbers are 9 digits after +351. They always start with '9'.
    { label: "MEO (Formerly TMN)", code: "91" }, // Also 92, 96
    { label: "Vodafone (Formerly Telecel)", code: "91" }, // Also 92, 93
    { label: "NOS (Formerly Optimus)", code: "93" } // Also 92, 96
  ],
  image: ""
};
// Note for Portugal: All mobile numbers start with '9'. The next digit or two helps, but portability applies.

const PuertoRico_USVirginIslands = {
  carrier: [
    // These are part of the NANP (+1) with various area codes (787, 939 for PR; 340 for USVI).
    { label: "AT&T", code: "787" }, // Area codes for PR and USVI.
    { label: "Claro", code: "787" },
    { label: "T-Mobile", code: "787" },
    { label: "Sprint", code: "787" }, // Sprint merged with T-Mobile.
    { label: "Open Mobile", code: "787" },
    { label: "Liberty Communications (formerly Choice Communications)", code: "787" },
    { label: "TracFone Wireless", code: "787" } // MVNO
  ],
  image: ""
};
// Note for Puerto Rico & US Virgin Islands: Uses NANP (+1) with area codes 787, 939 (PR), 340 (USVI).
// Carrier distinction is not by a unique numerical prefix within these codes.

const Qatar = {
  carrier: [
    // Qatari mobile numbers are 8 digits after +974. They commonly start with '3', '5', '6', '7'.
    { label: "Ooredoo (formerly Qtel)", code: "3" }, // Uses 33, 55, 66, 77
    { label: "Vodafone", code: "3" } // Uses 30, 50, 70
  ],
  image: ""
};
// Note for Qatar: Mobile numbers start with 3, 5, 6, or 7. The next digit helps differentiate.

const Romania = {
  carrier: [
    // Romanian mobile numbers are 9 digits after +40. They commonly start with '7'.
    { label: "Orange (Formerly Dialog)", code: "74" }, // Also 75, 76
    { label: "Vodafone (Formerly Connex)", code: "72" }, // Also 73
    { label: "Telekom (Formerly Cosmorom, Cosmote)", code: "76" }, // Also 78
    { label: "Digi.Mobil", code: "77" }
  ],
  image: ""
};
// Note for Romania: All mobile numbers start with '7'. The next digit differentiates carriers.

const Russia = {
  carrier: [
    // Russian mobile numbers are 10 digits after +7. They commonly start with '9'.
    // Prefixes are highly granular and depend on region and carrier.
    { label: "MTS", code: "91" }, // Many, many prefixes: 91x, 98x, 90x, 95x, 96x, 97x...
    { label: "MegaFon", code: "92" }, // Many, many prefixes: 92x, 93x, 90x, 95x, 96x...
    { label: "Beeline", code: "90" }, // Many, many prefixes: 90x, 95x, 96x...
    { label: "Tele2", code: "90" }, // Many, many prefixes: 90x, 95x, 97x...
    { label: "Sotovaja Svjaz MOTIV", code: "90" }, // Regional operator (Urals), uses 90, 91, 99
    // { label: "SMARTS", code: "" }, // SMARTS is largely defunct or merged.
    { label: "Tattelecom", code: "90" }, // Regional operator (Tatarstan), uses 90
    { label: "Vainahtelecom", code: "92" } // Regional operator (Chechnya), often uses 928.
  ],
  image: ""
};
// Note for Russia: Prefixes are 3 digits, but there's extensive overlap due to portability and regional operators.
// Providing a single prefix is highly generalized. Many listed carriers are regional or defunct.

const Rwanda = {
  carrier: [
    // Rwandan mobile numbers are 8 digits after +250. They commonly start with '7'.
    { label: "MTN", code: "78" }, // Also 79
    { label: "Airtel (includes Tigo)", code: "78" }, // Includes 78, 72 (from Tigo)
    { label: "Rwandatel", code: "" } // Rwandatel's mobile operations ceased.
  ],
  image: ""
};
// Note for Rwanda: All mobile numbers start with '7'. Airtel acquired Tigo. Rwandatel is defunct.

const SaintKittsAndNevis = {
  carrier: [
    // St. Kitts and Nevis is part of the NANP (+1) with Area Code 869.
    { label: "FLOW", code: "869" },
    { label: "Digicel", code: "869" },
    { label: "CHIPPIE", code: "869" }
  ],
  image: ""
};
// Note for Saint Kitts and Nevis: Uses NANP (+1) with Area Code 869. Carrier distinction is not by prefix within this code.

const SaintLucia = {
  carrier: [
    // Saint Lucia is part of the NANP (+1) with Area Code 758.
    { label: "FLOW", code: "758" },
    { label: "Digicel", code: "758" }
  ],
  image: ""
};
// Note for Saint Lucia: Uses NANP (+1) with Area Code 758. Carrier distinction is not by prefix within this code.

const SaintVincentAndTheGrenadines = {
  carrier: [
    // Saint Vincent & the Grenadines is part of the NANP (+1) with Area Code 784.
    { label: "FLOW", code: "784" },
    { label: "Digicel", code: "784" }
  ],
  image: ""
};
// Note for Saint Vincent and the Grenadines: Uses NANP (+1) with Area Code 784. Carrier distinction is not by prefix within this code.

const Samoa = {
  carrier: [
    // Samoan mobile numbers are 7 digits after +685. They commonly start with '7'.
    { label: "bluesky", code: "7" }, // Mobile numbers typically start with 7.
    { label: "Digicel", code: "7" } // Mobile numbers typically start with 7.
  ],
  image: ""
};
// Note for Samoa: Mobile numbers start with 7. The next digit helps differentiate.

const SanMarino = {
  carrier: [
    // San Marino mobile numbers are 8-9 digits after +378.
    // They are often associated with Italian networks.
    { label: "Telefonia Mobile Sammarinese (TMS)", code: "6" }, // Uses its own prefixes (e.g., 66)
    { label: "TIM", code: "3" }, // Italian TIM prefixes (e.g., 33x, 36x)
    { label: "San Marino Telecom (SMT)", code: "6" } // Mobile numbers typically start with 6.
  ],
  image: ""
};
// Note for San Marino: Uses a mix of its own prefixes and Italian prefixes.

const SaoTomeAndPrincipe = {
  carrier: [
    { label: "CST (Companhia Santomense de Telecomunicações)", code: "9" } // Mobile numbers commonly start with 9.
  ],
  image: ""
};
// Note for Sao Tome and Principe: Mobile numbers are 7 digits after +239. CST is the sole provider.

const SaudiArabia = {
  carrier: [
    // Saudi Arabian mobile numbers are 9 digits after +966. They commonly start with '5'.
    { label: "STC", code: "50" }, // Also 51, 53, 54, 55
    { label: "Mobily", code: "56" }, // Also 54, 59
    { label: "Zain", code: "58" }, // Also 59
    { label: "Bravo", code: "" }, // Bravo is for push-to-talk/trunking.
    { label: "Virgin mobile KSA", code: "57" }, // MVNO
    { label: "Lebara KSA", code: "57" } // MVNO
  ],
  image: ""
};
// Note for Saudi Arabia: All mobile numbers start with '5'. The next digit differentiates.

const Senegal = {
  carrier: [
    // Senegalese mobile numbers are 9 digits after +221. They commonly start with '7'.
    { label: "Orange (with Kirene virtual operator)", code: "77" }, // Also 78
    { label: "Tigo (Free)", code: "70" }, // Now Free Senegal. Uses 70, 76
    { label: "Expresso", code: "7" }, // Uses 73, 74, 75
    { label: "Hayo Telecom", code: "" } // Hayo Telecom is primarily a data/internet provider.
  ],
  image: ""
};
// Note for Senegal: All mobile numbers start with '7'. The next digit differentiates.

const Serbia = {
  carrier: [
    // Serbian mobile numbers are 8-9 digits after +381. They commonly start with '6'.
    { label: "mts (Telekom Srbija)", code: "64" }, // Also 65, 66
    { label: "Yettel (Formerly Telenor)", code: "63" }, // Also 62, 69
    { label: "A1 (formerly vip mobile)", code: "60" } // Also 61
  ],
  image: ""
};
// Note for Serbia: All mobile numbers start with '6'. The next digit differentiates.

const Seychelles = {
  carrier: [
    // Seychellois mobile numbers are 7 digits after +248. They commonly start with '2' or '4'.
    { label: "Airtel", code: "2" }, // Also 4
    { label: "Cable & Wireless", code: "2" } // Also 4
  ],
  image: ""
};
// Note for Seychelles: Mobile numbers start with 2 or 4. Prefixes overlap.

const SierraLeone = {
  carrier: [
    // Sierra Leonean mobile numbers are 8 digits after +232. They commonly start with '2' or '7'.
    { label: "Africell", code: "77" }, // Also 78
    { label: "Orange", code: "76" }, // Also 79
    { label: "Sierratel", code: "25" }, // Also 21, 22
    { label: "Comium", code: "" }, // Comium is largely defunct.
    { label: "GreenN", code: "" } // GreenN is largely defunct.
  ],
  image: ""
};
// Note for Sierra Leone: Prefixes are 2 digits. Comium and GreenN are largely defunct.

const Singapore = {
  carrier: [
    // Singaporean mobile numbers are 8 digits after +65. They commonly start with '8' or '9'.
    { label: "Singtel Mobile", code: "8" }, // Also 9
    { label: "StarHub", code: "8" }, // Also 9
    { label: "M1", code: "8" }, // Also 9
    { label: "GRID", code: "" }, // GRID is a specialized trunked radio system, not public mobile.
    { label: "Circles.Life (Using M1)", code: "8" }, // MVNO
    { label: "Zero Mobile (Using Singtel)", code: "8" }, // MVNO (ceased operations)
    { label: "Zero1 (Using Singtel)", code: "8" }, // MVNO
    { label: "MyRepublic (Using Starhub)", code: "8" } // MVNO
  ],
  image: ""
};
// Note for Singapore: Mobile numbers start with 8 or 9. The `code` field will not distinguish carriers.
// GRID is not a standard mobile carrier. Zero Mobile ceased operations.

const Slovakia = {
  carrier: [
    // Slovak mobile numbers are 9 digits after +421. They commonly start with '9'.
    { label: "Orange (Formerly Globtel, Slovtel)", code: "90" }, // Also 91
    { label: "Telekom (Formerly Eurotel, T-Mobile)", code: "90" }, // Also 91, 94
    { label: "O2", code: "94" },
    { label: "4KA / SWAN Mobile", code: "95" }
  ],
  image: ""
};
// Note for Slovakia: All mobile numbers start with '9'. The next digit differentiates.

const Slovenia = {
  carrier: [
    // Slovenian mobile numbers are 8 digits after +386. They commonly start with '3', '4', '5', '6'.
    { label: "Telekom Slovenije (formerly Mobitel)", code: "3" }, // Uses 31, 40, 51
    { label: "A1 (formerly Si.mobil)", code: "4" }, // Uses 40, 51, 68
    { label: "Telemach (formerly Tušmobil)", code: "6" }, // Uses 68, 69
    { label: "T-2", code: "6" } // Uses 64
  ],
  image: ""
};
// Note for Slovenia: Mobile numbers start with 3, 4, 5, or 6. The next digit differentiates.

const SolomonIslands = {
  carrier: [
    { label: "Our Telekom", code: "7" } // Mobile numbers commonly start with 7.
  ],
  image: ""
};
// Note for Solomon Islands: Mobile numbers are 7 digits after +677. Our Telekom is the sole provider.

const Somalia = {
  carrier: [
    // Somali mobile numbers are 7 digits after +252.
    // Due to the complex political situation, numbering can be fragmented.
    { label: "Hormuud", code: "61" }, // Also 62, 63
    { label: "Telcom Somalia", code: "6" }, // Less common mobile prefix.
    { label: "Telesom Mobile", code: "6" }, // Primarily Somaliland.
    { label: "Nationlink", code: "" }, // Nationlink operations are diminished or ceased.
    { label: "Somtel", code: "6" }, // Primarily Somaliland.
    { label: "Golis Telecom Somalia", code: "9" }, // Primarily Puntland.
    { label: "Somafone", code: "" }, // Somafone operations are diminished or ceased.
    { label: "Netco", code: "" } // Netco is primarily fixed-line or data.
  ],
  image: ""
};
// Note for Somalia: Prefixes are 2 digits. Operations vary significantly by region. Many carriers are regional or defunct.

const SouthAfrica = {
  carrier: [
    // South African mobile numbers are 9 digits after +27. They always start with '6', '7', or '8'.
    { label: "Vodacom", code: "6" }, // Uses 60, 63, 71, 72, 76, 79, 82
    { label: "MTN", code: "6" }, // Uses 60, 62, 63, 78, 83
    { label: "Cell C", code: "6" }, // Uses 61, 64, 74, 84
    { label: "Telkom Mobile", code: "6" } // Uses 68
  ],
  image: ""
};
// Note for South Africa: All mobile numbers start with 6, 7, or 8. The `code` field will not distinguish carriers.
// The next digit differentiates, but portability applies.

const SouthKorea = {
  carrier: [
    // South Korean mobile numbers are 8 digits after +82. They always start with '10'.
    { label: "SK Telecom", code: "10" }, // All carriers use 10 prefix.
    { label: "KT (formerly olleh, KTF)", code: "10" },
    { label: "LG U+ (formerly LG Telecom)", code: "10" }
  ],
  image: ""
};
// Note for South Korea: All mobile numbers use the '10' prefix (after '0' national dialing).
// The `code` field will not distinguish carriers.

const SouthSudan = {
  carrier: [
    // South Sudan mobile numbers are 8 digits after +211.
    { label: "MTN", code: "93" }, // Also uses 94
    { label: "Zain", code: "91" },
    { label: "Sudani", code: "92" },
    { label: "Vivacell (NOW)", code: "95" }, // Vivacell ceased operations.
    { label: "Gemtel", code: "" } // Gemtel is largely defunct.
  ],
  image: ""
};
// Note for South Sudan: Prefixes are 2 digits. Vivacell and Gemtel are largely defunct.

const Spain = {
  carrier: [
    // Spanish mobile numbers are 9 digits after +34. They always start with '6' or '7'.
    { label: "Movistar", code: "6" }, // Uses many 6x, 7x prefixes.
    { label: "Orange (Formerly Amena)", code: "6" }, // Uses many 6x, 7x prefixes.
    { label: "Vodafone (Formerly Airtel)", code: "6" }, // Uses many 6x, 7x prefixes.
    { label: "Yoigo", code: "6" } // Uses many 6x, 7x prefixes.
  ],
  image: ""
};
// Note for Spain: All mobile numbers start with 6 or 7. Due to number portability, the `code` field will not distinguish carriers.

const SriLanka = {
  carrier: [
    // Sri Lankan mobile numbers are 7 digits after +94. They commonly start with '7'.
    { label: "Dialog", code: "7" }, // Uses 71, 72, 76, 77
    { label: "Mobitel", code: "7" }, // Uses 70, 71
    { label: "Hutch (includes Etisalat prefixes)", code: "7" }, // Uses 78, 77 (from Etisalat)
    { label: "Airtel", code: "7" } // Uses 75
    // Etisalat was acquired by Hutch.
  ],
  image: ""
};
// Note for Sri Lanka: All mobile numbers start with '7'. The next digit differentiates.
const Sudan = {
  carrier: [
    // Sudanese mobile numbers are 9 digits after +249. They commonly start with '9'.
    { label: "Zain", code: "91" }, // Also 90, 96
    { label: "MTN", code: "93" }, // Also 92
    { label: "Sudani", code: "96" }, // Also 95
    { label: "Canar", code: "9" } // Canar is primarily fixed-line or data, less common for mobile.
  ],
  image: ""
};
// Note for Sudan: All mobile numbers start with '9'. The next digit helps differentiate, but there's overlap.

const Suriname = {
  carrier: [
    // Surinamese mobile numbers are 7 digits after +597. They commonly start with '8' or '7'.
    { label: "Telesur", code: "8" }, // Mobile numbers typically start with 8.
    { label: "Digicel", code: "7" } // Mobile numbers typically start with 7.
  ],
  image: ""
};
// Note for Suriname: Mobile numbers start with 7 or 8.

const Eswatini = { // Formerly Swaziland
  carrier: [
    // Eswatini mobile numbers are 8 digits after +268. They commonly start with '7'.
    { label: "MTN Eswatini", code: "76" } // Also 78, 79
  ],
  image: ""
};
// Note for Eswatini: All mobile numbers start with '7'. The next digit differentiates. MTN is the dominant, if not sole, mobile provider.

const Sweden = {
  carrier: [
    // Swedish mobile numbers are 7 digits after +46. They usually start with '7'.
    { label: "Telia", code: "70" }, // Also 72, 73
    { label: "Tele2", code: "70" }, // Also 72, 73, 76
    { label: "Telenor (Formerly Vodafone)", code: "70" }, // Also 72, 73, 76
    { label: "3 (Tre)", code: "70" } // Also 73, 76
  ],
  image: ""
};
// Note for Sweden: All mobile numbers start with '7'. Due to number portability, the `code` field will not definitively distinguish carriers.

const Switzerland = {
  carrier: [
    // Swiss mobile numbers are 9 digits after +41. They always start with '7'.
    { label: "Swisscom", code: "79" }, // Also 75
    { label: "Sunrise", code: "76" }, // Also 70, 77
    { label: "Salt (Formerly Orange)", code: "78" }
  ],
  image: ""
};
// Note for Switzerland: All mobile numbers start with '7'. The next digit differentiates the original network, but portability is active.

const Syria = {
  carrier: [
    // Syrian mobile numbers are 8 digits after +963. They commonly start with '9'.
    { label: "MTN", code: "9" }, // Uses 93, 94, 99
    { label: "Syriatel", code: "9" } // Uses 92, 93, 95, 96, 98
  ],
  image: ""
};
// Note for Syria: All mobile numbers start with '9'. The next digit differentiates the original network.

const Taiwan = {
  carrier: [
    // Taiwanese mobile numbers are 9 digits after +886. They always start with '9'.
    { label: "Chunghwa Telecom", code: "9" }, // Uses 90x, 91x, 92x, 93x, 94x, 95x, 96x, 97x, 98x, 99x
    { label: "Taiwan Mobile", code: "9" }, // Uses 90x, 91x, 92x, 93x, 94x, 95x, 96x, 97x, 98x, 99x
    { label: "FarEasTone", code: "9" }, // Uses 90x, 91x, 92x, 93x, 94x, 95x, 96x, 97x, 98x, 99x
    { label: "Asia Pacific Telecom GT 4G", code: "9" }, // Uses 90x, 97x, 98x
    { label: "T STAR (Taiwan Star)", code: "9" } // Uses 90x, 97x, 98x
  ],
  image: ""
};
// Note for Taiwan: All mobile numbers start with '9'. Due to number portability, the `code` field will not definitively distinguish carriers.

const Tajikistan = {
  carrier: [
    // Tajik mobile numbers are 9 digits after +992.
    { label: "Tcell", code: "93" }, // Also 55
    { label: "Babilon Mobile", code: "9" }, // Uses 90, 91
    { label: "Beeline", code: "9" }, // Uses 90, 91, 99
    { label: "MLT (MegaFon Tajikistan)", code: "90" } // Mobile numbers typically start with 90.
  ],
  image: ""
};
// Note for Tajikistan: Mobile numbers often start with 9. The next digit or two helps differentiate.

const Tanzania = {
  carrier: [
    // Tanzanian mobile numbers are 9 digits after +255. They commonly start with '6' or '7'.
    { label: "Vodacom", code: "74" }, // Also 65, 66, 67, 75, 76, 79
    { label: "Airtel (formerly Zain)", code: "68" }, // Also 69, 78
    { label: "Tigo", code: "61" }, // Also 65, 71
    { label: "Zantel", code: "77" }, // Also 65
    { label: "TTCL Mobile", code: "6" }, // Uses 65, 73
    { label: "Halotel", code: "6" }, // Uses 60, 62
    { label: "Benson Informatics", code: "" }, // Not a major mobile operator.
    { label: "MyCell", code: "" }, // Not a major mobile operator.
    { label: "Excellentcom", code: "" }, // Not a major mobile operator.
    { label: "Egotel (Lacell)", code: "" }, // Not a major mobile operator.
    { label: "Smart", code: "" }, // Operations ceased.
    { label: "Smile Communications", code: "" } // Primarily fixed wireless/data.
  ],
  image: ""
};
// Note for Tanzania: Mobile numbers often start with 6 or 7. Many listed carriers are not major mobile players or are defunct.

const Thailand = {
  carrier: [
    // Thai mobile numbers are 9 digits after +66. They commonly start with '6', '8', or '9'.
    { label: "AIS", code: "8" }, // Also 6, 9
    { label: "TrueMove H", code: "8" }, // Also 6, 9
    { label: "dtac - Includes LINE Mobile", code: "8" }, // Also 6, 9
    { label: "NT Mobile (Formerly MY by CAT Telecom)", code: "8" }, // Uses 88, 9x
    { label: "NT Mobile (Formerly TOT Mobile)", code: "6" }, // Uses 63, 64, 8x
    { label: "Buzzme (MVNO TOT)", code: "6" }, // MVNO
    { label: "i-Kool (MVNO TOT)", code: "6" }, // MVNO
    { label: "Open (MVNO CAT)", code: "8" }, // MVNO
    { label: "Mojo (MVNO TOT)", code: "6" }, // MVNO
    { label: "168 (MVNO MY)", code: "8" }, // MVNO
    { label: "My World 3G (MVNO MY)", code: "8" }, // MVNO
    { label: "Penguin (MVNO MY)", code: "8" } // MVNO
  ],
  image: ""
};
// Note for Thailand: Mobile numbers commonly start with 6, 8, or 9. The `code` field will not distinguish carriers due to portability.
// MY and TOT merged to become NT Mobile.

const TimorLeste = {
  carrier: [
    // Timor-Leste mobile numbers are 7 digits after +670. They commonly start with '7'.
    { label: "Timor Telecom", code: "7" }, // Uses 77, 78
    { label: "Telkomcel", code: "7" }, // Uses 77
    { label: "Viettel (Telemor)", code: "7" } // Uses 77
  ],
  image: ""
};
// Note for Timor-Leste: All mobile numbers start with '7'. The next digit differentiates.

const Togo = {
  carrier: [
    // Togolese mobile numbers are 8 digits after +228. They commonly start with '9'.
    { label: "Togocel", code: "9" }, // Uses 90, 91, 92
    { label: "Moov Africa (formerly Moov)", code: "9" } // Uses 97, 98, 99
  ],
  image: ""
};
// Note for Togo: All mobile numbers start with '9'. The next digit differentiates.

const Tonga = {
  carrier: [
    // Tongan mobile numbers are 7 digits after +676. They commonly start with '7' or '8'.
    { label: "Digicel", code: "7" }, // Mobile numbers typically start with 7.
    { label: "TCC (Tonga Communications Corporation)", code: "8" } // Mobile numbers typically start with 8.
  ],
  image: ""
};
// Note for Tonga: Mobile numbers start with 7 or 8.

const TrinidadAndTobago = {
  carrier: [
    // Trinidad and Tobago is part of the NANP (+1) with Area Code 868.
    { label: "bmobile", code: "868" },
    { label: "Digicel", code: "868" }
  ],
  image: ""
};
// Note for Trinidad and Tobago: Uses NANP (+1) with Area Code 868. Carrier distinction is not by prefix within this code.

const Tunisia = {
  carrier: [
    // Tunisian mobile numbers are 8 digits after +216. They always start with '2', '4', '5', '7', or '9'.
    { label: "Ooredoo (formerly Tunisiana)", code: "2" }, // Also 5
    { label: "Tunisie Telecom", code: "9" }, // Also 2, 4
    { label: "Orange", code: "5" } // Also 2
  ],
  image: ""
};
// Note for Tunisia: Mobile numbers start with 2, 4, 5, or 9. The code provided is the starting digit after the country code.

const Turkey = {
  carrier: [
    // Turkish mobile numbers are 10 digits after +90. They always start with '5'.
    { label: "Turkcell", code: "532" }, // Also many others: 53x, 54x, 57x
    { label: "Vodafone (Formerly Telsim)", code: "542" }, // Also many others: 54x, 56x
    { label: "Türk Telekom (Formerly Avea, Aria, Aycell)", code: "555" } // Also many others: 50x, 55x
  ],
  image: ""
};
// Note for Turkey: All mobile numbers start with '5'. The following 2 digits help differentiate the original network.
// Due to portability, these are not strictly exclusive.

const Turkmenistan = {
  carrier: [
    // Turkmen mobile numbers are 8 digits after +993. They commonly start with '6'.
    { label: "TM CELL (Altyn Asyr)", code: "6" }, // Uses 6x
    { label: "MTS", code: "6" } // Uses 6x. MTS operations in Turkmenistan are intermittent or suspended.
  ],
  image: ""
};
// Note for Turkmenistan: Mobile numbers start with 6 or 7. MTS's presence is often disrupted.

const TurksAndCaicosIslands = {
  carrier: [
    // Turks and Caicos Islands are part of the NANP (+1) with Area Code 649.
    { label: "Digicel", code: "649" },
    { label: "FLOW (which acquired the assets of Islandcom Wireless)", code: "649" }
  ],
  image: ""
};
// Note for Turks and Caicos Islands: Uses NANP (+1) with Area Code 649. Carrier distinction is not by prefix within this code.

const Tuvalu = {
  carrier: [
    { label: "TTC (Tuvalu Telecommunications Corporation)", code: "9" } // Mobile numbers commonly start with 9.
  ],
  image: ""
};
// Note for Tuvalu: Mobile numbers are 5 digits after +688. TTC is the sole provider.

const Uganda = {
  carrier: [
    // Ugandan mobile numbers are 9 digits after +256. They commonly start with '7'.
    { label: "MTN", code: "77" }, // Also 78
    { label: "Airtel (includes Warid)", code: "70" }, // Also 75
    { label: "Africell", code: "79" },
  ],
  image: ""
};
// Note for Uganda: All mobile numbers start with '7'. The next digit differentiates. Many listed carriers are defunct or merged.

const Ukraine = {
  carrier: [
    // Ukrainian mobile numbers are 9 digits after +380. They always start with '3', '5', '6', '7', '9'.
    { label: "Kyivstar", code: "67" }, // Also 96, 97, 98
    { label: "Vodafone (Formerly MTS)", code: "50" }, // Also 66, 95, 99
    { label: "Lifecell (Formerly Life)", code: "63" }, // Also 93
    { label: "Intertelecom", code: "94" }, // CDMA operator.
    { label: "TriMob", code: "91" }, // 3G/UMTS operator.
    { label: "PEOPLEnet", code: "92" } // CDMA operator.
  ],
  image: ""
};
// Note for Ukraine: Mobile numbers start with various prefixes. The `code` represents the first 2 digits after the country code.

const UnitedArabEmirates = {
  carrier: [
    // UAE mobile numbers are 9 digits after +971. They commonly start with '5'.
    { label: "Etisalat", code: "50" }, // Also 52, 54, 56
    { label: "du", code: "50" } // Uses 50, 55, 58
  ],
  image: ""
};
// Note for United Arab Emirates: All mobile numbers start with '5'. The next digit or two helps differentiate, but portability exists.
const UnitedKingdom = {
  carrier: [
    // UK mobile numbers are 10 digits after +44 (excluding the leading '0' national prefix). They commonly start with '7'.
    { label: "EE - Includes the previous T-Mobile and Orange network.", code: "7" }, // Uses a wide range of 7x prefixes, e.g., 73xx, 74xx, 75xx, 77xx, 78xx, 79xx
    { label: "O2", code: "7" }, // Uses a wide range of 7x prefixes, e.g., 73xx, 74xx, 75xx, 77xx, 78xx, 79xx
    { label: "Vodafone", code: "7" }, // Uses a wide range of 7x prefixes, e.g., 73xx, 74xx, 75xx, 77xx, 78xx, 79xx
    { label: "3 (Three)", code: "7" } // Uses a wide range of 7x prefixes, e.g., 73xx, 74xx, 75xx, 77xx, 78xx, 79xx
  ],
  image: ""
};
// Note for United Kingdom: All mobile numbers start with '7' after the removal of the national '0'. Due to extensive number portability,
// the initial digits are no longer a reliable indicator of the carrier.

const UnitedStates = {
  carrier: [
    // US mobile numbers are 10 digits (Area Code + 7-digit number) after +1.
    // Carrier identification by prefix is highly complex and not reliably unique due to number portability.
    { label: "Verizon Wireless", code: "" }, // Prefixes vary widely by geographic area.
    { label: "AT&T Mobility - Includes Cricket Wireless", code: "" }, // Prefixes vary widely by geographic area.
    { label: "T-Mobile US - Includes MetroPCS", code: "" }, // Prefixes vary widely by geographic area.
    { label: "Sprint Corporation", code: "" }, // Sprint merged with T-Mobile. Prefixes vary widely by geographic area.
    { label: "U.S. Cellular", code: "" } // Prefixes vary widely by geographic area.
  ],
  image: ""
};
// Note for United States: Mobile numbers are part of the NANP (+1). Carrier identification is not by a simple prefix;
// number portability means any prefix can belong to any carrier.

const Uruguay = {
  carrier: [
    // Uruguayan mobile numbers are 8 digits after +598. They commonly start with '09'.
    { label: "Antel", code: "9" }, // Uses 91, 92, 93, 94, 95, 96, 97, 98, 99
    { label: "Movistar", code: "9" }, // Uses 91, 92, 93, 94, 95, 96, 97, 98, 99
    { label: "Claro", code: "9" } // Uses 91, 92, 93, 94, 95, 96, 97, 98, 99
  ],
  image: ""
};
// Note for Uruguay: All mobile numbers start with '9' (after the '0' national prefix). Due to number portability, the `code` field will not distinguish carriers.

const Uzbekistan = {
  carrier: [
    // Uzbek mobile numbers are 9 digits after +998. They commonly start with '9'.
    { label: "UCell (Formerly Coscom)", code: "93" }, // Also 94
    { label: "Beeline", code: "90" }, // Also 91
    { label: "UMS (Mobiuz)", code: "97" }, // Also 99
    { label: "Uzmobile", code: "99" }, // Also 95
    { label: "Perfectum", code: "98" } // CDMA operator.
  ],
  image: ""
};
// Note for Uzbekistan: All mobile numbers start with '9'. The next digit differentiates.

const Vanuatu = {
  carrier: [
    // Vanuatuan mobile numbers are 7 digits after +678. They commonly start with '7'.
    { label: "Telecom Vanuatu (TVL)", code: "7" }, // Uses 77, 71, 73
    { label: "Digicel", code: "7" }, // Uses 70, 75, 76, 77
    { label: "AIL", code: "" }, // AIL (Amalgamated Telecom Holdings) is a parent company. Not a direct mobile service.
    { label: "WanTok", code: "7" } // Uses 76.
  ],
  image: ""
};
// Note for Vanuatu: All mobile numbers start with '7'. The next digit differentiates. AIL is not a direct mobile carrier.

const Venezuela = {
  carrier: [
    // Venezuelan mobile numbers are 7 digits after +58. They commonly start with '4'.
    { label: "Movilnet", code: "416" }, // Also 426
    { label: "Movistar", code: "414" }, // Also 424
    { label: "Digitel GSM", code: "412" }
  ],
  image: ""
};
// Note for Venezuela: All mobile numbers start with '4'. The next 2 digits identify the original network.

const Vietnam = {
  carrier: [
    // Vietnamese mobile numbers are 9-10 digits after +84. They commonly start with '3', '5', '7', '8', '9'.
    // Note: Vietnam completed a re-numbering project in 2018, converting 11-digit numbers to 10-digit.
    { label: "Viettel Mobile", code: "9" }, // Uses 9x, 3x
    { label: "MobiFone", code: "9" }, // Uses 9x, 7x
    { label: "Vinaphone", code: "9" }, // Uses 9x, 8x
    { label: "Vietnamobile", code: "9" }, // Uses 9x, 5x
    { label: "Gmobile (formerly Beeline)", code: "9" }, // Uses 9x, 5x
    { label: "S-Fone", code: "" } // S-Fone ceased operations.
  ],
  image: ""
};
// Note for Vietnam: Prefixes have been consolidated. The `code` field will not uniquely distinguish carriers due to changes and portability.
// S-Fone is defunct.

const Yemen = {
  carrier: [
    // Yemeni mobile numbers are 8 digits after +967. They commonly start with '7'.
    { label: "Spacetel (MTN Yemen)", code: "70" },
    { label: "Sabafon", code: "71" },
    { label: "Yemen Mobile", code: "77" }, // CDMA operator.
    { label: "HiTS-UNITEL (Y)", code: "73" } // Also uses 77.
  ],
  image: ""
};
// Note for Yemen: All mobile numbers start with '7'. The next digit differentiates.

const Zambia = {
  carrier: [
    // Zambian mobile numbers are 9 digits after +260. They commonly start with '9'.
    { label: "MTN", code: "96" }, // Also 97
    { label: "Airtel", code: "97" }, // Also 98
    { label: "ZAMTEL", code: "95" } // Also 96, 97
  ],
  image: ""
};
// Note for Zambia: All mobile numbers start with '9'. The next digit differentiates, but there's overlap.

const Zimbabwe = {
  carrier: [
    // Zimbabwean mobile numbers are 9 digits after +263. They commonly start with '7'.
    { label: "Econet Wireless", code: "77" }, // Also 78
    { label: "Telecel", code: "73" },
    { label: "Net*One", code: "71" }
  ],
  image: ""
};
// Note for Zimbabwe: All mobile numbers start with '7'. The next digit differentiates.




export default {
  Afghanistan,
  Algeria,
  Albania,
  AmericanSamoa,
  Andorra,
  Angola,
  Anguilla,
  AntiguaAndBarbuda,
  Argentina,
  Armenia,
  Aruba,
  Australia,
  Austria,
  Azerbaijan,
  Bahamas,
  Bahrain,
  Bangladesh,
  Barbados,
  Belarus,
  Belgium,
  Belize,
  Benin,
  Bermuda,
  Bhutan,
  Bolivia,
  Bonaire,
  BosniaAndHerzegovina,
  Botswana,
  Brazil,
  BritishVirginIslands,
  Brunei,
  Bulgaria,
  BurkinaFaso,
  Burundi,
  CaboVerde,
  Cambodia,
  Cameroon,
  Canada,
  CaymanIslands,
  CentralAfricanRepublic,
  Chad,
  Chile,
  China,
  Colombia,
  Comoros,
  Congo,
  CookIslands,
  CostaRica,
  CoteDIvoire,
  Croatia,
  Cuba,
  Curacao,
  Cyprus,
  CzechRepublic,
  DemocraticRepublicOfTheCongo,
  Denmark,
  Djibouti,
  Dominica,
  DominicanRepublic,
  Ecuador,
  Egypt,
  ElSalvador,
  EquatorialGuinea,
  Eritrea,
  Estonia,
  Ethiopia,
  FalklandIslands,
  FaroeIslands,
  Fiji,
  Finland,
  France,
  FrenchPolynesia,
  Gabon,
  Gambia,
  Georgia,
  Germany,
  Ghana,
  Gibraltar,
  Greece,
  Greenland,
  Grenada,
  GuadeloupeMartiniqueFrenchGuiana,
  Guam,
  Guatemala,
  Guernsey,
  Guinea,
  GuineaBissau,
  Guyana,
  Haiti,
  Honduras,
  HongKong,
  Hungary,
  Iceland,
  India,
  Indonesia,
  Iran,
  Iraq,
  Ireland,
  IsleOfMan,
  Israel,
  Italy,
  Jamaica,
  Japan,
  Jersey,
  Jordan,
  Kazakhstan,
  Kenya,
  Kiribati,
  Kosovo,
  Kuwait,
  Kyrgyzstan,
  LaReunion,
  Laos,
  Latvia,
  Lebanon,
  Lesotho,
  Liberia,
  Libya,
  Liechtenstein,
  Lithuania,
  Luxembourg,
  Macau,
  Macedonia,
  Madagascar,
  Malawi,
  Malaysia,
  Maldives,
  Mali,
  Malta,
  MarshallIslands,
  Mauritania,
  Mauritius,
  Mexico,
  Micronesia,
  Moldova,
  Monaco,
  Mongolia,
  Montenegro,
  Montserrat,
  Morocco,
  Mozambique,
  Myanmar,
  Namibia,
  Nauru,
  Nepal,
  Netherlands,
  NewCaledonia,
  NewZealand,
  Nicaragua,
  Niger,
  Nigeria,
  Niue,
  NorfolkIsland,
  NorthKorea,
  NorthernMarianaIslands,
  Norway,
  Oman,
  Pakistan,
  Palau,
  Palestine,
  Panama,
  PapuaNewGuinea,
  Paraguay,
  Peru,
  Philippines,
  Poland,
  Portugal,
  PuertoRico_USVirginIslands,
  Qatar,
  Romania,
  Russia,
  Rwanda,
  SaintKittsAndNevis,
  SaintLucia,
  SaintVincentAndTheGrenadines,
  Samoa,
  SanMarino,
  SaoTomeAndPrincipe,
  SaudiArabia,
  Senegal,
  Serbia,
  Seychelles,
  SierraLeone,
  Singapore,
  Slovakia,
  Slovenia,
  SolomonIslands,
  Somalia,
  SouthAfrica,
  SouthKorea,
  SouthSudan,
  Spain,
  SriLanka,
  Sudan,
  Suriname,
  Eswatini,
  Sweden,
  Switzerland,
  Syria,
  Taiwan,
  Tajikistan,
  Tanzania,
  Thailand,
  TimorLeste,
  Togo,
  Tonga,
  TrinidadAndTobago,
  Tunisia,
  Turkey,
  Turkmenistan,
  TurksAndCaicosIslands,
  Tuvalu,
  Uganda,
  Ukraine,
  UnitedArabEmirates,
  UnitedKingdom,
  UnitedStates,
  Uruguay,
  Uzbekistan,
  Vanuatu,
  Venezuela,
  Vietnam,
  Yemen,
  Zambia,
  Zimbabwe,
  CuracaoRevised,
  HaitiRevised,
  ArubaRevised

}
