import {
  FaDownload,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaDatabase,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaFilter,
  FaCloudUploadAlt,
  FaFile
} from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import Select from "react-select";
import Images from "../utils/Images";
import { useState } from "react";
import "./styles/sidebar.css";

const GenerateProps = ({
  file,
  handleFileChange,
  fileError,
  handleUpload,
  uploadLoading,
  country,
  countryOptions,
  state,
  stateOptions,
  matchCount,
  handleGenerate,
  generateLoading,
  loadingCheck,
  numbers,
  totalNumbers,
  handleDownload,
  registeredNumbers,
  rejectedNumbers,
  setCountry,
  setCarrier,
  carrier,
  setState,
  setMatchCount,
  setModalState,
  activeService,
  setGender,
  gender
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("generate"); // ['generate', 'stats', 'osint']

  const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];
  const OSINT_TYPES = [
    {
      id: "username",
      label: "Username",
      icon: <FaUser className="text-indigo-500" />,
      methods: ["Basic", "Advanced"],
      color: "indigo"
    },
    {
      id: "email",
      label: "Email",
      icon: <FaEnvelope className="text-blue-500" />,
      methods: ["Quick Check", "Full Scan"],
      color: "blue"
    },
    {
      id: "phone",
      label: "Phone Number",
      icon: <FaPhone className="text-green-500" />,
      methods: ["Carrier Lookup", "Deep Search"],
      color: "green"
    },
    {
      id: "domain",
      label: "Domain/IP",
      icon: <FaGlobe className="text-purple-500" />,
      methods: ["Whois Lookup"],
      color: "purple"
    },
  ];

  const [activeOSINTType, setActiveOSINTType] = useState("username");
  const [activeMethod, setActiveMethod] = useState(0);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  return (
    <div className="sidebar-container">
      {/* Header with Tabs */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          {activeService !== "osint" ? "Data Tools" : "OSINT Toolkit"}
        </h2>
        {activeService !== "osint" && (
          <div className="sidebar-tabs">
            <button
              className={`tab-btn ${activeTab === "generate" ? "active" : ""}`}
              onClick={() => setActiveTab("generate")}
            >
              <FaDatabase className="mr-1" /> Generate
            </button>
            <button
              className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              <FaFile className="mr-1" /> Upload
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-content">
        {activeService !== "osint" ? (
          <>
            {/* Upload Section - Always visible */}
        

            {/* Conditional Content based on Active Tab */}
            {activeTab === "generate" && (
              <> 
              <div className="generation-card">
                <div className="card-header">
                  <FaFilter className="text-purple-500" />
                  <h3>Generation Parameters</h3>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Country</label>
                    <Select
                      value={country}
                                  key={`country-select-${country?.value}`}
                      onChange={(selected) => {
                        if (selected) {
                          setCountry(selected);
                          const carriers = Images[selected.label]?.carrier || [];
                          if (carriers.length > 0) {
                            setCarrier({
                              label: carriers[0].label,
                              value: carriers[0].code || carriers[0].label,
                            });
                          } else {
                            setCarrier(null);
                          }
                        }
                      }}
                      options={countryOptions}
                      isSearchable
                      className="react-select"
                      classNamePrefix="select"
                      placeholder="Select country..."
                     
                    />
                  </div>
                  {activeService === "email" && (  <div className="form-group">
    <label>Gender</label>
         <Select
                          key="gender-select"
                          value={gender}
                          onChange={(selected) => selected && setGender(selected)}
                          options={genderOptions}  // Use stable reference
                          isSearchable
                          className="react-select"
                          classNamePrefix="select"
                          isDisabled={!country}
                        />
  </div>)}

                  {activeService !== "email" && !["UnitedStates", "Canada"].includes(country?.label) &&  (
                    <div className="form-group">
                      <label>Carrier</label>
               
                      <Select
                        value={carrier}
                                key={`carrier-select-${country?.value}-${carrier?.value}`}
                        onChange={(selected) => selected && setCarrier(selected)}
                        options={Images[country?.label]?.carrier?.map(
                          ({ label, code }) => ({
                            label,
                            value: code || label,
                          })
                        )}
                        isSearchable
                        className="react-select"
                        classNamePrefix="select"
                        placeholder="Select carrier..."
                        isDisabled={!country}
                      />
                    </div>
                  )}

         
{["US", "CA"].includes(country?.value) && activeService !== "email" && (
  <div className="form-group">
    <label>State</label>
    <Select
      value={state}
                                key={`state-select-${country?.value}-${state?.value}`}

      onChange={(selected) => selected && setState(selected)}
      options={stateOptions}
      isSearchable
      className="react-select"
      classNamePrefix="select"
      placeholder={`Select ${country?.value === "US" ? "state" : "province"}...`}
      isDisabled={!country}
    />
  </div>
)}

                  <div className="form-group">
                    <label>Number Count</label>
                    <div className="number-input-wrapper">
                      <input
  type="number"
  min={1}

  value={matchCount}
  onChange={(e) => {
    const value = Math.min(Number(e.target.value)); // Prevent > 1000
    setMatchCount(value);
  }}
  placeholder="Enter count..."
/>

                      <span className="input-suffix">numbers</span>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className={`generate-btn ${generateLoading ? "loading" : ""}`}
                    onClick={handleGenerate}
                    disabled={generateLoading || !country}
                  >
                    {generateLoading ? (
                      <>
                        <FiLoader className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Data"
                    )}
                  </button>
                  <button
                    className="verify-btn"
                    onClick={() => setModalState("setup")}
                    disabled={loadingCheck || numbers.length === 0}
                  >
                    Verify Results
                  </button>
                </div>
              </div>
                   <div className="stats-card">
                <div className="stats-grid">
                  <div className="stat-item total">
                    <div className="stat-value">{totalNumbers.length}</div>
                    <div className="stat-label">Total</div>
                    <button
                      className="stat-action"
                      onClick={() => handleDownload(totalNumbers, "total")}
                      disabled={totalNumbers.length === 0}
                    >
                      <FaDownload />
                    </button>
                  </div>
                  <div className="stat-item registered">
                    <div className="stat-value">{registeredNumbers.length}</div>
                    <div className="stat-label">Registered</div>
                    <button
                      className="stat-action"
                      onClick={() => handleDownload(registeredNumbers, "registered")}
                      disabled={registeredNumbers.length === 0}
                    >
                      <FaDownload />
                    </button>
                  </div>
                  <div className="stat-item rejected">
                    <div className="stat-value">{rejectedNumbers.length}</div>
                    <div className="stat-label">Rejected</div>
                    <button
                      className="stat-action"
                      onClick={() => handleDownload(rejectedNumbers, "rejected")}
                      disabled={rejectedNumbers.length === 0}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              </div>
              </>
            )}

            {activeTab === "stats" && (
              <>
                  <div className="upload-card">
              <div className="card-header">
                <FaCloudUploadAlt className="text-blue-500" />
                <h3>Upload Your Data</h3>
              </div>
              <div
                className={`upload-area ${isDragging ? "dragging" : ""} ${
                  file ? "has-file" : ""
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label className="upload-label">
                  {file ? (
                    <div className="file-preview">
                      <FaCheckCircle className="text-green-500" />
                      <span className="file-name">{file.name}</span>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="upload-icon" />
                      <p className="upload-text">Drag & drop your file here</p>
                      <p className="upload-hint">or click to browse</p>
                    </>
                  )}
                  <input
                    type="file"
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".csv"
                  />
                </label>
                {fileError && (
                  <div className="upload-error">
                    <FaTimesCircle />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
              {file && (
                <div className="upload-actions">
                <button
                  className={`upload-button ${uploadLoading ? "loading" : ""}`}
                  onClick={handleUpload}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </button>

                        <button
                    className="verify-btn"
                    onClick={() => setModalState("setup")}
                    disabled={loadingCheck || numbers.length === 0}
                  >
                    Verify Results
                  </button>
                </div>
              )}
            </div>



              
         
              <div className="stats-card">
                <div className="stats-grid">
                  <div className="stat-item total">
                    <div className="stat-value">{totalNumbers.length}</div>
                    <div className="stat-label">Total</div>
                    <button
                      className="stat-action"
                      onClick={() => handleDownload(totalNumbers, "total")}
                      disabled={totalNumbers.length === 0}
                    >
                      <FaDownload />
                    </button>
                  </div>
                  <div className="stat-item registered">
                    <div className="stat-value">{registeredNumbers.length}</div>
                    <div className="stat-label">Registered</div>
                    <button
                      className="stat-action"
                      onClick={() => handleDownload(registeredNumbers, "registered")}
                      disabled={registeredNumbers.length === 0}
                    >
                      <FaDownload />
                    </button>
                  </div>
                  <div className="stat-item rejected">
                    <div className="stat-value">{rejectedNumbers.length}</div>
                    <div className="stat-label">Rejected</div>
                    <button
                      className="stat-action"
                      onClick={() => handleDownload(rejectedNumbers, "rejected")}
                      disabled={rejectedNumbers.length === 0}
                    >
                      <FaDownload />
                    </button>
                  </div>
                </div>
              </div>
                   </>
            )}
          </>
        ) : (
          <div className="osint-card">
            <div className="osint-header">
              <h2>Intelligence Search</h2>
              <p>Find comprehensive data with our OSINT tools</p>
            </div>

            <div className="osint-types">
              {OSINT_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`osint-type ${activeOSINTType === type.id ? "active" : ""}`}
                  data-color={type.color}
                  onClick={() => {
                    setActiveOSINTType(type.id);
                    setActiveMethod(0);
                  }}
                >
                  <div className="osint-icon">{type.icon}</div>
                  <div className="osint-label">{type.label}</div>
                </button>
              ))}
            </div>

            <div className="osint-methods">
              {OSINT_TYPES.find((t) => t.id === activeOSINTType)?.methods.map(
                (method, index) => (
                  <button
                    key={method}
                    className={`method-btn ${activeMethod === index ? "active" : ""}`}
                    onClick={() => setActiveMethod(index)}
                  >
                    {method}
                  </button>
                )
              )}
            </div>

            <div className="osint-search">
              <input
                type="text"
                placeholder={`Enter ${activeOSINTType} to search...`}
                className="search-input"
              />
              <button className="search-btn">Search</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateProps;