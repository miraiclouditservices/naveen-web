import React, { useState } from "react";

interface CommunicationTimelineProps {
  activities: any[];
}

export default function CommunicationTimeline({ activities }: CommunicationTimelineProps) {
  const [filterType, setFilterType] = useState<string>("All");

  const activityTypes = ["All", "Call", "Meeting", "Email", "WhatsApp", "Note", "Demo"];

  const getIconInfo = (type: string) => {
    switch (type) {
      case "Call":
        return { icon: "bi-telephone-fill", color: "#2563eb", bg: "#dbeafe" }; // Blue
      case "Meeting":
        return { icon: "bi-people-fill", color: "#059669", bg: "#d1fae5" }; // Green
      case "Email":
        return { icon: "bi-envelope-fill", color: "#db2777", bg: "#fce7f3" }; // Pink
      case "WhatsApp":
        return { icon: "bi-whatsapp", color: "#16a34a", bg: "#dcfce7" }; // WhatsApp Green
      case "Note":
        return { icon: "bi-sticky-fill", color: "#d97706", bg: "#fef3c7" }; // Orange
      case "Demo":
        return { icon: "bi-play-btn-fill", color: "#7c3aed", bg: "#ede9fe" }; // Purple
      default:
        return { icon: "bi-chat-dots-fill", color: "#4b5563", bg: "#f3f4f6" }; // Grey
    }
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: "10px 16px",
    fontSize: "0.825rem",
    fontWeight: isActive ? 600 : 500,
    color: isActive ? "#5850ec" : "var(--text-muted)",
    borderBottom: isActive ? "2.3px solid #5850ec" : "2.3px solid transparent",
    background: "none",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    cursor: "pointer",
    transition: "all 0.15s",
  });

  const filteredActivities = filterType === "All"
    ? activities
    : activities.filter(act => act.type === filterType);

  return (
    <div 
      className="card border p-4 shadow-sm animate__animated animate__fadeIn" 
      style={{ 
        backgroundColor: "var(--bg-card)", 
        borderColor: "var(--border-color)", 
        borderRadius: "var(--radius-lg)" 
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="fw-bold m-0" style={{ color: "var(--text-main)" }}>
          Communication History Timeline
        </h6>
      </div>

      {/* Filter Tabs Type */}
      <div className="d-flex border-bottom mb-4 bg-light px-2 rounded-2 overflow-x-auto">
        {activityTypes.map((t) => (
          <button 
            key={t}
            type="button" 
            style={tabStyle(filterType === t)} 
            onClick={() => setFilterType(t)}
          >
            {t === "All" ? "All Timeline" : `${t}s`}
          </button>
        ))}
      </div>

      {/* Vertical Timeline */}
      <div 
        className="position-relative ps-5 border-start" 
        style={{ 
          borderColor: "var(--border-color)", 
          marginLeft: "20px" 
        }}
      >
        {filteredActivities.map((act, index) => {
          const iconInfo = getIconInfo(act.type);
          return (
            <div key={act._id || index} className="mb-4 position-relative">
              {/* Colored Bubble Icon Node */}
              <div
                className="position-absolute d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  left: "-68px",
                  top: "0px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  backgroundColor: iconInfo.bg,
                  color: iconInfo.color,
                  border: "3px solid var(--bg-card)"
                }}
                title={act.type}
              >
                <i className={`bi ${iconInfo.icon}`} style={{ fontSize: "0.85rem" }}></i>
              </div>

              {/* Timestamp */}
              <div className="small fw-semibold text-muted mb-1.5" style={{ fontSize: "0.78rem" }}>
                {act.date ? new Date(act.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} 
                {act.time ? ` · ${act.time}` : ''}
              </div>

              {/* Card Container */}
              <div 
                className="p-3 border rounded-3 bg-light" 
                style={{ 
                  maxWidth: "640px", 
                  borderColor: "var(--border-color)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <div className="fw-bold text-dark small mb-1">{act.title}</div>
                <p className="extra-small text-muted m-0 mb-2" style={{ fontSize: "0.78rem", lineHeight: "1.4" }}>
                  {act.description}
                </p>
                <div 
                  className="d-flex justify-content-between extra-small text-secondary border-top pt-2 mt-2" 
                  style={{ fontSize: "0.7rem" }}
                >
                  <span>Logged by: <strong className="text-dark">{act.user_id?.name || "System"}</strong></span>
                  <span 
                    className="badge rounded-pill px-2 py-0.5"
                    style={{ 
                      backgroundColor: iconInfo.bg, 
                      color: iconInfo.color, 
                      fontWeight: 600,
                      fontSize: "0.65rem"
                    }}
                  >
                    {act.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredActivities.length === 0 && (
          <div className="text-center py-5 text-muted small">
            <i className="bi bi-clock-history fs-3 d-block mb-2 opacity-50"></i>
            No matching communication logs recorded.
          </div>
        )}
      </div>
    </div>
  );
}
