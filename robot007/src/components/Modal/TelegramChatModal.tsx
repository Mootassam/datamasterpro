import React, { useState, useEffect } from "react";
import {
  FiSend,
  FiX,
  FiPlus,
  FiClock,
  FiDownload,
  FiRefreshCw,
  FiChevronRight,
  FiUserPlus,
  FiSearch,
  FiFolder,
  FiLink,
  FiLayers,
  FiTarget,
  FiZap,
  FiCheck,
  FiGlobe
} from "react-icons/fi";
import { RiShieldKeyholeLine, RiRobot2Line, RiSpyLine } from "react-icons/ri";
import "../styles/chat.css";
import {
  exportTelegramGroupMembers,
  fetchTelegramGroups,
  importMembersToGroup,
  scrapeTelegramMembers,
  fetchDialogFilters,
  joinTelegramGroup,
  autoDiscoverTelegramGroups,
  sendBulkMessagesToTelegramGroups
} from "../../store/telegram/TelegramActions";
import { useSelector } from "react-redux";
import { 
  selectTelegramGroups, 
  selectDialogFilters,
} from "../../store/telegram/TelegramSelectors";

interface Message {
  text: string;
}

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatar?: string;
  lastExported?: string;
  isAdmin?: boolean;
  username?: string;
  access_hash?: string;
}

interface Account {
  id: string;
  name: string;
  avatar?: string;
  platform: string;
  phoneNumber?: string;
}

interface TelegramChatModalProps {
  onClose: () => void;
  dispatch: (action: any) => void;
  socket: any;
  registeredNumbers: string[];
  availableGroups?: Group[];
  onExportMembers?: (groupId: string) => Promise<void>;
  onRefreshGroups?: () => Promise<void>;
  availableAccounts?: Account[];
  onAccountSelect?: (accountId: string) => void;
  telegramActiveAccounts: string[];
  exportProgress?: { [groupId: string]: number };
  showExportProgress?: boolean;
  initialView?: 'home' | 'campaigns' | 'scraper' | 'groups' | 'discovery';
  defaultAccountId?: string;
}

