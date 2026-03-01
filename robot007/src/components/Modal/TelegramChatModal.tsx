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
  discoverPublicGroupsOrChannels,
    sendBulkMessagesToTelegramGroups,
    joinBulkGroups
} from "../../store/telegram/TelegramActions";
  import { exportJoinedLinksTxt } from "../../store/telegram/TelegramActions";
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
  const [discoveredGroups, setDiscoveredGroups] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverFilter, setDiscoverFilter] = useState<'all' | 'channels' | 'groups'>('all');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [joinGroupList, setJoinGroupList] = useState("");

  // Debug/Placeholder usage to prevent build error until Home view is implemented
  useEffect(() => {
    if (joinGroupList) {
        console.log("Targets added to join list:", joinGroupList);
    }
  }, [joinGroupList]);

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
  const [joinProgress, setJoinProgress] = useState<any>(null);

  // Scheduling State
  const [scheduleType, setScheduleType] = useState<"once" | "recurring">("once");
  const [repeatHours, setRepeatHours] = useState<number>(1);
  const [repeatUnit, setRepeatUnit] = useState<"hours" | "minutes">("hours");
  const [maxRepeats, setMaxRepeats] = useState<number | undefined>(undefined);
  const [repeatStats, setRepeatStats] = useState<{ current: number; max?: number } | null>(null);
  const [campaignProgress, setCampaignProgress] = useState<any>(null);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = message.replace(/\s+/g, '-').toLowerCase();
    setToasts(prev => {
      // Prevent duplicates
      if (prev.some(t => t.id === id)) return prev;
      return [...prev, { id, message, type }];
    });
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

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

  // Campaign progress listener
  useEffect(() => {
    if (socket) {
      const handleProgress = (data: any) => {
          setCampaignProgress(data);
          if (data.lastAction?.type === 'error') {
             // Optional: Toast for individual failures might be too noisy, keep it in the progress UI
          }
      };
      
      const handleComplete = (data: any) => {
          setIsSending(false);
          setCampaignProgress(null);
          addToast(`Campaign Completed! Sent: ${data.result.sent.length}, Failed: ${data.result.failed.length}`, 'success');
      };

      const handleScheduled = (data: any) => {
          setIsSending(false);
          addToast(data.message, 'success');
          // If this is a recurring campaign, set up initial repeat stats
          if (data.repeatEvery) {
              setRepeatStats({ 
                  current: 0, 
                  max: data.maxRepeats 
              });
          }
      };

      const handleCampaignRepeatStart = (data: any) => {
        if (data.repeatNumber !== undefined) {
          setRepeatStats({ current: data.repeatNumber, max: data.maxRepeats });
        }
      };

      const handleCampaignRepeatComplete = (_data: any) => {
        // Keep repeat stats visible until next repeat starts
      };

      const handleJoinStart = (data: any) => {
          setJoinProgress({ status: 'starting', processed: 0, total: data.total ?? 0, joined: 0, failed: 0 });
      };
      const handleJoinProgress = (data: any) => {
          setJoinProgress(data);
      };
      const handleJoinComplete = (data: any) => {
          setJoinProgress(null);
          addToast(`Join Completed! ✓ Joined: ${data.result.joined.length}, ✗ Failed: ${data.result.failed.length}`, 'success');
      };
      const handleJoinLog = (data: any) => {
          if (data?.type === 'warning') addToast(data.message, 'info');
          if (data?.type === 'error') addToast(data.message, 'error');
      };

      socket.on("campaign-progress", handleProgress);
      socket.on("campaign-complete", handleComplete);
      socket.on("campaign-scheduled", handleScheduled);
      socket.on("campaign-repeat-start", handleCampaignRepeatStart);
      socket.on("campaign-repeat-complete", handleCampaignRepeatComplete);
      socket.on("join-start", handleJoinStart);
      socket.on("join-progress", handleJoinProgress);
      socket.on("join-complete", handleJoinComplete);
      socket.on("join-log", handleJoinLog);
      
      return () => {
        socket.off("campaign-progress", handleProgress);
        socket.off("campaign-complete", handleComplete);
        socket.off("campaign-scheduled", handleScheduled);
        socket.off("campaign-repeat-start", handleCampaignRepeatStart);
        socket.off("campaign-repeat-complete", handleCampaignRepeatComplete);
        socket.off("join-start", handleJoinStart);
        socket.off("join-progress", handleJoinProgress);
        socket.off("join-complete", handleJoinComplete);
        socket.off("join-log", handleJoinLog);
      };
    }
  }, [socket]);

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
      const results = await dispatch(discoverPublicGroupsOrChannels({
        accountId: selectedAccount.id,
        keyword: discoveryKeywords,
        limit: 1000,
        settings: {
          onlyChannels: discoverFilter === 'channels',
          onlyGroups: discoverFilter === 'groups'
        }
      }));
      setDiscoveredGroups((results as any).payload);
    } catch (error: any) {
      console.error("Discovery failed:", error);
      addToast(`Discovery failed: ${error.message || "Unknown error"}`, 'error');
    } finally {
      setIsDiscovering(false);
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
                randomDelay: useRandomDelay,
                repeatEvery: scheduleType === 'recurring' ? repeatHours : undefined,
                repeatUnit: scheduleType === 'recurring' ? repeatUnit : undefined,
                maxRepeats: scheduleType === 'recurring' ? maxRepeats : undefined
            },
            file: attachment || undefined
        }));
        
        if (scheduleType === 'once') {
            addToast("Campaign launched! Watch progress below...", 'info');
        }
      } catch (error: any) {
        addToast(`Campaign failed: ${error.message}`, 'error');
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

              <div className="scraper-input-section" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="url-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
                  <FiSearch />
                  <input 
                    type="text" 
                    placeholder="Enter keywords (e.g. 'Crypto', 'Marketing', 'Real Estate')" 
                    value={discoveryKeywords}
                    onChange={(e) => setDiscoveryKeywords(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDiscover()}
                  />
                </div>
                
                <div className="filter-toggle" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                  <button 
                    className={`view-btn ${discoverFilter === 'all' ? 'active' : ''}`} 
                    onClick={() => setDiscoverFilter('all')}
                    style={{ border: 'none', background: discoverFilter === 'all' ? '#fff' : 'transparent', boxShadow: discoverFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                  >All</button>
                  <button 
                    className={`view-btn ${discoverFilter === 'channels' ? 'active' : ''}`} 
                    onClick={() => setDiscoverFilter('channels')}
                    style={{ border: 'none', background: discoverFilter === 'channels' ? '#fff' : 'transparent', boxShadow: discoverFilter === 'channels' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                  >Channels</button>
                  <button 
                    className={`view-btn ${discoverFilter === 'groups' ? 'active' : ''}`} 
                    onClick={() => setDiscoverFilter('groups')}
                    style={{ border: 'none', background: discoverFilter === 'groups' ? '#fff' : 'transparent', boxShadow: discoverFilter === 'groups' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                  >Groups</button>
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

              {discoveredGroups.length > 0 && (
                <div className="results-toolbar" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    margin: '20px 0 15px', 
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#334155', fontSize: '1rem' }}>
                        {discoveredGroups.length}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Results Found</span>
                  </div>
                  <button 
                    className="secondary-action"
                    onClick={() => {
                        const allLinks = discoveredGroups.map(g => g.username ? `@${g.username}` : String(g.id));
                        const allSelected = allLinks.every(link => selectedTargets.includes(link));
                        
                        if (allSelected) {
                            setSelectedTargets(prev => prev.filter(t => !allLinks.includes(t)));
                        } else {
                            setSelectedTargets(prev => [...new Set([...prev, ...allLinks])]);
                        }
                    }}
                    style={{ 
                        fontSize: '0.9rem', 
                        padding: '8px 16px',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    {discoveredGroups.every(g => selectedTargets.includes(g.username ? `@${g.username}` : String(g.id))) 
                        ? <><FiX /> Deselect All</> 
                        : <><FiCheck /> Select All</>}
                  </button>
                </div>
              )}

              <div className="groups-grid">
                  {discoveredGroups.map((group) => {
                    const link = group.username ? `@${group.username}` : String(group.id);
                    const isSelected = selectedTargets.includes(link);
                    return (
                    <div 
                        key={group.id} 
                        className="group-card" 
                        style={{ 
                            border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            }
                        }}
                        onClick={() => {
                            setSelectedTargets(prev => prev.includes(link) ? prev.filter(l => l !== link) : [...prev, link]);
                        }}
                    >
                      <div className="group-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="group-avatar" style={{ 
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: isSelected ? '#3b82f6' : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)', 
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {group.title.charAt(0)}
                        </div>
                        <div className="group-info" style={{ flex: 1, minWidth: 0 }}>
                          <h5 style={{ 
                              margin: '0 0 4px 0', 
                              fontSize: '1rem', 
                              fontWeight: '600', 
                              color: isSelected ? '#1e40af' : '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                          }} title={group.title}>{group.title}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                            <span style={{ 
                                background: isSelected ? '#dbeafe' : '#f1f5f9',
                                color: isSelected ? '#1e40af' : '#475569', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.7rem', 
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>{group.type === 'channel' ? 'CHANNEL' : 'GROUP'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiUserPlus size={12} /> {group.members?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                            <div style={{ 
                                color: '#3b82f6', 
                                background: '#dbeafe', 
                                padding: '8px', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FiCheck size={18} />
                            </div>
                        )}
                      </div>
                      
                      {group.username ? (
                          <div style={{ 
                              marginTop: 'auto', 
                              paddingTop: '12px', 
                              borderTop: '1px solid', 
                              borderColor: isSelected ? '#bfdbfe' : '#f1f5f9',
                              fontSize: '0.85rem',
                              color: isSelected ? '#2563eb' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                          }}>
                              <FiLink size={14} /> 
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>t.me/{group.username}</span>
                          </div>
                      ) : (
                          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', height: '29px' }}></div>
                      )}
                    </div>
                  )})}
                  {discoveredGroups.length === 0 && !isDiscovering && (
                      <div className="empty-state" style={{width: '100%', textAlign: 'center', color: '#64748b', marginTop: '50px'}}>
                          <FiGlobe size={48} style={{opacity: 0.5, marginBottom: '20px'}}/>
                          <p>Enter keywords to find relevant groups globally.</p>
                      </div>
                  )}
              </div>
              
              {selectedTargets.length > 0 && (
                <div className="discovery-footer" style={{ 
                    position: 'sticky', 
                    bottom: '0', 
                    background: '#fff', 
                    padding: '16px', 
                    borderTop: '1px solid #e2e8f0',
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                    display: 'flex', 
                    justifyContent: 'center',
                    marginTop: 'auto'
                }}>
                  <button 
                    className="launch-btn" 
                    onClick={() => {
                      const unique = Array.from(new Set([...selectedTargets]));
                      setJoinGroupList(prev => {
                        const prevLines = prev.split('\n').map(l => l.trim()).filter(l => l);
                        const merged = Array.from(new Set([...prevLines, ...unique]));
                        return merged.join('\n');
                      });
                      setActiveView('home');
                      addToast(`${unique.length} targets added to join list`, 'success');
                    }}
                    style={{ width: '100%', maxWidth: '400px' }}
                  >
                    ADD SELECTED TO TARGETS ({selectedTargets.length})
                  </button>
                </div>
              )}
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

          {/* HOME VIEW */}
          {activeView === 'home' && (
            <div className="campaigns-view">
              <div className="campaign-setup">
                <div className="section-header">
                  <h4><FiUserPlus /> Auto-Join Groups</h4>
                </div>
                
                <div className="message-composer">
                   <div className="message-input-group">
                     <textarea 
                       value={joinGroupList} 
                       onChange={(e) => setJoinGroupList(e.target.value)}
                       placeholder="Paste group links here (one per line)...&#10;@username&#10;https://t.me/joinchat/..."
                     />
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                     <span>{joinGroupList.split('\n').filter(l => l.trim()).length} targets loaded</span>
                     <button 
                        className="secondary-action" 
                        onClick={() => setJoinGroupList('')}
                        style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}
                     >
                        Clear List
                     </button>
                   </div>
                </div>

                <div className="campaign-settings">
                  <h4><FiClock /> Joining Speed</h4>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Delay (seconds)</label>
                      <input type="number" value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
                    </div>
                  </div>
                </div>

                <button 
                  className="launch-btn" 
                  onClick={async () => {
                     const targets = joinGroupList.split('\n').filter(l => l.trim());
                     if (!selectedAccount) {
                       addToast("Select an account first", 'error');
                       return;
                     }
                     if (targets.length === 0) {
                       addToast("Add at least one group target", 'error');
                       return;
                     }
                     setJoinProgress({ status: 'starting', processed: 0, total: targets.length, joined: 0, failed: 0 });
                     addToast(`Starting to join ${targets.length} groups...`, 'info');
                     try {
                       await (dispatch as any)(joinBulkGroups({
                          accountId: selectedAccount!.id,
                          groups: targets,
                          config: { delayBetweenJoins: delay * 1000 }
                       })).unwrap();
                     } catch (err: any) {
                       addToast(err?.message || "Failed to start join process", 'error');
                     }
                  }}
                  disabled={!joinGroupList.trim()}
                >
                  START JOINING PROCESS 🚀
                </button>
                
                {joinProgress && (
                  <div className="campaign-settings" style={{ marginTop: 16 }}>
                    <h4><FiClock /> Progress</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#334155', fontWeight: 600 }}>
                      <span>Processed: {joinProgress.processed ?? 0} / {joinProgress.total ?? 0}</span>
                      <span>✓ Joined: {joinProgress.joined ?? 0}</span>
                      <span>✗ Failed: {joinProgress.failed ?? 0}</span>
                    </div>
                    <div style={{ marginTop: 10, height: 10, background: '#e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, Math.floor(((joinProgress.processed ?? 0) / Math.max(1, joinProgress.total ?? 1)) * 100))}%`, height: '100%', background: '#10b981' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* DISCOVERY VIEW */}
          {activeView === 'discovery' && (
            <div className="scraper-view">
              <div className="scraper-header">
                <h2><FiGlobe /> Global Group Discovery</h2>
                <p>Uncover hidden communities and expand your reach instantly.</p>
              </div>

              <div className="scraper-input-section" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="url-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
                  <FiSearch />
                  <input 
                    type="text" 
                    placeholder="Enter keywords (e.g. 'Crypto', 'Marketing', 'Real Estate')" 
                    value={discoveryKeywords}
                    onChange={(e) => setDiscoveryKeywords(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDiscover()}
                  />
                </div>
                
                <div className="filter-toggle" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                  <button 
                    className={`view-btn ${discoverFilter === 'all' ? 'active' : ''}`} 
                    onClick={() => setDiscoverFilter('all')}
                    style={{ border: 'none', background: discoverFilter === 'all' ? '#fff' : 'transparent', boxShadow: discoverFilter === 'all' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                  >All</button>
                  <button 
                    className={`view-btn ${discoverFilter === 'channels' ? 'active' : ''}`} 
                    onClick={() => setDiscoverFilter('channels')}
                    style={{ border: 'none', background: discoverFilter === 'channels' ? '#fff' : 'transparent', boxShadow: discoverFilter === 'channels' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                  >Channels</button>
                  <button 
                    className={`view-btn ${discoverFilter === 'groups' ? 'active' : ''}`} 
                    onClick={() => setDiscoverFilter('groups')}
                    style={{ border: 'none', background: discoverFilter === 'groups' ? '#fff' : 'transparent', boxShadow: discoverFilter === 'groups' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none' }}
                  >Groups</button>
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

              {discoveredGroups.length > 0 && (
                <div className="results-toolbar" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    margin: '20px 0 15px', 
                    padding: '12px 16px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#334155', fontSize: '1rem' }}>
                        {discoveredGroups.length}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Results Found</span>
                  </div>
                  <button 
                    className="secondary-action"
                    onClick={() => {
                        const allLinks = discoveredGroups.map(g => g.username ? `@${g.username}` : String(g.id));
                        const allSelected = allLinks.every(link => selectedTargets.includes(link));
                        
                        if (allSelected) {
                            setSelectedTargets(prev => prev.filter(t => !allLinks.includes(t)));
                        } else {
                            setSelectedTargets(prev => [...new Set([...prev, ...allLinks])]);
                        }
                    }}
                    style={{ 
                        fontSize: '0.9rem', 
                        padding: '8px 16px',
                        background: '#fff',
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    {discoveredGroups.every(g => selectedTargets.includes(g.username ? `@${g.username}` : String(g.id))) 
                        ? <><FiX /> Deselect All</> 
                        : <><FiCheck /> Select All</>}
                  </button>
                </div>
              )}

              <div className="groups-grid">
                  {discoveredGroups.map((group) => {
                    const link = group.username ? `@${group.username}` : String(group.id);
                    const isSelected = selectedTargets.includes(link);
                    return (
                    <div 
                        key={group.id} 
                        className="group-card" 
                        style={{ 
                            border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            }
                        }}
                        onClick={() => {
                            setSelectedTargets(prev => prev.includes(link) ? prev.filter(l => l !== link) : [...prev, link]);
                        }}
                    >
                      <div className="group-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="group-avatar" style={{ 
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: isSelected ? '#3b82f6' : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)', 
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {group.title.charAt(0)}
                        </div>
                        <div className="group-info" style={{ flex: 1, minWidth: 0 }}>
                          <h5 style={{ 
                              margin: '0 0 4px 0', 
                              fontSize: '1rem', 
                              fontWeight: '600', 
                              color: isSelected ? '#1e40af' : '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                          }} title={group.title}>{group.title}</h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                            <span style={{ 
                                background: isSelected ? '#dbeafe' : '#f1f5f9',
                                color: isSelected ? '#1e40af' : '#475569', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '0.7rem', 
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>{group.type === 'channel' ? 'CHANNEL' : 'GROUP'}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiUserPlus size={12} /> {group.members?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                            <div style={{ 
                                color: '#3b82f6', 
                                background: '#dbeafe', 
                                padding: '8px', 
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FiCheck size={18} />
                            </div>
                        )}
                      </div>
                      
                      {group.username ? (
                          <div style={{ 
                              marginTop: 'auto', 
                              paddingTop: '12px', 
                              borderTop: '1px solid', 
                              borderColor: isSelected ? '#bfdbfe' : '#f1f5f9',
                              fontSize: '0.85rem',
                              color: isSelected ? '#2563eb' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                          }}>
                              <FiLink size={14} /> 
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>t.me/{group.username}</span>
                          </div>
                      ) : (
                          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9', height: '29px' }}></div>
                      )}
                    </div>
                  )})}
                  {discoveredGroups.length === 0 && !isDiscovering && (
                      <div className="empty-state" style={{width: '100%', textAlign: 'center', color: '#64748b', marginTop: '50px'}}>
                          <FiGlobe size={48} style={{opacity: 0.5, marginBottom: '20px'}}/>
                          <p>Enter keywords to find relevant groups globally.</p>
                      </div>
                  )}
              </div>
              
              {selectedTargets.length > 0 && (
                <div className="discovery-footer" style={{ 
                    position: 'sticky', 
                    bottom: '0', 
                    background: '#fff', 
                    padding: '16px', 
                    borderTop: '1px solid #e2e8f0',
                    boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.05)',
                    display: 'flex', 
                    justifyContent: 'center',
                    marginTop: 'auto'
                }}>
                  <button 
                    className="launch-btn" 
                    onClick={() => {
                      const unique = Array.from(new Set([...selectedTargets]));
                      setJoinGroupList(prev => {
                        const prevLines = prev.split('\n').map(l => l.trim()).filter(l => l);
                        const merged = Array.from(new Set([...prevLines, ...unique]));
                        return merged.join('\n');
                      });
                      setActiveView('home');
                      addToast(`${unique.length} targets added to join list`, 'success');
                    }}
                    style={{ width: '100%', maxWidth: '400px' }}
                  >
                    ADD SELECTED TO TARGETS ({selectedTargets.length})
                  </button>
                </div>
              )}
            </div>
          )}
          
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0 }}><FiClock /> Velocity & Schedule</h4>
                    {repeatStats && (
                      <div style={{ 
                        padding: '4px 12px', 
                        background: '#dbeafe', 
                        borderRadius: '20px', 
                        color: '#1e40af', 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span className="animate-spin">🔄</span>
                        Repeats: {repeatStats.current}{repeatStats.max ? ` / ${repeatStats.max}` : ""}
                      </div>
                    )}
                  </div>
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
                    {scheduleType === 'recurring' && (
                        <>
                            <div className="setting-item">
                                <label>Repeat Every</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        style={{ width: '80px' }}
                                        value={repeatHours} 
                                        onChange={(e) => setRepeatHours(Number(e.target.value))} 
                                    />
                                    <select 
                                        value={repeatUnit}
                                        onChange={(e) => setRepeatUnit(e.target.value as "hours" | "minutes")}
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="minutes">Minutes</option>
                                    </select>
                                </div>
                            </div>
                            <div className="setting-item">
                                <label>Max Repeats (optional)</label>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        placeholder="Unlimited"
                                        style={{ width: '80px' }}
                                        value={maxRepeats || ''} 
                                        onChange={(e) => setMaxRepeats(e.target.value ? Number(e.target.value) : undefined)} 
                                    />
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        times (leave empty for unlimited)
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                  </div>
                </div>

                {/* Repeat Stats - Show when campaign is scheduled or running */}
                {repeatStats && (
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '16px', 
                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                        borderRadius: '12px', 
                        border: '2px solid #3b82f6',
                        boxShadow: '0 4px 6px rgba(59, 130, 246, 0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '2rem' }}>🔄</span>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e40af' }}>
                                        Repeat #{repeatStats.current}{repeatStats.max ? ` of ${repeatStats.max}` : ""}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
                                        {repeatStats.max ? `${repeatStats.max - repeatStats.current} remaining` : "Indefinite repetitions"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {campaignProgress && (
                    <div className="campaign-progress-bar" style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ fontWeight: 'bold' }}>Campaign Progress</span>
                            <span>{campaignProgress.processed} / {campaignProgress.total}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: `${(campaignProgress?.processed / campaignProgress?.total) * 100}%`, 
                                height: '100%', 
                                background: '#3b82f6',
                                transition: 'width 0.3s ease'
                            }}></div>
                        </div>
                        {repeatStats && (
                            <div style={{ 
                                marginTop: '12px', 
                                padding: '12px 16px', 
                                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                                borderRadius: '8px', 
                                fontSize: '0.95rem', 
                                color: '#1e40af',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)'
                            }}>
                                <span style={{ fontSize: '1.2rem' }}>🔄</span>
                                <span>Repeat #{repeatStats.current}{repeatStats.max ? ` of ${repeatStats.max}` : ''}</span>
                            </div>
                        )}
                        {campaignProgress && (
                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.9rem' }}>
                            <span style={{ color: '#16a34a' }}>✓ Sent: {campaignProgress.sent}</span>
                            <span style={{ color: '#dc2626' }}>✗ Failed: {campaignProgress.failed}</span>
                        </div>
                        )}
                        {campaignProgress.lastAction && (
                            <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#64748b' }}>
                                {campaignProgress.lastAction.type === 'error' 
                                    ? `Error with ${campaignProgress.lastAction.groupName}: ${campaignProgress.lastAction.error}`
                                    : `Sent to ${campaignProgress.lastAction.groupName}`
                                }
                            </div>
                        )}
                    </div>
                )}

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
                  <button 
                    className="refresh-btn" 
                    onClick={() => {
                      if (selectedGroups.length === filteredGroups.length) {
                        // Deselect all in current view
                        const filteredIds = filteredGroups.map(g => g.id);
                        setSelectedGroups(prev => prev.filter(id => !filteredIds.includes(id)));
                      } else {
                        // Select all in current view
                        const filteredIds = filteredGroups.map(g => g.id);
                        setSelectedGroups(prev => [...new Set([...prev, ...filteredIds])]);
                      }
                    }}
                    style={{ marginRight: '10px' }}
                  >
                    <FiCheck /> {selectedGroups.length === filteredGroups.length && filteredGroups.length > 0 ? 'Deselect All' : 'Select All'}
                  </button>
                  <button className="refresh-btn" onClick={handleRefreshGroups} disabled={isRefreshing}>
                    <FiRefreshCw className={isRefreshing ? "spinning" : ""} /> Sync Targets
                  </button>
                  <button 
                    className="refresh-btn" 
                    onClick={() => {
                      if (!selectedAccount) {
                        addToast("Select an account first", 'error');
                        return;
                      }
                      (dispatch as any)(exportJoinedLinksTxt({ accountId: selectedAccount.id }));
                    }}
                    style={{ marginLeft: '10px' }}
                  >
                    <FiDownload /> Extract Joined Links (.txt)
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
      {/* Toasts */}
      <div className="telegram-toasts" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => (
            <div key={t.id} style={{ 
                padding: '12px 20px', 
                background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#dcfce7' : '#eff6ff',
                color: t.type === 'error' ? '#991b1b' : t.type === 'success' ? '#166534' : '#1e40af',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${t.type === 'error' ? '#fecaca' : t.type === 'success' ? '#bbf7d0' : '#dbeafe'}`,
                minWidth: '250px',
                animation: 'slideIn 0.3s ease'
            }}>
                {t.message}
            </div>
        ))}
      </div>
    </div>
  );
};

export default TelegramChatModal;
