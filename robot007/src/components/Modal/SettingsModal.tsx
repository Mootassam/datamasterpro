import { useEffect, useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiWifi, FiKey, FiCpu } from 'react-icons/fi';
import { deleteCredentials, getAllCredentials, StoreCredentials } from '../../store/generate/generateActions';
import { useSelector } from 'react-redux';
import { allApi } from '../../store/generate/generateselectors';
import { deleteProxy, HandleProxy, testProxy } from '../../store/proxy/proxyActions';
const SettingsModal = ({ onClose, telegramApis, setTelegramApis, proxies, dispatch }) => {
  const [activeTab, setActiveTab] = useState('api');
  const [newApi, setNewApi] = useState({ phone: '', id: '', hash: '', testConnection: true });
  const [newProxy, setNewProxy] = useState({ host: '', port: '', type: 'socks5' });
  const api = useSelector(allApi)
  useEffect(() => {
    dispatch(getAllCredentials());
  }, []);

  const handleAddApi = () => {
    if (newApi.id && newApi.hash) {
      setTelegramApis([...telegramApis, newApi]);
      dispatch(StoreCredentials({ newApi }))
      dispatch(getAllCredentials());
      // setNewApi({ phone: '', id: '', hash: '', testConnection: true });

    }
  };





  const handleAddProxy = async () => {
    if (newProxy.host && newProxy.port) {
      setNewProxy({ host: '', port: '', type: 'socks5' });
    }

    await dispatch(HandleProxy(newProxy))


  };

  const TestProxy = async (proxy) => {
    dispatch(testProxy(proxy))
  }


  const proxyDelete = async (data, index) => {
    dispatch(deleteProxy({ data, index }))
  }

  const deleteApi = (id, index) => {
    dispatch(deleteCredentials({ id, index }))

  }

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-card">
        <div className="modal-headers">
          <div className="tab-controls">
            <button
              className={`tab-btns ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              <FiKey className="tab-icon" />
              <span>API Credentials</span>
            </button>
            <button
              className={`tab-btns ${activeTab === 'proxy' ? 'active' : ''}`}
              onClick={() => setActiveTab('proxy')}
            >
              <FiWifi className="tab-icon" />
              <span>Proxy Setup</span>
            </button>
          </div>
          <button className="close-panel-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="panel-content">
          {activeTab === 'api' ? (
            <div>
              <div className="input-card">
                <label className="input-label">
                  <span>Phone Number</span>
                  <input
                    type="text"
                    value={newApi.phone}
                    onChange={(e) => setNewApi({ ...newApi, phone: e.target.value })}
                    placeholder="+85259048068"
                    className="modern-input"
                  />
                </label>

                <label className="input-label">
                  <span>API ID</span>
                  <input
                    type="text"
                    value={newApi.id}
                    onChange={(e) => setNewApi({ ...newApi, id: e.target.value })}
                    placeholder="123456"
                    className="modern-input"
                  />
                </label>

                <label className="input-label">
                  <span>API Hash</span>
                  <input
                    type="text"
                    value={newApi.hash}
                    onChange={(e) => setNewApi({ ...newApi, hash: e.target.value })}
                    placeholder="a1b2c3d4e5..."
                    className="modern-input"
                  />
                </label>

                <button
                  className="add-item-btn neon-blue"
                  onClick={handleAddApi}
                  disabled={!newApi.id || !newApi.hash}
                >
                  <FiPlus />
                  <span>Add API</span>
                </button>
              </div>

              <div className="items-grid">
                <h3 className="items-title">
                  <FiCpu />
                  <span>Saved APIs</span>
                </h3>

                {api.length === 0 ? (
                  <div className="empty-state">
                    <p>No API credentials saved</p>
                  </div>
                ) : (
                  <div className="items-list">

                    {api.map((api, index) => (
                      <div key={index} className="config-item">
                        <div className="item-detailss">
                          <span className="item-id">Phone: {api.phoneNumber}</span>
                          <span className="item-id">Api ID: {api.apiId}</span>
                          <span className="item-hash">Hash: {api.apiHash}</span>
                        </div>
                        <button
                          className="delete-item-btn"
                          onClick={() => deleteApi(api.id, index)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="input-card">
                <div className="input-row">
                  <label className="input-label">
                    <span>Host</span>
                    <input
                      type="text"
                      value={newProxy.host}
                      onChange={(e) => setNewProxy({ ...newProxy, host: e.target.value })}
                      placeholder="proxy.server.com"
                      className="modern-input"
                    />
                  </label>

                  <label className="input-label">
                    <span>Port</span>
                    <input
                      type="text"
                      value={newProxy.port}
                      onChange={(e) => setNewProxy({ ...newProxy, port: e.target.value })}
                      placeholder="8088"
                      className="modern-input"
                    />
                  </label>
                </div>

                <label className="input-label">
                  <span>Protocol</span>
                  <select
                    value={newProxy.type}
                    onChange={(e) => setNewProxy({ ...newProxy, type: e.target.value })}
                    className="modern-select"
                  >
                    <option value="socks5">SOCKS5</option>
                    <option value="socks4">SOCKS4</option>
                    <option value="http">HTTP</option>
                  </select>
                </label>

                <button
                  className="add-item-btn neon-purple"
                  onClick={handleAddProxy}
                  disabled={!newProxy.host || !newProxy.port}
                >
                  <FiPlus />
                  <span>Add Proxy</span>
                </button>
              </div>

              <div className="items-grid">
                <h3 className="items-title">
                  <FiWifi />
                  <span>Active Proxies</span>
                </h3>

                {proxies.length === 0 ? (
                  <div className="empty-state">
                    <p>No proxies configured</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {proxies.map((proxy, index) => (
                      <div key={index} className="config-item">
                        <div className="item-detailss">
                          <span className="item-address">{proxy.ip}:{proxy.port}</span>
                          <span className={`protocol-tag ${proxy.type}`}>
                            {proxy.type.toUpperCase()}
                          </span>
                          <img
                            src={`https://cdn.proxyscrape.com/img/country/iso_16/${proxy.country?.toLowerCase()}.png`}
                            alt=""
                            style={{ paddingLeft: 5 }}
                          />
                        </div>
                        <div className="item-actions">
                          <button className="test-btn" onClick={() => TestProxy(proxy)}>
                            Test
                          </button>
                          <button
                            className="delete-item-btn"
                            onClick={() => proxyDelete(proxy, index)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;