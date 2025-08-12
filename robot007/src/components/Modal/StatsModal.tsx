import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiAlertTriangle,
  FiInfo,
  FiSend,
} from "react-icons/fi";
import "../styles/stats.css";
import { ProcessCancel } from "../../store/generate/generateActions";
import { useDispatch, } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
interface SocketEvent {
  type: "status" | "progress" | "error";
  data: any;
  timestamp: number;
}

const RealTimeMonitorModal = ({
  socket,
  onClose,
  setShowMonitor
}: {
  socket: any;
  onClose: () => void;
  setShowMonitor: (show: boolean) => void;
}) => {
  const dispatch: ThunkDispatch<any, void, AnyAction> = useDispatch();

  const cancel = () => {
    dispatch(ProcessCancel("whatsapp"));
    setShowMonitor(false)
  };
  const [events, setEvents] = useState<SocketEvent[]>([]);
  const [stats, setStats] = useState({
    sent: 0,
    failed: 0,
    pending: 0,
    total: 0,
    lastMessage: "",
    lastNumber: "",
    startTime: 0,
    endTime: 0,
  });
  const [activeTab, setActiveTab] = useState<"live" | "stats">("live");

  useEffect(() => {
    if (!socket) return;

    const statusHandler = (data: any) => {
      const event = {
        type: "status" as const,
        data,
        timestamp: Date.now(),
      };

      setEvents((prev) => [event, ...prev].slice(0, 100));

      if (data.status === "started") {
        setStats((prev) => ({
          ...prev,
          startTime: Date.now(),
          total: data.total,
          pending: data.total,
          sent: 0,
          failed: 0,
        }));
      }
    };

    const progressHandler = (data: any) => {
      const event = {
        type: "progress" as const,
        data,
        timestamp: Date.now(),
      };

      setEvents((prev) => [event, ...prev].slice(0, 100));

      setStats((prev) => ({
        ...prev,
        lastMessage: data.lastMessage,
        lastNumber: data.lastNumber,
        sent: prev.sent + 1,
        pending: prev.total - data.current,
      }));
    };

    const errorHandler = (data: any) => {
      const event = {
        type: "error" as const,
        data,
        timestamp: Date.now(),
      };

      setEvents((prev) => [event, ...prev].slice(0, 100));

      setStats((prev) => ({
        ...prev,
        failed: prev.failed + 1,
        lastNumber: data.number,
      }));
    };

    socket.on("send-status", statusHandler);
    socket.on("send-progress", progressHandler);
    socket.on("send-error", errorHandler);

    return () => {
      socket.off("send-status", statusHandler);
      socket.off("send-progress", progressHandler);
      socket.off("send-error", errorHandler);
    };
  }, [socket]);

  const successRate = (stats.sent / (stats.sent + stats.failed)) * 100;
  const elapsedTime = stats.startTime
    ? ((stats.endTime || Date.now()) - stats.startTime) / 60000
    : 0;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="monitor-overlay">
      <div className="monitor-container">
        {/* Header */}
        <div className="monitor-header">
          <div className="monitor-header-content">
            <FiBarChart2 className="monitor-header-icon" />
            <div>
              <h2 className="monitor-title">Real-time Message Monitor</h2>
              <p className="monitor-subtitle">
                {stats.startTime
                  ? `Started at ${formatTime(stats.startTime)}`
                  : "Waiting for messages..."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="monitor-close-btn">
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="monitor-tabs">
          <button
            className={`monitor-tab ${
              activeTab === "live" ? "monitor-tab--active" : ""
            }`}
            onClick={() => setActiveTab("live")}
          >
            <FiSend /> Live Events
          </button>
          <button
            className={`monitor-tab ${
              activeTab === "stats" ? "monitor-tab--active" : ""
            }`}
            onClick={() => setActiveTab("stats")}
          >
            <FiBarChart2 /> Statistics
          </button>
        </div>

        {/* Content */}
        <div className="monitor-content">
          {activeTab === "stats" ? (
            <div className="stats-view">
              {/* Stats Cards */}
              <div className="stats-grid">
                <div className="stats-card stats-card--success">
                  <div className="stats-value">{stats.sent}</div>
                  <div className="stats-label">
                    <FiCheckCircle /> Successful
                  </div>
                </div>

                <div className="stats-card stats-card--failed">
                  <div className="stats-value">{stats.failed}</div>
                  <div className="stats-label">
                    <FiXCircle /> Failed
                  </div>
                </div>

                <div className="stats-card stats-card--info">
                  <div className="stats-value">
                    {isNaN(successRate) ? "0" : successRate.toFixed(1)}%
                  </div>
                  <div className="stats-label">Success Rate</div>
                </div>
              </div>

              {/* Current Status */}
              <div className="status-section">
                <h3 className="section-header">
                  <FiInfo className="section-icon" /> Current Status
                </h3>
                <div className="status-grid">
                  <div className="status-item">
                    <div className="status-label">Last Number</div>
                    <div className="status-value">
                      {stats.lastNumber || "None yet"}
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-label">Last Message</div>
                    <div className="status-value truncate">
                      {stats.lastMessage || "None yet"}
                    </div>
                  </div>
                  <div className="status-item">
                    <div className="status-label">Pending</div>
                    <div className="status-value">{stats.pending}</div>
                  </div>
                  <div className="status-item">
                    <div className="status-label">Elapsed Time</div>
                    <div className="status-value">
                      {elapsedTime.toFixed(1)} minutes
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Tips */}
              {stats.failed > 0 && (
                <div className="recommendations">
                  <h3 className="recommendations-header">
                    <FiAlertTriangle /> Recommendations
                  </h3>
                  <ul className="recommendations-list">
                    <li>• {stats.failed} messages failed to send</li>
                    <li>• Consider increasing delay between messages</li>
                    <li>• Verify phone numbers are registered on WhatsApp</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="events-view">
              <div className="events-list">
                {events.length === 0 ? (
                  <div className="empty-state">
                    Waiting for message events...
                  </div>
                ) : (
                  events.map((event, index) => (
                    <div
                      key={index}
                      className={`event-item ${
                        event.type === "error"
                          ? "event-item--error"
                          : event.type === "progress"
                          ? "event-item--progress"
                          : "event-item--status"
                      }`}
                    >
                      <div className="event-content">
                        <div className="event-details">
                          <div className="event-title">
                            {event.type === "error"
                              ? "Failed to send"
                              : event.type === "progress"
                              ? "Message sent"
                              : "Status update"}
                          </div>
                          <div className="event-description">
                            {event.type === "error"
                              ? `Error sending to ${event.data.number}: ${event.data.error}`
                              : event.type === "progress"
                              ? `Sent to ${event.data.lastNumber}: "${event.data.lastMessage}"`
                              : JSON.stringify(event.data)}
                          </div>
                        </div>
                        <div className="event-time">
                          {formatTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="monitor-footer">
          <div className="events-count">{events.length} events logged</div>
          <div className="monitor-actions">
            <button
              onClick={() => setEvents([])}
              className="action-btn action-btn--secondary"
            >
              Clear Logs
            </button>
            <button onClick={cancel} className="action-btn action-btn--primary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitorModal;
