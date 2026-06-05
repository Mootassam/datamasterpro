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
  FaFile,
  FaClone
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
  gender,
  emailType,
  setEmailType,
  emailProvider,
  setEmailProvider,
  onCustomGenerate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("generate"); // ['generate', 'stats', 'custom', 'osint']

  // ── Custom pattern generator state ──
  const [customLength, setCustomLength] = useState<number>(10);
  const [customPrefix, setCustomPrefix] = useState<string>("");
  const [customCount, setCustomCount] = useState<number>(10);
  const [customError, setCustomError] = useState<string>("");

  // ── Duplicate checker state ──
  const [dupFileName, setDupFileName] = useState<string>("");
  const [dupTotal, setDupTotal] = useState<number>(0);
  const [dupUnique, setDupUnique] = useState<string[]>([]);       // deduplicated list (each value once)
  const [dupDuplicates, setDupDuplicates] = useState<string[]>([]); // distinct values that appeared 2+ times
  const [dupBusy, setDupBusy] = useState<boolean>(false);
  const [dupError, setDupError] = useState<string>("");
  const [dupDragging, setDupDragging] = useState<boolean>(false);

  // Generic plain-text downloader (one item per line)
  const downloadList = (items: string[], name: string) => {
    if (!items || items.length === 0) return;
    const blob = new Blob([items.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.href = url;
    link.download = `${name}_${items.length}_${stamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const analyzeDuplicates = (text: string, fileName: string) => {
    setDupError("");
    // Split on newlines / commas / semicolons / whitespace, keep digit-bearing entries
    const lines = text
      .split(/[\r\n,;]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setDupError("The file is empty or has no readable entries.");
      setDupTotal(0); setDupUnique([]); setDupDuplicates([]); setDupFileName("");
      return;
    }

    const counts = new Map<string, number>();
    for (const item of lines) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    const uniqueList = Array.from(counts.keys());                       // each value once
    const duplicateList = uniqueList.filter((k) => (counts.get(k) || 0) > 1);

    setDupFileName(fileName);
    setDupTotal(lines.length);
    setDupUnique(uniqueList);
    setDupDuplicates(duplicateList);
  };

  const handleDupFileSelected = (selected: File | null | undefined) => {
    if (!selected) return;
    const okType = /\.(txt|csv)$/i.test(selected.name);
    if (!okType) {
      setDupError("Please upload a .txt or .csv file.");
      return;
    }
    setDupBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        analyzeDuplicates(String(reader.result || ""), selected.name);
      } catch {
        setDupError("Could not read the file. Please try again.");
      } finally {
        setDupBusy(false);
      }
    };
    reader.onerror = () => { setDupError("Could not read the file."); setDupBusy(false); };
    reader.readAsText(selected);
  };

  const resetDupChecker = () => {
    setDupFileName(""); setDupTotal(0); setDupUnique([]); setDupDuplicates([]); setDupError("");
  };

  const handleCustomGenerate = () => {
    setCustomError("");
    const prefix = String(customPrefix).replace(/\D/g, ""); // keep digits only
    const length = Number(customLength);
    const count = Math.max(1, Number(customCount) || 1);

    if (!length || length < 1) {
      setCustomError("Enter a valid number length.");
      return;
    }
    if (prefix.length > length) {
      setCustomError(`Starting digits (${prefix.length}) are longer than the total length (${length}).`);
      return;
    }

    const remaining = length - prefix.length;

    // Maximum distinct numbers possible for this prefix+length (10^remaining)
    const maxPossible = Math.pow(10, remaining);
    if (count > maxPossible) {
      setCustomError(`Only ${maxPossible.toLocaleString()} unique numbers are possible for this prefix and length.`);
      return;
    }

    // Use a Set so no number is ever duplicated
    const unique = new Set<string>();
    const maxAttempts = Math.max(count * 50, 1000);
    let attempts = 0;
    while (unique.size < count && attempts < maxAttempts) {
      attempts++;
      let rest = "";
      for (let d = 0; d < remaining; d++) {
        rest += Math.floor(Math.random() * 10).toString();
      }
      unique.add(prefix + rest);
    }

    if (onCustomGenerate) onCustomGenerate(Array.from(unique));
  };

  const typeOptions = [
    { value: 'person', label: 'Personal' },
    { value: 'business', label: 'Business' },
  ];

  const providerOptions = [
    { value: 'gmail.com', label: 'Gmail' },
    { value: 'yahoo.com', label: 'Yahoo' },
    { value: 'outlook.com', label: 'Outlook' },
    { value: 'hotmail.com', label: 'Hotmail' },
  ];

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

  // Download every generated number/email — one per line, plain .txt, nothing else.
  const downloadAllAsTxt = () => {
    const items = (numbers || []).map((n) => String(n).trim()).filter(Boolean);
    if (items.length === 0) return;
    const blob = new Blob([items.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const kind = activeService === "email" ? "emails" : "numbers";
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.href = url;
    link.download = `${kind}_${items.length}_${stamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <button
              className={`tab-btn ${activeTab === "custom" ? "active" : ""}`}
              onClick={() => setActiveTab("custom")}
            >
              <FaPhone className="mr-1" /> Custom
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
                  {activeService === "email" && (
                    <>
                      <div className="form-group">
                        <label>Type</label>
                        <Select
                          key="type-select"
                          value={emailType}
                          onChange={(selected) => selected && setEmailType(selected)}
                          options={typeOptions}
                          isSearchable
                          className="react-select"
                          classNamePrefix="select"
                        />
                      </div>

                      {emailType?.value === 'person' && (
                        <>
                          <div className="form-group">
                            <label>Gender</label>
                            <Select
                              key="gender-select"
                              value={gender}
                              onChange={(selected) => selected && setGender(selected)}
                              options={genderOptions}
                              isSearchable
                              className="react-select"
                              classNamePrefix="select"
                              isDisabled={!country}
                            />
                          </div>
                          <div className="form-group">
                            <label>Provider</label>
                            <Select
                              key="provider-select"
                              value={emailProvider}
                              onChange={(selected) => selected && setEmailProvider(selected)}
                              options={providerOptions}
                              isSearchable
                              className="react-select"
                              classNamePrefix="select"
                            />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {activeService !== "email" && !["UnitedStates", "Canada"].includes(country?.label) && (
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
                  <button
                    className="download-all-btn"
                    onClick={downloadAllAsTxt}
                    disabled={numbers.length === 0}
                    title="Download all generated data as a plain .txt file"
                  >
                    <FaDownload />
                    Download All ({numbers.length}) .txt
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
                {/* ── Duplicate Checker ── */}
                <div className="dup-card">
                  <div className="card-header">
                    <FaClone className="text-purple-500" />
                    <h3>Duplicate Checker</h3>
                  </div>
                  <p className="dup-hint">
                    Upload a <strong>.txt</strong> or <strong>.csv</strong> list of numbers.
                    We'll find duplicates and let you download a clean (unique) list
                    or just the duplicated ones.
                  </p>

                  <label
                    className={`dup-dropzone ${dupDragging ? "dragging" : ""} ${dupFileName ? "has-file" : ""}`}
                    onDragEnter={(e) => { e.preventDefault(); setDupDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setDupDragging(false); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDupDragging(false);
                      handleDupFileSelected(e.dataTransfer.files?.[0]);
                    }}
                  >
                    {dupBusy ? (
                      <div className="dup-drop-inner">
                        <FiLoader className="animate-spin" />
                        <span>Analyzing…</span>
                      </div>
                    ) : dupFileName ? (
                      <div className="dup-drop-inner">
                        <FaCheckCircle className="text-green-500" />
                        <span className="dup-file-name">{dupFileName}</span>
                        <span className="dup-relink">Click to choose another file</span>
                      </div>
                    ) : (
                      <div className="dup-drop-inner">
                        <FaUpload className="dup-up-icon" />
                        <span>Drag & drop, or click to browse</span>
                        <span className="dup-sub">.txt or .csv — one number per line</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept=".txt,.csv"
                      className="file-input"
                      onChange={(e) => handleDupFileSelected(e.target.files?.[0])}
                    />
                  </label>

                  {dupError && (
                    <div className="upload-error">
                      <FaTimesCircle />
                      <span>{dupError}</span>
                    </div>
                  )}

                  {dupTotal > 0 && (
                    <>
                      <div className="dup-stats">
                        <div className="dup-stat total">
                          <div className="dup-stat-value">{dupTotal.toLocaleString()}</div>
                          <div className="dup-stat-label">Total Lines</div>
                        </div>
                        <div className="dup-stat unique">
                          <div className="dup-stat-value">{dupUnique.length.toLocaleString()}</div>
                          <div className="dup-stat-label">Unique</div>
                        </div>
                        <div className="dup-stat dupes">
                          <div className="dup-stat-value">{dupDuplicates.length.toLocaleString()}</div>
                          <div className="dup-stat-label">Duplicated</div>
                        </div>
                        <div className="dup-stat removed">
                          <div className="dup-stat-value">{(dupTotal - dupUnique.length).toLocaleString()}</div>
                          <div className="dup-stat-label">Removed</div>
                        </div>
                      </div>

                      <div className="dup-actions">
                        <button
                          className="dup-btn unique"
                          onClick={() => downloadList(dupUnique, "unique")}
                          disabled={dupUnique.length === 0}
                        >
                          <FaDownload /> Download Unique ({dupUnique.length})
                        </button>
                        <button
                          className="dup-btn dupes"
                          onClick={() => downloadList(dupDuplicates, "duplicates")}
                          disabled={dupDuplicates.length === 0}
                        >
                          <FaDownload /> Download Duplicates ({dupDuplicates.length})
                        </button>
                        <button className="dup-btn reset" onClick={resetDupChecker}>
                          Clear
                        </button>
                      </div>
                    </>
                  )}
                </div>

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
                    accept=".csv,.txt"
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

            {activeTab === "custom" && (
              <div className="generation-card">
                <div className="card-header">
                  <FaPhone className="text-purple-500" />
                  <h3>Custom Number Builder</h3>
                </div>

                <p className="custom-hint">
                  Enter the starting digits and the total length. The remaining
                  digits are filled randomly so every number keeps your prefix
                  and matches the length.
                </p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Starting Digits</label>
                    <div className="number-input-wrapper">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="e.g. 1234"
                        value={customPrefix}
                        onChange={(e) => setCustomPrefix(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Total Length</label>
                    <div className="number-input-wrapper">
                      <input
                        type="number"
                        min={1}
                        value={customLength}
                        onChange={(e) => setCustomLength(Number(e.target.value))}
                        placeholder="e.g. 10"
                      />
                      <span className="input-suffix">digits</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>How Many</label>
                    <div className="number-input-wrapper">
                      <input
                        type="number"
                        min={1}
                        value={customCount}
                        onChange={(e) => setCustomCount(Number(e.target.value))}
                        placeholder="e.g. 10"
                      />
                      <span className="input-suffix">numbers</span>
                    </div>
                  </div>
                </div>

                {(() => {
                  const previewPrefix = String(customPrefix).replace(/\D/g, "");
                  const rem = Number(customLength) - previewPrefix.length;
                  if (!customError && rem >= 0 && customLength > 0) {
                    return (
                      <div className="custom-preview">
                        Preview: <strong>{previewPrefix}{"x".repeat(rem)}</strong>
                      </div>
                    );
                  }
                  return null;
                })()}

                {customError && <div className="custom-error">{customError}</div>}

                <div className="action-buttons">
                  <button className="generate-btn" onClick={handleCustomGenerate}>
                    Generate
                  </button>
                  <button
                    className="download-all-btn"
                    onClick={downloadAllAsTxt}
                    disabled={numbers.length === 0}
                    title="Download all generated data as a plain .txt file"
                  >
                    <FaDownload />
                    Download All ({numbers.length}) .txt
                  </button>
                </div>
              </div>
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