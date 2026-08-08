"use client";

import { useState, useEffect } from "react";
import { getStoredToken, API_URL } from "@/utils/api";
import * as XLSX from "xlsx";

const FIELD_STYLE: React.CSSProperties = {
  borderRadius: "6px",
  border: "1px solid var(--border-color, #d1d5db)",
  fontSize: "0.88rem",
  padding: "8px 12px",
  width: "100%",
  outline: "none",
  backgroundColor: "var(--bg-card, #ffffff)",
  color: "var(--text-main, #111827)",
};

const LABEL_STYLE: React.CSSProperties = {
  display: "block",
  fontSize: "0.82rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

interface PreviewRow {
  rowNum: number;
  property: string;
  floorNumber: string;
  floorName: string;
  totalSft: number;
  floorType: string;
  status: string;
  isValid: boolean;
  errors: string[];
}

interface FloorBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties?: any[];
  defaultPropertyId?: string;
}

export default function FloorBulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
  properties = [],
  defaultPropertyId = "",
}: FloorBulkUploadModalProps) {
  const [selectedProperty, setSelectedProperty] = useState(defaultPropertyId);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resultSummary, setResultSummary] = useState<any>(null);

  // Auto-select initial property if default provided or if only 1 property exists
  useEffect(() => {
    if (defaultPropertyId) {
      setSelectedProperty(defaultPropertyId);
    } else if (properties.length === 1) {
      setSelectedProperty(properties[0]._id);
    }
  }, [defaultPropertyId, properties]);

  if (!isOpen) return null;

  // 1. Download Sample Excel Template
  const handleDownloadExcelTemplate = () => {
    const sampleData = [
      {
        "Property": "Green Valley Commercial Hub",
        "Floor Number": 1,
        "Floor Name": "1st Floor",
        "Total SFT": 5000,
        "Floor Type": "Commercial",
        "Status": "Active",
      },
      {
        "Property": "Green Valley Commercial Hub",
        "Floor Number": 2,
        "Floor Name": "2nd Floor",
        "Total SFT": 6500,
        "Floor Type": "Commercial",
        "Status": "Active",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FloorsTemplate");
    XLSX.writeFile(workbook, "Floors_Bulk_Upload_Template.xlsx");
  };

  // 2. Client-side File Read & Pre-Upload Review Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = [".xlsx", ".xls", ".csv"];
      const isValid = validExtensions.some((ext) => selected.name.toLowerCase().endsWith(ext));

      if (!isValid) {
        setErrorMsg("Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file");
        return;
      }

      setErrorMsg("");
      setFile(selected);

      // Read file in browser for pre-upload data review table
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result;
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

          if (!rawData || rawData.length === 0) {
            setErrorMsg("The selected file is empty or missing data rows.");
            return;
          }

          // Build property lookup map for client-side validation
          const propertyLookup = new Map();
          properties.forEach((p) => {
            propertyLookup.set(p._id.toString(), p.propertyName);
            if (p.propertyName) propertyLookup.set(p.propertyName.toLowerCase().trim(), p.propertyName);
            if (p.propertyCode) propertyLookup.set(p.propertyCode.toLowerCase().trim(), p.propertyName);
          });

          const defaultPropName = selectedProperty ? propertyLookup.get(selectedProperty) || "Selected Property" : "";

          const parsed: PreviewRow[] = rawData.map((rawItem, idx) => {
            const rowData: any = {};
            Object.keys(rawItem).forEach((k) => {
              const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, "");
              rowData[cleanKey] = String(rawItem[k]).trim();
            });

            const rowErrors: string[] = [];

            // Property validation
            const csvProp = rowData.property || rowData.propertyid || rowData.propertyname || rowData.propertycode;
            let displayProp = csvProp || defaultPropName;
            if (csvProp) {
              const matchedName = propertyLookup.get(csvProp.toLowerCase());
              if (matchedName) displayProp = matchedName;
            }

            if (!displayProp) {
              rowErrors.push("Missing Property");
            }

            // Floor Number validation
            const floorNum = rowData.floornumber || rowData.number || rowData.floor;
            if (!floorNum) {
              rowErrors.push("Missing Floor Number");
            }

            // Total SFT validation
            const sftVal = parseFloat(rowData.totalsft || rowData.capacity || rowData.sft || rowData.totalsftcapacity || "0");
            if (isNaN(sftVal) || sftVal < 0) {
              rowErrors.push("Invalid SFT");
            }

            return {
              rowNum: idx + 2, // Row 1 is header
              property: displayProp || "N/A",
              floorNumber: floorNum || "-",
              floorName: rowData.floorname || (floorNum ? `Floor ${floorNum}` : "-"),
              totalSft: isNaN(sftVal) ? 0 : sftVal,
              floorType: rowData.floortype || "Commercial",
              status: rowData.status || "Active",
              isValid: rowErrors.length === 0,
              errors: rowErrors,
            };
          });

          setPreviewRows(parsed);
          setStep("preview");
        } catch (err: any) {
          setErrorMsg("Failed to read file preview: " + err.message);
        }
      };

      reader.readAsArrayBuffer(selected);
    }
  };

  // 3. Confirm & Submit to Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedProperty) {
        formData.append("property", selectedProperty);
      }

      const token = getStoredToken();

      const response = await fetch(`${API_URL}/floors/bulk-upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResultSummary(data);
        setStep("result");
        if (data.summary?.successCount > 0) {
          onSuccess();
        }
      } else {
        setErrorMsg(data.error || data.message || "Failed to process bulk upload.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setStep("upload");
    setPreviewRows([]);
    setErrorMsg("");
    setResultSummary(null);
    onClose();
  };

  const validCount = previewRows.filter((r) => r.isValid).length;
  const invalidCount = previewRows.filter((r) => !r.isValid).length;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            backgroundColor: "var(--bg-card, #ffffff)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="modal-header border-bottom px-4 py-3 align-items-center justify-content-between"
            style={{
              backgroundColor: "var(--dark-section, #1e293b)",
              color: "#ffffff",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-arrow-up text-warning fs-5"></i>
              <div>
                <h5 className="modal-title fw-bold fs-6 m-0">Bulk Upload Floors</h5>
                <span style={{ color: "#94a3b8", fontSize: "0.78rem", fontWeight: 500 }}>
                  {step === "upload" && "Step 1: Select & Template Download"}
                  {step === "preview" && "Step 2: Pre-Upload Data Review"}
                  {step === "result" && "Step 3: Post-Upload Review & Audit"}
                </span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={resetModal}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 space-y-4">
              {/* STEP 1: FILE SELECTION */}
              {step === "upload" && (
                <>
                  <div
                    className="p-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                    style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
                  >
                    <div className="d-flex align-items-center gap-2 text-primary" style={{ fontSize: "0.85rem" }}>
                      <i className="bi bi-info-circle-fill fs-5"></i>
                      <span>Upload an Excel (.xlsx, .xls) or CSV file containing floor records.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadExcelTemplate}
                      className="btn btn-sm btn-outline-primary fw-semibold d-inline-flex align-items-center gap-1"
                      style={{ borderRadius: "8px", fontSize: "0.8rem" }}
                    >
                      <i className="bi bi-file-earmark-excel-fill text-success"></i> Download Excel Template
                    </button>
                  </div>

                  {properties.length > 0 && (
                    <div className="mt-3">
                      <label style={LABEL_STYLE}>
                        Target Property <span className="text-muted font-normal">(Default for rows without property column)</span>
                      </label>
                      <select style={FIELD_STYLE} value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
                        <option value="">Select Default Property...</option>
                        {properties.map((p: any) => (
                          <option key={p._id} value={p._id}>
                            {p.propertyName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mt-3">
                    <label style={LABEL_STYLE}>Select File for Upload *</label>
                    <div
                      className="border-2 border-dashed rounded-3 p-5 text-center"
                      style={{
                        borderColor: file ? "#2563eb" : "#cbd5e1",
                        backgroundColor: file ? "#f0f9ff" : "var(--bg-app, #f8fafc)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <input type="file" accept=".xlsx,.xls,.csv" id="bulk-file-input" className="d-none" onChange={handleFileChange} />
                      <label htmlFor="bulk-file-input" className="w-100 cursor-pointer m-0">
                        <i className="bi bi-cloud-arrow-up text-primary" style={{ fontSize: "3rem" }}></i>
                        <div className="fw-semibold mt-2 text-dark" style={{ fontSize: "1rem" }}>
                          Click to select or drop Excel / CSV file here
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                          Supports .XLSX, .XLS, .CSV files (Max 10MB)
                        </div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: PRE-UPLOAD DATA REVIEW TABLE */}
              {step === "preview" && (
                <>
                  <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-3 border flex-wrap gap-2">
                    <div>
                      <span className="badge bg-secondary me-2">{file?.name}</span>
                      <span className="fw-semibold text-dark me-3" style={{ fontSize: "0.88rem" }}>
                        Total Rows Found: {previewRows.length}
                      </span>
                      <span className="badge bg-success-subtle text-success border border-success me-2" style={{ fontSize: "0.78rem" }}>
                        <i className="bi bi-check-circle me-1"></i> {validCount} Valid
                      </span>
                      {invalidCount > 0 && (
                        <span className="badge bg-danger-subtle text-danger border border-danger" style={{ fontSize: "0.78rem" }}>
                          <i className="bi bi-exclamation-triangle me-1"></i> {invalidCount} Invalid
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep("upload")}
                      className="btn btn-sm btn-outline-secondary fw-semibold"
                      style={{ borderRadius: "6px", fontSize: "0.8rem" }}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Change File
                    </button>
                  </div>

                  <div className="table-responsive border rounded-3 mt-3" style={{ maxHeight: "340px", overflowY: "auto" }}>
                    <table className="table table-hover align-middle m-0" style={{ fontSize: "0.82rem" }}>
                      <thead className="table-dark sticky-top">
                        <tr>
                          <th style={{ width: "50px" }}>Row</th>
                          <th>Property</th>
                          <th>Floor #</th>
                          <th>Floor Name</th>
                          <th>Total SFT</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Validation Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row) => (
                          <tr key={row.rowNum} className={!row.isValid ? "table-danger" : ""}>
                            <td className="fw-bold text-muted">{row.rowNum}</td>
                            <td className="fw-semibold text-dark">{row.property}</td>
                            <td>{row.floorNumber}</td>
                            <td>{row.floorName}</td>
                            <td>{row.totalSft ? row.totalSft.toLocaleString("en-IN") : "0"} SFT</td>
                            <td>
                              <span className="badge bg-light text-dark border">{row.floorType}</span>
                            </td>
                            <td>
                              <span className={`badge ${row.status === "Active" ? "bg-success" : "bg-warning text-dark"}`}>
                                {row.status}
                              </span>
                            </td>
                            <td>
                              {row.isValid ? (
                                <span className="badge bg-success text-white">
                                  <i className="bi bi-check-lg me-1"></i> Ready
                                </span>
                              ) : (
                                <span className="badge bg-danger text-white">
                                  <i className="bi bi-x-circle me-1"></i> {row.errors.join(", ")}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* STEP 3: POST-UPLOAD REVIEW & AUDIT */}
              {step === "result" && resultSummary && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-3 d-flex align-items-center gap-3 border ${resultSummary.summary?.failedCount === 0
                        ? "bg-success-subtle border-success text-success-emphasis"
                        : "bg-warning-subtle border-warning text-warning-emphasis"
                      }`}
                  >
                    <i
                      className={`bi ${resultSummary.summary?.failedCount === 0 ? "bi-check-circle-fill text-success" : "bi-exclamation-circle-fill text-warning"} fs-1`}
                    ></i>
                    <div>
                      <h6 className="fw-bold fs-6 m-0">Bulk Upload Processing Complete</h6>
                      <p className="m-0 mt-1" style={{ fontSize: "0.85rem" }}>
                        Successfully created <strong>{resultSummary.summary?.successCount || 0}</strong> floor records out of{" "}
                        <strong>{resultSummary.summary?.totalProcessed || 0}</strong> processed.
                      </p>
                    </div>
                  </div>

                  {resultSummary.errors && resultSummary.errors.length > 0 && (
                    <div className="border rounded-3 p-3 bg-light" style={{ maxHeight: "200px", overflowY: "auto" }}>
                      <div className="fw-bold text-danger mb-2" style={{ fontSize: "0.85rem" }}>
                        <i className="bi bi-exclamation-octagon me-1"></i> Failed Rows ({resultSummary.errors.length}):
                      </div>
                      {resultSummary.errors.map((err: any, idx: number) => (
                        <div key={idx} className="p-2 bg-white rounded border mb-2 text-danger" style={{ fontSize: "0.8rem" }}>
                          <strong>Row {err.row}:</strong> {err.errors?.join(", ")}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Error Alert Banner */}
              {errorMsg && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mt-3 mb-0 py-2 px-3" style={{ fontSize: "0.85rem" }}>
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{errorMsg}</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between align-items-center">
              <div>
                {step === "preview" && (
                  <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Review row details above before confirming upload.
                  </span>
                )}
              </div>
              <div className="d-flex gap-2">
                {step === "upload" && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary fw-semibold px-3"
                    onClick={resetModal}
                    style={{ borderRadius: "8px", height: "36px" }}
                  >
                    Cancel
                  </button>
                )}

                {step === "preview" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary fw-semibold px-3"
                      onClick={() => setStep("upload")}
                      style={{ borderRadius: "8px", height: "36px" }}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || validCount === 0}
                      className="btn btn-sm btn-dark fw-bold px-4 d-flex align-items-center gap-2"
                      style={{
                        backgroundColor: "var(--dark-section, #1e293b)",
                        borderRadius: "8px",
                        height: "36px",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          Processing Upload...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-arrow-up"></i> Confirm & Upload ({validCount} Rows)
                        </>
                      )}
                    </button>
                  </>
                )}

                {step === "result" && (
                  <>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary fw-semibold px-3"
                      onClick={() => {
                        setStep("upload");
                        setFile(null);
                        setPreviewRows([]);
                        setResultSummary(null);
                      }}
                      style={{ borderRadius: "8px", height: "36px" }}
                    >
                      Upload Another File
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-dark fw-bold px-4"
                      onClick={resetModal}
                      style={{
                        backgroundColor: "var(--dark-section, #1e293b)",
                        borderRadius: "8px",
                        height: "36px",
                      }}
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
