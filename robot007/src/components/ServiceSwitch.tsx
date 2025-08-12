import { FaWhatsapp, FaTelegram, FaEnvelope, FaMars, FaVenus, FaTransgender } from "react-icons/fa";
import Select from 'react-select';

const ServiceSwitch = ({ activeService, setActiveService, gender, setGender }) => {
  // Options for service selection
  const serviceOptions = [
    { 
      value: 'whatsapp', 
      label: (
        <div className="service-option">
          <FaWhatsapp className="service-icon" />
          <span>WhatsApp</span>
        </div>
      )
    },
    { 
      value: 'telegram', 
      label: (
        <div className="service-option">
          <FaTelegram className="service-icon" />
          <span>Telegram</span>
        </div>
      )
    },
    { 
      value: 'email', 
      label: (
        <div className="service-option">
          <FaEnvelope className="service-icon" />
          <span>Email</span>
        </div>
      )
    }
  ];

  // Options for gender selection
  const genderOptions = [
    { 
      value: 'male', 
      label: (
        <div className="gender-option">
          <FaMars className="gender-icon" />
          <span>Male</span>
        </div>
      )
    },
    { 
      value: 'female', 
      label: (
        <div className="gender-option">
          <FaVenus className="gender-icon" />
          <span>Female</span>
        </div>
      )
    },
    { 
      value: 'other', 
      label: (
        <div className="gender-option">
          <FaTransgender className="gender-icon" />
          <span>Other</span>
        </div>
      )
    }
  ];

  // Custom styles for react-select
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      backgroundColor: state.isSelected ? '#f0f0f0' : 'white',
      color: 'black',
      '&:hover': {
        backgroundColor: '#f5f5f5'
      }
    }),
    control: (provided) => ({
      ...provided,
      minHeight: '44px',
      border: '1px solid #ddd',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#bbb'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center'
    })
  };

  return (
    <div className="service-switcher">
      <div className="service-selector">
        <label htmlFor="service-select">Select Service</label>
        <Select
          id="service-select"
          options={serviceOptions}
          value={serviceOptions.find(option => option.value === activeService)}
          onChange={(selectedOption) => setActiveService(selectedOption!.value)}
          styles={customStyles}
          isSearchable={true}
          placeholder="Search services..."
          components={{
            IndicatorSeparator: () => null
          }}
          formatOptionLabel={option => option.label}
        />
      </div>

      {/* Gender Selection (only shown for email) */}
      {activeService === 'email' && (
        <div className="gender-selection">
          <label htmlFor="gender-select">Select Gender</label>
          <Select
            id="gender-select"
            options={genderOptions}
            value={genderOptions.find(option => option.value === gender)}
            onChange={(selectedOption) => setGender(selectedOption!.value)}
            styles={customStyles}
            isSearchable={false}
            placeholder="Select gender..."
            components={{
              IndicatorSeparator: () => null
            }}
            formatOptionLabel={option => option.label}
          />
        </div>
      )}
    </div>
  );
};

export default ServiceSwitch;