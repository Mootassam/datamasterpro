const states = {
    // Alabama
   USA:[ { label: "Birmingham, AL", value: "205" },
    { label: "Mobile, AL", value: "251" },
    { label: "Huntsville, AL", value: "256" },
    { label: "Montgomery, AL", value: "334" },
  
    // Alaska
    { label: "Alaska, AK", value: "907" },
  
    // Arizona
    { label: "Phoenix Suburbs, AZ", value: "480" },
    { label: "Tucson, AZ", value: "520" },
    { label: "Phoenix Metro, AZ", value: "602" },
    { label: "Phoenix West Valley, AZ", value: "623" },
    { label: "Northern Arizona, AZ", value: "928" },
  
    // Arkansas
    { label: "NW Arkansas, AR", value: "479" },
    { label: "Little Rock, AR", value: "501" },
    { label: "Eastern/Southern AR", value: "870" },
  
    // California
    { label: "Central Valley (Stockton/Modesto), CA", value: "209" },
    { label: "Los Angeles (Downtown), CA", value: "213" },
    { label: "Los Angeles (Westside/South Bay), CA", value: "310" },
    { label: "Los Angeles (Central), CA", value: "323" },
    { label: "San Jose/Silicon Valley, CA", value: "408" },
    { label: "San Francisco, CA", value: "415" },
    { label: "East Bay (Oakland/Berkeley), CA", value: "510" },
    { label: "Northern California (Redding/Chico), CA", value: "530" },
    { label: "Central Valley (Fresno), CA", value: "559" },
    { label: "Long Beach/SE LA County, CA", value: "562" },
    { label: "San Diego, CA", value: "619" },
    { label: "San Gabriel Valley, CA", value: "626" },
    { label: "Peninsula/Silicon Valley, CA", value: "650" },
    { label: "Bakersfield, CA", value: "661" },
    { label: "North Bay (Santa Rosa), CA", value: "707" },
    { label: "Orange County, CA", value: "714" },
    { label: "Desert Cities (Palm Springs), CA", value: "760" },
    { label: "Central Coast (Santa Barbara), CA", value: "805" },
    { label: "San Fernando Valley, CA", value: "818" },
    { label: "Central Coast (Monterey), CA", value: "831" },
    { label: "San Diego North, CA", value: "858" },
    { label: "Inland Empire, CA", value: "909" },
    { label: "Sacramento, CA", value: "916" },
    { label: "East Bay Suburbs, CA", value: "925" },
    { label: "Orange County South, CA", value: "949" },
    { label: "Riverside County, CA", value: "951" },
  
    // Colorado
    { label: "Denver Metro, CO", value: "303" },
    { label: "Southern Colorado, CO", value: "719" },
    { label: "Western Colorado, CO", value: "970" },
  
    // Connecticut
    { label: "Southwestern CT, CT", value: "203" },
    { label: "Northern/Eastern CT, CT", value: "860" },
  
    // Delaware
    { label: "Delaware, DE", value: "302" },
  
    // Florida
    { label: "Jacksonville, FL", value: "904" },
    { label: "Miami, FL", value: "305" },
    { label: "Orlando, FL", value: "407" },
    { label: "Tampa, FL", value: "813" },
    { label: "Tallahassee, FL", value: "850" },
    { label: "Broward County, FL", value: "954" },
    { label: "West Palm Beach, FL", value: "561" },
    { label: "Daytona Beach, FL", value: "386" },
    { label: "SW Florida, FL", value: "239" },
    { label: "Gainesville, FL", value: "352" },
    { label: "Brevard County, FL", value: "321" },
  
    // Georgia
    { label: "SW Georgia, GA", value: "229" },
    { label: "Atlanta Metro, GA", value: "404" },
    { label: "Central Georgia, GA", value: "478" },
    { label: "Atlanta Suburbs, GA", value: "678" },
    { label: "Northern Georgia, GA", value: "706" },
    { label: "Atlanta Outer Suburbs, GA", value: "770" },
    { label: "Savannah/Southeast GA, GA", value: "912" },
  
    // Hawaii
    { label: "Hawaii, HI", value: "808" },
  
    // Idaho
    { label: "Idaho, ID", value: "208" },
  
    // Illinois
    { label: "Central Illinois, IL", value: "217" },
    { label: "Chicago Suburbs, IL", value: "224" },
    { label: "Western Illinois, IL", value: "309" },
    { label: "Chicago (Downtown), IL", value: "312" },
    { label: "Southern Illinois, IL", value: "618" },
    { label: "Chicago Western Suburbs, IL", value: "630" },
    { label: "Chicago South Suburbs, IL", value: "708" },
    { label: "Chicago North/Northwest, IL", value: "773" },
    { label: "Northern Illinois, IL", value: "779" },
    { label: "Rockford/NW Illinois, IL", value: "815" },
    { label: "Chicago North Suburbs, IL", value: "847" },
  
    // Indiana
    { label: "NW Indiana, IN", value: "219" },
    { label: "NE Indiana, IN", value: "260" },
    { label: "Indianapolis, IN", value: "317" },
    { label: "Northern Indiana, IN", value: "574" },
    { label: "West Central Indiana, IN", value: "765" },
    { label: "Southern Indiana, IN", value: "812" },
  
    // Iowa
    { label: "Eastern Iowa, IA", value: "319" },
    { label: "Central Iowa, IA", value: "515" },
    { label: "Southern Iowa, IA", value: "641" },
    { label: "Western Iowa, IA", value: "712" },
  
    // Kansas
    { label: "South Central Kansas, KS", value: "316" },
    { label: "Western Kansas, KS", value: "620" },
    { label: "Northern Kansas, KS", value: "785" },
    { label: "Kansas City Metro, KS", value: "913" },
  
    // Kentucky
    { label: "Western Kentucky, KY", value: "270" },
    { label: "Louisville, KY", value: "502" },
    { label: "Eastern Kentucky, KY", value: "606" },
    { label: "Northern Kentucky, KY", value: "859" },
  
    // Louisiana
    { label: "Baton Rouge, LA", value: "225" },
    { label: "Northern Louisiana, LA", value: "318" },
    { label: "Southwest Louisiana, LA", value: "337" },
    { label: "New Orleans, LA", value: "504" },
    { label: "Southeast Louisiana, LA", value: "985" },
  
    // Maine
    { label: "Maine, ME", value: "207" },
  
    // Maryland
    { label: "Western Maryland, MD", value: "240" },
    { label: "Eastern Maryland, MD", value: "410" },
  
    // Massachusetts
    { label: "Eastern Massachusetts, MA", value: "339" },
    { label: "Northeast Massachusetts, MA", value: "351" },
    { label: "Western Massachusetts, MA", value: "413" },
    { label: "Southeast Massachusetts, MA", value: "508" },
    { label: "Boston, MA", value: "617" },
    { label: "Central Massachusetts, MA", value: "774" },
    { label: "Boston Suburbs, MA", value: "781" },
    { label: "Northeast Massachusetts, MA", value: "978" },
  
    // Michigan
    { label: "NW Michigan, MI", value: "231" },
    { label: "Detroit Suburbs, MI", value: "248" },
    { label: "SW Michigan, MI", value: "269" },
    { label: "Detroit, MI", value: "313" },
    { label: "Central Michigan, MI", value: "517" },
    { label: "Macomb County, MI", value: "586" },
    { label: "Western Michigan, MI", value: "616" },
    { label: "SE Michigan, MI", value: "734" },
    { label: "Eastern Michigan, MI", value: "810" },
    { label: "Upper Peninsula, MI", value: "906" },
    { label: "Central/Northern Michigan, MI", value: "989" },
  
    // Minnesota
    { label: "Northern Minnesota, MN", value: "218" },
    { label: "Central Minnesota, MN", value: "320" },
    { label: "Southern Minnesota, MN", value: "507" },
    { label: "Minneapolis, MN", value: "612" },
    { label: "St. Paul Metro, MN", value: "651" },
    { label: "Minneapolis Suburbs, MN", value: "763" },
    { label: "SW Minneapolis Suburbs, MN", value: "952" },
  
    // Mississippi
    { label: "Gulf Coast, MS", value: "228" },
    { label: "Central Mississippi, MS", value: "601" },
    { label: "Northern Mississippi, MS", value: "662" },
  
    // Missouri
    { label: "St. Louis, MO", value: "314" },
    { label: "SW Missouri, MO", value: "417" },
    { label: "SE Missouri, MO", value: "573" },
    { label: "St. Louis Suburbs, MO", value: "636" },
    { label: "Northern Missouri, MO", value: "660" },
    { label: "Kansas City, MO", value: "816" },
  
    // Montana
    { label: "Montana, MT", value: "406" },
  
    // Nebraska
    { label: "Western Nebraska, NE", value: "308" },
    { label: "Eastern Nebraska, NE", value: "402" },
  
    // Nevada
    { label: "Las Vegas, NV", value: "702" },
    { label: "Northern Nevada, NV", value: "775" },
  
    // New Hampshire
    { label: "New Hampshire, NH", value: "603" },
  
    // New Jersey
    { label: "Northern New Jersey, NJ", value: "201" },
    { label: "Southern New Jersey, NJ", value: "609" },
    { label: "Central New Jersey, NJ", value: "732" },
    { label: "SW New Jersey, NJ", value: "856" },
    { label: "Northern New Jersey, NJ", value: "973" },
  
    // New Mexico
    { label: "New Mexico, NM", value: "505" },
  
    // New York
    { label: "Manhattan, NY", value: "212" },
    { label: "Northern New York, NY", value: "315" },
    { label: "Long Island, NY", value: "516" },
    { label: "NE New York, NY", value: "518" },
    { label: "Western New York, NY", value: "585" },
    { label: "Southern Tier, NY", value: "607" },
    { label: "Buffalo, NY", value: "716" },
    { label: "New York City, NY", value: "718" },
    { label: "Hudson Valley, NY", value: "845" },
    { label: "Westchester County, NY", value: "914" },
    { label: "New York City, NY", value: "917" },
  
    // North Carolina
    { label: "Eastern North Carolina, NC", value: "252" },
    { label: "Greensboro/Winston-Salem, NC", value: "336" },
    { label: "Charlotte Metro, NC", value: "704" },
    { label: "Western North Carolina, NC", value: "828" },
    { label: "SE North Carolina, NC", value: "910" },
    { label: "Raleigh/Durham, NC", value: "919" },
  
    // North Dakota
    { label: "North Dakota, ND", value: "701" },
  
    // Ohio
    { label: "Cleveland, OH", value: "216" },
    { label: "Cincinnati, OH", value: "513" },
    { label: "Columbus, OH", value: "614" },
    { label: "Dayton, OH", value: "937" },
    { label: "Toledo, OH", value: "419" },
    { label: "Akron/Canton, OH", value: "330" },
  
    // Oklahoma
    { label: "Oklahoma City, OK", value: "405" },
    { label: "Western Oklahoma, OK", value: "580" },
    { label: "Tulsa, OK", value: "918" },
  
    // Oregon
    { label: "NW Oregon, OR", value: "503" },
    { label: "Eastern Oregon, OR", value: "541" },
  
    // Pennsylvania
    { label: "Philadelphia, PA", value: "215" },
    { label: "NE Pennsylvania, PA", value: "272" },
    { label: "Pittsburgh, PA", value: "412" },
    { label: "Eastern Pennsylvania, PA", value: "484" },
    { label: "SE Pennsylvania, PA", value: "610" },
    { label: "Central Pennsylvania, PA", value: "717" },
    { label: "Western Pennsylvania, PA", value: "724" },
    { label: "NW Pennsylvania, PA", value: "814" },
  
    // Rhode Island
    { label: "Rhode Island, RI", value: "401" },
  
    // South Carolina
    { label: "Central South Carolina, SC", value: "803" },
    { label: "Coastal South Carolina, SC", value: "843" },
    { label: "Upstate South Carolina, SC", value: "864" },
  
    // South Dakota
    { label: "South Dakota, SD", value: "605" },
  
    // Tennessee
    { label: "Eastern Tennessee, TN", value: "423" },
    { label: "Nashville, TN", value: "615" },
    { label: "Western Tennessee, TN", value: "731" },
    { label: "Knoxville, TN", value: "865" },
    { label: "Memphis, TN", value: "901" },
    { label: "Middle Tennessee, TN", value: "931" },
  
    // Texas
    { label: "San Antonio, TX", value: "210" },
    { label: "Dallas, TX", value: "214" },
    { label: "Central Texas, TX", value: "254" },
    { label: "Houston Suburbs, TX", value: "281" },
    { label: "West Texas, TX", value: "325" },
    { label: "Corpus Christi, TX", value: "361" },
    { label: "SE Texas, TX", value: "409" },
    { label: "North Texas, TX", value: "430" },
    { label: "West Texas, TX", value: "432" },
    { label: "Austin, TX", value: "512" },
    { label: "Houston, TX", value: "713" },
    { label: "Panhandle, TX", value: "806" },
    { label: "Fort Worth, TX", value: "817" },
    { label: "Southern Texas, TX", value: "830" },
    { label: "NE Texas, TX", value: "903" },
    { label: "El Paso, TX", value: "915" },
    { label: "East Texas, TX", value: "936" },
    { label: "North Central Texas, TX", value: "940" },
    { label: "South Texas, TX", value: "956" },
    { label: "SE Texas, TX", value: "979" },
  
    // Utah
    { label: "SE Utah, UT", value: "435" },
    { label: "Salt Lake City, UT", value: "801" },
  
    // Vermont
    { label: "Vermont, VT", value: "802" },
  
    // Virginia
    { label: "SW Virginia, VA", value: "276" },
    { label: "Southern Virginia, VA", value: "434" },
    { label: "Western Virginia, VA", value: "540" },
    { label: "Northern Virginia, VA", value: "703" },
    { label: "Hampton Roads, VA", value: "757" },
    { label: "Richmond, VA", value: "804" },
  
    // Washington
    { label: "Seattle, WA", value: "206" },
    { label: "Tacoma, WA", value: "253" },
    { label: "Western Washington, WA", value: "360" },
    { label: "Seattle Eastside, WA", value: "425" },
    { label: "Eastern Washington, WA", value: "509" },
  
    // West Virginia
    { label: "West Virginia, WV", value: "304" },
  
    // Wisconsin
    { label: "SE Wisconsin, WI", value: "262" },
    { label: "Milwaukee, WI", value: "414" },
    { label: "Southern Wisconsin, WI", value: "608" },
    { label: "Northern Wisconsin, WI", value: "715" },
    { label: "NE Wisconsin, WI", value: "920" },
  
    // Wyoming
    { label: "Wyoming, WY", value: "307" },
  
    // US Territories
    { label: "American Samoa, AS", value: "684" },
    { label: "Guam, GU", value: "671" },
    { label: "Northern Mariana Islands, MP", value: "670" },
    { label: "Puerto Rico, PR", value: "787" },
    { label: "US Virgin Islands, VI", value: "340" }
    ], 
    canada: [
    // Alberta
    { label: "Calgary, AB", value: "403" },
    { label: "Edmonton, AB", value: "780" },
    { label: "Northern Alberta, AB", value: "587" },
    
    // British Columbia
    { label: "Vancouver, BC", value: "604" },
    { label: "Victoria, BC", value: "250" },
    { label: "Kelowna, BC", value: "250" },
    { label: "Northern BC, BC", value: "778" },
    
    // Manitoba
    { label: "Winnipeg, MB", value: "204" },
    
    // New Brunswick
    { label: "Fredericton, NB", value: "506" },
    { label: "Moncton, NB", value: "506" },
    
    // Newfoundland and Labrador
    { label: "St. John's, NL", value: "709" },
    
    // Northwest Territories
    { label: "Yellowknife, NT", value: "867" },
    
    // Nova Scotia
    { label: "Halifax, NS", value: "902" },
    
    // Nunavut
    { label: "Iqaluit, NU", value: "867" },
    
    // Ontario (major cities separated)
    { label: "Toronto, ON", value: "416" },
    { label: "Ottawa, ON", value: "613" },
    { label: "Mississauga, ON", value: "905" },
    { label: "Hamilton, ON", value: "905" },
    { label: "London, ON", value: "519" },
    { label: "Northern Ontario, ON", value: "705" },
    
    // Prince Edward Island
    { label: "Charlottetown, PE", value: "902" },
    
    // Quebec (with Montreal specifically called out)
    { label: "Montreal, QC", value: "514" },
    { label: "Quebec City, QC", value: "418" },
    { label: "Laval, QC", value: "450" },
    { label: "Gatineau, QC", value: "819" },
    
    // Saskatchewan
    { label: "Regina, SK", value: "306" },
    { label: "Saskatoon, SK", value: "306" },
    
    // Yukon
    { label: "Whitehorse, YT", value: "867" }
  ]
};
  
  export default states;