import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiUserPlus, FiSearch, FiSend, FiGlobe, FiX, FiPause, FiPlay,
  FiActivity, FiCheckCircle, FiAlertCircle, FiClock, FiWifi, FiWifiOff,
  FiChevronRight, FiZap, FiRefreshCw, FiCheck, FiArchive,
} from "react-icons/fi";
import {
  startAccountTask, cancelAccountTask, pauseAccountTask, resumeAccountTask,
  getAccountTasks, getTelegramGroups, archiveAllGroupsAndChannels, TgTaskType,
} from "../../store/telegram/telegramServices";
import "../styles/telegram-workspace.css";

interface Account {
  id: string;
  name?: string;
  phoneNumber?: string;
  connected?: boolean;
}

interface Task {
  id: string;
  accountId: string;
  type: TgTaskType;
  label: string;
  status: "queued" | "running" | "paused" | "completed" | "failed" | "cancelled";
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
  progress: number;
  error?: string;
  result?: any;
  createdAt: number;
  logs?: { ts: number; level: string; message: string }[];
}

interface Group {
  id: string;
  name?: string;
  memberCount?: number;
  username?: string;
  access_hash?: string;
}

interface Props {
  socket: any;
  telegramAccounts: Account[];
}

const TASK_META: Record<string, { icon: JSX.Element; color: string; label: string }> = {
  join:     { icon: <FiUserPlus />, color: "#16a34a", label: "Join Groups" },
  scrape:   { icon: <FiSearch />,   color: "#9333ea", label: "Extract / Scrape" },
  campaign: { icon: <FiSend />,     color: "#2563eb", label: "Campaign" },
  discover: { icon: <FiGlobe />,    color: "#0891b2", label: "Discover" },
  import:   { icon: <FiUserPlus />, color: "#d97706", label: "Import Members" },
  export:   { icon: <FiActivity />, color: "#475569", label: "Export" },
};

const STATUS_META: Record<string, { color: string; label: string }> = {
  queued:    { color: "#94a3b8", label: "Queued" },
  running:   { color: "#2563eb", label: "Running" },
  paused:    { color: "#d97706", label: "Paused" },
  completed: { color: "#16a34a", label: "Completed" },
  failed:    { color: "#dc2626", label: "Failed" },
  cancelled: { color: "#64748b", label: "Cancelled" },
};

