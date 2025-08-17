
import React, { useEffect, useState, useCallback, useMemo } from "react";
import io, { Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { FaCogs } from "react-icons/fa";

import {
  checkphonedetail,
  checkWhatsApp,
  download,
  generateNumbers,
  login,
  logout,
  connectionState,
  getUserDetails,
  generateEmails,
  verifyEmails,
  logoutAll,
  // Disconnect,
  allAccounts,
} from "../store/generate/generateActions";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import {
  selectphoneNumbers,
  selectGenerateLoading,
  checkLoading,
  fileLoading,
  phonedetail,
  connectionStates,
  showContact,
  allaccounts,
} from "../store/generate/generateselectors";
import countries from "../utils/Countries";
import statess from "../utils/States";
import ChatModal from "./Modal/ChatModal ";
import ProgressModal from "./Modal/VerificationModalProps ";
import VerificationSetupModal from "./Modal/VerificationSetupModal";
import QrModal from "./Modal/QRModal";
import ContactModal from "./Modal/ContactModal";
import TelegramAuthModal from "./Modal/TelegramAuthModal";
import GenerateProps from "./GenerateProps";
import TableProps from "./tableProps";
import Errors from "../modules/shared/error";
import SettingsModal from "./Modal/SettingsModal";
import FileStatsModal from "./Modal/FileStatsModal";
import { uploadFile } from "../store/generate/generateService";
import { getNumbers, setShowContact } from "../store/generate/generateReducer";
import { proxyDetails } from "../store/proxy/proxySelector";
import Toast from "../shared/Message/Toast";
import CountdownModal from "./Modal/CountdownModal";
import HeaderModal from "./Modal/Header";
import TelegramChatModal from "./Modal/TelegramChatModal";
import EmailManagementModal from "./Modal/EmailManagementModal";
import { verifyTelegramNumbers } from "../store/telegram/TelegramActions";
import { selectConnectedAccounts } from "../store/telegram/TelegramSelectors";
import TelegramExportProgressModal from "./Modal/TelegramExportProgress";
interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface Account {
  id: string;
  name: string;
  avatar?: string;
  status: "connected" | "disconnected";
}
interface VerificationPausedData {
  message: string;
  waitTime: number;
  nextAvailableAccount: {
    id: string;
    phoneNumber: string;
    availableAt: string;
  };
}

interface OperationFailedData {
  operation: string;
  error: string;
  progress: {
    processed: number;
    total: number;
    successRate: number;
  };
  floodedAccounts: Array<{
    id: string;
    phoneNumber: string;
    waitTimeSeconds: number;
    formattedWaitTime: string;
  }>;
}

interface NumberVerifiedData {
  phoneNumber: string;
  status: 'registered' | 'not_registered';
  accountId: string;
}

interface VerificationErrorData {
  phoneNumber: string;
  error: string;
  accountId: string;
}

interface VerificationCompleteData {
  registered: number;
  rejected: number;
  total: number;
  processed: number;
  unprocessed: number;
  floodedAccounts: Array<{
    id: string;
    phoneNumber: string;
    waitTimeSeconds: number;
    formattedWaitTime: string;
  }>;
}

// types.ts
export interface ExportProgress {
  operationId: string;
  status: 'started' | 'progress' | 'completed' | 'error' | 'cancelled' | 'warning';
  accountId: string;
  groupId: string;
  progress?: number;
  currentCount?: number;
  total?: number | string;
  message?: string;
  error?: string;
  code?: number;
  batchSize?: number;
  currentStrategy?: string;
  uniqueMembers?: number;
  duration?: number;
  partialCount?: number;
}
function WhatsAppNumberGenerator() {
  const dispatch: ThunkDispatch<any, void, AnyAction> = useDispatch();
  const [filter, setFilter] = useState<
    "all" | "registered" | "rejected" | "pending"
  >("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState<
    "setup" | "progress" | "results" | null
  >(null);
  const [verificationConfig, setVerificationConfig] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [telegramApis, setTelegramApis] = useState([]);
  const [gender, setGender] = useState("male");
  const [progressData, setProgressData] = useState({
    batches: 0,
    progress: 0,
    total: 4,
    currentBatch: [],
    registeredCount: 0,
    rejectedCount: 0,
    eta: "",
  });
    const [telegramExportProgress, setTelegramExportProgress] = useState<ExportProgress | null>(null);

  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [EmailModalOpen, setEmailModalOpen] = useState(false);
const [tvPaused, setTvPaused] = useState<VerificationPausedData | null>(null);
const [tvFailed, setTvFailed] = useState<OperationFailedData | null>(null);
const [tvVerified, setTvVerified] = useState<NumberVerifiedData | null>(null);
const [tvError, setTvError] = useState<VerificationErrorData | null>(null);
const [tvComplete, setTvComplete] = useState<VerificationCompleteData | null>(null);
const [tvNotification, setTvNotification] = useState<{
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  details?: string;
  timestamp: string;
} | null>(null);

  // Then in your component, use it like this:

  // State management
  const [loading, setLoading] = useState(false);
  const [registeredNumbers, setRegisteredNumbers] = useState<string[]>([]);
  const [totalNumbers, setTotalNumbers] = useState<string[]>([]);
  const [rejectedNumbers, setRejectedNumbers] = useState<string[]>([]);
  const [qrcode, setQrcode] = useState("");
  const [displayQr, setDisplayQr] = useState(false);
  const [isFileOpen, setIsFileOpen] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  const [activeService, setActiveService] = useState("whatsapp");

  // Sample stats data
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState("");
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const showContactModal = useSelector(showContact);
  const stateConnetion = useSelector(connectionStates);

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [country, setCountry] = useState({ value: "HK", label: "HongKong" });
  const [state, setState] = useState({ value: "201", label: "" });
  const [carrier, setCarrier] = useState({
    value: "5",
    label: "CMHK (China Mobile Hong Kong)",
  });
  const [matchCount, setMatchCount] = useState("10");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  // Selectors
  const numbers = useSelector(selectphoneNumbers);
  const generateLoading = useSelector(selectGenerateLoading);
  const loadingCheck = useSelector(checkLoading);
  const uploadLoading = useSelector(fileLoading);
  const detailsphone = useSelector(phonedetail);
  // const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const proxies = useSelector(proxyDetails);
  const [duplicate, setDuplicateNumber] = useState();
  const [invalid, setInvalid] = useState();
  const [news] = useState();
  const all = useSelector(allaccounts);
  const [accoutnId, setAccountId] = useState("");
  const telegramAccounts = useSelector(selectConnectedAccounts);
  // Mock cancel function
  const handleCancelUpload = () => {
    // setUploadProgress(0);
    setIsFileOpen(false);
  };

  // Mock download function

// Remove the first handler (lines 1079-1094) and keep only this one:
const handleTelegramExportProgress = (data: ExportProgress) => {
  console.log('Telegram export progress:', data);
  setTelegramExportProgress(data);
  
  // Handle notifications
  if (data.status === 'completed') {
    toast.success(
      <div className="custom-toast">
        <strong>Export Completed</strong>
        <p>{data.message || 'Group members exported successfully'}</p>
      </div>,
      { autoClose: 3000 }
    );
    setTimeout(() => setTelegramExportProgress(null), 5000);
  } 
  else if (data.status === 'error') {
    toast.error(
      <div className="custom-toast">
        <strong>Export Failed</strong>
        <p>{data.message || 'Failed to export group members'}</p>
      </div>,
      { autoClose: 8000 }
    );
    setTimeout(() => setTelegramExportProgress(null), 10000);
  }
};
  
const handleDownloadExport  = () => {
  if (!telegramExportProgress) return;
  
  const { groupId, accountId } = telegramExportProgress;
  const url = `/api/export/download?groupId=${groupId}&accountId=${accountId}`;
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `telegram_${groupId}_members.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTelegramExportProgress(null);
};


  const handleStartVerification = (config) => {
    setVerificationConfig(config);
    setModalState("progress");
    handleCheckNumbers(config);
  };

  const cancel = () => {
    setModalState(null);
  };

  // Memoized values
  const filteredNumbers = useMemo(() => {
    return numbers
      .map((number) => ({
        number,
        status: registeredNumbers.includes(number)
          ? "registered"
          : rejectedNumbers.includes(number)
          ? "rejected"
          : "pending",
      }))
      .filter((item) => {
        if (filter === "all") return true;
        return item.status === filter;
      });
  }, [numbers, registeredNumbers, rejectedNumbers, filter]);

  // Socket initialization and cleanup
useEffect(() => {
    let newSocket: Socket | null = null;
    
    try {







      // Create socket with better error handling and reconnection settings
      newSocket = io("http://localhost:8082", {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });
      
      setSocket(newSocket);
      console.log(`Initializing socket for ${activeService} service`);
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast.error(
        <div className="custom-toast fatal-error">
          <strong>Connection Error</strong>
          <p>Failed to connect to the server. Please check if the server is running.</p>
        </div>,
        { autoClose: 8000 }
      );
      return;
    }

    const handleConnect = () => {
      setConnectionLoading(false);
    };

    const handleDisplayError = (data: any) => {
      if (!data) {
        toast.error(
          <div className="custom-toast fatal-error">
            <strong>Unknown Error</strong>
            <p>An unexpected error occurred</p>
          </div>,
          { autoClose: 5000 }
        );
        return;
      }
      
      // Handle different error types with appropriate messages
      if (data.isFatal) {
        toast.error(
          <div className="custom-toast fatal-error">
            <strong>Critical Error</strong>
            <p>{data.message || 'A critical error occurred'}</p>
            {data.code && <p>Error code: {data.code}</p>}
            {data.action && <p>Suggested action: {data.action}</p>}
          </div>,
          { autoClose: 8000 }
        );
      } else if (data.code === 'RATE_LIMIT') {
        toast.error(
          <div className="custom-toast warning">
            <strong>Rate Limited</strong>
            <p>{data.message}</p>
            <p>Please try again after {data.waitTime || 'some time'}</p>
          </div>,
          { autoClose: 10000 }
        );
      } else if (data.code === 'AUTH_ERROR') {
        toast.error(
          <div className="custom-toast auth-error">
            <strong>Authentication Error</strong>
            <p>{data.message}</p>
            <p>Please reconnect your account</p>
          </div>,
          { autoClose: 8000 }
        );
      } else {
        toast.error(
          <div className="custom-toast">
            <strong>{data.title || 'Error'}</strong>
            <p>{data.message || 'An error occurred'}</p>
          </div>, 
          { autoClose: 5000 }
        );
      }
      
      // Log error for debugging
      console.error('Error received:', data);
    };
    
    // Handle Telegram export progress updates


    const handleDisplaySuccess = (data: any) => {
      if (!data) {
        toast.success(
          <div className="custom-toast">
            <strong>Success</strong>
            <p>Operation completed successfully</p>
          </div>,
          { autoClose: 3000 }
        );
        return;
      }
      
      if (data.important) {
        toast.success(
          <div className="custom-toast important-success">
            <strong>{data.title || 'Success'}</strong>
            <p>{data.message}</p>
            {data.details && <p>{data.details}</p>}
          </div>,
          { autoClose: 5000 }
        );
      } else {
        toast.success(
          <div className="custom-toast">
            <strong>{data.title || 'Success'}</strong>
            <p>{data.message || 'Operation completed successfully'}</p>
          </div>,
          { autoClose: 3000 }
        );
      }
      
      // Log success for debugging
      console.log('Success event:', data);
    };

    const handleScanQrCode = (data: any) => {
      if (stateConnetion !== "connected") {
        setQrcode(data.qr);
        setAccountId(data.accountId);
        setDisplayQr(true);
      }
    };

    const handleClientConnect = (data: any) => {
      if (data.connect) {
        setQrcode("");
        setDisplayQr(false);
        dispatch(connectionState("connected"));
        dispatch(allAccounts());
        toast.success(
          <div className="custom-toast">
            <strong>WhatsApp Connected</strong>
            <p>You can now verify numbers</p>
          </div>,
          { autoClose: 3000 }
        );
      }
    };
    const handleSuccess = (data: any) => {
      toast.success(
        <div className="custom-toast">
          <strong>Success</strong>
          <p>{data.message}</p>
        </div>,
        { autoClose: 3000 }
      );
    };
    const handleClientDisconnect = (data: any) => {
      setQrcode("");
      setDisplayQr(false);
      // Enhanced disconnect handling
      const isBlocked = data.reason.includes("blocked");
      const isVersionIssue = data.reason.includes("version");
      const toastContent = (
        <div className={`custom-toast ${isBlocked ? "fatal-error" : ""}`}>
          <strong>
            {isBlocked ? "ACCOUNT BLOCKED" : "WhatsApp Disconnected"}
          </strong>
          <p>Reason: {data.reason || "Unknown"}</p>
          {isBlocked ? (
            <p className="recovery-instruction">
              Please use a different device/number or contact WhatsApp support
            </p>
          ) : (
            !isVersionIssue && <></>
          )}
        </div>
      );

      // const toastOptions = {
      //   autoClose: isBlocked ? false : 10000,
      //   className: isBlocked ? 'fatal-error-toast' : ''
      // };
      isBlocked && toast.error(toastContent);
    };

    // Enhanced progress handler
    const handleProgress = (data: any) => {
      setProgressData((prev) => ({
        ...prev,
        batches: data.batchesCompleted,
        progress: data.progress,
        total: data.totalBatches,
        currentBatch: data.currentBatch || [],
        registeredCount: data.registered || 0,
        rejectedCount: data.rejected || 0,
        eta: data.eta,
      }));

      // Auto-open modal on first progress
      if (!modalOpen && data.progress > 0) {
        setModalOpen(true);
      }
    };

    const showInfoBanner = (data: any) => {
      setModalOpen(false);
      toast.info(
        <div className="custom-toast fatal-info">
          <strong>Switched Account</strong>
          <p>{data}</p>
        </div>,
        { autoClose: 900 }
      );
    };
    // New: Handle blocked state during verification
    const handleVerificationBlocked = (data: any) => {
      setModalOpen(false);
      toast.error(
        <div className="custom-toast fatal-error">
          <strong>Verification Stopped</strong>
          <p>WhatsApp blocked the verification process</p>
          <p className="recovery-instruction">
            {data.suggestion || "Please try again later with different numbers"}
          </p>
        </div>,
        { autoClose: false }
      );
    };

    const handleDataUpdated = (data: any) => {
      setRegisteredNumbers(data.phoneNumberRegistred || []);
      setTotalNumbers(data.totalPhoneNumber || []);
      setRejectedNumbers(data.phoneNumberRejected || []);
    };

    const handleDone = () => {
      setLoading(false);
    };
    const handleTvPaused = (data: VerificationPausedData) => {
    setTvPaused(data);
  };

  const handleTvFailed = (data: OperationFailedData) => {
    // Ensure error is properly formatted as a string
    if (data && typeof data.error === 'object') {
      data = {
        ...data,
        error: typeof data.error === 'object' && data.error !== null 
          ? (data.error as any).message || JSON.stringify(data.error)
          : String(data.error)
      };
    }
    setTvFailed(data);
    
    // Show a toast notification for flood wait errors
    if (data.error && data.error.includes('flood wait')) {
      toast.warning(
        <div className="custom-toast warning">
          <strong>Account Rate Limited</strong>
          <p>{data.error}</p>
          {data.floodedAccounts.length > 0 && (
            <p>Wait time: {data.floodedAccounts[0].formattedWaitTime}</p>
          )}
          {data.floodedAccounts.length === 0 && (
            <p>Please add another account to continue verification</p>
          )}
        </div>,
        { autoClose: 8000 }
      );
    }
  };

  const handleTvVerified = (data: NumberVerifiedData) => {
    setTvVerified(data);
    setTimeout(() => setTvVerified(null), 5000);
  };

  const handleTvError = (data: VerificationErrorData) => {
    setTvError(data);
  };

  const handleTvComplete = (data: VerificationCompleteData) => {
    setTvComplete(data);
  };

  const handleTvAccountSwitched = (data: any) => {
    toast.info(
      <div className="tv-account-switched-toast">
        <strong>Account Switched</strong>
        <p>From: {data.oldAccountPhone}</p>
        <p>To: {data.newAccountPhone}</p>
        <p>Reason: Rate limit (wait: {data.formattedWaitTime})</p>
      </div>,
      { autoClose: 5000 }
    );
    
    // Show a more prominent notification if this is important
    if (data.reason === "flood_wait") {
      setTvNotification({
        type: "info",
        title: "Account Switched Due to Rate Limit",
        message: `Account ${data.oldAccountPhone} is rate limited. Automatically switched to ${data.newAccountPhone} to continue verification.`,
        details: `The rate-limited account will be available again after ${data.formattedWaitTime}.`,
        timestamp: new Date().toISOString()
      });
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => setTvNotification(null), 5000);
    }
  };

  // Only set up event listeners if socket was successfully created
  if (newSocket) {
    // Connection events
    newSocket.on("connect", handleConnect);
    newSocket.on("connect_error", (error) => {
      console.error('Socket connection error:', error);
      toast.error(
        <div className="custom-toast fatal-error">
          <strong>Connection Error</strong>
          <p>Failed to connect to the server. Please check if the server is running.</p>
        </div>,
        { autoClose: 8000 }
      );
    });
    
    newSocket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      if (reason === 'io server disconnect') {
        // Server disconnected us, try to reconnect
        newSocket?.connect();
      }
    });
    
    // Application events
    newSocket.on("display-error", handleDisplayError);
    newSocket.on("display-success", handleDisplaySuccess);
    newSocket.on("scan-qrcode", handleScanQrCode);
    newSocket.on("client-connect", handleClientConnect);
    newSocket.on("client-disconnect", handleClientDisconnect);
    newSocket.on("progress", handleProgress);
    newSocket.on("verification-blocked", handleVerificationBlocked);
    newSocket.on("done", handleDone);
    newSocket.on("data-updated", handleDataUpdated);


    // Telegram verification events
    newSocket.on("verification-paused", handleTvPaused);
    newSocket.on("operation-failed", handleTvFailed);
    newSocket.on("number-verified", handleTvVerified);
    newSocket.on("verification-error", handleTvError);
    newSocket.on("verification-complete", handleTvComplete);
    newSocket.on("account-switched", handleTvAccountSwitched);
    newSocket.on("display-info", (data) => showInfoBanner(data.message));
    newSocket.on("hide-success", () => setVisible(false));
    newSocket.on("success", handleSuccess);
  }

    // Register event listeners
    newSocket.on("status-update", (data) => {
      dispatch(connectionState(data.status));
    });
    newSocket.on("display-warning", (data) => {
      setMessage(data.message);
      setCountdown(data.duration);
      setVisible(true);
    });


    newSocket.on("display-info", (data) => showInfoBanner(data.message));
    newSocket.on("hide-success", () => setVisible(false));
    newSocket.on("success", handleSuccess);
    // Only set up event listeners if socket was successfully created
    if (newSocket) {
      // Connection events
      newSocket.on("connect", handleConnect);
      newSocket.on("connect_error", (error) => {
        console.error('Socket connection error:', error);
        toast.error(
          <div className="custom-toast fatal-error">
            <strong>Connection Error</strong>
            <p>Failed to connect to the server. Please check if the server is running.</p>
          </div>,
          { autoClose: 8000 }
        );
      });
      
      newSocket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        if (reason === 'io server disconnect') {
          // Server disconnected us, try to reconnect
          newSocket?.connect();
        }
      });
      
      // Application events
      newSocket.on("display-error", handleDisplayError);
      newSocket.on("display-success", handleDisplaySuccess);
      newSocket.on("telegram-export-progress", handleTelegramExportProgress);
      newSocket.on("scan-qrcode", handleScanQrCode);
      newSocket.on("client-connect", handleClientConnect);
      newSocket.on("client-disconnect", handleClientDisconnect);
      newSocket.on("progress", handleProgress);
      newSocket.on("verification-blocked", handleVerificationBlocked);
      newSocket.on("done", handleDone);
      newSocket.on("data-updated", handleDataUpdated);
      
      // Telegram verification events
      newSocket.on("verification-paused", handleTvPaused);
      newSocket.on("operation-failed", handleTvFailed);
      newSocket.on("number-verified", handleTvVerified);
      newSocket.on("verification-error", handleTvError);
      newSocket.on("verification-complete", handleTvComplete);
      newSocket.on("account-switched", handleTvAccountSwitched);
      
      // Account flood wait events
      newSocket.on("account-flood-wait", (data) => {
        setTvNotification({
          type: 'warning',
          title: 'Account Rate Limited',
          message: data.message,
          details: `This account will be available again after ${data.waitSeconds} seconds.`,
          timestamp: new Date().toISOString()
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => setTvNotification(null), 5000);
      });
      
      newSocket.on("account-flood-wait-update", (data) => {
        // Only update if we're showing a flood wait notification
        if (tvNotification && tvNotification.type === 'warning' && tvNotification.title.includes('Rate Limited')) {
          setTvNotification({
            ...tvNotification,
            details: `This account will be available again after ${data.formattedTime}.`
          });
        }
      });
      
      newSocket.on("account-flood-wait-complete", (data) => {
        toast.success(
          <div className="custom-toast">
            <strong>Account Available</strong>
            <p>{data.message}</p>
          </div>,
          { autoClose: 3000 }
        );
        
        // Clear any flood wait notification for this account
        if (tvNotification && tvNotification.type === 'warning' && tvNotification.message.includes(data.accountId)) {
          setTvNotification(null);
        }
      });

    newSocket.on("telegram-logout-error", (data) => {
      Toast.Error(data.error.message);
    });

    newSocket.on("error", (data) => {
      Toast.Error(data.message);
    });

    // Handle server-side connection termination for all clients
    newSocket.on("all-clients-disconnected", (data) => {
      // Clear local state
      setQrcode("");
      setDisplayQr(false);
      dispatch(connectionState("disconnected"));
      toast.success(data.message || "All connections terminated");
    });

    

    return () => {
      if (newSocket) {
        // Clean up all listeners
        newSocket.off("connect");
        newSocket.off("connect_error");
        newSocket.off("disconnect");
        newSocket.off("display-error");
        newSocket.off("display-success");
        newSocket.off("scan-qrcode");
        newSocket.off("client-connect");
        newSocket.off("client-disconnect");
        newSocket.off("progress");
        newSocket.off("verification-blocked");
        newSocket.off("done");
        newSocket.off("data-updated");
        newSocket.off("display-info");
        newSocket.off("display-warning");
        newSocket.off("success");
        newSocket.off("status-update");
        newSocket.off("hide-success");
        newSocket.off("telegram-logout-error");
        newSocket.off("error");
        newSocket.off("all-clients-disconnected");
        newSocket.off("email-sending-progress");
        
        // Telegram verification events
        newSocket.off("verification-paused");
        newSocket.off("operation-failed");
        newSocket.off("number-verified");
        newSocket.off("verification-error");
        newSocket.off("verification-complete");
        newSocket.off("account-switched");
        newSocket.off("account-flood-wait");
        newSocket.off("account-flood-wait-update");
        newSocket.off("account-flood-wait-complete");

              newSocket.off("telegram-export-progress", handleTelegramExportProgress);

        
        // Disconnect socket
        newSocket.disconnect();
        console.log('Socket disconnected and cleaned up');
      }
    }
  };
}, [stateConnetion, activeService, dispatch, accoutnId]);

  const handleGenerate = useCallback(async () => {
    try {
      if (activeService == "email") {
        await dispatch(generateEmails({ matchCount, country, gender }));
      } else {
        await dispatch(
          generateNumbers({
            country: country,
            match: matchCount,
            state: state.value,
            carrier: carrier,
          })
        );
      }
    } catch (error) {
      toast.error("Failed to generate numbers");
    }
  }, [
    dispatch,
    country.value,
    matchCount,
    state.value,
    activeService,
    carrier,
  ]);

  // Handlers
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (selectedFile.type === "text/csv") {
        setFile(selectedFile);
        setFileError("");
      } else {
        setFileError("Invalid file type. Only CSV files are allowed.");
      }
    },
    []
  );

  const handleUpload = useCallback(async () => {
    setIsFileOpen(true);
    if (file) {
      try {
        setLoading(true);
        const response = await uploadFile(file);
        if (response) {
          setDuplicateNumber(response.duplicateNumbers);
          setInvalid(response.invalidNumbers);
          if (response.newNumbers) {
            dispatch(getNumbers(response.newNumbers));
          }
        }
        toast.success("File uploaded successfully");
      } catch (error) {
        toast.error("Failed to upload file");
      } finally {
        setLoading(false);
      }
    }
  }, [file, dispatch]);

  const handleCheckNumbers = useCallback(
    async (config) => {
      console.log("the currentActiveService", activeService);

      try {
        setModalState("progress");
        if (activeService === "whatsapp") {
          await dispatch(checkWhatsApp({ numbers, config })).unwrap();
        } else if (activeService === "telegram") {
          await dispatch(verifyTelegramNumbers({ numbers, config })).unwrap();
        } else {
          await dispatch(verifyEmails({ numbers, config })).unwrap();
        }
      } catch (error) {
        Errors.handle(error);
      } finally {
        // setModalState(null);
      }
    },
    [dispatch, numbers]
  );

  const handleDownload = useCallback(
    (data: string[], type: string) => {
      dispatch(download(data));
      toast.success(`Downloading ${type} numbers`);
    },
    [dispatch]
  );

  const handleConnect = useCallback(async () => {
    setConnectionLoading(true);
    try {
      await dispatch(login({}));
    } catch (err: any) {
      let errorMessage = err.message;
      let isFatal = false;

      if (err.message.includes("blocked")) {
        errorMessage = "Account temporarily blocked by WhatsApp";
        isFatal = true;
      } else if (err.message.includes("version")) {
        errorMessage = "Incompatible WhatsApp version";
        isFatal = true;
      }

      toast.error(
        <div className={`custom-toast ${isFatal ? "fatal-error" : ""}`}>
          <strong>Connection Error</strong>
          <p>{errorMessage}</p>
          {!isFatal && (
            <button className="reconnect-btn" onClick={() => handleConnect()}>
              Try Again
            </button>
          )}
        </div>,
        { autoClose: isFatal ? false : 5000 }
      );
    } finally {
      setConnectionLoading(false);
    }
  }, [dispatch, stateConnetion]);

  // Country and state options
  const countryOptions = useMemo(() => countries, []);
  const stateOptions = useMemo(() => {
    if (country?.value === "US") {
      return statess.USA.map((s) => ({ label: s.label, value: s.value }));
    } else if (country?.value === "CA") {
      return statess.canada.map((s) => ({ label: s.label, value: s.value }));
    }
    return [];
  }, [country]);

  const getDetail = async (number) => {
    if (activeService === "whatsapp") {
      await dispatch(checkphonedetail(number));
      // setIsContactModalOpen(true)
    } else {
      await dispatch(getUserDetails(number));
      // setIsContactModalOpen(true)
    }
  };

  // const LoginTelegram = (phone) => {
  //   dispatch(authTelegram(phone));
  // };
  // const confirmTelegramOtp = async (phone, otp) => {
  //   dispatch(confirmOTP({ phone, otp, codehash }));
  // };

  const cancelConnection = useCallback(async () => {
    try {
      // Clear local state first to immediately update UI
      setQrcode("");
      setDisplayQr(false);
      dispatch(connectionState("disconnected"));

      // Notify server to cancel the connection
      if (socket) {
        // Emit cancel-connection event to server
        console.log(accoutnId);

        socket.emit("cancel-connection", { accountId: accoutnId });

        // Wait a moment for the server to process the cancellation
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success("Connection cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel connection");
      console.error("Cancel error:", error);
    }
  }, [socket, dispatch]);
  // State for connection
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // User data
  const [user] = useState<User>({
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/path/to/avatar.jpg",
  });

  // Accounts state - separate for each service
  const [accounts, setAccounts] = useState<{
    whatsapp: Account[];
    telegram: Account[];
    email: Account[];
  }>({
    whatsapp: [
      {
        id: "1",
        name: "Business Account",
        status: "connected",
        avatar: "/whatsapp-avatar1.jpg",
      },
      { id: "2", name: "Marketing Account", status: "disconnected" },
    ],
    telegram: [{ id: "t1", name: "Main Telegram", status: "connected" }],
    email: [],
  });

  // Get active accounts based on current service
  accounts[activeService];

  // Handler functions

  const handleLogout = () => {
    // Your logout logic
    setConnectionStatus("disconnected");
  };

  const handleAddAccount = () => {
    const newAccount: Account = {
      id: `new-${Date.now()}`,
      name: `New ${activeService} Account`,
      status: "disconnected",
    };

    setAccounts((prev) => ({
      ...prev,
      [activeService]: [...prev[activeService], newAccount],
    }));
  };

  const handleAccountAction = (accountId: string) => {
    setAccounts((prev) => {
      const updatedAccounts = prev[activeService].map((account) => {
        if (account.id === accountId) {
          return {
            ...account,
            status:
              account.status === "connected" ? "disconnected" : "connected",
          };
        }
        return account;
      });

      return {
        ...prev,
        [activeService]: updatedAccounts,
      };
    });
  };

  const handleLogoutAll = () => {
    setAccounts((prev) => ({
      ...prev,
      [activeService]: prev[activeService].map((account) => ({
        ...account,
        status: "disconnected",
      })),
    }));
    setConnectionStatus("disconnected");
  };

  const handleMainConnection = () => {
    if (activeService === "telegram") {
      setIsTelegramModalOpen(true);
    } else {
      handleConnect();
    }
  };

  const logoutAccount = (accountId) => {
    dispatch(logout(accountId));
  };
  const logoutAllAccounts = () => {
    dispatch(logoutAll());
  };

  return (
    <div className="app-container">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <HeaderModal
        activeService={activeService as "whatsapp" | "telegram" | "email"}
        setActiveService={setActiveService}
        stateConnection={connectionStatus}
        user={user}
        handleLogout={handleLogout}
        handleConnect={handleConnect}
        handleAddAccount={handleAddAccount}
        handleAccountAction={handleAccountAction}
        handleLogoutAll={handleLogoutAll}
        handleMainConnection={handleMainConnection}
        connectionLoading={connectionLoading}
        connectionStatus={connectionStatus}
        logout={logoutAccount}
        logoutAll={logoutAllAccounts}
        socket={socket}
      />

      <div className="main-content">
        {/* Left Sidebar */}

        <GenerateProps
          file={file}
          handleFileChange={handleFileChange}
          setCountry={setCountry}
          setState={setState}
          setMatchCount={setMatchCount}
          setModalState={setModalState}
          fileError={fileError}
          handleUpload={handleUpload}
          uploadLoading={uploadLoading}
          country={country}
          countryOptions={countryOptions}
          state={state}
          stateOptions={stateOptions}
          matchCount={matchCount}
          handleGenerate={handleGenerate}
          generateLoading={generateLoading}
          loadingCheck={loadingCheck}
          numbers={numbers}
          totalNumbers={totalNumbers}
          handleDownload={handleDownload}
          registeredNumbers={registeredNumbers}
          rejectedNumbers={rejectedNumbers}
          carrier={carrier}
          setCarrier={setCarrier}
          activeService={activeService}
          setGender={setGender}
          gender={gender}
        />

        {/* Right Content */}
        <div className="right-content">
          <TableProps
            filter={filter}
            setEmailModalOpen={setEmailModalOpen}
            setFilter={setFilter}
            registeredNumbers={registeredNumbers}
            loading={loading}
            filteredNumbers={filteredNumbers}
            setChatModalOpen={setChatModalOpen}
            getDetail={getDetail}
            activeService={activeService}
          />
        </div>
      </div>

      {/* <button
        className="settings-button"
        onClick={() => setShowSettings(true)}
      >
        <FaCogs className="settings-icon" />

      </button> */}
      {qrcode && displayQr && (
        <QrModal onClick={cancelConnection} qrcode={qrcode} />
      )}
      {showContactModal && (
        <ContactModal
          onClose={() => dispatch(setShowContact(false))}
          detailsphone={detailsphone}
          activeService={activeService}
        />
      )}
      {chatModalOpen && activeService === "whatsapp" && (
        <ChatModal
          onClose={() => setChatModalOpen(false)}
          dispatch={dispatch}
          socket={socket}
          registeredNumbers={registeredNumbers}
          activeService={activeService}
          availableAccounts={all}
        />
      )}

      {EmailModalOpen && activeService === "email" && (
        <EmailManagementModal
          isOpen={EmailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          socket={socket}
        />
      )}

      {modalState === "setup" && (
        <VerificationSetupModal
          isOpen
          onCancel={cancel}
          onStart={handleStartVerification}
          availableAccounts={all}
          activeService={activeService}
          telegramActiveAccounts={telegramAccounts}
        />
      )}

      {chatModalOpen && activeService === "telegram" && (
        <TelegramChatModal
          onClose={() => setChatModalOpen(false)}
          dispatch={dispatch}
          socket={socket}
          registeredNumbers={registeredNumbers}
          telegramActiveAccounts={telegramAccounts}
        />
      )}

      {modalState === "progress" && verificationConfig && (
        <ProgressModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          batches={progressData.batches}
          progress={progressData.progress}
          total={progressData.total}
          currentBatch={progressData.currentBatch}
          registeredCount={progressData.registeredCount}
          rejectedCount={progressData.rejectedCount}
          eta={progressData.eta}
          dispatch={dispatch}
          activeService={activeService}
        />
      )}

      <TelegramAuthModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        dispatch={dispatch}
      />

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          telegramApis={telegramApis}
          setTelegramApis={setTelegramApis}
          proxies={proxies}
          dispatch={dispatch}
        />
      )}

      {isFileOpen && (
        <FileStatsModal
          isOpen={isFileOpen}
          onClose={() => setIsFileOpen(false)}
          fileName="customer_numbers.csv" // This would be dynamic in a real app
          onUploadNewNumbers={() => setIsFileOpen(false)}
          onCancelUpload={handleCancelUpload}
          onDownloadSection={handleDownload}
          newSocket={socket}
          duplicate={duplicate}
          invalid={invalid}
          news={news}
        />
      )}

      {visible && (
        <CountdownModal
          message={message}
          countdown={countdown}
          visible={visible}
          setCountdown={setCountdown}
          setVisible={setVisible}
          socket={socket}
        />
      )}


         <TelegramExportProgressModal 
        progressData={telegramExportProgress}
        onClose={() => setTelegramExportProgress(null)}
      onDownload={handleDownloadExport}

      />



         {tvPaused && (
      <div className="tv-modal-overlay">
        <div className="tv-modal tv-paused-modal">
          <button className="tv-modal-close" onClick={() => setTvPaused(null)}>
            &times;
          </button>
          <h2 className="tv-modal-title">Verification Paused</h2>
          <div className="tv-icon-container">
            <div className="tv-icon tv-warning-icon">⏱️</div>
          </div>
          <p className="tv-message">{tvPaused.message}</p>
          
          <div className="tv-info-card">
            <h3>Next Available Account</h3>
            <p><strong>ID:</strong> {tvPaused.nextAvailableAccount.id}</p>
            <p><strong>Number:</strong> {tvPaused.nextAvailableAccount.phoneNumber}</p>
            <p><strong>Available At:</strong> {new Date(tvPaused.nextAvailableAccount.availableAt).toLocaleTimeString()}</p>
            <p><strong>Wait Time:</strong> {Math.round(tvPaused.waitTime)} seconds</p>
          </div>
        </div>
      </div>
    )}

    {tvFailed && (
      <div className="tv-modal-overlay">
        <div className="tv-modal tv-failed-modal">
          <button className="tv-modal-close" onClick={() => setTvFailed(null)}>
            &times;
          </button>
          <h2 className="tv-modal-title">Operation Failed</h2>
          <div className="tv-icon-container">
            <div className="tv-icon tv-error-icon">❌</div>
          </div>
          <p className="tv-message">Operation: {tvFailed.operation}</p>
          <p className="tv-error-message">{tvFailed.error}</p>
          
          <div className="tv-progress-info">
            <h3>Progress</h3>
            <p><strong>Processed:</strong> {tvFailed.progress.processed}</p>
            <p><strong>Total:</strong> {tvFailed.progress.total}</p>
            <p><strong>Success Rate:</strong> {tvFailed.progress.successRate}%</p>
          </div>
          
          {tvFailed.floodedAccounts?.length > 0 && (
            <div className="tv-flooded-accounts">
              <h3>Flooded Accounts</h3>
              {tvFailed.floodedAccounts.map(account => (
                <div key={account.id} className="tv-account-card">
                  <p><strong>ID:</strong> {account.id}</p>
                  <p><strong>Number:</strong> {account.phoneNumber}</p>
                  <p><strong>Wait Time:</strong> {account.formattedWaitTime}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    {tvVerified && (
      <div className={`tv-notification tv-verified-notification ${tvVerified.status}`}>
        <div className="tv-notification-content">
          <div className="tv-notification-icon">
            {tvVerified.status === 'registered' ? '✓' : '✗'}
          </div>
          <div className="tv-notification-details">
            <div className="tv-phone-number">{tvVerified.phoneNumber}</div>
            <div className="tv-verified-status">
              {tvVerified.status === 'registered' ? 'Registered' : 'Not Registered'}
            </div>
          </div>
        </div>
      </div>
    )}
    
    {tvNotification && (
      <div className={`tv-notification tv-custom-notification tv-${tvNotification.type}`} style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: tvNotification.type === 'info' ? '#2196F3' : 
                         tvNotification.type === 'warning' ? '#FF9800' : 
                         tvNotification.type === 'error' ? '#F44336' : 
                         '#4CAF50',
        color: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        padding: '15px',
        maxWidth: '400px',
        animation: 'slideIn 0.5s ease-out'
      }}>
        <button 
          onClick={() => setTvNotification(null)} 
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          ×
        </button>
        <div className="tv-notification-content" style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div className="tv-notification-icon" style={{ marginRight: '15px', fontSize: '24px' }}>
            {tvNotification.type === 'info' && 'ℹ️'}
            {tvNotification.type === 'warning' && '⚠️'}
            {tvNotification.type === 'error' && '❌'}
            {tvNotification.type === 'success' && '✓'}
          </div>
          <div className="tv-notification-details">
            <div className="tv-notification-title" style={{ fontWeight: 'bold', marginBottom: '5px' }}>{tvNotification.title}</div>
            <div className="tv-notification-message" style={{ marginBottom: '5px' }}>{tvNotification.message}</div>
            {tvNotification.details && (
              <div className="tv-notification-details-text" style={{ fontSize: '0.9em', opacity: '0.9' }}>{tvNotification.details}</div>
            )}
          </div>
        </div>
      </div>
    )}

    {tvError && (
      <div className="tv-modal-overlay">
        <div className="tv-modal tv-error-modal">
          <button className="tv-modal-close" onClick={() => setTvError(null)}>
            &times;
          </button>
          <h2 className="tv-modal-title">Verification Error</h2>
          <div className="tv-icon-container">
            <div className="tv-icon tv-error-icon">⚠️</div>
          </div>
          <div className="tv-error-details">
            <p><strong>Phone Number:</strong> {tvError.phoneNumber}</p>
            <p><strong>Account ID:</strong> {tvError.accountId}</p>
            <p className="tv-error-message">{tvError.error}</p>
          </div>
        </div>
      </div>
    )}

    {tvComplete && (
      <div className="tv-modal-overlay">
        <div className="tv-modal tv-complete-modal">
          <button className="tv-modal-close" onClick={() => setTvComplete(null)}>
            &times;
          </button>
          <h2 className="tv-modal-title">Verification Complete!</h2>
          <div className="tv-icon-container">
            <div className="tv-icon tv-complete-icon">🎉</div>
          </div>
          
          <div className="tv-stats-container">
            <div className="tv-stat-card tv-registered-card">
              <div className="tv-stat-value">{tvComplete.registered}</div>
              <div className="tv-stat-label">Registered</div>
            </div>
            
            <div className="tv-stat-card tv-rejected-card">
              <div className="tv-stat-value">{tvComplete.rejected}</div>
              <div className="tv-stat-label">Rejected</div>
            </div>
            
            <div className="tv-stat-card tv-total-card">
              <div className="tv-stat-value">{tvComplete.total}</div>
              <div className="tv-stat-label">Total</div>
            </div>
          </div>
          
          <div className="tv-summary">
            <p><strong>Processed:</strong> {tvComplete.processed}</p>
            <p><strong>Unprocessed:</strong> {tvComplete.unprocessed}</p>
          </div>
          
          {tvComplete.floodedAccounts.length > 0 && (
            <div className="tv-flooded-accounts">
              <h3>Accounts in Flood Wait</h3>
              {tvComplete.floodedAccounts.map(account => (
                <div key={account.id} className="tv-account-card">
                  <p><strong>ID:</strong> {account.id}</p>
                  <p><strong>Number:</strong> {account.phoneNumber}</p>
                  <p><strong>Wait Time:</strong> {account.formattedWaitTime}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )}

    </div> // FIXED: Removed extra closing divs
  );
}
  


export default WhatsAppNumberGenerator