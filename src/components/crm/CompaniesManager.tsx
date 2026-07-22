import React from "react";
import Table from "@/components/common/Table";

interface CompaniesManagerProps {
  companies: any[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  openNewCompanyForm: () => void;
}

export default function CompaniesManager({
  companies,
  isLoading,
  onDelete,
  openNewCompanyForm
}: CompaniesManagerProps) {
  
  return (
    <div className="card border-0 p-3 shadow-sm" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", borderRadius: "var(--radius-lg)" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold m-0" style={{ color: "var(--text-main)" }}>B2B Accounts Directory</h6>
        <button 
          className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-2" 
          style={{ backgroundColor: "var(--dark-section)", borderRadius: "var(--radius-md)" }}
          onClick={openNewCompanyForm}
        >
          <i className="bi bi-plus-lg"></i> Add Company
        </button>
      </div>

      <Table 
        columns={[
          { header: "Company Name", render: (item) => <span className="fw-bold text-dark">{item.name}</span> },
          { header: "Industry", render: (item) => <span>{item.industry || "—"}</span> },
          { header: "GST Number", render: (item) => <span className="fw-semibold text-secondary">{item.gst || "—"}</span> },
          { header: "Website", render: (item) => <a href={item.website} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{item.website || "—"}</a> },
          { header: "Email", render: (item) => <span>{item.email || "—"}</span> },
          { header: "Phone", render: (item) => <span>{item.phone || "—"}</span> },
          { header: "Employees", render: (item) => <span>{item.employeesCount || 0}</span> },
          {
            header: "Actions",
            render: (item) => (
              <button 
                className="btn btn-sm btn-light border text-danger p-1" 
                onClick={() => onDelete(item._id)}
                title="Delete Company"
              >
                <i className="bi bi-trash" />
              </button>
            )
          }
        ]}
        data={companies}
        isLoading={isLoading}
        emptyMessage="No companies found."
      />
    </div>
  );
}