const TelegramWorkspace: React.FC<Props> = ({ socket, telegramAccounts }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // tasksByAccount[accountId] = { taskId: Task }
  const [tasksByAccount, setTasksByAccount] = useState<Record<string, Record<string, Task>>>({});
  const [activeAction, setActiveAction] = useState<TgTaskType>("join");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // ── Action form state (per action type) ──
  const [joinList, setJoinList] = useState("");
  const [joinDelay, setJoinDelay] = useState(3);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [discoverKeyword, setDiscoverKeyword] = useState("");
  const [campaignMsg, setCampaignMsg] = useState("");
  const [campaignDelay, setCampaignDelay] = useState(5);

  // ── Joined groups (for campaign target selection) ──
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first account
  useEffect(() => {
    if (!selectedId && telegramAccounts.length > 0) {
      setSelectedId(telegramAccounts[0].id);
    }
  }, [telegramAccounts, selectedId]);

  const showToast = useCallback((msg: string, type: string = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch this account's joined groups ──
  const fetchGroups = useCallback(async (accountId: string) => {
    setLoadingGroups(true);
    try {
      const data = await getTelegramGroups(accountId);
      const list: Group[] = (Array.isArray(data) ? data : []).map((g: any) => ({
        id: g?.id?.toString?.() ?? String(g?.id ?? ""),
        name: g?.name || g?.title || "Untitled",
        memberCount: g?.memberCount ?? g?.members ?? 0,
        username: g?.username,
        access_hash: g?.access_hash != null ? String(g.access_hash) : "",
      }));
      setGroups(list);
    } catch {
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  // Load groups + clear selection whenever the active account changes
  useEffect(() => {
    setSelectedGroupIds([]);
    setGroups([]);
    if (selectedId) fetchGroups(selectedId);
  }, [selectedId, fetchGroups]);

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllGroups = () => {
    setSelectedGroupIds((prev) =>
      prev.length === groups.length ? [] : groups.map((g) => g.id)
    );
  };

  const handleArchiveAll = async () => {
    if (!selectedId) return;
    if (!window.confirm("Archive ALL groups & channels for this account? Only private chats will remain in the main list.")) return;
    setArchiving(true);
    try {
      await archiveAllGroupsAndChannels(selectedId);
      showToast("All groups & channels archived", "success");
      fetchGroups(selectedId);
    } catch (e: any) {
      showToast(e?.response?.data?.error || e?.message || "Failed to archive", "error");
    } finally {
      setArchiving(false);
    }
  };

  // ── Fetch tasks when selecting an account ──
  useEffect(() => {
    if (!selectedId) return;
    getAccountTasks(selectedId)
      .then((tasks: Task[]) => {
        setTasksByAccount((prev) => {
          const map: Record<string, Task> = {};
          (tasks || []).forEach((t) => { map[t.id] = t; });
          return { ...prev, [selectedId]: map };
        });
      })
      .catch(() => {/* ignore */});
  }, [selectedId]);

  // ── Live socket updates (namespaced by accountId) ──
  useEffect(() => {
    if (!socket) return;

    const onUpdate = (data: { accountId: string; task: Task }) => {
      if (!data?.accountId || !data?.task) return;
      setTasksByAccount((prev) => ({
        ...prev,
        [data.accountId]: { ...(prev[data.accountId] || {}), [data.task.id]: data.task },
      }));
    };

    const onLog = (data: { accountId: string; taskId: string; log: any }) => {
      if (!data?.accountId || !data?.taskId) return;
      setTasksByAccount((prev) => {
        const acct = prev[data.accountId];
        const task = acct?.[data.taskId];
        if (!task) return prev;
        const logs = [...(task.logs || []), data.log].slice(-50);
        return {
          ...prev,
          [data.accountId]: { ...acct, [data.taskId]: { ...task, logs } },
        };
      });
    };

    socket.on("account-task-update", onUpdate);
    socket.on("account-task-log", onLog);
    return () => {
      socket.off("account-task-update", onUpdate);
      socket.off("account-task-log", onLog);
    };
  }, [socket]);

  const accountTasks = (id: string | null): Task[] => {
    if (!id) return [];
    return Object.values(tasksByAccount[id] || {}).sort((a, b) => b.createdAt - a.createdAt);
  };

  const activeTaskCount = (id: string): number =>
    accountTasks(id).filter((t) => t.status === "running" || t.status === "queued" || t.status === "paused").length;

  // ── Launch a task ──
  const launch = async (type: TgTaskType, label: string, payload: any) => {
    if (!selectedId) return;
    try {
      await startAccountTask(selectedId, type, label, payload);
      showToast(`${label} started`, "success");
    } catch (e: any) {
      showToast(e?.response?.data?.error || e?.message || "Failed to start task", "error");
    }
  };

  const handleLaunch = () => {
    if (activeAction === "join") {
      const groups = joinList.split("\n").map((l) => l.trim()).filter(Boolean);
      if (groups.length === 0) return showToast("Add at least one group link", "error");
      launch("join", `Join ${groups.length} groups`, { groups, config: { delayBetweenJoins: joinDelay * 1000 } });
    } else if (activeAction === "scrape") {
      if (!scrapeUrl.trim()) return showToast("Enter a group URL", "error");
      launch("scrape", `Scrape ${scrapeUrl}`, { inviteLink: scrapeUrl.trim() });
    } else if (activeAction === "discover") {
      if (!discoverKeyword.trim()) return showToast("Enter a keyword", "error");
      launch("discover", `Discover "${discoverKeyword}"`, { keyword: discoverKeyword.trim(), limit: 500 });
    } else if (activeAction === "campaign") {
      if (selectedGroupIds.length === 0) return showToast("Select at least one target group", "error");
      if (!campaignMsg.trim()) return showToast("Enter a message", "error");
      const targetGroups = groups
        .filter((g) => selectedGroupIds.includes(g.id))
        .map((g) => ({ id: g.id, access_hash: g.access_hash, title: g.name, username: g.username }));
      launch("campaign", `Campaign → ${targetGroups.length} groups`, {
        groups: targetGroups,
        message: campaignMsg.trim(),
        config: { delayBetweenMessages: campaignDelay * 1000 },
      });
    }
  };

  const doCancel = async (taskId: string) => {
    if (!selectedId) return;
    await cancelAccountTask(selectedId, taskId).catch(() => {});
  };
  const doPause = async (taskId: string) => {
    if (!selectedId) return;
    await pauseAccountTask(selectedId, taskId).catch(() => {});
  };
  const doResume = async (taskId: string) => {
    if (!selectedId) return;
    await resumeAccountTask(selectedId, taskId).catch(() => {});
  };

  const selectedAccount = telegramAccounts.find((a) => a.id === selectedId);
  const tasks = accountTasks(selectedId);
  const runningTask = tasks.find((t) => t.status === "running");

  return (
    <div className="tgw-root">
      {/* ── Account sidebar ── */}
      <aside className="tgw-accounts">
        <div className="tgw-accounts-head">
          <span>Connected Accounts</span>
          <span className="tgw-count-pill">{telegramAccounts.length}</span>
        </div>
        <div className="tgw-accounts-list">
          {telegramAccounts.length === 0 && (
            <div className="tgw-no-accounts">No accounts connected yet.</div>
          )}
          {telegramAccounts.map((acc) => {
            const active = activeTaskCount(acc.id);
            const isSel = acc.id === selectedId;
            return (
              <button
                key={acc.id}
                className={`tgw-account ${isSel ? "active" : ""}`}
                onClick={() => setSelectedId(acc.id)}
              >
                <div className="tgw-account-avatar">
                  {(acc.name || acc.phoneNumber || acc.id).charAt(0).toUpperCase()}
                  <span className={`tgw-status-dot ${acc.connected ? "on" : "off"}`} />
                </div>
                <div className="tgw-account-info">
                  <span className="tgw-account-name">{acc.name || acc.phoneNumber || acc.id}</span>
                  <span className="tgw-account-sub">
                    {acc.connected ? <><FiWifi size={11} /> Online</> : <><FiWifiOff size={11} /> Offline</>}
                  </span>
                </div>
                {active > 0 && <span className="tgw-active-badge">{active}</span>}
                <FiChevronRight className="tgw-chevron" />
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Workspace ── */}
      <section className="tgw-workspace">
        {!selectedAccount ? (
          <div className="tgw-empty">
            <FiActivity size={42} />
            <p>Select an account to manage its tasks</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="tgw-ws-head">
              <div>
                <h2>{selectedAccount.name || selectedAccount.phoneNumber}</h2>
                <span className="tgw-ws-sub">
                  {selectedAccount.phoneNumber} · {activeTaskCount(selectedAccount.id)} active task(s)
                </span>
              </div>
              {runningTask && (
                <div className="tgw-now-running">
                  <FiZap /> {runningTask.label} · {runningTask.progress}%
                </div>
              )}
            </div>

            {/* Action launcher */}
            <div className="tgw-launcher">
              <div className="tgw-action-tabs">
                {(["join", "scrape", "campaign", "discover"] as TgTaskType[]).map((t) => (
                  <button
                    key={t}
                    className={`tgw-action-tab ${activeAction === t ? "active" : ""}`}
                    onClick={() => setActiveAction(t)}
                    style={activeAction === t ? { background: TASK_META[t].color } : {}}
                  >
                    {TASK_META[t].icon} {TASK_META[t].label}
                  </button>
                ))}
              </div>

              <div className="tgw-action-body">
                {activeAction === "join" && (
                  <>
                    <textarea
                      placeholder={"Group links, one per line\n@username\nhttps://t.me/joinchat/..."}
                      value={joinList}
                      onChange={(e) => setJoinList(e.target.value)}
                    />
                    <div className="tgw-action-row">
                      <label>Delay (s)
                        <input type="number" min={1} value={joinDelay} onChange={(e) => setJoinDelay(Number(e.target.value))} />
                      </label>
                      <button className="tgw-launch-btn" onClick={handleLaunch}>Start Joining</button>
                    </div>
                  </>
                )}
                {activeAction === "scrape" && (
                  <div className="tgw-action-row">
                    <input
                      type="text"
                      placeholder="t.me/group_username or invite link"
                      value={scrapeUrl}
                      onChange={(e) => setScrapeUrl(e.target.value)}
                    />
                    <button className="tgw-launch-btn" onClick={handleLaunch}>Extract Members</button>
                  </div>
                )}
                {activeAction === "discover" && (
                  <div className="tgw-action-row">
                    <input
                      type="text"
                      placeholder="Keyword: crypto, marketing, real estate..."
                      value={discoverKeyword}
                      onChange={(e) => setDiscoverKeyword(e.target.value)}
                    />
                    <button className="tgw-launch-btn" onClick={handleLaunch}>Discover</button>
                  </div>
                )}
                {activeAction === "campaign" && (
                  <>
                    {/* Target group selector — pick from this account's joined groups */}
                    <div className="tgw-groups-toolbar">
                      <span className="tgw-groups-title">
                        Target Groups
                        <span className="tgw-groups-count">
                          {selectedGroupIds.length}/{groups.length} selected
                        </span>
                      </span>
                      <div className="tgw-groups-actions">
                        <button onClick={toggleAllGroups} disabled={groups.length === 0}>
                          <FiCheck /> {selectedGroupIds.length === groups.length && groups.length > 0 ? "Deselect all" : "Select all"}
                        </button>
                        <button onClick={() => selectedId && fetchGroups(selectedId)} disabled={loadingGroups}>
                          <FiRefreshCw className={loadingGroups ? "tgw-spin" : ""} /> Refresh
                        </button>
                        <button className="tgw-archive-btn" onClick={handleArchiveAll} disabled={archiving}>
                          <FiArchive /> {archiving ? "Archiving…" : "Archive all groups"}
                        </button>
                      </div>
                    </div>

                    <div className="tgw-groups-grid">
                      {loadingGroups && <div className="tgw-groups-empty">Loading groups…</div>}
                      {!loadingGroups && groups.length === 0 && (
                        <div className="tgw-groups-empty">No joined groups found for this account.</div>
                      )}
                      {!loadingGroups && groups.map((g) => {
                        const sel = selectedGroupIds.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            className={`tgw-group-card ${sel ? "selected" : ""}`}
                            onClick={() => toggleGroup(g.id)}
                          >
                            <span className="tgw-group-avatar">{(g.name || "?").charAt(0).toUpperCase()}</span>
                            <span className="tgw-group-info">
                              <span className="tgw-group-name">{g.name}</span>
                              <span className="tgw-group-members">{(g.memberCount || 0).toLocaleString()} members</span>
                            </span>
                            {sel && <FiCheck className="tgw-group-check" />}
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      placeholder="Your message..."
                      value={campaignMsg}
                      onChange={(e) => setCampaignMsg(e.target.value)}
                    />
                    <div className="tgw-action-row">
                      <label>Delay (s)
                        <input type="number" min={1} value={campaignDelay} onChange={(e) => setCampaignDelay(Number(e.target.value))} />
                      </label>
                      <button className="tgw-launch-btn" onClick={handleLaunch}>Launch Campaign</button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tasks list */}
            <div className="tgw-tasks">
              <h3>Tasks</h3>
              {tasks.length === 0 && <div className="tgw-no-tasks">No tasks yet for this account.</div>}
              {tasks.map((task) => {
                const meta = TASK_META[task.type] || TASK_META.export;
                const st = STATUS_META[task.status];
                const canCancel = ["running", "queued", "paused"].includes(task.status);
                const canPause = task.status === "running";
                const canResume = task.status === "paused";
                return (
                  <div key={task.id} className="tgw-task">
                    <div className="tgw-task-head">
                      <span className="tgw-task-icon" style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="tgw-task-label">{task.label}</span>
                      <span className="tgw-task-status" style={{ color: st.color, background: `${st.color}1a` }}>
                        {task.status === "completed" && <FiCheckCircle size={11} />}
                        {task.status === "failed" && <FiAlertCircle size={11} />}
                        {(task.status === "queued" || task.status === "paused") && <FiClock size={11} />}
                        {st.label}
                      </span>
                      <div className="tgw-task-controls">
                        {canPause && <button title="Pause" onClick={() => doPause(task.id)}><FiPause /></button>}
                        {canResume && <button title="Resume" onClick={() => doResume(task.id)}><FiPlay /></button>}
                        {canCancel && <button title="Cancel" className="danger" onClick={() => doCancel(task.id)}><FiX /></button>}
                      </div>
                    </div>

                    {task.total > 0 && (
                      <div className="tgw-progress">
                        <div className="tgw-progress-bar">
                          <div
                            className="tgw-progress-fill"
                            style={{ width: `${task.progress}%`, background: meta.color }}
                          />
                        </div>
                        <div className="tgw-progress-stats">
                          <span>{task.processed}/{task.total}</span>
                          <span className="ok">✓ {task.succeeded}</span>
                          <span className="bad">✗ {task.failed}</span>
                          <span>{task.progress}%</span>
                        </div>
                      </div>
                    )}

                    {task.error && <div className="tgw-task-error">{task.error}</div>}

                    {task.logs && task.logs.length > 0 && (
                      <div className="tgw-logs">
                        {task.logs.slice(-6).map((l, i) => (
                          <div key={i} className={`tgw-log ${l.level}`}>
                            <span className="tgw-log-time">
                              {new Date(l.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                            {l.message}
                          </div>
                        ))}
                        <div ref={logEndRef} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {toast && <div className={`tgw-toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default TelegramWorkspace;
