import React from "react";
import Table from "@/components/common/Table";

interface ActivitiesManagerProps {
  activities: any[];
  isLoading: boolean;
  openLogActivityForm: () => void;
}

export default function ActivitiesManager({
  activities,
  isLoading,
  openLogActivityForm
}: ActivitiesManagerProps) {
  
  return (
    <div className="card border-0 p-3 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold m-0" style={{ color: "var(--text-main)" }}>CRM Activity Logs</h6>
        <button 
          className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-2" 
          style={{ backgroundColor: "var(--dark-section)", borderRadius: "var(--radius-md)" }}
          onClick={openLogActivityForm}
        >
          <i className="bi bi-telephone"></i> Log Activity
        </button>
      </div>

      <Table 
        columns={[
          { 
            header: "Activity Type", 
            render: (item) => {
              const iconClass = item.type === 'Call' ? 'telephone' : item.type === 'Meeting' ? 'people' : item.type === 'Email' ? 'envelope' : 'chat-dots';
              return (
                <span className="badge bg-light text-dark border px-2 py-1">
                  <i className={`bi bi-${iconClass} me-1`}></i>
                  {item.type}
                </span>
              );
            } 
          },
          { header: "Title", render: (item) => <span className="fw-bold text-dark">{item.title}</span> },
          { header: "Description", render: (item) => <span className="text-muted">{item.description || "—"}</span> },
          { header: "Representative", render: (item) => <span className="fw-semibold">{item.user_id?.name || "System"}</span> },
          { header: "Date", render: (item) => <span>{item.date ? new Date(item.date).toLocaleDateString("en-IN") : "—"}</span> },
          { header: "Time", render: (item) => <span>{item.time || "—"}</span> },
          { header: "Status", render: (item) => <span className="badge bg-success">{item.status}</span> }
        ]}
        data={activities}
        isLoading={isLoading}
        emptyMessage="No activities logged."
      />
    </div>
  );
}
