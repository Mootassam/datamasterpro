import React, { useState, useEffect, useRef, useCallback } from "react";
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
  FiGlobe,
  FiUpload,
  FiImage,
  FiTrash2,
  FiShield,
  FiWifi,
  FiWifiOff,
  FiArchive,
  FiFolderPlus,
  FiCornerDownRight,
  FiAlertTriangle,
  FiMessageSquare,
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
  joinBulkGroups,
  exportJoinedLinksTxt,
  createTelegramFolder,
  moveChatsToFolder,
  archiveTelegramChats,
  archiveAllGroupsAndChannels,
  deleteTelegramFolder,
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
  initialView?: "home" | "campaigns" | "scraper" | "groups" | "discovery";
  defaultAccountId?: string;
}

const TelegramChatModal: React.FC<TelegramChatModalProps> = ({
  onClose,
  dispatch,
  socket,
  availableGroups = [],
  onAccountSelect,
  telegramActiveAccounts,
  initialView = "scraper",
  defaultAccountId,
}) => {
  // ── View State ────────────────────────────────────────
  const [activeView, setActiveView] = useState<
    "home" | "campaigns" | "scraper" | "groups" | "discovery"
  >(initialView);

  // ── Campaign State ────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([{ text: "" }]);
  const [delay, setDelay] = useState<number>(3);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [useRandomDelay, setUseRandomDelay] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Scraper State ─────────────────────────────────────
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isScraping, setIsScraping] = useState(false);

  // ── Discovery State ───────────────────────────────────
  const [discoveryKeywords, setDiscoveryKeywords] = useState("");
  const [discoveredGroups, setDiscoveredGroups] = useState<any[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverFilter, setDiscoverFilter] = useState<"all" | "channels" | "groups">("all");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [joinGroupList, setJoinGroupList] = useState("");

  // ── Group & Folder State ──────────────────────────────
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>(availableGroups);

  // ── Account State ─────────────────────────────────────
  const [showAccountSelection, setShowAccountSelection] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // ── Import Members State ──────────────────────────────
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingGroup, setImportingGroup] = useState<Group | null>(null);
  const [importMembersList, setImportMembersList] = useState("");
  const [importDelay, setImportDelay] = useState(2000);
  const [importProgress, setImportProgress] = useState<any>(null);
  const [joinProgress, setJoinProgress] = useState<any>(null);

  // ── Scheduling State ──────────────────────────────────
  const [scheduleType, setScheduleType] = useState<"once" | "recurring">("once");
  const [repeatHours, setRepeatHours] = useState<number>(1);
  const [repeatUnit, setRepeatUnit] = useState<"hours" | "minutes">("hours");
  const [maxRepeats, setMaxRepeats] = useState<number | undefined>(undefined);
  const [repeatStats, setRepeatStats] = useState<{ current: number; max?: number } | null>(null);
  const [campaignProgress, setCampaignProgress] = useState<any>(null);

  // ── Folder Manager State ───────────────────────────
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [addSelectedToFolder, setAddSelectedToFolder] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // ── Move-to-folder State ───────────────────────────
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetFilterId, setMoveTargetFilterId] = useState<number | null>(null);
  const [isMovingToFolder, setIsMovingToFolder] = useState(false);

  // ── Archive State ──────────────────────────────────
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<"selected" | "all" | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // ── Delete Folder State ────────────────────────────
  const [folderToDelete, setFolderToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);

  // ── Socket Connection Status ──────────────────────────
  const [socketStatus, setSocketStatus] = useState<"connected" | "reconnecting" | "disconnected">(
    socket?.connected ? "connected" : "disconnected"
  );

  // ── Toasts ────────────────────────────────────────────
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: "success" | "error" | "info" }[]
  >([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => {
        if (prev.some((t) => t.message === message)) return prev;
        return [...prev, { id, message, type }];
      });
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // ── Redux Selectors ───────────────────────────────────
  const listTelegramGroups = useSelector(selectTelegramGroups as any) as any[];
  const dialogFilters = useSelector(selectDialogFilters as any) as any[];

  // ── Initialise with defaultAccountId ──────────────────
  useEffect(() => {
    if (defaultAccountId && telegramActiveAccounts.length > 0) {
      const found = (telegramActiveAccounts as any[]).find(
        (a) => a.id === defaultAccountId
      );
      if (found) {
        setSelectedAccount(found);
        setShowAccountSelection(false);
        dispatch(fetchTelegramGroups(found.id));
      }
    }
  }, []);

  // ── Socket connection status tracking ─────────────────
  useEffect(() => {
    if (!socket) return;
    const onConnect    = () => setSocketStatus("connected");
    const onDisconnect = () => setSocketStatus("disconnected");
    const onReconnecting = () => setSocketStatus("reconnecting");
    const onReconnect    = () => {
      setSocketStatus("connected");
      addToast("Reconnected to server", "success");
    };
    socket.on("connect",              onConnect);
    socket.on("disconnect",           onDisconnect);
    socket.io?.on("reconnect_attempt", onReconnecting);
    socket.io?.on("reconnect",         onReconnect);
    return () => {
      socket.off("connect",              onConnect);
      socket.off("disconnect",           onDisconnect);
      socket.io?.off("reconnect_attempt", onReconnecting);
      socket.io?.off("reconnect",         onReconnect);
    };
  }, [socket, addToast]);

  // ── Campaign progress socket listeners ────────────────
  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data: any) => setCampaignProgress(data);

    const handleComplete = (data: any) => {
      setIsSending(false);
      setCampaignProgress(null);
      addToast(
        `Campaign done ✓ Sent: ${data.result.sent.length}  ✗ Failed: ${data.result.failed.length}`,
        "success"
      );
    };

    const handleScheduled = (data: any) => {
      setIsSending(false);
      addToast(data.message, "success");
      if (data.repeatEvery) setRepeatStats({ current: 0, max: data.maxRepeats });
    };

    const handleRepeatStart = (data: any) => {
      if (data.repeatNumber !== undefined)
        setRepeatStats({ current: data.repeatNumber, max: data.maxRepeats });
    };

    const handleJoinStart = (data: any) =>
      setJoinProgress({ status: "starting", processed: 0, total: data.total ?? 0, joined: 0, failed: 0 });

    const handleJoinProgress = (data: any) => setJoinProgress(data);

    const handleJoinComplete = (data: any) => {
      setJoinProgress(null);
      addToast(
        `Join done ✓ Joined: ${data.result.joined.length}  ✗ Failed: ${data.result.failed.length}`,
        "success"
      );
    };

    const handleJoinLog = (data: any) => {
      if (data?.type === "warning") addToast(data.message, "info");
      if (data?.type === "error")   addToast(data.message, "error");
    };

    socket.on("campaign-progress",        handleProgress);
    socket.on("campaign-complete",        handleComplete);
    socket.on("campaign-scheduled",       handleScheduled);
    socket.on("campaign-repeat-start",    handleRepeatStart);
    socket.on("join-start",               handleJoinStart);
    socket.on("join-progress",            handleJoinProgress);
    socket.on("join-complete",            handleJoinComplete);
    socket.on("join-log",                 handleJoinLog);

    return () => {
      socket.off("campaign-progress",     handleProgress);
      socket.off("campaign-complete",     handleComplete);
      socket.off("campaign-scheduled",    handleScheduled);
      socket.off("campaign-repeat-start", handleRepeatStart);
      socket.off("join-start",            handleJoinStart);
      socket.off("join-progress",         handleJoinProgress);
      socket.off("join-complete",         handleJoinComplete);
      socket.off("join-log",              handleJoinLog);
    };
  }, [socket, addToast]);

  // ── Sync groups from Redux ────────────────────────────
  useEffect(() => {
    setGroups(listTelegramGroups.length > 0 ? listTelegramGroups : availableGroups);
  }, [availableGroups, listTelegramGroups]);

  // ── Import progress listener ──────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      if (selectedAccount && data.accountId === selectedAccount.id)
        setImportProgress(data);
    };
    socket.on("import-progress", handler);
    return () => socket.off("import-progress", handler);
  }, [socket, selectedAccount]);

  // ── Fetch folders when entering groups view ───────────
  useEffect(() => {
    if (activeView === "groups" && selectedAccount)
      dispatch(fetchDialogFilters(selectedAccount.id));
  }, [activeView, selectedAccount, dispatch]);

  // ── Drag & Drop ───────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
      setAttachmentPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
      setAttachmentPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setAttachmentPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearAllAttachments = useCallback(() => {
    attachmentPreviews.forEach((url) => URL.revokeObjectURL(url));
    setAttachments([]);
    setAttachmentPreviews([]);
  }, [attachmentPreviews]);

  // ── Stealth delay helper ──────────────────────────────
  const getEffectiveDelay = () => {
    if (!stealthMode) return delay * 1000;
    const variance = 0.3 + Math.random() * 0.4; // ±30-70% random variance
    const base = delay * 1000;
    return Math.round(base + base * variance * (Math.random() > 0.5 ? 1 : -1));
  };

  // ── Actions ───────────────────────────────────────────
  const handleScrape = async () => {
    if (!scrapeUrl || !selectedAccount) return;
    try {
      setIsScraping(true);
      setScrapedData(null);
      const result = await dispatch(
        scrapeTelegramMembers({ accountId: selectedAccount.id, inviteLink: scrapeUrl })
      );
      setScrapedData((result as any).payload);
    } catch (error) {
      addToast("Scrape failed. Check the link and try again.", "error");
    } finally {
      setIsScraping(false);
    }
  };

  const handleExportScraped = async (_format: "csv" | "txt") => {
    if (!scrapedData || !selectedAccount) return;
    try {
      await dispatch(
        exportTelegramGroupMembers({
          accountId: selectedAccount.id,
          groupId: scrapedData.group.id,
        })
      );
    } catch (error) {
      addToast("Export failed", "error");
    }
  };

  // Fixed: replaced alert() with toast + auto-switch view
  const handleAddScrapedToGroup = () => {
    if (!scrapedData) return;
    const membersList = scrapedData.members
      .map((m: any) => (m.username ? `@${m.username}` : m.phone || m.id))
      .join("\n");
    setImportMembersList(membersList);
    setActiveView("groups");
    addToast(
      `${scrapedData.members.length} members ready — select a target group to import them.`,
      "info"
    );
  };

  const handleImportMembers = async () => {
    if (!importingGroup || !selectedAccount) return;
    const members = importMembersList
      .split("\n")
      .map((m) => m.trim())
      .filter((m) => m);
    if (members.length === 0) return;
    try {
      setImportProgress({ status: "starting", processed: 0, total: members.length, added: 0, failed: 0 });
      await dispatch(
        importMembersToGroup({
          accountId: selectedAccount.id,
          groupId: importingGroup.id,
          members,
          config: { delayBetweenMembers: importDelay },
        })
      );
    } catch (error: any) {
      addToast(`Import failed: ${error.message}`, "error");
      setImportProgress((prev: any) => ({ ...prev, status: "error", message: error.message }));
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
      const results = await dispatch(
        discoverPublicGroupsOrChannels({
          accountId: selectedAccount.id,
          keyword: discoveryKeywords,
          limit: 1000,
          settings: {
            onlyChannels: discoverFilter === "channels",
            onlyGroups: discoverFilter === "groups",
          },
        })
      );
      setDiscoveredGroups((results as any).payload);
    } catch (error: any) {
      addToast(`Discovery failed: ${error.message || "Unknown error"}`, "error");
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
        const targetGroups = groups
          .filter((g) => selectedGroups.includes(g.id))
          .map((g) => ({
            id: g.id,
            access_hash: g.access_hash,
            title: g.name,
            username: g.username,
          }));

        const firstAttachment = attachments.length > 0 ? attachments[0] : undefined;

        await dispatch(
          sendBulkMessagesToTelegramGroups({
            accountId: selectedAccount.id,
            groups: targetGroups,
            message: validMessages[Math.floor(Math.random() * validMessages.length)].text,
            config: {
              delayBetweenMessages: getEffectiveDelay(),
              randomDelay: useRandomDelay || stealthMode,
              repeatEvery: scheduleType === "recurring" ? repeatHours : undefined,
              repeatUnit: scheduleType === "recurring" ? repeatUnit : undefined,
              maxRepeats: scheduleType === "recurring" ? maxRepeats : undefined,
              attachments: attachments.length > 1 ? attachments.slice(1) : [],
              stealthMode,
            },
            file: firstAttachment,
          })
        );

        if (scheduleType === "once") addToast("Campaign launched! Watch progress below.", "info");
      } catch (error: any) {
        addToast(`Campaign failed: ${error.message}`, "error");
        setIsSending(false);
      }
    } else {
      addToast("Add at least one message and select target groups.", "error");
      setIsSending(false);
    }
  };

  // ── Folder / Archive handlers ─────────────────────────
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedAccount) return;
    try {
      setIsCreatingFolder(true);
      const peersToAdd = addSelectedToFolder ? selectedGroups : [];
      await dispatch(createTelegramFolder({
        accountId: selectedAccount.id,
        folderName: newFolderName.trim(),
        peerIds: peersToAdd,
      }));
      addToast(`Folder "${newFolderName.trim()}" created${peersToAdd.length ? ` with ${peersToAdd.length} groups` : ""}`, "success");
      setNewFolderName("");
      setShowCreateFolderModal(false);
      // Refresh folders in sidebar
      dispatch(fetchDialogFilters(selectedAccount.id));
    } catch {
      addToast("Failed to create folder", "error");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleMoveToFolder = async () => {
    if (!selectedAccount || moveTargetFilterId === null || selectedGroups.length === 0) return;
    try {
      setIsMovingToFolder(true);
      await dispatch(moveChatsToFolder({
        accountId: selectedAccount.id,
        filterId: moveTargetFilterId,
        peerIds: selectedGroups,
      }));
      const folderName = dialogFilters.find((f: any) => {
        const id = f?.id != null ? Number(f.id) : null;
        return id === moveTargetFilterId;
      })?.title || "folder";
      addToast(`Moved ${selectedGroups.length} group${selectedGroups.length > 1 ? "s" : ""} to "${folderName}"`, "success");
      setShowMoveModal(false);
      setMoveTargetFilterId(null);
    } catch {
      addToast("Failed to move chats to folder", "error");
    } finally {
      setIsMovingToFolder(false);
    }
  };

  const handleArchiveSelected = async () => {
    if (!selectedAccount || selectedGroups.length === 0) return;
    try {
      setIsArchiving(true);
      await dispatch(archiveTelegramChats({
        accountId: selectedAccount.id,
        peerIds: selectedGroups,
      }));
      addToast(`Archived ${selectedGroups.length} group${selectedGroups.length > 1 ? "s" : ""}`, "success");
      setSelectedGroups([]);
      setShowArchiveConfirm(null);
    } catch {
      addToast("Failed to archive chats", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!selectedAccount || !folderToDelete) return;
    try {
      setIsDeletingFolder(true);
      await dispatch(deleteTelegramFolder({ accountId: selectedAccount.id, filterId: folderToDelete.id }));
      addToast(`Folder "${folderToDelete.title}" deleted`, "success");
      setFolderToDelete(null);
      if (selectedFolder === folderToDelete.id.toString()) setSelectedFolder(null);
    } catch {
      addToast("Failed to delete folder", "error");
    } finally {
      setIsDeletingFolder(false);
    }
  };

  const handleArchiveAll = async () => {
    if (!selectedAccount) return;
    try {
      setIsArchiving(true);
      const result: any = await dispatch(archiveAllGroupsAndChannels({ accountId: selectedAccount.id }));
      const count = result?.payload?.archived ?? "all";
      addToast(`Archived ${count} groups & channels — only private chats remain visible`, "success");
      setShowArchiveConfirm(null);
      // Refresh group list
      dispatch(fetchTelegramGroups(selectedAccount.id));
    } catch {
      addToast("Failed to archive groups/channels", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  const filteredGroups = selectedFolder
    ? groups.filter((g) => {
        const filter = dialogFilters.find((f: any, idx: number) => {
          const key = f?.id != null ? f.id.toString() : f?.title || String(idx);
          return key === selectedFolder;
        });
        if (!filter) return true;
        const peers = filter?.include_peers || filter?.pinned_peers || [];
        return peers?.some(
          (p: any) =>
            (p?.channel_id ?? p?.chat_id ?? p?.user_id)?.toString() === g.id
        );
      })
    : groups;

  // ── Reusable Discovery Grid ───────────────────────────
  const DiscoveryGrid = () => (
    <div className="scraper-view">
      <div className="scraper-header">
        <h2>Global Group Discovery</h2>
        <p>Find and target relevant communities at scale.</p>
      </div>

      <div className="scraper-input-section" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div className="url-input-wrapper" style={{ flex: 1, minWidth: 220 }}>
          <FiSearch />
          <input
            type="text"
            placeholder="Keywords: Crypto, Marketing, Real Estate..."
            value={discoveryKeywords}
            onChange={(e) => setDiscoveryKeywords(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 3,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--c-border)",
            padding: 3,
            borderRadius: "var(--r-md)",
          }}
        >
          {(["all", "channels", "groups"] as const).map((f) => (
            <button
              key={f}
              className={`view-btn ${discoverFilter === f ? "active" : ""}`}
              onClick={() => setDiscoverFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "16px 0",
            padding: "10px 14px",
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-md)",
            width: "100%",
            maxWidth: 920,
          }}
        >
          <span style={{ color: "var(--c-text-2)", fontWeight: 700, fontSize: "0.9rem" }}>
            {discoveredGroups.length} results found
          </span>
          <button
            onClick={() => {
              const allLinks = discoveredGroups.map((g) =>
                g.username ? `@${g.username}` : String(g.id)
              );
              const allSelected = allLinks.every((l) => selectedTargets.includes(l));
              setSelectedTargets(allSelected
                ? (prev) => prev.filter((t) => !allLinks.includes(t))
                : (prev) => [...new Set([...prev, ...allLinks])]
              );
            }}
            style={{
              background: "var(--c-surface-2)",
              border: "1px solid var(--c-border)",
              color: "var(--c-text-2)",
              borderRadius: "var(--r-md)",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {discoveredGroups.every((g) =>
              selectedTargets.includes(g.username ? `@${g.username}` : String(g.id))
            ) ? (
              <><FiX /> Deselect All</>
            ) : (
              <><FiCheck /> Select All</>
            )}
          </button>
        </div>
      )}

      <div className="groups-grid" style={{ width: "100%", maxWidth: 920 }}>
        {discoveredGroups.map((group) => {
          const link = group.username ? `@${group.username}` : String(group.id);
          const isSelected = selectedTargets.includes(link);
          return (
            <div
              key={group.id}
              className={`group-card ${isSelected ? "selected" : ""}`}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
              onClick={() =>
                setSelectedTargets((prev) =>
                  prev.includes(link) ? prev.filter((l) => l !== link) : [...prev, link]
                )
              }
            >
              <div className="group-card-header">
                <div className="group-avatar">{group.title.charAt(0)}</div>
                <div className="group-info">
                  <h5 title={group.title}>{group.title}</h5>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        background: isSelected ? "var(--c-accent-dim)" : "var(--c-surface-3)",
                        color: isSelected ? "var(--c-accent)" : "var(--c-text-3)",
                        padding: "2px 8px",
                        borderRadius: "var(--r-pill)",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {group.type === "channel" ? "CHANNEL" : "GROUP"}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--c-text-3)", display: "flex", alignItems: "center", gap: 4 }}>
                      <FiUserPlus size={11} /> {group.members?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="check-icon"><FiCheck size={18} /></div>
                )}
              </div>
              {group.username && (
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 10,
                    borderTop: `1px solid ${isSelected ? "rgba(42,171,238,0.2)" : "var(--c-border)"}`,
                    fontSize: "0.82rem",
                    color: isSelected ? "var(--c-accent)" : "var(--c-text-3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiLink size={13} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    t.me/{group.username}
                  </span>
                </div>
              )}
            </div>
          );
        })}
        {discoveredGroups.length === 0 && !isDiscovering && (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <FiGlobe size={44} style={{ opacity: 0.3, marginBottom: 16 }} />
            <p>Enter keywords to discover relevant groups globally.</p>
          </div>
        )}
      </div>

      {selectedTargets.length > 0 && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "var(--c-surface)",
            padding: "14px 20px",
            borderTop: "1px solid var(--c-border)",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <button
            className="launch-btn"
            style={{ maxWidth: 400 }}
            onClick={() => {
              const unique = [...new Set(selectedTargets)];
              setJoinGroupList((prev) => {
                const prevLines = prev.split("\n").map((l) => l.trim()).filter(Boolean);
                return [...new Set([...prevLines, ...unique])].join("\n");
              });
              setActiveView("home");
              addToast(`${unique.length} targets added to join list`, "success");
            }}
          >
            ADD {selectedTargets.length} SELECTED TO TARGETS
          </button>
        </div>
      )}
    </div>
  );

  // ── Account Selection Screen ──────────────────────────
  if (showAccountSelection) {
    return (
      <div className="telegram-modal-overlay">
        <div className="telegram-modal">
          <div className="telegram-modal-header">
            <div className="telegram-header-left">
              <RiShieldKeyholeLine className="telegram-header-icon" />
              <h3>Select Account</h3>
            </div>
            <button className="telegram-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
          <div className="telegram-modal-body">
            {(telegramActiveAccounts as any[]).length === 0 ? (
              <div className="no-accounts-container">
                <RiShieldKeyholeLine size={48} style={{ opacity: 0.3 }} />
                <h4>No Accounts Available</h4>
                <p>Add a Telegram account to get started.</p>
              </div>
            ) : (
              <div className="accounts-list">
                {(telegramActiveAccounts as any[]).map((account: any) => (
                  <div
                    key={account.id}
                    className="account-item"
                    onClick={() => {
                      dispatch(fetchTelegramGroups(account.id));
                      setSelectedAccount(account);
                      setShowAccountSelection(false);
                      if (onAccountSelect) onAccountSelect(account.id);
                    }}
                  >
                    <div className="account-avatar">{account.name.charAt(0)}</div>
                    <div className="account-details">
                      <span className="account-name">{account.name}</span>
                      <span className="account-phone">{account.phoneNumber}</span>
                    </div>
                    <FiChevronRight style={{ color: "var(--c-text-3)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main View ─────────────────────────────────────────
  return (
    <div className="telegram-modal-overlay">
      <div className="telegram-modal full-screen-modal">

        {/* Connection Status Banner */}
        {socketStatus !== "connected" && (
          <div className={`connection-status-bar ${socketStatus}`}>
            {socketStatus === "reconnecting" ? (
              <><FiRefreshCw className="spinning" style={{ display: "inline", marginRight: 6 }} />
                Reconnecting to server...</>
            ) : (
              <><FiWifiOff style={{ display: "inline", marginRight: 6 }} />
                Disconnected — operations continue in background, reconnecting...</>
            )}
          </div>
        )}

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
            <button className={`view-btn ${activeView === "home" ? "active" : ""}`} onClick={() => setActiveView("home")}>
              <RiRobot2Line /> Home
            </button>
            <button className={`view-btn ${activeView === "campaigns" ? "active" : ""}`} onClick={() => setActiveView("campaigns")}>
              <FiSend /> Campaigns
            </button>
            <button className={`view-btn ${activeView === "scraper" ? "active" : ""}`} onClick={() => setActiveView("scraper")}>
              <RiSpyLine /> Scraper
            </button>
            <button className={`view-btn ${activeView === "groups" ? "active" : ""}`} onClick={() => setActiveView("groups")}>
              <FiFolder /> Groups
            </button>
            <button className={`view-btn ${activeView === "discovery" ? "active" : ""}`} onClick={() => setActiveView("discovery")}>
              <FiGlobe /> Discovery
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Socket status indicator */}
            <div
              title={`Server: ${socketStatus}`}
              style={{ display: "flex", alignItems: "center", color: socketStatus === "connected" ? "var(--c-success)" : socketStatus === "reconnecting" ? "var(--c-warning)" : "var(--c-error)" }}
            >
              {socketStatus === "connected" ? <FiWifi size={16} /> : <FiWifiOff size={16} />}
            </div>
            <button className="telegram-close-btn" onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        <div className="telegram-modal-body no-padding">

          {/* HOME VIEW — Auto Join */}
          {activeView === "home" && (
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
                      placeholder={"Paste group links (one per line)\n@username\nhttps://t.me/joinchat/..."}
                      style={{ minHeight: 140 }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.85rem", color: "var(--c-text-3)" }}>
                    <span>{joinGroupList.split("\n").filter((l) => l.trim()).length} targets loaded</span>
                    <button
                      onClick={() => setJoinGroupList("")}
                      style={{ background: "none", border: "none", color: "var(--c-error)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
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
                      <input type="number" min={1} value={delay} onChange={(e) => setDelay(Number(e.target.value))} />
                    </div>
                    <div className="setting-item" style={{ display: "flex", alignItems: "flex-end" }}>
                      <div
                        className={`stealth-toggle ${stealthMode ? "active" : ""}`}
                        style={{ width: "100%" }}
                        onClick={() => setStealthMode((v) => !v)}
                      >
                        <FiShield size={16} />
                        <span className="stealth-toggle-label">
                          {stealthMode ? "STEALTH ON" : "STEALTH OFF"}
                        </span>
                        <div style={{ marginLeft: "auto" }}>
                          <div className={`toggle-switch ${stealthMode ? "on" : ""}`}>
                            <div className="toggle-knob" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  className="launch-btn"
                  disabled={!joinGroupList.trim()}
                  onClick={async () => {
                    const targets = joinGroupList.split("\n").filter((l) => l.trim());
                    if (!selectedAccount) { addToast("Select an account first", "error"); return; }
                    if (targets.length === 0) { addToast("Add at least one group target", "error"); return; }
                    setJoinProgress({ status: "starting", processed: 0, total: targets.length, joined: 0, failed: 0 });
                    addToast(`Starting to join ${targets.length} groups...`, "info");
                    try {
                      await (dispatch as any)(
                        joinBulkGroups({
                          accountId: selectedAccount.id,
                          groups: targets,
                          config: { delayBetweenJoins: getEffectiveDelay() },
                        })
                      ).unwrap();
                    } catch (err: any) {
                      addToast(err?.message || "Failed to start join process", "error");
                    }
                  }}
                >
                  START JOINING PROCESS
                </button>

                {joinProgress && (
                  <div className="campaign-settings" style={{ marginTop: 16 }}>
                    <h4><FiClock /> Progress</h4>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "var(--c-text-2)", fontWeight: 600, fontSize: "0.9rem" }}>
                      <span>Processed: {joinProgress.processed ?? 0} / {joinProgress.total ?? 0}</span>
                      <span style={{ color: "var(--c-success)" }}>✓ {joinProgress.joined ?? 0}</span>
                      <span style={{ color: "var(--c-error)" }}>✗ {joinProgress.failed ?? 0}</span>
                    </div>
                    <div className="progress-track" style={{ marginTop: 10 }}>
                      <div
                        className="progress-fill green"
                        style={{
                          width: `${Math.min(100, Math.floor(((joinProgress.processed ?? 0) / Math.max(1, joinProgress.total ?? 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DISCOVERY VIEW */}
          {activeView === "discovery" && <DiscoveryGrid />}

          {/* CAMPAIGNS VIEW */}
          {activeView === "campaigns" && (
            <div className="campaigns-view">
              <div className="campaign-setup">
                <div className="section-header">
                  <h4><FiTarget /> Precision Targeting</h4>
                  <button className="select-groups-btn" onClick={() => setActiveView("groups")}>
                    {selectedGroups.length} Targets Selected <FiChevronRight />
                  </button>
                </div>

                {/* Message Composer */}
                <div className="message-composer">
                  <h4><FiZap /> Messages</h4>
                  <p className="helper-text">
                    Add multiple message variants — one is picked randomly each send for anti-spam.
                  </p>
                  {messages.map((msg, idx) => (
                    <div key={idx} className="message-input-group">
                      <textarea
                        value={msg.text}
                        onChange={(e) => {
                          const newMsgs = [...messages];
                          newMsgs[idx] = { text: e.target.value };
                          setMessages(newMsgs);
                        }}
                        placeholder={`Message variant ${idx + 1}...`}
                      />
                      {messages.length > 1 && (
                        <button
                          onClick={() => setMessages((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="add-variant-btn"
                    onClick={() => setMessages((prev) => [...prev, { text: "" }])}
                  >
                    <FiPlus /> Add Variant
                  </button>
                </div>

                {/* Media Attachments */}
                <div className="message-composer">
                  <h4><FiImage /> Media Attachments</h4>
                  <p className="helper-text">Drag & drop or click to select images.</p>
                  <div
                    className={`drop-zone ${isDraggingOver ? "dragging-over" : ""} ${attachments.length > 0 ? "has-files" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    {attachments.length === 0 ? (
                      <div className="drop-zone-content">
                        <FiUpload size={30} />
                        <p>Drag photos here or click to browse</p>
                        <span>JPG · PNG · GIF · WEBP</span>
                      </div>
                    ) : (
                      <div className="attachments-preview">
                        {attachmentPreviews.map((url, idx) => (
                          <div key={idx} className="attachment-item">
                            <img src={url} alt={`Attachment ${idx + 1}`} />
                            <button
                              className="remove-btn"
                              onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                            >
                              <FiTrash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <div
                          className="add-more-btn"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          <FiPlus />
                        </div>
                      </div>
                    )}
                  </div>
                  {attachments.length > 0 && (
                    <div className="attachments-info">
                      <span>{attachments.length} photo{attachments.length > 1 ? "s" : ""} selected</span>
                      <button onClick={clearAllAttachments}>Clear All</button>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <div className="campaign-settings">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ margin: 0 }}><FiClock /> Velocity & Schedule</h4>
                    {repeatStats && (
                      <span
                        style={{
                          padding: "3px 12px",
                          background: "var(--c-accent-dim)",
                          border: "1px solid rgba(42,171,238,0.3)",
                          borderRadius: "var(--r-pill)",
                          color: "var(--c-accent)",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        Repeat {repeatStats.current}{repeatStats.max ? ` / ${repeatStats.max}` : ""}
                      </span>
                    )}
                  </div>
                  <div className="settings-grid">
                    <div className="setting-item">
                      <label>Delay (seconds)</label>
                      <input
                        type="number"
                        min={1}
                        value={delay}
                        onChange={(e) => setDelay(Number(e.target.value))}
                      />
                    </div>
                    <div className="setting-item">
                      <label>Schedule</label>
                      <select
                        value={scheduleType}
                        onChange={(e) => setScheduleType(e.target.value as any)}
                      >
                        <option value="once">Send Once</option>
                        <option value="recurring">Recurring</option>
                      </select>
                    </div>
                    {scheduleType === "recurring" && (
                      <>
                        <div className="setting-item">
                          <label>Repeat Every</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input
                              type="number"
                              min={1}
                              style={{ width: 80 }}
                              value={repeatHours}
                              onChange={(e) => setRepeatHours(Number(e.target.value))}
                            />
                            <select
                              value={repeatUnit}
                              onChange={(e) => setRepeatUnit(e.target.value as any)}
                            >
                              <option value="hours">Hours</option>
                              <option value="minutes">Minutes</option>
                            </select>
                          </div>
                        </div>
                        <div className="setting-item">
                          <label>Max Repeats (blank = unlimited)</label>
                          <input
                            type="number"
                            min={1}
                            placeholder="Unlimited"
                            value={maxRepeats || ""}
                            onChange={(e) =>
                              setMaxRepeats(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </div>
                      </>
                    )}
                    {/* Stealth + Random delay row */}
                    <div className="setting-item">
                      <label>Anti-Ban Options</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div
                          className={`stealth-toggle ${stealthMode ? "active" : ""}`}
                          style={{ flex: 1 }}
                          onClick={() => setStealthMode((v) => !v)}
                        >
                          <FiShield size={14} />
                          <span className="stealth-toggle-label">
                            {stealthMode ? "STEALTH ON" : "STEALTH OFF"}
                          </span>
                          <div style={{ marginLeft: "auto" }}>
                            <div className={`toggle-switch ${stealthMode ? "on" : ""}`}>
                              <div className="toggle-knob" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="setting-item">
                      <label>Random Delay</label>
                      <div
                        className={`stealth-toggle ${useRandomDelay ? "active" : ""}`}
                        onClick={() => setUseRandomDelay((v) => !v)}
                      >
                        <FiClock size={14} />
                        <span className="stealth-toggle-label">
                          {useRandomDelay ? "RANDOM ON" : "RANDOM OFF"}
                        </span>
                        <div style={{ marginLeft: "auto" }}>
                          <div className={`toggle-switch ${useRandomDelay ? "on" : ""}`}>
                            <div className="toggle-knob" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Progress */}
                {campaignProgress && (
                  <div className="campaign-progress-bar" style={{ marginTop: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.88rem", fontWeight: 700, color: "var(--c-text)" }}>
                      <span>Campaign Progress</span>
                      <span>{campaignProgress.processed} / {campaignProgress.total}</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${((campaignProgress.processed / Math.max(1, campaignProgress.total)) * 100).toFixed(1)}%` }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--c-success)" }}>✓ Sent: {campaignProgress.sent}</span>
                      <span style={{ color: "var(--c-error)" }}>✗ Failed: {campaignProgress.failed}</span>
                    </div>
                    {campaignProgress.lastAction && (
                      <div style={{ marginTop: 6, fontSize: "0.78rem", color: "var(--c-text-3)" }}>
                        {campaignProgress.lastAction.type === "error"
                          ? `Error — ${campaignProgress.lastAction.groupName}: ${campaignProgress.lastAction.error}`
                          : `Sent to ${campaignProgress.lastAction.groupName}`}
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="launch-btn"
                  style={{ marginTop: 20 }}
                  onClick={handleSend}
                  disabled={isSending || selectedGroups.length === 0}
                >
                  {isSending ? "LAUNCHING..." : "LAUNCH CAMPAIGN"}
                </button>
              </div>
            </div>
          )}

          {/* SCRAPER VIEW */}
          {activeView === "scraper" && (
            <div className="scraper-view">
              <div className="scraper-header">
                <h2>Lead Extractor</h2>
                <p>Scrape members from any public group or channel.</p>
              </div>

              <div className="scraper-input-section">
                <div className="url-input-wrapper">
                  <FiLink />
                  <input
                    type="text"
                    placeholder="t.me/group_username or invite link..."
                    value={scrapeUrl}
                    onChange={(e) => setScrapeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isScraping && handleScrape()}
                  />
                </div>
                <button
                  className="scrape-btn"
                  onClick={handleScrape}
                  disabled={isScraping || !scrapeUrl}
                >
                  {isScraping ? <FiRefreshCw className="spinning" /> : <FiSearch />}
                  {isScraping ? "EXTRACTING..." : "EXTRACT LEADS"}
                </button>
              </div>

              {scrapedData && (
                <div className="scraped-results">
                  <div className="result-card">
                    <div className="result-header">
                      <div className="group-info">
                        <h3>{scrapedData.group.name}</h3>
                        <span className="member-count">
                          {scrapedData.group.memberCount} members found
                        </span>
                      </div>
                      <div className="result-actions">
                        <button onClick={() => handleExportScraped("csv")}>
                          <FiDownload /> CSV
                        </button>
                        <button onClick={() => handleExportScraped("txt")}>
                          <FiDownload /> TXT
                        </button>
                        <button className="primary-action" onClick={handleAddScrapedToGroup}>
                          <FiUserPlus /> Add to Group
                        </button>
                      </div>
                    </div>
                    <div className="members-preview">
                      <h4>Members Preview</h4>
                      <div className="members-grid">
                        {scrapedData.members.slice(0, 50).map((m: any) => (
                          <div key={m.id} className="member-chip">
                            {m.username ? `@${m.username}` : m.firstName}
                          </div>
                        ))}
                        {scrapedData.members.length > 50 && (
                          <div className="more-members">
                            +{scrapedData.members.length - 50} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GROUPS VIEW */}
          {activeView === "groups" && (
            <div className="groups-view">
              <div className="folders-sidebar">
                <div className="sidebar-header">
                  <h4>Folders</h4>
                  <button
                    onClick={() => { if (selectedAccount) dispatch(fetchDialogFilters(selectedAccount.id)); }}
                    title="Sync folders"
                    disabled={!selectedAccount}
                  >
                    <FiRefreshCw size={15} />
                  </button>
                </div>
                <ul>
                  <li
                    className={!selectedFolder ? "active" : ""}
                    onClick={() => setSelectedFolder(null)}
                  >
                    <FiLayers size={15} /> All Chats
                  </li>
                  {dialogFilters.map((filter: any, index: number) => {
                    const key = filter?.id != null ? filter.id.toString() : filter?.title || String(index);
                    const title = filter?.title || `Folder ${index + 1}`;
                    return (
                      <li
                        key={key}
                        className={selectedFolder === key ? "active" : ""}
                        onClick={() => setSelectedFolder(key)}
                        style={{ justifyContent: "space-between" }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                          <FiFolder size={14} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {title}
                          </span>
                        </span>
                        <button
                          title="Delete folder"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFolderToDelete({ id: filter?.id != null ? Number(filter.id) : index, title });
                          }}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--err, #dc2626)", padding: "2px 4px",
                            borderRadius: 4, display: "flex", alignItems: "center",
                            opacity: 0.5, flexShrink: 0, transition: "opacity 0.15s",
                          }}
                          onMouseOver={e => (e.currentTarget.style.opacity = "1")}
                          onMouseOut={e => (e.currentTarget.style.opacity = "0.5")}
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="groups-list-container">
                <div className="groups-toolbar" style={{ flexDirection: "column", alignItems: "stretch", padding: "10px 18px", gap: 10 }}>
                  {/* Top row: stats + refresh */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ color: "var(--txt3)", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {filteredGroups.length} Groups
                      {selectedGroups.length > 0 && (
                        <span style={{ marginLeft: 8, color: "var(--p)", fontWeight: 800 }}>
                          · {selectedGroups.length} selected
                        </span>
                      )}
                    </span>

                    <div style={{ display: "flex", gap: 6 }}>
                      {/* Select / Deselect all */}
                      <button
                        className="refresh-btn"
                        onClick={() => {
                          if (selectedGroups.length === filteredGroups.length && filteredGroups.length > 0) {
                            const ids = filteredGroups.map((g) => g.id);
                            setSelectedGroups((prev) => prev.filter((id) => !ids.includes(id)));
                          } else {
                            const ids = filteredGroups.map((g) => g.id);
                            setSelectedGroups((prev) => [...new Set([...prev, ...ids])]);
                          }
                        }}
                      >
                        <FiCheck size={13} />
                        {selectedGroups.length === filteredGroups.length && filteredGroups.length > 0
                          ? "Deselect All"
                          : "Select All"}
                      </button>

                      <button className="refresh-btn" onClick={handleRefreshGroups} disabled={isRefreshing}>
                        <FiRefreshCw size={13} className={isRefreshing ? "spinning" : ""} /> Refresh
                      </button>

                      <button
                        className="refresh-btn"
                        onClick={() => {
                          if (!selectedAccount) { addToast("Select an account first", "error"); return; }
                          (dispatch as any)(exportJoinedLinksTxt({ accountId: selectedAccount.id }));
                        }}
                      >
                        <FiDownload size={13} /> Export Links
                      </button>
                    </div>
                  </div>

                  {/* Action bar — always visible */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {/* ── Create Folder ── */}
                    <button
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 13px", borderRadius: "var(--r-sm)",
                        border: "1px solid var(--border)", background: "var(--surf)",
                        color: "var(--p)", fontWeight: 700, fontSize: "0.78rem",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = "var(--p-lt)")}
                      onMouseOut={e => (e.currentTarget.style.background = "var(--surf)")}
                      onClick={() => setShowCreateFolderModal(true)}
                    >
                      <FiFolderPlus size={14} /> Create Folder
                    </button>

                    {/* ── Move to Folder (only when groups selected + folders exist) ── */}
                    {selectedGroups.length > 0 && dialogFilters.length > 0 && (
                      <button
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 13px", borderRadius: "var(--r-sm)",
                          border: "1px solid var(--border)", background: "var(--surf)",
                          color: "var(--txt2)", fontWeight: 700, fontSize: "0.78rem",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = "var(--surf2)")}
                        onMouseOut={e => (e.currentTarget.style.background = "var(--surf)")}
                        onClick={() => setShowMoveModal(true)}
                      >
                        <FiCornerDownRight size={14} /> Move to Folder ({selectedGroups.length})
                      </button>
                    )}

                    {/* ── Archive Selected ── */}
                    {selectedGroups.length > 0 && (
                      <button
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "7px 13px", borderRadius: "var(--r-sm)",
                          border: "1px solid rgba(217,119,6,.3)", background: "var(--warn-lt)",
                          color: "var(--warn)", fontWeight: 700, fontSize: "0.78rem",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                        onClick={() => setShowArchiveConfirm("selected")}
                      >
                        <FiArchive size={14} /> Archive Selected ({selectedGroups.length})
                      </button>
                    )}

                    {/* ── Archive All Groups/Channels ── */}
                    <button
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 13px", borderRadius: "var(--r-sm)",
                        border: "1px solid rgba(220,38,38,.3)", background: "var(--err-lt)",
                        color: "var(--err)", fontWeight: 700, fontSize: "0.78rem",
                        cursor: "pointer", marginLeft: "auto", transition: "all 0.15s",
                      }}
                      onClick={() => setShowArchiveConfirm("all")}
                    >
                      <FiMessageSquare size={14} /> Keep Only Chats
                    </button>
                  </div>
                </div>

                <div className="groups-grid-container">
                  <div className="groups-grid">
                    {filteredGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`group-card ${selectedGroups.includes(group.id) ? "selected" : ""}`}
                        onClick={() =>
                          setSelectedGroups((prev) =>
                            prev.includes(group.id)
                              ? prev.filter((id) => id !== group.id)
                              : [...prev, group.id]
                          )
                        }
                      >
                        <div className="group-card-header">
                          <div className="group-avatar">{group.name.charAt(0)}</div>
                          <div className="group-info">
                            <h5>{group.name}</h5>
                            <span>{group.memberCount?.toLocaleString()} members</span>
                          </div>
                          {selectedGroups.includes(group.id) && (
                            <FiCheck className="check-icon" />
                          )}
                        </div>
                        <div className="group-card-actions">
                          <button
                            title="Import Members"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImportingGroup(group);
                              setShowImportModal(true);
                            }}
                          >
                            <FiUserPlus size={15} />
                          </button>
                          <button
                            title="Export CSV"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedAccount)
                                dispatch(
                                  exportTelegramGroupMembers({
                                    accountId: selectedAccount.id,
                                    groupId: group.id,
                                  })
                                );
                            }}
                          >
                            <FiDownload size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Folder Modal ────────────────────────── */}
      {showCreateFolderModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--r-sm)",
                background: "var(--p-lt)", border: "1px solid var(--p-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--p)",
              }}>
                <FiFolderPlus size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--txt)" }}>
                Create New Folder
              </h3>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Folder Name
              </label>
              <input
                type="text"
                placeholder="e.g. Crypto Groups, Hot Leads..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
                style={{
                  width: "100%", padding: "10px 12px",
                  border: "1.5px solid var(--border)", borderRadius: "var(--r-sm)",
                  background: "var(--surf2)", color: "var(--txt)",
                  fontSize: "0.9rem", outline: "none", transition: "border-color 0.15s",
                  boxSizing: "border-box",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--p)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
            </div>

            {selectedGroups.length > 0 && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 13px", borderRadius: "var(--r-sm)",
                  background: "var(--surf2)", border: "1px solid var(--border)",
                  marginBottom: 14, cursor: "pointer",
                }}
                onClick={() => setAddSelectedToFolder((v) => !v)}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4,
                  border: `2px solid ${addSelectedToFolder ? "var(--p)" : "var(--border2)"}`,
                  background: addSelectedToFolder ? "var(--p)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.15s",
                }}>
                  {addSelectedToFolder && <FiCheck size={11} color="#fff" />}
                </div>
                <span style={{ fontSize: "0.85rem", color: "var(--txt2)", fontWeight: 500 }}>
                  Add <strong>{selectedGroups.length} selected group{selectedGroups.length > 1 ? "s" : ""}</strong> to this folder
                </span>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => { setShowCreateFolderModal(false); setNewFolderName(""); }}>
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleCreateFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
              >
                {isCreatingFolder ? <><FiRefreshCw className="spinning" size={13} /> Creating...</> : <><FiFolderPlus size={13} /> Create Folder</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Move to Folder Modal ────────────────────────── */}
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "var(--r-sm)",
                background: "var(--p-lt)", border: "1px solid var(--p-dim)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "var(--p)",
              }}>
                <FiCornerDownRight size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--txt)" }}>
                  Move to Folder
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--txt3)" }}>
                  {selectedGroups.length} group{selectedGroups.length > 1 ? "s" : ""} selected
                </p>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Select Target Folder
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
                {dialogFilters.map((f: any, idx: number) => {
                  const id = f?.id != null ? Number(f.id) : idx;
                  const title = f?.title || `Folder ${idx + 1}`;
                  const isChosen = moveTargetFilterId === id;
                  return (
                    <div
                      key={id}
                      onClick={() => setMoveTargetFilterId(id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 13px", borderRadius: "var(--r-sm)",
                        border: `1.5px solid ${isChosen ? "var(--p)" : "var(--border)"}`,
                        background: isChosen ? "var(--p-lt)" : "var(--surf2)",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <FiFolder size={16} color={isChosen ? "var(--p)" : "var(--txt3)"} />
                      <span style={{ fontWeight: 600, color: isChosen ? "var(--p)" : "var(--txt)", fontSize: "0.9rem" }}>
                        {title}
                      </span>
                      {isChosen && <FiCheck size={15} style={{ marginLeft: "auto", color: "var(--p)" }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => { setShowMoveModal(false); setMoveTargetFilterId(null); }}>
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleMoveToFolder}
                disabled={isMovingToFolder || moveTargetFilterId === null}
              >
                {isMovingToFolder
                  ? <><FiRefreshCw className="spinning" size={13} /> Moving...</>
                  : <><FiCornerDownRight size={13} /> Move {selectedGroups.length} Group{selectedGroups.length > 1 ? "s" : ""}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Archive Confirmation Modal ──────────────────── */}
      {showArchiveConfirm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 420 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, padding: "8px 0 20px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: showArchiveConfirm === "all" ? "var(--err-lt)" : "var(--warn-lt)",
                border: `1px solid ${showArchiveConfirm === "all" ? "rgba(220,38,38,.25)" : "rgba(217,119,6,.25)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FiAlertTriangle size={24} color={showArchiveConfirm === "all" ? "var(--err)" : "var(--warn)"} />
              </div>

              {showArchiveConfirm === "selected" ? (
                <>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--txt)" }}>
                    Archive {selectedGroups.length} Group{selectedGroups.length > 1 ? "s" : ""}?
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--txt3)", lineHeight: 1.5, maxWidth: 320 }}>
                    The selected groups will be moved to your Telegram archive. You can unarchive them anytime from the Telegram app.
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "var(--txt)" }}>
                    Archive All Groups & Channels?
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--txt3)", lineHeight: 1.5, maxWidth: 340 }}>
                    All groups and channels will be moved to archive, leaving only <strong>private conversations</strong> visible in your main chat list. This keeps your inbox clean.
                  </p>
                  <div style={{
                    padding: "10px 16px", borderRadius: "var(--r-sm)",
                    background: "var(--p-lt)", border: "1px solid var(--p-dim)",
                    fontSize: "0.82rem", color: "var(--p)", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <FiMessageSquare size={14} /> Private chats are NOT affected
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowArchiveConfirm(null)} disabled={isArchiving}>
                Cancel
              </button>
              <button
                onClick={showArchiveConfirm === "selected" ? handleArchiveSelected : handleArchiveAll}
                disabled={isArchiving}
                style={{
                  padding: "8px 16px", borderRadius: "var(--r-sm)",
                  cursor: isArchiving ? "not-allowed" : "pointer",
                  border: "none",
                  background: showArchiveConfirm === "all" ? "var(--err)" : "var(--warn)",
                  color: "#fff", fontWeight: 700, fontSize: "0.88rem",
                  display: "flex", alignItems: "center", gap: 7,
                  opacity: isArchiving ? 0.7 : 1,
                }}
              >
                {isArchiving
                  ? <><FiRefreshCw className="spinning" size={13} /> Archiving...</>
                  : <><FiArchive size={13} /> {showArchiveConfirm === "selected" ? "Archive Selected" : "Archive All Groups"}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Folder Confirmation Modal ───────────── */}
      {folderToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, padding: "8px 0 18px" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--err-lt, #fef2f2)",
                border: "1px solid rgba(220,38,38,.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FiTrash2 size={22} color="var(--err, #dc2626)" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--txt, #0f172a)" }}>
                Delete "{folderToDelete.title}"?
              </h3>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--txt3, #94a3b8)", lineHeight: 1.5, maxWidth: 300 }}>
                The folder will be deleted. Chats inside it will remain in your main chat list.
              </p>
            </div>
            <div className="modal-actions">
              <button onClick={() => setFolderToDelete(null)} disabled={isDeletingFolder}>Cancel</button>
              <button
                onClick={handleDeleteFolder}
                disabled={isDeletingFolder}
                style={{
                  padding: "8px 16px", borderRadius: "var(--r-sm, 6px)",
                  border: "none", background: "var(--err, #dc2626)", color: "#fff",
                  fontWeight: 700, fontSize: "0.88rem", cursor: isDeletingFolder ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  opacity: isDeletingFolder ? 0.7 : 1,
                }}
              >
                {isDeletingFolder
                  ? <><FiRefreshCw className="spinning" size={13} /> Deleting...</>
                  : <><FiTrash2 size={13} /> Delete Folder</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && importingGroup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Import to {importingGroup.name}</h3>
            <textarea
              value={importMembersList}
              onChange={(e) => setImportMembersList(e.target.value)}
              placeholder="Usernames or phone numbers, one per line..."
              rows={10}
            />
            <div className="setting-item" style={{ marginBottom: 16 }}>
              <label>Delay between imports (ms)</label>
              <input
                type="number"
                value={importDelay}
                onChange={(e) => setImportDelay(Number(e.target.value))}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowImportModal(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleImportMembers}>
                Start Import
              </button>
            </div>
            {importProgress && (
              <div className="progress-bar" style={{ marginTop: 16 }}>
                <div
                  className="fill"
                  style={{
                    width: `${((importProgress.processed / Math.max(1, importProgress.total)) * 100).toFixed(1)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="telegram-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`telegram-toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelegramChatModal;
