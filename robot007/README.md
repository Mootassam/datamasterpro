# DataMasterPro - Phone Number Generator

## Overview

This application provides functionality to generate phone numbers for various countries based on their specific formats. It supports two main approaches for phone number generation:

1. **State/Province-based generation** (for countries like USA and Canada)
2. **Carrier-based generation** (for most other countries)

## Features

- Generate phone numbers for 200+ countries
- Support for state/province selection for USA and Canada
- Support for carrier selection for other countries
- Proper formatting of phone numbers according to country standards
- Download generated numbers as CSV
- Copy generated numbers to clipboard

## Implementation Details

### Key Files

- **CountryFormat.ts**: Contains functions to generate formatted phone numbers for different countries
- **Number.tsx**: Implements the phone number generation logic
- **Countries.tsx**: List of countries with their codes and labels
- **states.tsx**: List of US states with area codes
- **canadaStates.tsx**: List of Canadian provinces with area codes
- **CountryCarrierMap.tsx**: Maps countries to their carriers
- **CountryStateMap.tsx**: Maps countries to their states/provinces
- **GenerateProps.tsx**: Defines interfaces for the phone number generator
- **PhoneNumberGenerator.tsx**: React component for the phone number generator UI

### How It Works

1. User selects a country from the dropdown
2. Based on the country selection:
   - For USA and Canada: A list of states/provinces is displayed
   - For other countries: A list of carriers is displayed
3. User selects a state/province or carrier
4. User specifies the number of phone numbers to generate
5. The system generates phone numbers according to the country's format and the selected state/province or carrier

## Usage

1. Select a country from the dropdown
2. Select a state/province or carrier based on the country
3. Enter the number of phone numbers to generate (1-1000)
4. Click "Generate Phone Numbers"
5. View, copy, or download the generated numbers

## Technical Implementation

The application uses a modular approach to handle different country formats:

- For USA: Format is +1 (area code) XXX-XXXX
- For Canada: Format is +1 (area code) XXX-XXXX
- For other countries: Format varies based on country-specific rules

The phone number generation logic ensures that the generated numbers follow the correct format for each country, including proper area codes, carrier prefixes, and number lengths.