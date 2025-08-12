import  { useState } from 'react';
import { FaPlus, FaTrash, FaCheck, FaTimes, FaSpinner, FaPlug, FaSignal } from 'react-icons/fa';

interface Proxy {
  id: string;
  host: string;
  port: string;
  username?: string;
  password?: string;
  status?: 'active' | 'inactive' | 'testing';
  latency?: number;
}

const ProxyModal = ({ 
  isOpen, 
  onClose, 
  proxies, 
  onAddProxy, 
  onRemoveProxy 
}: {
  isOpen: boolean;
  onClose: () => void;
  proxies: Proxy[];
  onAddProxy: (proxy: Proxy) => Promise<void>;
  onRemoveProxy: (index: number) => void;
}) => {
  const [newProxy, setNewProxy] = useState<Omit<Proxy, 'id'>>({ 
    host: '',
    port: '',
    username: '',
    password: ''
  });
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);

  const validateProxy = (proxy: Omit<Proxy, 'id'>): boolean => {
    const errors: Record<string, string> = {};
    
    if (!proxy.host.trim()) errors.host = 'Host is required';
    if (!proxy.port.trim()) errors.port = 'Port is required';
    if (proxy.port && isNaN(Number(proxy.port))) errors.port = 'Port must be a number';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddProxy = async () => {
    if (!validateProxy(newProxy)) return;
    
    setIsAdding(true);
    try {
      await onAddProxy({
        ...newProxy,
        id: Date.now().toString(),
        status: 'inactive'
      });
      setNewProxy({ host: '', port: '', username: '', password: '' });
      setActiveTab('list');
      setValidationErrors({});
    } finally {
      setIsAdding(false);
    }
  };

  const testProxy = async () => {
    setIsTesting(true);
    try {
      // Simulate proxy testing
      await new Promise(resolve => setTimeout(resolve, 1500));
      return Math.random() > 0.5 ? 'active' : 'inactive';
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="proxy-modal-overlay">
      <div className="proxy-modal">
        <div className="proxy-modal-header">
          <h3>Proxy Manager</h3>
          <button onClick={onClose} className="proxy-modal-close">
            <FaTimes />
          </button>
        </div>

        <div className="proxy-modal-tabs">
          <button
            className={`proxy-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Your Proxies ({proxies.length})
          </button>
          <button
            className={`proxy-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <FaPlus /> Add Proxy
          </button>
        </div>

        <div className="proxy-modal-body">
          {activeTab === 'list' ? (
            <div className="proxy-list-container">
              {proxies.length === 0 ? (
                <div className="proxy-empty-state">
                  <div className="empty-state-icon">
                    <FaSignal size={48} />
                  </div>
                  <h4>No proxies configured</h4>
                  <p>Add your first proxy server to get started</p>
                  <button 
                    className="add-first-proxy-btn"
                    onClick={() => setActiveTab('add')}
                  >
                    <FaPlus /> Add Proxy
                  </button>
                </div>
              ) : (
                <div className="proxy-table-container">
                  <table className="proxy-table">
                    <thead>
                      <tr>
                        <th>Host</th>
                        <th>Port</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proxies.map((proxy, index) => (
                        <tr key={proxy.id}>
                          <td>{proxy.host}</td>
                          <td>{proxy.port}</td>
                          <td>
                            <span className={`proxy-status ${proxy.status || 'inactive'}`}>
                              {proxy.status === 'active' ? (
                                <>
                                  <FaCheck /> Active
                                  {proxy.latency && (
                                    <span className="proxy-latency">{proxy.latency}ms</span>
                                  )}
                                </>
                              ) : proxy.status === 'testing' ? (
                                <FaSpinner className="spin" />
                              ) : (
                                'Inactive'
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="proxy-actions">
                              <button
                                className="proxy-action-btn test-btn"
                                onClick={async () => {
                                 await testProxy();
                                  // Update proxy status in parent component
                                }}
                                disabled={isTesting}
                              >
                                <FaPlug /> Test
                              </button>
                              <button
                                className="proxy-action-btn danger"
                                onClick={() => onRemoveProxy(index)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="add-proxy-form">
              <div className="form-group">
                <label>Proxy Host <span className="required">*</span></label>
                <input
                  type="text"
                  name="host"
                  value={newProxy.host}
                  onChange={(e) => setNewProxy({...newProxy, host: e.target.value})}
                  placeholder="proxy.example.com"
                  className={validationErrors.host ? 'error' : ''}
                />
                {validationErrors.host && (
                  <span className="error-message">{validationErrors.host}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>Proxy Port <span className="required">*</span></label>
                <input
                  type="text"
                  name="port"
                  value={newProxy.port}
                  onChange={(e) => setNewProxy({...newProxy, port: e.target.value})}
                  placeholder="8082"
                  className={validationErrors.port ? 'error' : ''}
                />
                {validationErrors.port && (
                  <span className="error-message">{validationErrors.port}</span>
                )}
              </div>
              
              <div className="form-group">
                <label>Username (Optional)</label>
                <input
                  type="text"
                  name="username"
                  value={newProxy.username || ''}
                  onChange={(e) => setNewProxy({...newProxy, username: e.target.value})}
                  placeholder="username"
                />
              </div>
              
              <div className="form-group">
                <label>Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  value={newProxy.password || ''}
                  onChange={(e) => setNewProxy({...newProxy, password: e.target.value})}
                  placeholder="password"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setActiveTab('list');
                    setNewProxy({ host: '', port: '', username: '', password: '' });
                    setValidationErrors({});
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={handleAddProxy}
                  disabled={isAdding}
                >
                  {isAdding ? (
                    <>
                      <FaSpinner className="spinner" /> Adding...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Save Proxy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProxyModal;