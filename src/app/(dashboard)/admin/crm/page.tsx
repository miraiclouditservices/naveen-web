"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { api } from "@/utils/api";
import { useSearchParams } from "next/navigation";

// Import modular CRM components
import CRMDashboard from "@/components/crm/CRMDashboard";
import LeadsManager from "@/components/crm/LeadsManager";
import ContactsManager from "@/components/crm/ContactsManager";
import AccountsManager from "@/components/crm/AccountsManager";
import DealsManager from "@/components/crm/DealsManager";
import PipelineKanban from "@/components/crm/PipelineKanban";
import ActivitiesManager from "@/components/crm/ActivitiesManager";
import CommunicationTimeline from "@/components/crm/CommunicationTimeline";
import ReportsAnalytics from "@/components/crm/ReportsAnalytics";
import CRMSettings from "@/components/crm/CRMSettings";
import CRMFormModals from "@/components/crm/CRMFormModals";

type CRMTab =
  | "dashboard"
  | "leads"
  | "contacts"
  | "accounts"
  | "deals"
  | "pipeline"
  | "activities"
  | "communication"
  | "reports"
  | "settings";

function CRMContent() {
  const [activeTab, setActiveTab] = useState<CRMTab>("dashboard");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Read tab parameter from URL search params
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as CRMTab | null;

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("dashboard");
    }
  }, [tabParam]);

  // Lists Data
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Fetch Users List
  useEffect(() => {
    const fetchUsersList = async () => {
      try {
        const res = await api.get("/users?limit=200");
        if (res.success) {
          setUsers(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsersList();
  }, []);

  // Stats / Metrics
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeadsToday: 0,
    activeDealsCount: 0,
    revenuePipeline: 0,
    conversionRate: 0
  });
  const [sourceBreakdown, setSourceBreakdown] = useState<any[]>([]);
  const [stageBreakdown, setStageBreakdown] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>({
    conversionRate: 0,
    salesPerformance: [],
    revenueForecast: []
  });

  // Loadings
  const [loading, setLoading] = useState(true);

  // Forms Modals State
  const [activeModal, setActiveModal] = useState<"lead" | "contact" | "company" | "deal" | "activity" | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form states
  const [leadForm, setLeadForm] = useState({
    lead_name: "", companyName: "", phone: "", email: "", designation: "", industry: "",
    requirementType: "Office Space", requiredArea: 0, moveInDate: "",
    propertyId: "", floorId: "",
    source: "Website", priority: "Medium", status: "New", owner_id: "",
    nextFollowUp: "", notes: ""
  });

  const [contactForm, setContactForm] = useState({
    name: "", account_id: "", phone: "", email: "", designation: "", department: "",
    address: "", address2: "", city: "", state: "", country: "", pincode: "",
    profileImage: "", contact_type: "Tenant", gender: "", dob: "", alternatePhone: "",
    whatsapp: "", status: "Active", priority: "Medium", assigned_to: "", notes: "",
    connectedDeals: [] as string[], propertyId: "", floorId: "", unitId: ""
  });

  const [companyForm, setCompanyForm] = useState({
    company_name: "", logo: "", account_type: "Customer", industry: "Other", website: "",
    registration_number: "", gst_number: "", pan_number: "", tax_id: "",
    contact_name: "", phone: "", email: "", whatsapp: "",
    address: "", address2: "", city: "", state: "", country: "", pincode: "",
    company_size: "1-10", employee_count: 0, annual_revenue: 0, business_category: "",
    owner_id: "", source: "Direct", priority: "Medium", status: "Active", notes: ""
  });

  const [dealForm, setDealForm] = useState({
    name: "", lead_id: "", account_id: "", contact_id: "", stage: "New", amount: 0,
    deal_type: "New Lease", contract_duration: "", propertyId: "", floorId: "", unitId: "",
    expectedCloseDate: "", probability: 10, owner: "", status: "Open"
  });

  const [activityForm, setActivityForm] = useState({
    type: "Call", title: "", description: "", lead_id: "", deal_id: "", date: "", time: "", status: "Completed"
  });

  // Filters / Search
  const [searchTerm, setSearchTerm] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [leadPriorityFilter, setLeadPriorityFilter] = useState("All");

  // Pagination states
  const [leadPage, setLeadPage] = useState(1);
  const [leadTotal, setLeadTotal] = useState(0);
  const [leadPages, setLeadPages] = useState(1);

  // Contacts states
  const [contactSearch, setContactSearch] = useState("");
  const [contactTypeFilter, setContactTypeFilter] = useState("All");
  const [contactStatusFilter, setContactStatusFilter] = useState("All");
  const [contactPage, setContactPage] = useState(1);
  const [contactTotal, setContactTotal] = useState(0);
  const [contactPages, setContactPages] = useState(1);
  const [contactStats, setContactStats] = useState<any>({
    total: 0,
    employees: 0,
    tenants: 0,
    owners: 0,
    partners: 0,
    inactive: 0
  });

  // Accounts states
  const [accountSearch, setAccountSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("All");
  const [accountIndustryFilter, setAccountIndustryFilter] = useState("All");
  const [accountStatusFilter, setAccountStatusFilter] = useState("All");
  const [accountPage, setAccountPage] = useState(1);
  const [accountTotal, setAccountTotal] = useState(0);
  const [accountPages, setAccountPages] = useState(1);

  // Fetch Current User on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setCurrentUser(JSON.parse(stored)); } catch { }
      }
    }
  }, []);

  // Fetch metrics & stats
  const fetchDashboardMetrics = useCallback(async () => {
    try {
      const res = await api.get("/crm/dashboard");
      if (res.success && res.data) {
        setMetrics(res.data.metrics);
        setSourceBreakdown(res.data.leadSourceBreakdown || []);
        setStageBreakdown(res.data.pipelineStagesBreakdown || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Reset contact page to 1 when filters or search change
  useEffect(() => {
    setContactPage(1);
  }, [contactSearch, contactTypeFilter, contactStatusFilter]);

  // Reset account page to 1 when filters or search change
  useEffect(() => {
    setAccountPage(1);
  }, [accountSearch, accountTypeFilter, accountIndustryFilter, accountStatusFilter]);

  // Fetch Lists Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        await fetchDashboardMetrics();
        const res = await api.get("/crm/leads?limit=5");
        if (res.success) setLeads(res.data);
      } else if (activeTab === "leads") {
        const queryParams = ["limit=20", `page=${leadPage}`];
        if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        if (leadStatusFilter !== "All") queryParams.push(`status=${leadStatusFilter}`);
        if (leadPriorityFilter !== "All") queryParams.push(`priority=${leadPriorityFilter}`);
        const qStr = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        const res = await api.get(`/crm/leads${qStr}`);
        if (res.success) {
          setLeads(res.data || []);
          if (res.pagination) {
            setLeadTotal(res.pagination.total || 0);
            setLeadPages(res.pagination.pages || 1);
          } else {
            setLeadTotal(res.data ? res.data.length : 0);
            setLeadPages(1);
          }
        }
      } else if (activeTab === "contacts") {
        const queryParams = ["limit=20", `page=${contactPage}`];
        if (contactSearch) queryParams.push(`search=${encodeURIComponent(contactSearch)}`);
        if (contactTypeFilter !== "All") queryParams.push(`contact_type=${contactTypeFilter}`);
        if (contactStatusFilter !== "All") queryParams.push(`status=${contactStatusFilter}`);
        const qStr = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        const res = await api.get(`/crm/contacts${qStr}`);
        if (res.success) {
          setContacts(res.data || []);
          if (res.stats) {
            setContactStats(res.stats);
          }
          if (res.pagination) {
            setContactTotal(res.pagination.total || 0);
            setContactPages(res.pagination.pages || 1);
          } else {
            setContactTotal(res.data ? res.data.length : 0);
            setContactPages(1);
          }
        }
      } else if (activeTab === "accounts") {
        const queryParams = ["limit=20", `page=${accountPage}`];
        if (accountSearch) queryParams.push(`search=${encodeURIComponent(accountSearch)}`);
        if (accountTypeFilter !== "All") queryParams.push(`account_type=${accountTypeFilter}`);
        if (accountIndustryFilter !== "All") queryParams.push(`industry=${accountIndustryFilter}`);
        if (accountStatusFilter !== "All") queryParams.push(`status=${accountStatusFilter}`);
        const qStr = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";

        const res = await api.get(`/crm/accounts${qStr}`);
        if (res.success) {
          setCompanies(res.data || []);
          if (res.pagination) {
            setAccountTotal(res.pagination.total || 0);
            setAccountPages(res.pagination.pages || 1);
          } else {
            setAccountTotal(res.data ? res.data.length : 0);
            setAccountPages(1);
          }
        }
      } else if (activeTab === "deals" || activeTab === "pipeline") {
        const res = await api.get("/crm/deals");
        if (res.success) setDeals(res.data);
      } else if (activeTab === "activities" || activeTab === "communication") {
        const res = await api.get("/crm/activities");
        if (res.success) setActivities(res.data);
      } else if (activeTab === "reports") {
        const res = await api.get("/crm/reports");
        if (res.success) setReportData(res.data);
      }

      // Keep Accounts/Companies list loaded for selectors
      if (activeTab !== "accounts") {
        const accountsRes = await api.get("/crm/accounts?limit=1000");
        if (accountsRes.success) setCompanies(accountsRes.data);
      }
    } catch (err) {
      console.error("Error loading CRM data:", err);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    searchTerm,
    leadStatusFilter,
    leadPriorityFilter,
    leadPage,
    contactSearch,
    contactTypeFilter,
    contactStatusFilter,
    contactPage,
    accountSearch,
    accountTypeFilter,
    accountIndustryFilter,
    accountStatusFilter,
    accountPage,
    fetchDashboardMetrics
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Form Resets
  const openNewForm = (type: typeof activeModal) => {
    setEditMode(false);
    setSelectedId(null);
    setActiveModal(type);

    const currentUserId = currentUser?._id || "";

    if (type === "lead") {
      setLeadForm({
        lead_name: "", companyName: "", phone: "", email: "", designation: "", industry: "",
        requirementType: "Office Space", requiredArea: 0, moveInDate: "",
        propertyId: "", floorId: "",
        source: "Website", priority: "Medium", status: "New", owner_id: currentUserId,
        nextFollowUp: "", notes: ""
      });
    } else if (type === "contact") {
      setContactForm({
        name: "", account_id: "", phone: "", email: "", designation: "", department: "",
        address: "", address2: "", city: "", state: "", country: "", pincode: "",
        profileImage: "", contact_type: "Tenant", gender: "", dob: "", alternatePhone: "",
        whatsapp: "", status: "Active", priority: "Medium", assigned_to: currentUserId, notes: "",
        connectedDeals: [], propertyId: "", floorId: "", unitId: ""
      });
    } else if (type === "company") {
      setCompanyForm({
        company_name: "", logo: "", account_type: "Customer", industry: "Other", website: "",
        registration_number: "", gst_number: "", pan_number: "", tax_id: "",
        contact_name: "", phone: "", email: "", whatsapp: "",
        address: "", address2: "", city: "", state: "", country: "", pincode: "",
        company_size: "1-10", employee_count: 0, annual_revenue: 0, business_category: "",
        owner_id: currentUserId, source: "Direct", priority: "Medium", status: "Active", notes: ""
      });
    } else if (type === "deal") {
      setDealForm({
        name: "", lead_id: "", account_id: "", contact_id: "", stage: "New", amount: 0,
        deal_type: "New Lease", contract_duration: "", propertyId: "", floorId: "", unitId: "",
        expectedCloseDate: "", probability: 10, owner: currentUserId, status: "Open"
      });
    } else if (type === "activity") {
      setActivityForm({
        type: "Call", title: "", description: "", lead_id: "", deal_id: "", date: "", time: "", status: "Completed"
      });
    }
  };

  // Submit Logic
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (activeModal === "lead") {
        res = editMode
          ? await api.put(`/crm/leads/${selectedId}`, leadForm)
          : await api.post("/crm/leads", leadForm);
      } else if (activeModal === "contact") {
        res = editMode
          ? await api.put(`/crm/contacts/${selectedId}`, contactForm)
          : await api.post("/crm/contacts", contactForm);
      } else if (activeModal === "company") {
        res = editMode
          ? await api.put(`/crm/accounts/${selectedId}`, companyForm)
          : await api.post("/crm/accounts", companyForm);
      } else if (activeModal === "deal") {
        res = editMode
          ? await api.put(`/crm/deals/${selectedId}`, dealForm)
          : await api.post("/crm/deals", dealForm);
      } else if (activeModal === "activity") {
        res = await api.post("/crm/activities", activityForm);
      }

      if (res && res.success) {
        setActiveModal(null);
        fetchData();
        fetchDashboardMetrics();
      } else {
        alert(res?.error || "Failed to save item.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Kanban / Deals Stage update trigger
  const updateDealStage = async (dealId: string, newStage: string) => {
    try {
      const res = await api.put(`/crm/deals/${dealId}`, { stage: newStage });
      if (res.success) {
        fetchData();
        fetchDashboardMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Action
  const handleDelete = async (type: string, id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await api.delete(`/crm/${type}/${id}`);
      if (res.success) {
        fetchData();
        fetchDashboardMetrics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Lead trigger from child component
  const handleEditLead = (item: any) => {
    setEditMode(true);
    setSelectedId(item._id);
    setLeadForm({
      lead_name: item.lead_name || item.name || "",
      companyName: item.companyName || "",
      phone: item.phone || "",
      email: item.email || "",
      designation: item.designation || "",
      industry: item.industry || "",
      requirementType: item.requirementType || "Office Space",
      requiredArea: item.requiredArea || 0,
      moveInDate: item.moveInDate ? new Date(item.moveInDate).toISOString().split("T")[0] : "",
      propertyId: item.propertyId?._id || item.propertyId || "",
      floorId: item.floorId?._id || item.floorId || "",
      source: item.source || "Website",
      priority: item.priority || "Medium",
      status: item.status || "New",
      owner_id: item.owner_id?._id || item.owner_id || "",
      nextFollowUp: item.nextFollowUp ? new Date(item.nextFollowUp).toISOString().split("T")[0] : "",
      notes: item.notes || ""
    });
    setActiveModal("lead");
  };

  const handleEditContact = (item: any) => {
    setEditMode(true);
    setSelectedId(item._id);
    setContactForm({
      name: item.name || "",
      account_id: item.account_id?._id || item.account_id || item.company_id?._id || item.company_id || "",
      phone: item.phone || "",
      email: item.email || "",
      designation: item.designation || "",
      department: item.department || "",
      address: item.address || "",
      address2: item.address2 || "",
      city: item.city || "",
      state: item.state || "",
      country: item.country || "",
      pincode: item.pincode || "",
      profileImage: item.profileImage || "",
      contact_type: item.contact_type || "Tenant",
      gender: item.gender || "",
      dob: item.dob ? new Date(item.dob).toISOString().split("T")[0] : "",
      alternatePhone: item.alternatePhone || "",
      whatsapp: item.whatsapp || "",
      status: item.status || "Active",
      priority: item.priority || "Medium",
      assigned_to: item.assigned_to?._id || item.assigned_to || "",
      notes: item.notes || "",
      connectedDeals: item.connectedDeals || [],
      propertyId: item.propertyId?._id || item.propertyId || "",
      floorId: item.floorId?._id || item.floorId || "",
      unitId: item.unitId?._id || item.unitId || ""
    });
    setActiveModal("contact");
  };

  const handleEditAccount = (item: any) => {
    setEditMode(true);
    setSelectedId(item._id);
    setCompanyForm({
      company_name: item.company_name || "",
      logo: item.logo || "",
      account_type: item.account_type || "Customer",
      industry: item.industry || "Other",
      website: item.website || "",
      registration_number: item.registration_number || "",
      gst_number: item.gst_number || "",
      pan_number: item.pan_number || "",
      tax_id: item.tax_id || "",
      contact_name: item.contact_name || "",
      phone: item.phone || "",
      email: item.email || "",
      whatsapp: item.whatsapp || "",
      address: item.address || "",
      address2: item.address2 || "",
      city: item.city || "",
      state: item.state || "",
      country: item.country || "",
      pincode: item.pincode || "",
      company_size: item.company_size || "1-10",
      employee_count: item.employee_count || 0,
      annual_revenue: item.annual_revenue || 0,
      business_category: item.business_category || "",
      owner_id: item.owner_id?._id || item.owner_id || "",
      source: item.source || "Direct",
      priority: item.priority || "Medium",
      status: item.status || "Active",
      notes: item.notes || ""
    });
    setActiveModal("company");
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-app)",
        minHeight: "100vh",
        padding: "0 24px 24px 24px",
        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
        color: "var(--text-primary)"
      }}
    >

      {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <CRMDashboard
          metrics={metrics}
          sourceBreakdown={sourceBreakdown}
          stageBreakdown={stageBreakdown}
        />
      )}

      {activeTab === "leads" && (
        <LeadsManager
          leads={leads}
          isLoading={loading}
          searchTerm={searchTerm}
          setSearchTerm={(val) => { setSearchTerm(val); setLeadPage(1); }}
          statusFilter={leadStatusFilter}
          setStatusFilter={(val) => { setLeadStatusFilter(val); setLeadPage(1); }}
          priorityFilter={leadPriorityFilter}
          setPriorityFilter={(val) => { setLeadPriorityFilter(val); setLeadPage(1); }}
          onEdit={handleEditLead}
          onDelete={(id) => handleDelete("leads", id)}
          openNewLeadForm={() => openNewForm("lead")}
          currentPage={leadPage}
          totalPages={leadPages}
          totalRecords={leadTotal}
          onPageChange={setLeadPage}
        />
      )}

      {activeTab === "contacts" && (
        <ContactsManager
          contacts={contacts}
          isLoading={loading}
          searchTerm={contactSearch}
          setSearchTerm={(val) => { setContactSearch(val); setContactPage(1); }}
          contactTypeFilter={contactTypeFilter}
          setContactTypeFilter={(val) => { setContactTypeFilter(val); setContactPage(1); }}
          statusFilter={contactStatusFilter}
          setStatusFilter={(val) => { setContactStatusFilter(val); setContactPage(1); }}
          onEdit={handleEditContact}
          openNewContactForm={() => openNewForm("contact")}
          currentPage={contactPage}
          totalPages={contactPages}
          totalRecords={contactTotal}
          onPageChange={setContactPage}
          stats={contactStats}
        />
      )}

      {activeTab === "accounts" && (
        <AccountsManager
          accounts={companies}
          isLoading={loading}
          searchTerm={accountSearch}
          setSearchTerm={(val) => { setAccountSearch(val); setAccountPage(1); }}
          accountTypeFilter={accountTypeFilter}
          setAccountTypeFilter={(val) => { setAccountTypeFilter(val); setAccountPage(1); }}
          industryFilter={accountIndustryFilter}
          setIndustryFilter={(val) => { setAccountIndustryFilter(val); setAccountPage(1); }}
          statusFilter={accountStatusFilter}
          setStatusFilter={(val) => { setAccountStatusFilter(val); setAccountPage(1); }}
          onEdit={handleEditAccount}
          onDelete={(id) => handleDelete("accounts", id)}
          openNewAccountForm={() => openNewForm("company")}
          currentPage={accountPage}
          totalPages={accountPages}
          totalRecords={accountTotal}
          onPageChange={setAccountPage}
        />
      )}

      {activeTab === "deals" && (
        <DealsManager
          deals={deals}
          isLoading={loading}
          onUpdateStage={updateDealStage}
          onDelete={(id) => handleDelete("deals", id)}
          openNewDealForm={() => openNewForm("deal")}
        />
      )}

      {activeTab === "pipeline" && (
        <PipelineKanban
          deals={deals}
          onUpdateStage={updateDealStage}
        />
      )}

      {activeTab === "activities" && (
        <ActivitiesManager
          activities={activities}
          isLoading={loading}
          openLogActivityForm={() => openNewForm("activity")}
        />
      )}

      {activeTab === "communication" && (
        <CommunicationTimeline
          activities={activities}
        />
      )}

      {activeTab === "reports" && (
        <ReportsAnalytics
          reportData={reportData}
        />
      )}

      {activeTab === "settings" && (
        <CRMSettings />
      )}

      {/* ── FORMS MODALS ────────────────────────────────────────────────── */}
      <CRMFormModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onSubmit={handleSave}
        editMode={editMode}
        leadForm={leadForm}
        setLeadForm={setLeadForm}
        contactForm={contactForm}
        setContactForm={setContactForm}
        companies={companies}
        companyForm={companyForm}
        setCompanyForm={setCompanyForm}
        dealForm={dealForm}
        setDealForm={setDealForm}
        leads={leads}
        activityForm={activityForm}
        setActivityForm={setActivityForm}
        users={users}
      />
    </div>
  );
}

export default function CRMPage() {
  return (
    <Suspense fallback={<div className="p-4 fw-medium text-muted">Loading CRM Center Portal...</div>}>
      <CRMContent />
    </Suspense>
  );
}
