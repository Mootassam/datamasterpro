import { Server } from "socket.io";

/**
 * AccountTaskManager
 * ──────────────────
 * Provides fully-isolated, per-account task execution.
 *
 *  • Each Telegram account has its OWN sequential task queue.
 *  • Accounts run in parallel with each other — a failure, flood-wait, or
 *    disconnection on one account NEVER affects the others.
 *  • Every task runs inside its own error boundary (try/catch). A thrown
 *    error is captured into the task's state and the queue keeps going.
 *  • Tasks can be paused, resumed and cancelled individually.
 *  • All state changes are pushed to the frontend through namespaced
 *    socket events ("account-task-update" / "account-task-log") that always
 *    carry the accountId, so the UI can route them to the right panel.
 */

export type TaskType = "join" | "scrape" | "campaign" | "discover" | "import" | "export";

export type TaskStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface TaskLog {
  ts: number;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface Task {
  id: string;
  accountId: string;
  type: TaskType;
  label: string;
  status: TaskStatus;
  processed: number;
  total: number;
  succeeded: number;
  failed: number;
  progress: number; // 0-100
  logs: TaskLog[];
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  payload: any;
}

/** Context handed to every executor so it can report back and respect control signals. */
export interface TaskContext {
  taskId: string;
  accountId: string;
  io: Server;
  /** Returns true if the task was cancelled — executors must check this in their loops. */
  isCancelled: () => boolean;
  /** Resolves once the task is un-paused (or immediately if not paused). Also throws if cancelled. */
  waitIfPaused: () => Promise<void>;
  /** Report incremental progress. */
  reportProgress: (p: Partial<Pick<Task, "processed" | "total" | "succeeded" | "failed">>) => void;
  /** Append a log line (also streamed to the UI). */
  log: (level: TaskLog["level"], message: string) => void;
}

type Executor = (payload: any, ctx: TaskContext) => Promise<any>;

class AccountTaskManagerClass {
  /** accountId -> taskId -> Task */
  private tasks: Map<string, Map<string, Task>> = new Map();
  /** accountId -> ordered list of queued taskIds waiting to run */
  private queues: Map<string, string[]> = new Map();
  /** accountId -> whether a task is currently running for that account */
  private running: Map<string, boolean> = new Map();
  /** taskId -> cancellation flag */
  private cancelFlags: Map<string, boolean> = new Map();
  /** taskId -> pause flag */
  private pauseFlags: Map<string, boolean> = new Map();
  /** Registered executors by task type */
  private executors: Map<TaskType, Executor> = new Map();

  /** Register the function that actually performs a given task type. */
  registerExecutor(type: TaskType, fn: Executor) {
    this.executors.set(type, fn);
  }

  private ensureAccount(accountId: string) {
    if (!this.tasks.has(accountId)) this.tasks.set(accountId, new Map());
    if (!this.queues.has(accountId)) this.queues.set(accountId, []);
    if (!this.running.has(accountId)) this.running.set(accountId, false);
  }

  private genId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** Create + enqueue a task for an account. Returns the task immediately (status "queued"). */
  enqueue(
    accountId: string,
    type: TaskType,
    label: string,
    payload: any,
    io: Server
  ): Task {
    this.ensureAccount(accountId);

    const task: Task = {
      id: this.genId(),
      accountId,
      type,
      label,
      status: "queued",
      processed: 0,
      total: 0,
      succeeded: 0,
      failed: 0,
      progress: 0,
      logs: [],
      createdAt: Date.now(),
      payload,
    };

    this.tasks.get(accountId)!.set(task.id, task);
    this.queues.get(accountId)!.push(task.id);
    this.cancelFlags.set(task.id, false);
    this.pauseFlags.set(task.id, false);

    this.emitUpdate(task, io);
    // Kick the queue (fire-and-forget — isolated per account)
    void this.drain(accountId, io);
    return task;
  }

  /** Process the account's queue one task at a time. Never throws. */
  private async drain(accountId: string, io: Server) {
    if (this.running.get(accountId)) return; // already draining
    this.running.set(accountId, true);

    try {
      const queue = this.queues.get(accountId)!;
      while (queue.length > 0) {
        const taskId = queue.shift()!;
        const task = this.tasks.get(accountId)?.get(taskId);
        if (!task) continue;
        if (this.cancelFlags.get(taskId)) {
          task.status = "cancelled";
          task.finishedAt = Date.now();
          this.emitUpdate(task, io);
          continue;
        }
        await this.runTask(task, io);
      }
    } finally {
      this.running.set(accountId, false);
    }
  }

  /** Run a single task inside a complete error boundary. */
  private async runTask(task: Task, io: Server) {
    const executor = this.executors.get(task.type);
    if (!executor) {
      task.status = "failed";
      task.error = `No executor registered for task type "${task.type}"`;
      task.finishedAt = Date.now();
      this.emitUpdate(task, io);
      return;
    }

    task.status = "running";
    task.startedAt = Date.now();
    this.pushLog(task, "info", `Task started: ${task.label}`, io);
    this.emitUpdate(task, io);

    const ctx: TaskContext = {
      taskId: task.id,
      accountId: task.accountId,
      io,
      isCancelled: () => this.cancelFlags.get(task.id) === true,
      waitIfPaused: async () => {
        // Spin while paused; bail out if cancelled
        while (this.pauseFlags.get(task.id) && !this.cancelFlags.get(task.id)) {
          if (task.status !== "paused") {
            task.status = "paused";
            this.emitUpdate(task, io);
          }
          await new Promise((r) => setTimeout(r, 500));
        }
        if (task.status === "paused" && !this.cancelFlags.get(task.id)) {
          task.status = "running";
          this.emitUpdate(task, io);
        }
        if (this.cancelFlags.get(task.id)) {
          throw new CancelledError();
        }
      },
      reportProgress: (p) => {
        if (p.processed !== undefined) task.processed = p.processed;
        if (p.total !== undefined) task.total = p.total;
        if (p.succeeded !== undefined) task.succeeded = p.succeeded;
        if (p.failed !== undefined) task.failed = p.failed;
        task.progress =
          task.total > 0 ? Math.min(100, Math.round((task.processed / task.total) * 100)) : 0;
        this.emitUpdate(task, io);
      },
      log: (level, message) => this.pushLog(task, level, message, io),
    };

    try {
      const result = await executor(task.payload, ctx);
      if (this.cancelFlags.get(task.id)) {
        task.status = "cancelled";
        this.pushLog(task, "warn", "Task cancelled.", io);
      } else {
        task.status = "completed";
        task.result = result;
        task.progress = 100;
        this.pushLog(task, "success", `Task completed: ${task.label}`, io);
      }
    } catch (err: any) {
      if (err instanceof CancelledError || this.cancelFlags.get(task.id)) {
        task.status = "cancelled";
        this.pushLog(task, "warn", "Task cancelled.", io);
      } else {
        // ── ERROR BOUNDARY ── one task failing never propagates.
        task.status = "failed";
        task.error = this.errMsg(err);
        this.pushLog(task, "error", `Task failed: ${task.error}`, io);
      }
    } finally {
      task.finishedAt = Date.now();
      this.emitUpdate(task, io);
    }
  }

  cancelTask(accountId: string, taskId: string, io: Server): boolean {
    const task = this.tasks.get(accountId)?.get(taskId);
    if (!task) return false;
    this.cancelFlags.set(taskId, true);
    this.pauseFlags.set(taskId, false);
    // If still queued (not yet running), mark cancelled now
    if (task.status === "queued") {
      task.status = "cancelled";
      task.finishedAt = Date.now();
      this.emitUpdate(task, io);
    }
    return true;
  }

  pauseTask(accountId: string, taskId: string, io: Server): boolean {
    const task = this.tasks.get(accountId)?.get(taskId);
    if (!task || (task.status !== "running" && task.status !== "queued")) return false;
    this.pauseFlags.set(taskId, true);
    return true;
  }

  resumeTask(accountId: string, taskId: string, io: Server): boolean {
    const task = this.tasks.get(accountId)?.get(taskId);
    if (!task) return false;
    this.pauseFlags.set(taskId, false);
    return true;
  }

  /** Cancel every active task for an account (used on logout/disconnect). */
  cancelAllForAccount(accountId: string, io: Server) {
    const accountTasks = this.tasks.get(accountId);
    if (!accountTasks) return;
    for (const task of accountTasks.values()) {
      if (task.status === "running" || task.status === "queued" || task.status === "paused") {
        this.cancelTask(accountId, task.id, io);
      }
    }
  }

  getAccountTasks(accountId: string): Task[] {
    const map = this.tasks.get(accountId);
    if (!map) return [];
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  getAllTasks(): Record<string, Task[]> {
    const out: Record<string, Task[]> = {};
    for (const [accountId] of this.tasks) {
      out[accountId] = this.getAccountTasks(accountId);
    }
    return out;
  }

  /** Remove finished tasks older than `maxAgeMs` to keep memory bounded. */
  pruneOld(maxAgeMs = 1000 * 60 * 30) {
    const now = Date.now();
    for (const map of this.tasks.values()) {
      for (const [id, task] of map) {
        const finished =
          task.status === "completed" || task.status === "failed" || task.status === "cancelled";
        if (finished && task.finishedAt && now - task.finishedAt > maxAgeMs) {
          map.delete(id);
          this.cancelFlags.delete(id);
          this.pauseFlags.delete(id);
        }
      }
    }
  }

  // ── helpers ──────────────────────────────────────────────────────────────
  private pushLog(task: Task, level: TaskLog["level"], message: string, io: Server) {
    const entry: TaskLog = { ts: Date.now(), level, message };
    task.logs.push(entry);
    if (task.logs.length > 200) task.logs.shift(); // bound log size
    try {
      io.emit("account-task-log", { accountId: task.accountId, taskId: task.id, log: entry });
    } catch {/* never let emit crash a task */}
  }

  private emitUpdate(task: Task, io: Server) {
    try {
      // Strip nothing heavy — logs are small and bounded
      io.emit("account-task-update", { accountId: task.accountId, task: this.serialize(task) });
    } catch {/* never let emit crash a task */}
  }

  private serialize(task: Task) {
    return {
      id: task.id,
      accountId: task.accountId,
      type: task.type,
      label: task.label,
      status: task.status,
      processed: task.processed,
      total: task.total,
      succeeded: task.succeeded,
      failed: task.failed,
      progress: task.progress,
      error: task.error,
      result: task.result,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      finishedAt: task.finishedAt,
      logs: task.logs.slice(-50),
    };
  }

  private errMsg(err: any): string {
    if (!err) return "Unknown error";
    if (err.error_message) return String(err.error_message);
    if (err.message) return String(err.message);
    try { return JSON.stringify(err); } catch { return "Unknown error"; }
  }
}

export class CancelledError extends Error {
  constructor() {
    super("Task cancelled");
    this.name = "CancelledError";
  }
}

// Singleton
const AccountTaskManager = new AccountTaskManagerClass();

// Periodic cleanup of old finished tasks
setInterval(() => AccountTaskManager.pruneOld(), 1000 * 60 * 10).unref?.();

export default AccountTaskManager;