const TelegramChatModal: React.FC<TelegramChatModalProps> = ({
  onClose,
  dispatch,
  socket,
  availableGroups = [],
  onAccountSelect,
  telegramActiveAccounts,
  initialView = 'scraper',
  defaultAccountId,
}) => {
  // View State
  const [activeView, setActiveView] = useState<'home' | 'campaigns' | 'scraper' | 'groups' | 'discovery'>(initialView);
  
  // Campaign State
  const [messages, setMessages] = useState<Message[]>([{ text: "" }]);
  const [delay, setDelay] = useState<number>(1);
  const [attachment] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [useRandomDelay] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  
  // Scraper State
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isScraping, setIsScraping] = useState(false);

  // Discovery State
  const [discoveryKeywords, setDiscoveryKeywords] = useState("");
  const [discoveryLimit, setDiscoveryLimit] = useState(20);
  const [discoveredGroups, setDiscoveredGroups] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Group & Folder State
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>(availableGroups);
  
  // Account State
  const [showAccountSelection, setShowAccountSelection] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Import Members State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingGroup, setImportingGroup] = useState<Group | null>(null);
  const [importMembersList, setImportMembersList] = useState("");
  const [importDelay, setImportDelay] = useState(2000);
  const [importProgress, setImportProgress] = useState<any>(null);

  // Scheduling State
  const [scheduleType, setScheduleType] = useState<"once" | "recurring">("once");

  // Selectors
  const listTelegramGroups = useSelector(selectTelegramGroups as any) as any[];
  const dialogFilters = useSelector(selectDialogFilters as any) as any[];

  // Initialize date/time
  useEffect(() => {
    if (defaultAccountId && telegramActiveAccounts.length > 0) {
      const found = (telegramActiveAccounts as any[]).find(a => a.id === defaultAccountId);
      if (found) {
        setSelectedAccount(found);
        setShowAccountSelection(false);
        dispatch(fetchTelegramGroups(found.id));
      }
    }
  }, []);

  // Sync groups state
  useEffect(() => {
    setGroups(listTelegramGroups.length > 0 ? listTelegramGroups : availableGroups);
  }, [availableGroups, listTelegramGroups]);

  // Import progress listener
  useEffect(() => {
    if (socket) {
      socket.on("import-progress", (data: any) => {
        if (selectedAccount && data.accountId === selectedAccount.id) {
           setImportProgress(data);
        }
      });
    }
    return () => {
      if (socket) socket.off("import-progress");
    };
  }, [socket, selectedAccount]);

  // Fetch folders when entering groups view
  useEffect(() => {
    if (activeView === 'groups' && selectedAccount) {
      dispatch(fetchDialogFilters(selectedAccount.id));
    }
  }, [activeView, selectedAccount, dispatch]);

  // Actions
  const handleScrape = async () => {
    if (!scrapeUrl || !selectedAccount) return;
    try {
      setIsScraping(true);
      setScrapedData(null);
      const result = await dispatch(scrapeTelegramMembers({ 
        accountId: selectedAccount.id, 
        inviteLink: scrapeUrl 
      }));
      setScrapedData((result as any).payload);
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleExportScraped = async (format: 'csv' | 'txt') => {
    void format;
    if (!scrapedData || !selectedAccount) return;
    try {
      // Use the group ID from scraped data
      await dispatch(exportTelegramGroupMembers({ 
        accountId: selectedAccount.id, 
        groupId: scrapedData.group.id
      }));
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleAddScrapedToGroup = () => {
    if (!scrapedData) return;
    // Format scraped members for import
    const membersList = scrapedData.members
      .map((m: any) => m.username ? `@${m.username}` : m.phone || m.id)
      .join('\n');
    setImportMembersList(membersList);
    setActiveView('groups'); // Switch to groups to select target
    // Note: We'll need a way to trigger import modal after switch, 
    // but for now user can select group manually
    alert("Members extracted! Select a target group to import them to.");
  };

  const handleImportMembers = async () => {
    if (!importingGroup || !selectedAccount) return;
    const members = importMembersList.split('\n').map(m => m.trim()).filter(m => m);
    if (members.length === 0) return;
    
    try {
        setImportProgress({ status: 'starting', processed: 0, total: members.length, added: 0, failed: 0 });
        await dispatch(importMembersToGroup({
            accountId: selectedAccount.id,
            groupId: importingGroup.id,
            members,
            config: { delayBetweenMembers: importDelay }
        }));
    } catch (error: any) {
        console.error("Import failed:", error);
        setImportProgress(prev => ({ ...prev, status: 'error', message: error.message }));
    }
  };

  const handleRefreshGroups = async () => {
    if (!selectedAccount) return;
    try {
      setIsRefreshing(true);
      await dispatch(fetchTelegramGroups(selectedAccount.id));
      await dispatch(fetchDialogFilters(selectedAccount.id));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDiscover = async () => {
    if (!discoveryKeywords || !selectedAccount) return;
    try {
      setIsDiscovering(true);
      const keywords = discoveryKeywords.split(',').map(k => k.trim()).filter(k => k);
      const results = await dispatch(autoDiscoverTelegramGroups({
        accountId: selectedAccount.id,
        keywords,
        limit: discoveryLimit
      }));
      setDiscoveredGroups((results as any).payload);
    } catch (error) {
      console.error("Discovery failed:", error);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleJoinDiscoveredGroup = async (group: any) => {
    if (!selectedAccount) return;
    try {
        await dispatch(joinTelegramGroup({
            accountId: selectedAccount.id,
            inviteLink: group.username ? `https://t.me/${group.username}` : group.id
        }));
        alert(`Joined ${group.title}!`);
    } catch (error: any) {
        alert(`Failed to join: ${error.message}`);
    }
  };

  const handleSend = async () => {
    if (!selectedAccount) return;
    setIsSending(true);
    const validMessages = messages.filter((m) => m.text.trim() !== "");
    if (validMessages.length > 0 && selectedGroups.length > 0) {
      try {
        const targetGroups = groups.filter(g => selectedGroups.includes(g.id))
            .map(g => ({
                id: g.id,
                access_hash: g.access_hash,
                title: g.name,
                username: g.username
            }));
            
        await dispatch(sendBulkMessagesToTelegramGroups({
            accountId: selectedAccount.id,
            groups: targetGroups,
            message: validMessages[0].text,
            config: {
                delayBetweenMessages: delay * 1000,
                randomDelay: useRandomDelay
            },
            file: attachment || undefined
        }));
        
        alert("Campaign launched successfully!");
      } catch (error: any) {
        alert(`Campaign failed: ${error.message}`);
      } finally {
        setIsSending(false);
      }
    }
  };

  const filteredGroups = selectedFolder 
    ? groups.filter(g => {
        const filter = dialogFilters.find((f: any, idx: number) => {
          const key = f?.id != null ? f.id.toString() : (f?.title || String(idx));
          return key === selectedFolder;
        });
        if (!filter) return true;
        const peers = filter?.include_peers || filter?.pinned_peers || [];
        return peers?.some((p: any) => 
          (p?.channel_id ?? p?.chat_id ?? p?.user_id)?.toString() === g.id
        );
      })
    : groups;

  // Render Account Selection
  if (showAccountSelection) {
    return (
      <div className="telegram-modal-overlay">
        <div className="telegram-modal">
          <div className="telegram-modal-header">
            <div className="telegram-header-left">
              <RiShieldKeyholeLine className="telegram-header-icon" />
              <h3>Select Account</h3>
            </div>
            <button className="telegram-close-btn" onClick={onClose}><FiX /></button>
          </div>
          <div className="telegram-modal-body">
            {telegramActiveAccounts.length === 0 ? (
              <div className="no-accounts-container">
                <h4>No Accounts Available</h4>
                <p>Please add an account to continue</p>
                <button className="telegram-btn" onClick={onClose}><FiPlus /> Add Account</button>
              </div>
            ) : (
              <div className="accounts-list">
                {telegramActiveAccounts.map((account: any) => (
                  <div key={account.id} className="account-item" onClick={() => {
                    dispatch(fetchTelegramGroups(account.id));
                    setSelectedAccount(account);
                    setShowAccountSelection(false);
                    if (onAccountSelect) onAccountSelect(account.id);
                  }}>
                    <div className="account-avatar">{account.name.charAt(0)}</div>
                    <div className="account-details">
                      <span className="account-name">{account.name}</span>
                      <span className="account-phone">{account.phoneNumber}</span>
                    </div>
                    <FiChevronRight />
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* DISCOVERY VIEW */}
          {activeView === 'discovery' && (
            <div className="scraper-view">
              <div className="scraper-header">
                <h2><FiGlobe /> Global Group Discovery</h2>
                <p>Uncover hidden communities and expand your reach instantly.</p>
              </div>

              <div className="scraper-input-section">
                <div className="url-input-wrapper">
                  <FiSearch />
                  <input 
                    type="text" 
                    placeholder="Enter keywords (e.g. 'Crypto', 'Marketing', 'Real Estate')" 
                    value={discoveryKeywords}
                    onChange={(e) => setDiscoveryKeywords(e.target.value)}
                  />
                </div>
                <div className="limit-input-wrapper" style={{width: '100px', marginLeft: '10px'}}>
                    <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        value={discoveryLimit} 
                        onChange={(e) => setDiscoveryLimit(Number(e.target.value))}
                        title="Limit per keyword"
                        style={{width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '1.1rem'}}
                    />
                </div>
                <button 
                  className="scrape-btn" 
                  onClick={handleDiscover}
                  disabled={isDiscovering || !discoveryKeywords}
                >
                  {isDiscovering ? <FiRefreshCw className="spinning" /> : <FiSearch />}
                  {isDiscovering ? "SEARCHING..." : "DISCOVER"}
                </button>
              </div>

              <div className="groups-grid">
                  {discoveredGroups.map((group) => (
                    <div key={group.id} className="group-card">
                      <div className="group-card-header">
                        <div className="group-avatar">{group.title.charAt(0)}</div>
                        <div className="group-info">
                          <h5>{group.title}</h5>
                          <span>@{group.username} • {group.members} members</span>
                        </div>
                      </div>
                      <div className="group-card-actions">
                        <button onClick={() => handleJoinDiscoveredGroup(group)} className="primary-action" style={{backgroundColor: '#e0f2fe', color: '#0284c7', border: 'none'}}>
                            <FiUserPlus /> Join Group
                        </button>
                      </div>
                    </div>
                  ))}
                  {discoveredGroups.length === 0 && !isDiscovering && (
                      <div className="empty-state" style={{width: '100%', textAlign: 'center', color: '#64748b', marginTop: '50px'}}>
                          <FiGlobe size={48} style={{opacity: 0.5, marginBottom: '20px'}}/>
                          <p>Enter keywords to find relevant groups globally.</p>
                      </div>
                  )}
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="telegram-modal-overlay">
      <div className="telegram-modal full-screen-modal">
        {/* Header */}
        <div className="telegram-modal-header">
          <div className="telegram-header-left">
            <RiRobot2Line className="telegram-header-icon" />
            <div className="header-info">
              <h3>Telegram Domination Pro</h3>
              <span className="account-badge">{selectedAccount?.name}</span>
            </div>
          </div>
          
          <div className="view-switcher">
            <button 
              className={`view-btn ${activeView === 'home' ? 'active' : ''}`}
              onClick={() => setActiveView('home')}
            >
              <RiRobot2Line /> Home
            </button>
            <button 
              className={`view-btn ${activeView === 'campaigns' ? 'active' : ''}`}
              onClick={() => setActiveView('campaigns')}
            >
              <FiSend /> Campaigns
            </button>
            <button 
              className={`view-btn ${activeView === 'scraper' ? 'active' : ''}`}
              onClick={() => setActiveView('scraper')}
            >
              <RiSpyLine /> Lead Scraper
            </button>
            <button 
              className={`view-btn ${activeView === 'groups' ? 'active' : ''}`}
              onClick={() => setActiveView('groups')}
            >
              <FiFolder /> Groups & Folders
            </button>
            <button 
              className={`view-btn ${activeView === 'discovery' ? 'active' : ''}`}
              onClick={() => setActiveView('discovery')}
            >
              <FiGlobe /> Discovery
            </button>
          </div>

          <button className="telegram-close-btn" onClick={onClose}><FiX /></button>
        </div>

        <div className="telegram-modal-body no-padding">
          
          {/* CAMPAIGNS VIEW */}
          {activeView === 'campaigns' && (
            <div className="campaigns-view">
              <div className="campaign-setup">
                <div className="section-header">
                  <h4><FiTarget /> Precision Targeting</h4>
                  <button className="select-groups-btn" onClick={() => setActiveView('groups')}>
                    {selectedGroups.length} Targets Selected <FiChevronRight />
                  </button>
                </div>
                
                <div className="message-composer">
                   <h4><FiZap /> Hypnotic Power Messages</h4>
                   <p className="helper-text">Craft irresistible messages that demand attention. Our anti-ban technology ensures maximum delivery.</p>
                   {messages.map((msg, idx) => (
                     <div key={idx} className="message-input-group">
                       <textarea 
                         value={msg.text} 
                         onChange={(e) => {
                           const newMsgs = [...messages];
                           newMsgs[idx].text = e.target.value;
                           setMessages(newMsgs);
                         }}
                         placeholder="Type your persuasive message here..."
                       />
                       {messages.length > 1 && (
                         <button onClick={() => {
                           const newMsgs = messages.filter((_, i) => i !== idx);
                           setMessages(newMsgs);
                         }}><FiX /></button>
                       )}
                     </div>
                   ))}
                   <button className="add-variant-btn" onClick={() => setMessages([...messages, { text: "" }])}>
                     <FiPlus /> Add Variation
                   </button>
                </div>

                <div className="campaign-settings">
                  <h4><FiClock /> Velocity & Schedule</h4>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Delay (seconds)</label>
                      <input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
                    </div>
                    <div className="setting-item">
                      <label>Schedule</label>
                      <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value as any)}>
                        <option value="once">Send Now / Once</option>
                        <option value="recurring">Recurring Domination</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  className="launch-btn" 
                  onClick={handleSend}
                  disabled={isSending || selectedGroups.length === 0}
                >
                  {isSending ? "Launching Campaign..." : "LAUNCH CAMPAIGN & DOMINATE 🚀"}
                </button>
              </div>
            </div>
          )}

          {/* SCRAPER VIEW */}
          {activeView === 'scraper' && (
            <div className="scraper-view">
              <div className="scraper-header">
                <h2>⚡ Stealth Lead Extractor</h2>
                <p>Hijack your competitors' most active customers instantly. Zero effort, maximum results.</p>
              </div>

              <div className="scraper-input-section">
                <div className="url-input-wrapper">
                  <FiLink />
                  <input 
                    type="text" 
                    placeholder="Paste Competitor Group URL (e.g., t.me/competitor_group)" 
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                  />
                </div>
                <button 
                  className="scrape-btn" 
                  onClick={handleScrape}
                  disabled={isScraping || !scrapeUrl}
                >
                  {isScraping ? <FiRefreshCw className="spinning" /> : <FiSearch />}
                  {isScraping ? "EXTRACTING..." : "STEAL LEADS NOW"}
                </button>
              </div>

              {scrapedData && (
                <div className="scraped-results">
                  <div className="result-card">
                    <div className="result-header">
                      <div className="group-info">
                        <h3>{scrapedData.group.name}</h3>
                        <span className="member-count">{scrapedData.group.memberCount} Members Found</span>
                      </div>
                      <div className="result-actions">
                        <button onClick={() => handleExportScraped('csv')}><FiDownload /> CSV</button>
                        <button onClick={() => handleExportScraped('txt')}><FiDownload /> TXT</button>
                        <button className="primary-action" onClick={handleAddScrapedToGroup}><FiUserPlus /> Add to My Group</button>
                      </div>
                    </div>
                    <div className="members-preview">
                      <h4>Recent Members Preview</h4>
                      <div className="members-grid">
                        {scrapedData.members.slice(0, 50).map((m: any) => (
                          <div key={m.id} className="member-chip">
                            {m.username ? `@${m.username}` : m.firstName}
                          </div>
                        ))}
                        {scrapedData.members.length > 50 && (
                          <div className="more-members">+{scrapedData.members.length - 50} more...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GROUPS VIEW */}
          {activeView === 'groups' && (
            <div className="groups-view">
              <div className="folders-sidebar">
                <div className="sidebar-header">
                  <h4>Strategic Folders</h4>
                  <button 
                    onClick={() => { if (selectedAccount) dispatch(fetchDialogFilters(selectedAccount.id)); }} 
                    title="Sync Folders"
                    disabled={!selectedAccount}
                  >
                    <FiRefreshCw />
                  </button>
                </div>
                <ul>
                  <li 
                    className={!selectedFolder ? 'active' : ''} 
                    onClick={() => setSelectedFolder(null)}
                  >
                    <FiLayers /> All Chats
                  </li>
                  {dialogFilters.map((filter: any, index: number) => {
                    const key = filter?.id != null ? filter.id.toString() : (filter?.title || String(index));
                    return (
                      <li 
                        key={key} 
                        className={selectedFolder === key ? 'active' : ''}
                        onClick={() => setSelectedFolder(key)}
                      >
                        <FiFolder /> {filter?.title || `Folder ${index + 1}`}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="groups-list-container">
                <div className="groups-toolbar">
                  <span>{filteredGroups.length} Active Targets</span>
                  <button className="refresh-btn" onClick={handleRefreshGroups} disabled={isRefreshing}>
                    <FiRefreshCw className={isRefreshing ? "spinning" : ""} /> Sync Targets
                  </button>
                </div>
                
                <div className="groups-grid">
                  {filteredGroups.map(group => (
                    <div 
                      key={group.id} 
                      className={`group-card ${selectedGroups.includes(group.id) ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedGroups(prev => 
                          prev.includes(group.id) ? prev.filter(id => id !== group.id) : [...prev, group.id]
                        );
                      }}
                    >
                      <div className="group-card-header">
                        <div className="group-avatar">{group.name.charAt(0)}</div>
                        <div className="group-info">
                          <h5>{group.name}</h5>
                          <span>{group.memberCount} members</span>
                        </div>
                        {selectedGroups.includes(group.id) && <FiCheck className="check-icon" />}
                      </div>
                      <div className="group-card-actions">
                        <button onClick={(e) => {
                           e.stopPropagation();
                           setImportingGroup(group);
                           setShowImportModal(true);
                        }} title="Import Members"><FiUserPlus /></button>
                        <button onClick={(e) => {
                           e.stopPropagation();
                           if (selectedAccount) {
                             dispatch(exportTelegramGroupMembers({ accountId: selectedAccount.id, groupId: group.id }));
                           }
                        }} title="Export CSV"><FiDownload /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Import Modal */}
      {showImportModal && importingGroup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Import to {importingGroup.name}</h3>
            <textarea 
              value={importMembersList} 
              onChange={e => setImportMembersList(e.target.value)}
              placeholder="Paste usernames or phone numbers (one per line)..."
              rows={10}
            />
            <div className="setting-item" style={{ marginBottom: '20px' }}>
               <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#475569' }}>Delay between imports (ms)</label>
               <input 
                 type="number" 
                 value={importDelay} 
                 onChange={(e) => setImportDelay(Number(e.target.value))}
                 style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
               />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowImportModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleImportMembers}>Start Import</button>
            </div>
            {importProgress && (
               <div className="progress-bar">
                 <div className="fill" style={{ width: `${(importProgress.processed / importProgress.total) * 100}%` }}></div>
                 <span>{importProgress.processed}/{importProgress.total}</span>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramChatModal;
