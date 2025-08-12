import React, { useEffect, useState } from 'react';
import './styles/update-notification.css';

interface UpdateInfo {
  version: string;
  releaseDate?: string;
}

const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in Electron environment
    if ((window as any).electronAPI) {
      // Listen for update events
      (window as any).electronAPI.onMessage('update-available', (info: UpdateInfo) => {
        setUpdateAvailable(true);
        setUpdateInfo(info);
      });

      (window as any).electronAPI.onMessage('update-downloaded', (info: UpdateInfo) => {
        setUpdateDownloaded(true);
        setUpdateInfo(info);
      });

      (window as any).electronAPI.onMessage('update-error', (error: string) => {
        setUpdateError(error);
      });
      
      // Listen for backend errors
      (window as any).electronAPI.onMessage('backend-error', (error: string) => {
        setBackendError(error);
      });

      // Check for updates when component mounts
      (window as any).electronAPI.checkForUpdates();
    }
  }, []);

  const handleRestartAndUpdate = () => {
    if ((window as any).electronAPI) {
      (window as any).electronAPI.sendMessage('restart-and-update');
    }
  };

  return (
    <div className="update-notification">
      {updateAvailable && !updateDownloaded && (
        <div className="update-banner">
          <p>New version {updateInfo?.version} is available and downloading...</p>
          <p>{updateInfo?.releaseDate && `Released on: ${updateInfo.releaseDate}`}</p>
        </div>
      )}

      {updateDownloaded && (
        <div className="update-banner update-ready">
          <p>Update {updateInfo?.version} is ready to install!</p>
          <button onClick={handleRestartAndUpdate}>Restart Now</button>
        </div>
      )}

      {updateError && (
        <div className="update-banner update-error">
          <p>Update error: {updateError}</p>
        </div>
      )}
      
      {backendError && (
        <div className="update-banner update-error">
          <p>Backend error: {backendError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

  
    </div>
  );
};

export default UpdateNotification;