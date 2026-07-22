import React from "react";

interface PipelineKanbanProps {
  deals: any[];
  onUpdateStage: (dealId: string, newStage: string) => void;
}

export default function PipelineKanban({ deals, onUpdateStage }: PipelineKanbanProps) {
  const stages = ["New", "Site Visit", "Discussion", "Proposal", "Negotiation", "Won", "Lost"];

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex gap-3 overflow-auto pb-4" style={{ minHeight: "60vh" }}>
        {stages.map((columnStage) => {
          const columnDeals = deals.filter((d) => d.stage === columnStage);
          
          return (
            <div 
              key={columnStage} 
              className="d-flex flex-column"
              style={{ 
                flex: "0 0 280px", 
                backgroundColor: "#fcfbfa", 
                borderRadius: "var(--radius-lg)", 
                border: "1px solid var(--border-color)", 
                padding: "12px" 
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: "0.03em" }}>
                  {columnStage}
                </span>
                <span className="badge bg-light text-dark border fw-bold">{columnDeals.length}</span>
              </div>

              <div className="d-flex flex-column gap-2" style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {columnDeals.map((deal) => (
                  <div 
                    key={deal._id} 
                    className="card p-3 border shadow-sm bg-white" 
                    style={{ borderRadius: "var(--radius-md)" }}
                  >
                    <div className="fw-bold small text-dark mb-1">{deal.name}</div>
                    <div className="text-success fw-bold small mb-2">
                      ₹{(deal.amount || 0).toLocaleString("en-IN")}
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                      <span className="extra-small text-muted" style={{ fontSize: "0.7rem" }}>
                        Prob: {deal.probability}%
                      </span>
                      <select 
                        className="form-select form-select-sm border-0 bg-light p-1" 
                        style={{ width: "110px", fontSize: "0.68rem" }}
                        value={deal.stage}
                        onChange={(e) => onUpdateStage(deal._id, e.target.value)}
                      >
                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                {columnDeals.length === 0 && (
                  <div className="text-center py-4 text-muted small" style={{ fontSize: "0.75rem" }}>
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
