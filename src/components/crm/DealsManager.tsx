"use client";

import React, { useState, useEffect } from "react";
import Table, { TableColumn } from "@/components/common/Table";
import { api } from "@/utils/api";

interface DealsManagerProps {
  // We manage fetching internally for server-side pagination, search, and filtering.
  deals?: any[];
  isLoading?: boolean;
  onUpdateStage?: (id: string, newStage: string) => void;
  onDelete?: (id: string) => void;
  openNewDealForm?: () => void;
}

export default function DealsManager({}: DealsManagerProps) {

  // Server-side state
  const [deals, setDeals] = useState<any[]>([]);
  const [allDealsForMetrics, setAllDealsForMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Form Modals
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingDeal, setEditingDeal] = useState<any | null>(null);
  const [formStep, setFormStep] = useState<number>(1);

  // Form Fields
  const [dealName, setDealName] = useState("");
  const [dealType, setDealType] = useState("New Business");
  const [dealSource, setDealSource] = useState("Direct");
  const [accountId, setAccountId] = useState("");
  const [contactId, setContactId] = useState("");
  const [associatedLeadId, setAssociatedLeadId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [requiredArea, setRequiredArea] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [discountPercent, setDiscountPercent] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("Monthly");
  const [contractDuration, setContractDuration] = useState("12 Months");
  const [stage, setStage] = useState("New");
  const [probability, setProbability] = useState("10");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [salesOwner, setSalesOwner] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [lostReason, setLostReason] = useState("");

  // Document upload state (Simulated)
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; url: string }[]>([]);
  const [docNameInput, setDocNameInput] = useState("");
  const [docUrlInput, setDocUrlInput] = useState("");

  // Details Modal
  const [viewingDeal, setViewingDeal] = useState<any | null>(null);
  const [detailTab, setDetailTab] = useState<string>("overview");

  // Dropdown Lists
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [contactsList, setContactsList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [floorsList, setFloorsList] = useState<any[]>([]);
  const [unitsList, setUnitsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);

  // Local details modal interactive sub-lists
  const [activities, setActivities] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityType, setNewActivityType] = useState("Call");
  const [newActivityDesc, setNewActivityDesc] = useState("");

  // Fetch paginated deals
  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const params = [`limit=20`, `page=${currentPage}`];
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      if (stageFilter !== "All") params.push(`stage=${stageFilter}`);
      const qStr = params.length > 0 ? `?${params.join("&")}` : "";

      const res = await api.get(`/crm/deals${qStr}`);
      if (res.success) {
        let filtered = res.data || [];
        // client-side type and priority filtering if backend doesn't support them directly
        if (typeFilter !== "All") {
          filtered = filtered.filter((d: any) => d.deal_type === typeFilter);
        }
        if (priorityFilter !== "All") {
          filtered = filtered.filter((d: any) => d.priority === priorityFilter);
        }
        setDeals(filtered);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
          setTotalRecords(res.pagination.total || filtered.length);
        } else {
          setTotalPages(1);
          setTotalRecords(filtered.length);
        }
      }
    } catch (err) {
      console.error("Error fetching deals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all deals to compute metrics cards correctly
  const fetchAllDealsForMetrics = async () => {
    try {
      const res = await api.get("/crm/deals?limit=2000");
      if (res.success) {
        setAllDealsForMetrics(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Initial lists loading for dropdowns
  const fetchDropdownOptions = async () => {
    try {
      const accs = await api.get("/crm/accounts?limit=1000");
      if (accs.success) setAccountsList(accs.data || []);

      const lds = await api.get("/crm/leads?limit=1000");
      if (lds.success) setLeadsList(lds.data || []);

      const props = await api.get("/properties?limit=1000");
      if (props.success) setPropertiesList(props.data || []);

      const usrs = await api.get("/users?limit=1000");
      if (usrs.success) setUsersList(usrs.data || []);
      else {
        // Fallback owners list
        setUsersList([
          { _id: "1", name: "Anvaya Admin" },
          { _id: "2", name: "Rajesh Kumar" },
          { _id: "3", name: "Suresh Raina" }
        ]);
      }
    } catch (err) {
      console.error("Error loading dropdown data:", err);
    }
  };

  // Fetch contacts when account changes
  useEffect(() => {
    if (!accountId) {
      setContactsList([]);
      return;
    }
    api.get(`/crm/contacts?account_id=${accountId}&limit=500`)
      .then(res => {
        if (res.success) setContactsList(res.data || []);
      })
      .catch(err => console.error(err));
  }, [accountId]);

  // Fetch floors when property changes
  useEffect(() => {
    if (!propertyId) {
      setFloorsList([]);
      return;
    }
    api.get(`/floors?property=${propertyId}&limit=100`)
      .then(res => {
        if (res.success) setFloorsList(res.data || []);
      })
      .catch(err => console.error(err));
  }, [propertyId]);

  // Fetch units when floor changes
  useEffect(() => {
    if (!floorId) {
      setUnitsList([]);
      return;
    }
    api.get(`/units?floor=${floorId}&limit=100`)
      .then(res => {
        if (res.success) setUnitsList(res.data || []);
      })
      .catch(err => console.error(err));
  }, [floorId]);

  // Trigger loading details sub-lists
  useEffect(() => {
    if (!viewingDeal) return;
    // Activities
    api.get(`/crm/activities?limit=100`)
      .then(res => {
        if (res.success) {
          const filtered = (res.data || []).filter((a: any) => a.deal_id?._id === viewingDeal._id || a.deal_id === viewingDeal._id);
          setActivities(filtered);
        }
      });
    // Invoices / payments (only after Won)
    if (viewingDeal.stage === "Won" || viewingDeal.status === "Won") {
      api.get("/payments?limit=100")
        .then(res => {
          if (res.success) {
            const filtered = (res.data || []).filter((p: any) => p.deal_id === viewingDeal._id);
            setInvoices(filtered);
          }
        });
    }
  }, [viewingDeal]);

  useEffect(() => {
    fetchDeals();
    fetchAllDealsForMetrics();
  }, [currentPage, searchTerm, stageFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    fetchDropdownOptions();
  }, []);

  // Compute stats metrics
  const totalDeals = allDealsForMetrics.length;
  const openOpportunities = allDealsForMetrics.filter(d => d.stage !== "Won" && d.stage !== "Lost").length;
  const negotiationCount = allDealsForMetrics.filter(d => d.stage === "Negotiation").length;
  const wonDeals = allDealsForMetrics.filter(d => d.stage === "Won").length;
  const lostDeals = allDealsForMetrics.filter(d => d.stage === "Lost").length;
  const totalPipelineValue = allDealsForMetrics.reduce((sum, d) => sum + (d.amount || 0), 0);
  const expectedRevenue = allDealsForMetrics.reduce((sum, d) => sum + ((d.amount || 0) * (d.probability || 0) / 100), 0);

  // Open Form modal
  const openCreateModal = () => {
    setEditingDeal(null);
    setFormStep(1);
    setDealName("");
    setDealType("New Business");
    setDealSource("Direct");
    setAccountId("");
    setContactId("");
    setAssociatedLeadId("");
    setPropertyId("");
    setFloorId("");
    setUnitId("");
    setRequiredArea("");
    setMoveInDate("");
    setDealValue("");
    setDiscountPercent("0");
    setPaymentTerms("Monthly");
    setContractDuration("12 Months");
    setStage("New");
    setProbability("10");
    setExpectedCloseDate("");
    setSalesOwner("");
    setPriority("Medium");
    setNotes("");
    setLostReason("");
    setUploadedDocs([]);
    setShowFormModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingDeal(item);
    setFormStep(1);
    setDealName(item.name || "");
    setDealType(item.deal_type || "New Business");
    setDealSource(item.deal_source || "Direct");
    setAccountId(item.account_id?._id || item.account_id || "");
    setContactId(item.contact_id?._id || item.contact_id || "");
    setAssociatedLeadId(item.lead_id?._id || item.lead_id || "");
    setPropertyId(item.propertyId?._id || item.propertyId || "");
    setFloorId(item.floorId?._id || item.floorId || "");
    setUnitId(item.unitId?._id || item.unitId || "");
    setRequiredArea(item.requirement || "");
    setMoveInDate(item.moveInDate ? item.moveInDate.split("T")[0] : "");
    setDealValue(item.amount ? String(item.amount) : "");
    setDiscountPercent(item.discount ? String(item.discount) : "0");
    setPaymentTerms(item.payment_terms || "Monthly");
    setContractDuration(item.contract_duration || "12 Months");
    setStage(item.stage || "New");
    setProbability(item.probability ? String(item.probability) : "10");
    setExpectedCloseDate(item.expectedCloseDate ? item.expectedCloseDate.split("T")[0] : "");
    setSalesOwner(item.owner?._id || item.owner || "");
    setPriority(item.priority || "Medium");
    setNotes(item.notes || "");
    setLostReason(item.lostReason || "");
    setUploadedDocs(item.documents || []);
    setShowFormModal(true);
  };

  // Handle Form Submit
  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: dealName,
      deal_type: dealType,
      deal_source: dealSource,
      account_id: accountId || undefined,
      contact_id: contactId || undefined,
      lead_id: associatedLeadId || undefined,
      propertyId: propertyId || undefined,
      floorId: floorId || undefined,
      unitId: unitId || undefined,
      requirement: requiredArea,
      moveInDate: moveInDate || undefined,
      amount: parseFloat(dealValue) || 0,
      discount: parseFloat(discountPercent) || 0,
      expected_revenue: (parseFloat(dealValue) || 0) * (parseFloat(probability) || 0) / 100,
      payment_terms: paymentTerms,
      contract_duration: contractDuration,
      stage,
      probability: parseInt(probability) || 0,
      expectedCloseDate: expectedCloseDate || undefined,
      owner: salesOwner || undefined,
      priority,
      notes,
      lostReason: stage === "Lost" ? lostReason : undefined,
      documents: uploadedDocs
    };

    try {
      let res;
      if (editingDeal) {
        res = await api.put(`/crm/deals/${editingDeal._id}`, payload);
      } else {
        res = await api.post("/crm/deals", payload);
      }

      if (res.success) {
        setShowFormModal(false);
        fetchDeals();
        fetchAllDealsForMetrics();
        alert("Deal saved successfully!");
      } else {
        alert(res.error || "Failed to save deal.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Log Activity
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle) return;
    try {
      const res = await api.post("/crm/activities", {
        activity_type: newActivityType,
        subject: newActivityTitle,
        description: newActivityDesc,
        deal_id: viewingDeal._id,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString(),
        status: "Completed"
      });
      if (res.success) {
        setNewActivityTitle("");
        setNewActivityDesc("");
        // refresh list
        const actRes = await api.get(`/crm/activities?limit=100`);
        if (actRes.success) {
          const filtered = (actRes.data || []).filter((a: any) => a.deal_id?._id === viewingDeal._id || a.deal_id === viewingDeal._id);
          setActivities(filtered);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Columns definition
  const columns: TableColumn<any>[] = [

    {
      header: "Deal Name",
      style: {
        position: "sticky",
        left: 0,
        zIndex: 6,
        minWidth: "160px",
        width: "160px",
        boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
        backgroundColor: "var(--bg-card)"
      },
      render: (item) => (
        <span 
          className="fw-bold text-dark hover-underline" 
          style={{ cursor: "pointer", fontSize: "0.825rem" }}
          onClick={() => { setViewingDeal(item); setDetailTab("overview"); }}
        >
          {item.name}
        </span>
      )
    },
    {
      header: "Account / Company",
      render: (item) => {
        const comp = item.account_id?.company_name || "—";
        return (
          <span className="text-secondary fw-medium" style={{ fontSize: "0.825rem" }}>
            {comp !== "—" ? (comp.charAt(0).toUpperCase() + comp.slice(1)) : "—"}
          </span>
        );
      }
    },
    {
      header: "Contact Person",
      render: (item) => (
        <span style={{ fontSize: "0.825rem" }}>{item.contact_id?.name || "—"}</span>
      )
    },
    {
      header: "Deal Type",
      render: (item) => <span className="badge bg-light text-dark border" style={{ fontSize: "0.75rem" }}>{item.deal_type || "Lease"}</span>
    },
    {
      header: "Space Allocation",
      render: (item) => (
        <div className="d-flex flex-column">
          <span className="fw-semibold text-dark" style={{ fontSize: "0.8rem" }}>{item.propertyId?.propertyName || "—"}</span>
          {(item.floorId || item.unitId) && (
            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
              {item.floorId?.floorName || `Floor ${item.floorId?.floorNumber || ""}`} • Unit {item.unitId?.unitNumber || ""}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Deal Value",
      render: (item) => <span className="fw-bold text-dark" style={{ fontSize: "0.825rem" }}>₹{(item.amount || 0).toLocaleString("en-IN")}</span>
    },
    {
      header: "Stage",
      render: (item) => {
        const stage = item.stage || "New";
        let badgeStyle = { backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #dbeafe" };
        if (stage === "Won") {
          badgeStyle = { backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #dcfce7" };
        } else if (stage === "Lost") {
          badgeStyle = { backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fee2e2" };
        } else if (stage === "Negotiation") {
          badgeStyle = { backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #ffedd5" };
        }
        return (
          <span className="badge px-2 py-1 fw-bold" style={{ fontSize: "0.725rem", borderRadius: "var(--radius-full)", ...badgeStyle }}>
            {stage}
          </span>
        );
      }
    },
    {
      header: "Probability",
      render: (item) => <span className="fw-bold text-primary" style={{ fontSize: "0.8rem" }}>{item.probability || 0}%</span>
    },
    {
      header: "Assigned To",
      render: (item) => <span style={{ fontSize: "0.8rem" }}>{item.owner?.name || "—"}</span>
    },
    {
      header: "Priority",
      render: (item) => {
        const pri = item.priority || "Medium";
        const badgeColor = pri === "High" ? "bg-danger" : pri === "Medium" ? "bg-warning text-dark" : "bg-secondary";
        return <span className={`badge ${badgeColor}`} style={{ fontSize: "0.7rem" }}>{pri}</span>;
      }
    },
    {
      header: "Actions",
      style: {
        position: "sticky",
        right: 0,
        zIndex: 6,
        minWidth: "90px",
        width: "90px",
        backgroundColor: "var(--bg-card)",
        boxShadow: "-2px 0 5px rgba(0,0,0,0.05)"
      },
      render: (item) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--bg-app)", border: "none", color: "var(--text-main)" }}
            onClick={() => { setViewingDeal(item); setDetailTab("overview"); }}
            title="View Deal Details"
          >
            <i className="bi bi-eye" style={{ fontSize: "0.85rem" }} />
          </button>
          <button
            className="btn btn-sm p-0 d-inline-flex align-items-center justify-content-center"
            style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "var(--bg-app)", border: "none", color: "var(--text-main)" }}
            onClick={() => openEditModal(item)}
            title="Edit Deal"
          >
            <i className="bi bi-pencil" style={{ fontSize: "0.85rem" }} />
          </button>
        </div>
      )
    }
  ];

  return (
    <>
      {/* ── METRIC CARDS ── */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        {/* Total Deals */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "175px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb"
              }}
            >
              <i className="bi bi-piggy-bank" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Deals</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{totalDeals}</div>
            </div>
          </div>
        </div>

        {/* Open Opportunities */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "175px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#fff7ed",
                color: "#ea580c"
              }}
            >
              <i className="bi bi-clock-history" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Open Opps</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{openOpportunities}</div>
            </div>
          </div>
        </div>

        {/* Negotiation */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "175px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#f5f3ff",
                color: "#7c3aed"
              }}
            >
              <i className="bi bi-chat-right-quote" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Negotiations</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{negotiationCount}</div>
            </div>
          </div>
        </div>

        {/* Won Deals */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "175px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                color: "#16a34a"
              }}
            >
              <i className="bi bi-check-circle" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Won Deals</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{wonDeals}</div>
            </div>
          </div>
        </div>

        {/* Lost Deals */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "175px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#fef2f2",
                color: "#dc2626"
              }}
            >
              <i className="bi bi-x-circle" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Lost Deals</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1.1rem", lineHeight: "1" }}>{lostDeals}</div>
            </div>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "220px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#eff6ff",
                color: "#2563eb"
              }}
            >
              <i className="bi bi-cash-stack" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Total Pipeline Value</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1rem", lineHeight: "1" }}>₹{totalPipelineValue.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>

        {/* Expected Revenue */}
        <div className="col-auto">
          <div
            className="card border-0 d-flex flex-row align-items-center gap-2"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              width: "220px"
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#f0fdf4",
                color: "#16a34a"
              }}
            >
              <i className="bi bi-graph-up-arrow" style={{ fontSize: "1rem" }}></i>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "0.7rem", fontWeight: "500", lineHeight: "1.1" }}>Expected Revenue</div>
              <div className="fw-bold text-dark mt-1" style={{ fontSize: "1rem", lineHeight: "1" }}>₹{expectedRevenue.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── OPPORTUNITIES & DEALS DIRECTORY CARD ── */}
      <div className="card border-0 p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "10px" }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h5 className="fw-bold m-0" style={{ color: "var(--text-main)", fontSize: "1.1rem" }}>Opportunities & Deals Directory</h5>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">

            <div className="position-relative">
              <i className="bi bi-search text-muted position-absolute" style={{ left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem" }}></i>
              <input
                type="text"
                placeholder="Search deals..."
                className="form-control form-control-sm"
                value={searchTerm || ""}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "200px", paddingLeft: "30px", borderColor: "var(--border-color)", borderRadius: "10px", height: "36px", fontSize: "0.85rem" }}
              />
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: "150px", borderColor: "var(--border-color)", borderRadius: "10px", height: "36px", fontSize: "0.85rem" }}
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
            >
              <option value="All">All Stages</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Site Visit">Site Visit</option>
              <option value="Discussion">Discussion</option>
              <option value="Proposal">Proposal</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <select
              className="form-select form-select-sm"
              style={{ width: "150px", borderColor: "var(--border-color)", borderRadius: "10px", height: "36px", fontSize: "0.85rem" }}
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="All">All Deal Types</option>
              <option value="New Business">New Business</option>
              <option value="Renewal">Renewal</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Service">Service</option>
              <option value="Lease">Lease</option>
              <option value="Purchase">Purchase</option>
            </select>

            <button
              className="btn btn-dark btn-sm fw-bold px-3 d-flex align-items-center gap-2"
              style={{ backgroundColor: "var(--dark-section)", borderRadius: "10px", height: "36px", fontSize: "0.85rem", paddingTop: "0px", paddingBottom: "0px" }}
              onClick={openCreateModal}
            >
              <i className="bi bi-plus-lg"></i> Create Deal
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={deals}
          isLoading={isLoading}
          emptyMessage="No opportunities match your filter options."
          containerClassName="table-responsive-container table-responsive mt-0"
        />

        {/* Pagination Controls */}
        {!isLoading && totalRecords > 0 && (
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4 pt-3 border-top" style={{ fontSize: "0.825rem" }}>
            <div className="text-muted">
              Showing <span className="fw-semibold">{Math.min((currentPage - 1) * 20 + 1, totalRecords)}</span> to{" "}
              <span className="fw-semibold">{Math.min(currentPage * 20, totalRecords)}</span> of{" "}
              <span className="fw-semibold">{totalRecords}</span> deals
            </div>
            
            <div className="d-flex gap-1 align-items-center">
              <button
                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px", borderRadius: "10px", borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <i className="bi bi-chevron-left" />
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => {
                if (pg === 1 || pg === totalPages || Math.abs(pg - currentPage) <= 1) {
                  const isActive = pg === currentPage;
                  return (
                    <button
                      key={pg}
                      className="btn btn-sm d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "10px",
                        border: isActive ? "none" : "1px solid var(--border-color)",
                        backgroundColor: isActive ? "var(--dark-section)" : "var(--bg-card)",
                        color: isActive ? "#ffffff" : "var(--text-main)"
                      }}
                      onClick={() => setCurrentPage(pg)}
                    >
                      {pg}
                    </button>
                  );
                } else if (pg === 2 || pg === totalPages - 1) {
                  return <span key={pg} className="px-1 text-muted" style={{ userSelect: "none" }}>...</span>;
                }
                return null;
              })}

              <button
                className="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px", borderRadius: "10px", borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)", color: "var(--text-main)" }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT DEAL FORM MODAL ── */}
      {showFormModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 1200, backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: 720 }}>
            <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between px-4 py-3 bg-dark text-white">
                <h5 className="modal-title fw-bold m-0" style={{ fontSize: "1.05rem" }}>
                  {editingDeal ? "Edit Sales Deal Opportunity" : "Create New Deal Opportunity"}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowFormModal(false)} />
              </div>

              {/* Step indicator */}
              <div className="d-flex align-items-center justify-content-between px-5 py-3 border-bottom bg-light" style={{ userSelect: "none" }}>
                {[
                  { step: 1, label: "Info" },
                  { step: 2, label: "Customer" },
                  { step: 3, label: "Property" },
                  { step: 4, label: "Commercials" },
                  { step: 5, label: "Pipeline" },
                  { step: 6, label: "Ownership" },
                  { step: 7, label: "Files" }
                ].map(s => {
                  const isActive = s.step === formStep;
                  const isCompleted = s.step < formStep;
                  return (
                    <div 
                      key={s.step} 
                      className="d-flex flex-column align-items-center cursor-pointer"
                      onClick={() => setFormStep(s.step)}
                    >
                      <div 
                        className="d-flex align-items-center justify-content-center fw-bold shadow-sm"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: isActive || isCompleted ? "var(--dark-section)" : "#cbd5e1",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          border: "2px solid #ffffff"
                        }}
                      >
                        {s.step}
                      </div>
                      <span className="mt-1" style={{ fontSize: "0.68rem", fontWeight: isActive ? 600 : 500, color: isActive ? "#0f172a" : "#64748b" }}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Form Content */}
              <form onSubmit={(e) => {
                if (formStep < 7) {
                  e.preventDefault();
                  setFormStep(prev => prev + 1);
                } else {
                  handleSaveDeal(e);
                }
              }}>
                <div className="modal-body p-4" style={{ maxHeight: "480px", overflowY: "auto" }}>
                  
                  {/* Step 1: Deal Information */}
                  {formStep === 1 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark small mb-1">Deal Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          placeholder="Enter deal name (e.g. ABC Technologies Office Lease)"
                          value={dealName}
                          onChange={e => setDealName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Deal Type <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm"
                          required
                          value={dealType}
                          onChange={e => setDealType(e.target.value)}
                        >
                          <option value="New Business">New Business</option>
                          <option value="Renewal">Renewal</option>
                          <option value="Upgrade">Upgrade</option>
                          <option value="Service">Service</option>
                          <option value="Lease">Lease</option>
                          <option value="Purchase">Purchase</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Deal Source</label>
                        <select
                          className="form-select form-select-sm"
                          value={dealSource}
                          onChange={e => setDealSource(e.target.value)}
                        >
                          <option value="Lead">Lead</option>
                          <option value="Referral">Referral</option>
                          <option value="Campaign">Campaign</option>
                          <option value="Direct">Direct</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Customer Information */}
                  {formStep === 2 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Select Account / Company <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm"
                          required
                          value={accountId}
                          onChange={e => setAccountId(e.target.value)}
                        >
                          <option value="">— Select B2B Account —</option>
                          {accountsList.map(a => <option key={a._id} value={a._id}>{a.company_name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Select Contact Person <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm"
                          required
                          disabled={!accountId}
                          value={contactId}
                          onChange={e => setContactId(e.target.value)}
                        >
                          <option value="">— Select Contact Person —</option>
                          {contactsList.map(c => <option key={c._id} value={c._id}>{c.name} ({c.designation || "Contact"})</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark small mb-1">Source CRM Lead (Optional)</label>
                        <select
                          className="form-select form-select-sm"
                          value={associatedLeadId}
                          onChange={e => setAssociatedLeadId(e.target.value)}
                        >
                          <option value="">— Select Qualified Lead —</option>
                          {leadsList.map(l => <option key={l._id} value={l._id}>{l.lead_name || l.name}</option>)}
                        </select>
                      </div>

                      {/* Auto contact display */}
                      {contactId && (
                        <div className="col-12 mt-3 p-3 bg-light rounded border">
                          <span className="fw-bold text-muted small d-block mb-1">Auto Customer Data Overview</span>
                          {(() => {
                            const c = contactsList.find(x => x._id === contactId);
                            if (!c) return <span className="text-muted small">Loading details...</span>;
                            return (
                              <div className="row g-2 small">
                                <div className="col-md-4"><strong>Designation:</strong> {c.designation || "—"}</div>
                                <div className="col-md-4"><strong>Phone:</strong> {c.phone || "—"}</div>
                                <div className="col-md-4"><strong>Email:</strong> {c.email || "—"}</div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 3: Property Opportunity */}
                  {formStep === 3 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Select Property <span className="text-danger">*</span></label>
                        <select
                          className="form-select form-select-sm"
                          required
                          value={propertyId}
                          onChange={e => setPropertyId(e.target.value)}
                        >
                          <option value="">— Select Property Building —</option>
                          {propertiesList.map(p => <option key={p._id} value={p._id}>{p.propertyName}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Select Floor</label>
                        <select
                          className="form-select form-select-sm"
                          disabled={!propertyId}
                          value={floorId}
                          onChange={e => setFloorId(e.target.value)}
                        >
                          <option value="">— Select Floor —</option>
                          {floorsList.map(f => <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Select Available Unit</label>
                        <select
                          className="form-select form-select-sm"
                          disabled={!floorId}
                          value={unitId}
                          onChange={e => setUnitId(e.target.value)}
                        >
                          <option value="">— Select Available Space Unit —</option>
                          {unitsList.map(u => <option key={u._id} value={u._id}>{u.unitNumber} ({u.unitStatus})</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Required Area (Sq.ft)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. 2500 Sq.ft"
                          value={requiredArea}
                          onChange={e => setRequiredArea(e.target.value)}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-bold text-dark small mb-1">Move-in Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={moveInDate}
                          onChange={e => setMoveInDate(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Commercial Details */}
                  {formStep === 4 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Deal Value (₹) <span className="text-danger">*</span></label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          required
                          placeholder="₹ Enter Deal Value"
                          value={dealValue}
                          onChange={e => setDealValue(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Discount %</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="Enter discount percent"
                          value={discountPercent}
                          onChange={e => setDiscountPercent(e.target.value)}
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-bold text-dark text-muted small mb-1">Auto expected revenue: ₹{((parseFloat(dealValue) || 0) * (1 - (parseFloat(discountPercent) || 0)/100)).toLocaleString("en-IN")}</label>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Payment Terms</label>
                        <select
                          className="form-select form-select-sm"
                          value={paymentTerms}
                          onChange={e => setPaymentTerms(e.target.value)}
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Quarterly">Quarterly</option>
                          <option value="Yearly">Yearly</option>
                          <option value="One Time">One Time</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Contract Duration</label>
                        <select
                          className="form-select form-select-sm"
                          value={contractDuration}
                          onChange={e => setContractDuration(e.target.value)}
                        >
                          <option value="12 Months">12 Months</option>
                          <option value="24 Months">24 Months</option>
                          <option value="36 Months">36 Months</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Sales Pipeline */}
                  {formStep === 5 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Pipeline Stage</label>
                        <select
                          className="form-select form-select-sm"
                          value={stage}
                          onChange={e => setStage(e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Site Visit">Site Visit</option>
                          <option value="Discussion">Discussion</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Proposal Sent">Proposal Sent</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Probability (0-100%)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="0"
                          max="100"
                          value={probability}
                          onChange={e => setProbability(e.target.value)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark small mb-1">Expected Close Date</label>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={expectedCloseDate}
                          onChange={e => setExpectedCloseDate(e.target.value)}
                        />
                      </div>

                      {stage === "Lost" && (
                        <div className="col-12 animate-fade-in">
                          <label className="form-label fw-bold text-danger small mb-1">Lost Reason *</label>
                          <select
                            className="form-select form-select-sm border-danger"
                            required
                            value={lostReason}
                            onChange={e => setLostReason(e.target.value)}
                          >
                            <option value="">— Select Reason —</option>
                            <option value="Budget Issue">Budget Issue</option>
                            <option value="Competitor">Competitor</option>
                            <option value="No Response">No Response</option>
                            <option value="Requirement Changed">Requirement Changed</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 6: Ownership */}
                  {formStep === 6 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Sales Owner</label>
                        <select
                          className="form-select form-select-sm"
                          value={salesOwner}
                          onChange={e => setSalesOwner(e.target.value)}
                        >
                          <option value="">Select Employee</option>
                          {usersList.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-dark small mb-1">Priority</label>
                        <select
                          className="form-select form-select-sm"
                          value={priority}
                          onChange={e => setPriority(e.target.value)}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold text-dark small mb-1">Notes & Remarks</label>
                        <textarea
                          className="form-control form-control-sm"
                          rows={3}
                          placeholder="Add deal notes..."
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 7: Notes & Documents */}
                  {formStep === 7 && (
                    <div className="row g-3 animate-fade-in">
                      <div className="col-12">
                        <h6 className="fw-bold mb-2 small text-secondary">Upload Proposal / Quotation Documents (Simulated)</h6>
                        <div className="bg-light p-3 rounded border d-flex flex-column gap-2 mb-3">
                          <div className="row g-2">
                            <div className="col-md-5">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Document Name (e.g. Quotation v1)"
                                value={docNameInput}
                                onChange={e => setDocNameInput(e.target.value)}
                              />
                            </div>
                            <div className="col-md-5">
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="https://example.com/doc.pdf"
                                value={docUrlInput}
                                onChange={e => setDocUrlInput(e.target.value)}
                              />
                            </div>
                            <div className="col-md-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-dark w-100"
                                onClick={() => {
                                  if (docNameInput && docUrlInput) {
                                    setUploadedDocs(prev => [...prev, { name: docNameInput, url: docUrlInput }]);
                                    setDocNameInput("");
                                    setDocUrlInput("");
                                  }
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>

                        {uploadedDocs.length > 0 && (
                          <div className="list-group">
                            {uploadedDocs.map((doc, idx) => (
                              <div key={idx} className="list-group-item d-flex justify-content-between align-items-center p-2 bg-light border-0 mb-1 rounded small">
                                <span>{doc.name}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-danger p-0"
                                  onClick={() => setUploadedDocs(prev => prev.filter((_, i) => i !== idx))}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="modal-footer p-3 bg-light d-flex justify-content-between">
                  <div>
                    {formStep > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-light border fw-bold px-3 py-2"
                        onClick={() => setFormStep(prev => prev - 1)}
                      >
                        Back
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-light border fw-bold px-3 py-2"
                      onClick={() => setShowFormModal(false)}
                    >
                      Cancel
                    </button>

                    {formStep < 7 ? (
                      <button type="submit" className="btn btn-dark btn-sm fw-bold px-3 py-2">
                        Next
                      </button>
                    ) : (
                      <>
                        <button type="submit" className="btn btn-dark btn-sm fw-bold px-3 py-2">
                          Save Deal
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DEAL 360 DETAIL VIEW MODAL ── */}
      {viewingDeal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", zIndex: 1200, backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: 800 }}>
            <div className="modal-content border-0 overflow-hidden" style={{ borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              {/* Header */}
              <div className="p-4 bg-dark text-white d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="fw-bold mb-1">{viewingDeal.name}</h5>
                  <div className="d-flex gap-3 align-items-center mt-1 text-light opacity-75 small">
                    <span>{viewingDeal.deal_id || "DEAL-PROSPECT"}</span>
                    <span>•</span>
                    <span>₹{(viewingDeal.amount || 0).toLocaleString("en-IN")}</span>
                    <span>•</span>
                    <span className="badge bg-light text-dark fw-bold">{viewingDeal.stage || "New"}</span>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingDeal(null)} />
              </div>

              {/* Tabs Selector */}
              <div className="bg-light px-3 border-bottom">
                <nav className="nav nav-tabs border-0" style={{ fontSize: "0.8rem" }}>
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "timeline", label: "Timeline" },
                    { id: "activities", label: "Activities" },
                    { id: "documents", label: "Documents" },
                    { id: "payments", label: "Payments" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`nav-link border-0 fw-bold px-4 py-3 ${detailTab === tab.id ? "active bg-white text-dark" : "text-muted bg-transparent"}`}
                      onClick={() => setDetailTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Contents */}
              <div className="modal-body p-4 overflow-auto bg-light" style={{ maxHeight: "400px", fontSize: "0.825rem" }}>
                
                {/* Tab 1: Overview */}
                {detailTab === "overview" && (
                  <div className="row g-3">
                    <div className="col-md-6 bg-white p-3 rounded border">
                      <strong className="text-secondary d-block mb-2">Deal Information</strong>
                      <div className="row g-2">
                        <div className="col-5 text-muted">Type:</div>
                        <div className="col-7 text-dark fw-semibold">{viewingDeal.deal_type || "New Business"}</div>
                        <div className="col-5 text-muted">Source:</div>
                        <div className="col-7 text-dark">{viewingDeal.deal_source || "Direct"}</div>
                        <div className="col-5 text-muted">Priority:</div>
                        <div className="col-7 text-dark">{viewingDeal.priority || "Medium"}</div>
                        <div className="col-5 text-muted">Probability:</div>
                        <div className="col-7 text-dark fw-bold text-primary">{viewingDeal.probability || 0}%</div>
                      </div>
                    </div>

                    <div className="col-md-6 bg-white p-3 rounded border">
                      <strong className="text-secondary d-block mb-2">Customer Details</strong>
                      <div className="row g-2">
                        <div className="col-5 text-muted">Company:</div>
                        <div className="col-7 text-dark fw-semibold">{viewingDeal.account_id?.company_name || "—"}</div>
                        <div className="col-5 text-muted">Contact:</div>
                        <div className="col-7 text-dark fw-semibold">{viewingDeal.contact_id?.name || "—"}</div>
                        <div className="col-5 text-muted">Source Lead:</div>
                        <div className="col-7 text-dark">{viewingDeal.lead_id?.lead_name || "—"}</div>
                      </div>
                    </div>

                    <div className="col-md-6 bg-white p-3 rounded border">
                      <strong className="text-secondary d-block mb-2">Property Allocation</strong>
                      <div className="row g-2">
                        <div className="col-5 text-muted">Property:</div>
                        <div className="col-7 text-dark fw-semibold">{viewingDeal.propertyId?.propertyName || "—"}</div>
                        <div className="col-5 text-muted">Floor:</div>
                        <div className="col-7 text-dark">{viewingDeal.floorId?.floorName || `Floor ${viewingDeal.floorId?.floorNumber || ""}`}</div>
                        <div className="col-5 text-muted">Space Unit:</div>
                        <div className="col-7 text-dark fw-semibold text-primary">{viewingDeal.unitId?.unitNumber || "—"}</div>
                        <div className="col-5 text-muted">Req Area:</div>
                        <div className="col-7 text-dark">{viewingDeal.requirement || "—"}</div>
                      </div>
                    </div>

                    <div className="col-md-6 bg-white p-3 rounded border">
                      <strong className="text-secondary d-block mb-2">Commercial Terms</strong>
                      <div className="row g-2">
                        <div className="col-5 text-muted">Deal Value:</div>
                        <div className="col-7 text-dark fw-bold">₹{(viewingDeal.amount || 0).toLocaleString("en-IN")}</div>
                        <div className="col-5 text-muted">Expected Rev:</div>
                        <div className="col-7 text-success fw-bold">₹{((viewingDeal.amount || 0) * (viewingDeal.probability || 0) / 100).toLocaleString("en-IN")}</div>
                        <div className="col-5 text-muted">Payment Terms:</div>
                        <div className="col-7 text-dark">{viewingDeal.payment_terms || "Monthly"}</div>
                        <div className="col-5 text-muted">Duration:</div>
                        <div className="col-7 text-dark">{viewingDeal.contract_duration || "12 Months"}</div>
                      </div>
                    </div>

                    {viewingDeal.notes && (
                      <div className="col-12 bg-white p-3 rounded border">
                        <strong className="text-secondary d-block mb-1">Notes & Description</strong>
                        <p className="m-0 text-dark" style={{ whiteSpace: "pre-line" }}>{viewingDeal.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Timeline */}
                {detailTab === "timeline" && (
                  <div className="d-flex flex-column gap-3 py-2">
                    <div className="d-flex gap-3 position-relative">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px" }}><i className="bi bi-check-lg" /></div>
                        <div className="bg-success" style={{ width: "2px", flexGrow: 1, minHeight: "30px" }} />
                      </div>
                      <div>
                        <strong className="text-dark d-block">Deal Record Created</strong>
                        <span className="text-muted small">{viewingDeal.createdAt ? new Date(viewingDeal.createdAt).toLocaleString("en-IN") : "—"}</span>
                      </div>
                    </div>

                    {viewingDeal.contact_id && (
                      <div className="d-flex gap-3 position-relative">
                        <div className="d-flex flex-column align-items-center">
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px" }}><i className="bi bi-person-check-fill" /></div>
                          <div className="bg-success" style={{ width: "2px", flexGrow: 1, minHeight: "30px" }} />
                        </div>
                        <div>
                          <strong className="text-dark d-block">Customer Contact Linked</strong>
                          <span className="text-muted small">{viewingDeal.contact_id?.name} added as primary decision maker.</span>
                        </div>
                      </div>
                    )}

                    {viewingDeal.propertyId && (
                      <div className="d-flex gap-3 position-relative">
                        <div className="d-flex flex-column align-items-center">
                          <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px" }}><i className="bi bi-building" /></div>
                          <div className="bg-success" style={{ width: "2px", flexGrow: 1, minHeight: "30px" }} />
                        </div>
                        <div>
                          <strong className="text-dark d-block">Property Space Allocation Setup</strong>
                          <span className="text-muted small">Assigned Unit {viewingDeal.unitId?.unitNumber || "—"} at {viewingDeal.propertyId?.propertyName}.</span>
                        </div>
                      </div>
                    )}

                    <div className="d-flex gap-3">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px" }}><i className="bi bi-clock-fill" /></div>
                      </div>
                      <div>
                        <strong className="text-dark d-block">Current Stage: {viewingDeal.stage}</strong>
                        <span className="text-muted small">Deal probability set to {viewingDeal.probability}%. Expected close date: {viewingDeal.expectedCloseDate ? new Date(viewingDeal.expectedCloseDate).toLocaleDateString() : "—"}.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Activities */}
                {detailTab === "activities" && (
                  <div className="d-flex flex-column gap-3">
                    <form onSubmit={handleAddActivity} className="bg-white p-3 rounded border row g-2">
                      <strong className="text-dark small d-block mb-1 col-12">Log New Interaction Activity</strong>
                      <div className="col-md-4">
                        <select className="form-select form-select-sm" value={newActivityType} onChange={e => setNewActivityType(e.target.value)}>
                          <option value="Call">Call</option>
                          <option value="Meeting">Meeting</option>
                          <option value="Email">Email</option>
                          <option value="Note">Note</option>
                        </select>
                      </div>
                      <div className="col-md-8">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          placeholder="Activity Title (e.g. Discussed proposal discount)"
                          value={newActivityTitle}
                          onChange={e => setNewActivityTitle(e.target.value)}
                        />
                      </div>
                      <div className="col-md-10">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Details (Optional)"
                          value={newActivityDesc}
                          onChange={e => setNewActivityDesc(e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <button type="submit" className="btn btn-sm btn-dark w-100">Log</button>
                      </div>
                    </form>

                    <div className="list-group">
                      {activities.length === 0 ? (
                        <div className="text-center py-4 text-muted bg-white rounded border border-dashed">No activity records logged.</div>
                      ) : (
                        activities.map(act => (
                          <div key={act._id} className="list-group-item d-flex justify-content-between align-items-center bg-white p-3 border mb-1 rounded">
                            <div>
                              <strong className="text-dark">{act.subject}</strong>
                              <div className="text-muted small mt-0.5">{act.description}</div>
                              <span className="text-muted small mt-1 d-block" style={{ fontSize: "0.68rem" }}>{act.date ? new Date(act.date).toLocaleDateString() : ""} {act.time}</span>
                            </div>
                            <span className="badge bg-secondary-subtle text-secondary border">{act.activity_type}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}



                {/* Tab 5: Documents */}
                {detailTab === "documents" && (
                  <div className="d-flex flex-column gap-2">
                    {(!viewingDeal.documents || viewingDeal.documents.length === 0) ? (
                      <div className="text-center py-4 text-muted bg-white rounded border border-dashed">No proposal or contract documents uploaded.</div>
                    ) : (
                      viewingDeal.documents.map((doc: any, i: number) => (
                        <div key={i} className="list-group-item d-flex justify-content-between align-items-center bg-white p-3 border mb-1 rounded">
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-pdf-fill text-danger fs-5" />
                            <strong>{doc.name}</strong>
                          </div>
                          <a href={doc.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border px-2">
                            View File <i className="bi bi-box-arrow-up-right ms-1" />
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 6: Payments */}
                {detailTab === "payments" && (
                  <div className="d-flex flex-column gap-3">
                    {(viewingDeal.stage !== "Won" && viewingDeal.status !== "Won") ? (
                      <div className="text-center py-4 text-muted bg-white rounded border border-dashed">
                        Payments ledger and payment schedule will generate automatically once Deal is marked <strong>Won</strong>.
                      </div>
                    ) : (
                      <>
                        <div className="row g-2 text-center">
                          <div className="col bg-white p-3 rounded border">
                            <span className="text-muted d-block small">Invoice Total</span>
                            <strong className="text-dark fs-6">₹{(viewingDeal.amount || 0).toLocaleString("en-IN")}</strong>
                          </div>
                          <div className="col bg-white p-3 rounded border">
                            <span className="text-muted d-block small">Paid Amount</span>
                            <strong className="text-success fs-6">₹{invoices.filter(i => i.status === "Paid").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString("en-IN")}</strong>
                          </div>
                          <div className="col bg-white p-3 rounded border">
                            <span className="text-muted d-block small">Pending Balance</span>
                            <strong className="text-danger fs-6">₹{invoices.filter(i => i.status !== "Paid").reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString("en-IN")}</strong>
                          </div>
                        </div>

                        <div className="list-group mt-2">
                          {invoices.length === 0 ? (
                            <div className="text-center py-4 text-muted bg-white rounded border border-dashed">No initial invoice generated yet.</div>
                          ) : (
                            invoices.map(inv => (
                              <div key={inv._id} className="list-group-item d-flex justify-content-between align-items-center bg-white p-3 border mb-1 rounded">
                                <div>
                                  <strong className="text-dark">{inv.invoiceNumber || "Invoice Record"}</strong>
                                  <div className="text-muted small">Due Date: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</div>
                                </div>
                                <div className="text-end">
                                  <span className="fw-bold text-dark d-block">₹{(inv.amount || 0).toLocaleString("en-IN")}</span>
                                  <span className={`badge ${inv.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: "0.68rem" }}>{inv.status}</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

              </div>
              <div className="modal-footer p-3 bg-light">
                <button type="button" className="btn btn-sm btn-dark px-4 py-2" onClick={() => setViewingDeal(null)}>
                  Close Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
