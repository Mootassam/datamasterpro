import { FaCheck, FaEye, FaTimes, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { FiMail, FiMessageSquare } from "react-icons/fi";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from 'react-window';
import { useState } from 'react';
import './styles/Table.css'
import './styles/email.css'

const TableProps = ({ 
  filter, 
  setFilter, 
  registeredNumbers, 
  loading, 
  filteredNumbers, 
  setChatModalOpen, 
  getDetail, 
  activeService ,
  setEmailModalOpen
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const getServiceColor = () => {
    switch(activeService) {
      case 'whatsapp': return '#25D366';
      case 'telegram': return '#0088cc';
      default: return '#718096';
    }
  };

  const Row = ({ index, style }) => {
    const { number, status } = filteredNumbers[index];
    return (
      <div 
        style={style} 
        className={`virtualized-row ${hoveredRow === index ? 'hovered' : ''}`}
        onMouseEnter={() => setHoveredRow(index)}
        onMouseLeave={() => setHoveredRow(null)}
      >
        <div className="cell index">{index + 1}</div>
        <div className="cell number">{number}</div>
        <div className="cell status">
          <span className={`status-badge ${status}`}>
            {status === "registered" ? (
              <>
                <FaCheck className="status-icon" />
                <span>Registered</span>
              </>
            ) : status === "rejected" ? (
              <>
                <FaTimes className="status-icon" />
                <span>Rejected</span>
              </>
            ) : (
              <span>Pending</span>
            )}
          </span>
        </div>
        <div className="cell actions">
          <button 
            className="action-btn view-btn" 
            onClick={() => getDetail(number)}
            title="View details"
          >
            <FaEye />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="results-panel">
      <div className="panel-header">
        <h2 className="panel-title">Number Results</h2>
        
        <div className="controls-container">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === 'registered' ? 'active' : ''}`}
              onClick={() => setFilter('registered')}
            >
              <FaCheck className="filter-icon" />
              Registered
            </button>
            <button
              className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              <FaTimes className="filter-icon" />
              Rejected
            </button>
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
          </div>

      {(activeService === "whatsapp" || activeService === "telegram" || activeService === "email") && (
  <div className="bulk-action-buttons">
    {(activeService === "whatsapp" || activeService === "telegram") && (
      <button
        className="bulk-message-btn"
        onClick={() => setChatModalOpen(true)}
        style={{ backgroundColor: getServiceColor() }}
      >
        {activeService === "whatsapp" ? (
          <FaWhatsapp className="service-icon" />
        ) : (
          <FaTelegram className="service-icon" />
        )}
        <span>Message All ({registeredNumbers.length})</span>
      </button>
    )}
    
    {activeService === "email" && (
      <button
        className="bulk-email-btn"
        onClick={() => setEmailModalOpen(true)}
      >
        <FiMail className="service-icon" />
        <span>Email All ({registeredNumbers.length})</span>
      </button>
    )}
  </div>
)}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : filteredNumbers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FiMessageSquare />
          </div>
          <h3>No Numbers Found</h3>
          <p>Please upload a file or generate numbers to get started</p>
        </div>
      ) : (
        <div className="results-table-container">
          <div className="table-header">
            <div className="header-cell">#</div>
            <div className="header-cell">Phone Number</div>
            <div className="header-cell">Status</div>
            <div className="header-cell">Actions</div>
          </div>
          
          <div className="table-body">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={filteredNumbers.length}
                  itemSize={60}
                  width={width}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableProps;