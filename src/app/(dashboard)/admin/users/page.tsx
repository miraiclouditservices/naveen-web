"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from "@/utils/api";
import Table, { TableColumn } from "@/components/common/Table";
import FilterDrawer from "@/components/users/FilterDrawer";
import UserDetailView from "@/components/users/UserDetailView";
import EditUserModal from "@/components/users/modals/EditUserModal";
import ResetPasswordModal from "@/components/users/modals/ResetPasswordModal";
import RecordPaymentModal from "@/components/users/modals/RecordPaymentModal";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All');
  const [staffCategoryFilter, setStaffCategoryFilter] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Navigation & details view state
  const [viewUser, setViewUser] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Agreement & payment data states
  const [agreementData, setAgreementData] = useState<any>(null);  // { agreements: [], summary: {} }
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [billingData, setBillingData] = useState<any>(null);  // { invoices: [], summary: {} }
  const [loadingBilling, setLoadingBilling] = useState(false);

  // Edit and Quick Action states
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);
  const [paymentModeInput, setPaymentModeInput] = useState('UPI');
  const [transactionRefInput, setTransactionRefInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentDateInput, setPaymentDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Global lists for mapping (Removed to prevent unwanted API triggers)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    // Only fetching users directly via dependencies below
  }, []);

  // Reset pagination to page 1 when filter or query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, roleFilter, statusFilter, staffCategoryFilter]);

  // Fetch users when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, debouncedSearchQuery, roleFilter, statusFilter, staffCategoryFilter]);

  // Sync agreement & billing data when viewed user changes
  useEffect(() => {
    if (viewUser) {
      fetchAgreementData(viewUser._id);
      fetchBillingData(viewUser._id);
    } else {
      setAgreementData(null);
      setBillingData(null);
    }
  }, [viewUser]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(itemsPerPage));
      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }
      if (roleFilter !== 'All Roles') {
        params.append('role', roleFilter);
      }
      if (statusFilter !== 'All') {
        params.append('agreementStatus', statusFilter);
      }
      if (staffCategoryFilter !== 'All') {
        params.append('staffCategory', staffCategoryFilter);
      }

      const res = await api.get(`/users?${params.toString()}`);
      if (res.success) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.total);
          setTotalPages(res.pagination.pages);
        } else {
          setTotalItems(res.data.length);
          setTotalPages(Math.ceil(res.data.length / itemsPerPage) || 1);
        }
        // If viewing, update the reference state to stay sync'd
        if (viewUser) {
          const updated = res.data.find((u: any) => u._id === viewUser._id);
          if (updated) setViewUser(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };


  const fetchAgreementData = async (userId: string) => {
    try {
      setLoadingAgreement(true);
      const res = await api.get(`/agreements/user/${userId}`);
      if (res.success) {
        setAgreementData(res.data); // { agreements: [], summary: {} }
      }
    } catch (err: any) {
      if (err.status === 404 || err.message === 'No agreement active for this user.') {
        setAgreementData(null);
      } else {
        console.error('Error fetching agreement data:', err);
      }
    } finally {
      setLoadingAgreement(false);
    }
  };

  const fetchBillingData = async (userId: string) => {
    try {
      setLoadingBilling(true);
      const res = await api.get(`/users/${userId}/billing`);
      if (res.success) {
        setBillingData(res.data); // { invoices: [], summary: {} }
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  // Status/Suspend action
  const handleSuspendUser = async () => {
    if (!viewUser) return;
    const isCurrentlySuspended = viewUser.agreementStatus === 'Suspended';
    const actionText = isCurrentlySuspended ? 'activate' : 'suspend';
    if (confirm(`Are you sure you want to ${actionText} this user agreement?`)) {
      try {
        setIsSubmittingAction(true);
        const res = await api.put(`/users/${viewUser._id}`, {
          agreementStatus: isCurrentlySuspended ? 'Active' : 'Suspended'
        });
        if (res.success) {
          setViewUser(res.data);
          fetchUsers();
          alert(`User agreement status has been set to: ${res.data.agreementStatus}`);
        }
      } catch (err: any) {
        alert(err.message || 'Failed to update agreement status');
      } finally {
        setIsSubmittingAction(false);
      }
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgreement || !viewUser) return;
    const amt = Number(paymentAmountInput);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    try {
      setIsSubmittingPayment(true);
      const res = await api.post(`/agreements/${selectedAgreement._id}/payments`, {
        amountPaid: amt,
        paymentDate: paymentDateInput || new Date().toISOString(),
        paymentMode: paymentModeInput,
        transactionRef: transactionRefInput || undefined,
        notes: notesInput || 'Recorded via admin portal'
      });
      if (res.success) {
        const receipt = res.data?.transactionId || 'N/A';
        alert(`Payment of Ã¢â€šÂ¹${amt.toLocaleString()} recorded! Transaction ID / Receipt: ${receipt}`);
        setShowPaymentModal(false);
        setSelectedAgreement(null);
        setTransactionRefInput('');
        setNotesInput('');
        setPaymentAmountInput('');
        setPaymentDateInput(new Date().toISOString().split('T')[0]);
        fetchAgreementData(viewUser._id);
        fetchBillingData(viewUser._id);
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Password reset action
  const handleResetPassword = async (e: React.FormEvent, password: string) => {
    e.preventDefault();
    if (!viewUser || !password.trim()) return;
    try {
      setIsSubmittingAction(true);
      const res = await api.put(`/users/${viewUser._id}`, { password });
      if (res.success) {
        alert('Password reset successfully!');
        setShowResetPasswordModal(false);
        setNewPassword('');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Profile Edit save
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingAction(true);
      const res = await api.put(`/users/${viewUser._id}`, editForm);
      if (res.success) {
        setViewUser(res.data);
        fetchUsers();
        setIsEditingUser(false);
        alert('User details updated successfully!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user details');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const startEditing = () => {
    if (viewUser && viewUser._id) {
      router.push(`/admin/users/create?edit=${viewUser._id}`);
    }
  };

  // Distinct Premium Badges for Roles
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'text-success border-success bg-success bg-opacity-10';
      case 'Admin':
        return 'text-dark border-secondary bg-light';
      case 'Owner':
      case 'Floor Owner':
        return 'text-warning border-warning bg-warning bg-opacity-10';
      case 'OFFICE_OWNER':
        return 'text-purple border-purple bg-purple-light';
      case 'FLOOR_ADMIN':
        return 'text-primary border-primary bg-primary bg-opacity-10';
      case 'STAFF_ADMIN':
        return 'text-info border-info bg-info bg-opacity-10';
      default:
        return 'text-secondary border-secondary bg-light';
    }
  };

  // Dynamic mapped names
  const getPropertyNames = (propertiesArr: any[] = []) => {
    if (!propertiesArr || propertiesArr.length === 0) return 'None';
    return propertiesArr.map(p => typeof p === 'object' && p !== null ? p.propertyName : 'Unknown Property').join(', ');
  };

  const getFloorNames = (floorsArr: any[] = []) => {
    if (!floorsArr || floorsArr.length === 0) return 'None';
    return floorsArr.map(f => typeof f === 'object' && f !== null ? (f.floorName || `Floor ${f.floorNumber}`) : 'Unknown Floor').join(', ');
  };

  // Helper date duration parser
  const getAgreementDuration = (start: string, end: string) => {
    if (!start || !end) return 'N/A';
    const s = new Date(start);
    const e = new Date(end);
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (months <= 0) months = 1;
    return `${months} Months`;
  };

  // Helper to generate dynamic installment schedule
  const generateInstallments = (user: any, agr: any, paymentsList: any[] = []) => {
    const startStr = agr?.startDate || user?.floorAssignmentStartDate;
    const endStr = agr?.endDate || user?.floorAssignmentEndDate;
    if (!startStr || !endStr) return [];

    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    // Term in months
    const termMonths = Math.max((end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1, 1);

    // Amount details
    const totalAmount = agr?.totalAmount || user?.totalAgreementAmount || ((user?.monthlyManagementAmount || 0) * termMonths);
    const paymentType = agr?.paymentType || user?.paymentType || 'Monthly';
    const dueDay = agr?.paymentDueDay || user?.paymentDueDay || 5;

    // Determine interval in months
    let intervalMonths = 1;
    if (paymentType.includes('Quarterly')) intervalMonths = 3;
    else if (paymentType.includes('Half-Yearly')) intervalMonths = 6;
    else if (paymentType.includes('Yearly')) intervalMonths = 12;
    else if (paymentType.includes('One Time')) intervalMonths = termMonths;

    // Number of installments
    const numInstallments = Math.max(1, Math.ceil(termMonths / intervalMonths));
    const installmentAmount = Math.ceil(totalAmount / numInstallments);

    // Calculate total paid
    let totalPaid = agr?.totalPaid || 0;
    if (paymentsList && paymentsList.length > 0) {
      totalPaid = paymentsList.reduce((sum: number, p: any) => sum + (p.amountPaid || p.amount || 0), 0);
    }

    const schedule = [];
    let remainingPaid = totalPaid;

    for (let i = 0; i < numInstallments; i++) {
      const currentDueDate = new Date(start);
      currentDueDate.setMonth(start.getMonth() + i * intervalMonths);
      currentDueDate.setDate(dueDay);

      const formattedDueDate = currentDueDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

      let paid = 0;
      let balance = installmentAmount;
      let status = 'Pending';

      if (remainingPaid >= installmentAmount) {
        paid = installmentAmount;
        balance = 0;
        status = 'Paid';
        remainingPaid -= installmentAmount;
      } else if (remainingPaid > 0) {
        paid = remainingPaid;
        balance = installmentAmount - remainingPaid;
        status = 'Partially Paid';
        remainingPaid = 0;
      }

      schedule.push({
        invoiceNo: `INV-${(i + 1).toString().padStart(3, '0')}`,
        dueDate: formattedDueDate,
        amount: installmentAmount,
        paid,
        balance,
        status
      });
    }

    return schedule;
  };

  // Helper for generating custom human User IDs
  const getDisplayUserId = (user: any, indexVal: number) => {
    const year = user.createdAt ? new Date(user.createdAt).getFullYear() : '2025';
    const suffix = user._id ? user._id.toString().slice(-6).toUpperCase() : String(indexVal).padStart(6, '0');
    return `USR-${year}-${suffix}`;
  };

  // Next due date calculator
  const getNextDueDate = (dueDay: number) => {
    const today = new Date();
    const current = new Date(today.getFullYear(), today.getMonth(), dueDay || 5);
    if (current < today) {
      current.setMonth(current.getMonth() + 1);
    }
    return current.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysRemaining = (endDateString: string) => {
    if (!endDateString) return null;
    const endDate = new Date(endDateString);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sendExpiryNotification = async (user: any) => {
    try {
      const res = await api.post('/notifications', {
        user: user._id,
        title: 'Agreement Expiring Soon',
        message: `Dear ${user.name}, your access agreement is expiring soon (on ${new Date(user.floorAssignmentEndDate).toLocaleDateString('en-GB')}). Please renew it as soon as possible.`,
        type: 'Alert'
      });
      if (res.success) {
        alert(`Notification sent successfully to ${user.name}!`);
      } else {
        alert(`Failed to send notification: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error sending notification: ${err.message || err}`);
    }
  };

  const ShimmerRow = () => (
    <tr className="border-0">
      <td className="py-3 px-4 align-middle">
        <div className="shimmer-wrapper shimmer-line" style={{ width: '30px' }}></div>
      </td>
      <td className="py-3 px-4 align-middle">
        <div className="d-flex align-items-center gap-3">
          <div className="shimmer-wrapper shimmer-circle"></div>
          <div className="d-flex flex-column gap-2 flex-grow-1">
            <div className="shimmer-wrapper shimmer-line" style={{ width: '120px' }}></div>
            <div className="shimmer-wrapper shimmer-line" style={{ width: '180px' }}></div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 align-middle">
        <div className="d-flex gap-2">
          <div className="shimmer-wrapper shimmer-line" style={{ width: '80px', height: '20px', borderRadius: '12px' }}></div>
        </div>
      </td>
      <td className="py-3 px-4 align-middle">
        <div className="shimmer-wrapper shimmer-line" style={{ width: '100px' }}></div>
      </td>
      <td className="py-3 px-4 align-middle text-center">
        <div className="shimmer-wrapper shimmer-circle" style={{ width: '32px', height: '32px' }}></div>
      </td>
    </tr>
  );

  const tableColumns: TableColumn<any>[] = [
    {
      header: "USER",
      render: (user) => {
        const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'NA';
        return (
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px', fontSize: '0.9rem', backgroundColor: '#f3f4f6', color: '#111827' }}>
              {initials}
            </div>
            <div className="d-flex flex-column justify-content-center">
              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.85rem' }}>{user.name}</h6>
              <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>{user.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: "ROLE",
      render: (user) => {
        const roleStr = user.role || 'Staff';
        let bg = '#f3f4f6';
        let color = '#4b5563';

        if (roleStr.includes('Super Admin')) { bg = 'var(--brand-orange)_BG'; color = 'var(--brand-orange-hover)'; }
        else if (roleStr.includes('Property Admin') || roleStr.includes('Tenant User')) { bg = '#eff6ff'; color = '#1d4ed8'; }
        else if (roleStr.includes('Floor Manager')) { bg = '#f3e8ff'; color = '#7e22ce'; }
        else if (roleStr.includes('Accounts Manager')) { bg = '#dcfce7'; color = '#15803d'; }
        else if (roleStr.includes('Support Staff') || roleStr.includes('Security')) { bg = 'var(--brand-orange-bg)'; color = 'var(--brand-orange-hover)'; }

        return (
          <span className="badge rounded-pill px-3 py-1" style={{ backgroundColor: bg, color: color, fontSize: '0.75rem', fontWeight: 600 }}>
            {roleStr === 'SUPER_ADMIN' ? 'Super Admin' :
              roleStr === 'FLOOR_ADMIN' ? 'Floor Manager' :
                roleStr === 'OFFICE_OWNER' ? 'Property Admin' : roleStr}
          </span>
        );
      }
    },
    {
      header: "PROPERTY ACCESS",
      render: (user) => {
        const isSuper = user.role === 'SUPER_ADMIN' || user.role === 'Admin' || user.role === 'Super Admin';
        const props = getPropertyNames(user.assignedProperties || []);
        const flrs = getFloorNames(user.assignedFloors || []);
        return (
          <div className="d-flex flex-column justify-content-center">
            <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
              {isSuper ? 'All Properties' : (props !== 'None' && props !== '' ? props : 'Tech Park One')}
            </span>
            {!isSuper && (
              <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                {flrs !== 'None' && flrs !== '' ? flrs : 'Floor 1, Floor 2'}
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: "CONTACT NUMBER",
      render: (user) => (
        <div className="d-flex flex-column justify-content-center">
          <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{user.phoneNumber || 'N/A'}</span>
          {user.emergencyNumber && <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>Emg: {user.emergencyNumber}</span>}
        </div>
      )
    },
    {
      header: "STATUS",
      render: (user) => {
        const isActive = user.agreementStatus !== 'Suspended' && user.status !== 'Inactive';
        return (
          <span className="badge rounded-pill px-3 py-1" style={{
            backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
            color: isActive ? '#15803d' : '#b91c1c',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      }
    },
    {
      header: "ACTIONS",
      render: (user) => {
        const isFloorAdmin = currentUser?.role === 'FLOOR_ADMIN';
        const isSelf = currentUser?._id && user._id === currentUser._id;
        const hideEditOptions = isFloorAdmin || isSelf;

        return (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm bg-white border d-flex align-items-center justify-content-center"
              style={{ width: '32px', height: '32px', borderRadius: '8px', borderColor: '#e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
              onClick={() => setViewUser(user)}
              title="View Details"
            >
              <i className="hgi-stroke hgi-view text-dark" style={{ fontSize: '1rem' }}></i>
            </button>
            {!hideEditOptions && (
              <button
                className="btn btn-sm bg-white border d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px', borderRadius: '8px', borderColor: '#e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
                title="More Options"
              >
                <i className="hgi-stroke hgi-more-vertical text-dark" style={{ fontSize: '1rem' }}></i>
              </button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-0 d-flex flex-column" style={{ backgroundColor: 'transparent', height: 'calc(100vh - 104px)', fontFamily: 'var(--font-geist-sans)', overflow: 'hidden' }}>

      {!viewUser ? (
        /* ======================== 1. USERS LIST COMPONENT ======================== */
        <div className="d-flex flex-column h-100  rounded-4" style={{ backgroundColor: 'var(--bg-card)', margin: '0px', padding: '0px', overflow: 'hidden' }}>

          {/* Header & Filter Bar Merged */}
          <div className="d-flex justify-content-between align-items-center mb-1 pb-2 pt-4 px-4 flex-shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
            <div className="d-flex gap-4">
              <div>
                <h4 className="fw-bolder text-dark mb-0" style={{ fontSize: '1.3rem', letterSpacing: '-0.02em' }}>Access Management</h4>
              </div>
            </div>

            {/* Right: Search & Filters */}
            <div className="d-flex gap-3 align-items-center">
              <div className="position-relative" style={{ width: '280px' }}>
                <i className="hgi-stroke hgi-search-01 position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', pointerEvents: 'none' }}></i>
                <input
                  type="text"
                  className="form-control shadow-none"
                  placeholder="Search users..."
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    padding: '0 16px 0 38px',
                    height: '40px',
                    color: 'var(--text-primary)'
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button
                className="btn bg-white border d-flex align-items-center justify-content-center"
                onClick={() => setShowAdvancedFilters(true)}
                style={{ width: '40px', height: '40px', borderRadius: '8px', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-primary)' }}
                title="Filters"
              >
                <i className="hgi-stroke hgi-filter"></i>
              </button>

              <Link
                href="/admin/users/create"
                className="btn d-flex align-items-center justify-content-center gap-2 px-4"
                style={{ backgroundColor: "var(--dark-section)", color: 'var(--bg-card)', fontWeight: '600', borderRadius: '8px', height: '40px', fontSize: '0.85rem', border: 'none', boxShadow: 'var(--shadow-sm)' }}
              >
                <i className="hgi-stroke hgi-user-add-01"></i> New User
              </Link>

            </div>
          </div>

          {/* Right-aligned Advanced Filters Drawer */}
          <FilterDrawer
            isOpen={showAdvancedFilters}
            onClose={() => setShowAdvancedFilters(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            staffCategoryFilter={staffCategoryFilter}
            setStaffCategoryFilter={setStaffCategoryFilter}
            onReset={() => {
              setRoleFilter('All Roles');
              setStatusFilter('All');
              setStaffCategoryFilter('All');
              setSearchQuery('');
              setCurrentPage(1);
            }}
          />
          <Table
            columns={tableColumns}
            data={users}
            isLoading={loadingUsers}
            loadingMessage="Fetching user accounts..."
            emptyMessage="No accounts match this query."
            containerClassName="table-responsive-container table-responsive flex-grow-1"
            rowClassName={(user, index) => "user-table-row"}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : (
        /* ======================== 2. PREMIUM DETAILS VIEW ======================== */
        <UserDetailView
          viewUser={viewUser}
          agreementData={agreementData}
          loadingAgreement={loadingAgreement}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          onBack={() => setViewUser(null)}
          onStartEditing={startEditing}
          onSuspend={handleSuspendUser}
          onResetPassword={() => setShowResetPasswordModal(true)}
          onRecordPayment={(agr, amount) => {
            setSelectedAgreement(agr);
            setPaymentAmountInput(amount);
            setShowPaymentModal(true);
          }}
          generateInstallments={generateInstallments}
          getPropertyNames={getPropertyNames}
          getFloorNames={getFloorNames}
          getAgreementDuration={getAgreementDuration}
          getNextDueDate={getNextDueDate}
        />
      )}

      {/* â”€â”€ Modals â”€â”€ */}
      {isEditingUser && (
        <EditUserModal
          editForm={editForm}
          setEditForm={setEditForm}
          onSubmit={handleEditSubmit}
          onClose={() => setIsEditingUser(false)}
          isSubmitting={isSubmittingAction}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          onSubmit={handleResetPassword}
          onClose={() => { setShowResetPasswordModal(false); setNewPassword(''); }}
          isSubmitting={isSubmittingAction}
        />
      )}

      {showPaymentModal && selectedAgreement && (
        <RecordPaymentModal
          agreement={selectedAgreement}
          amountInput={paymentAmountInput}
          setAmountInput={setPaymentAmountInput}
          dateInput={paymentDateInput}
          setDateInput={setPaymentDateInput}
          modeInput={paymentModeInput}
          setModeInput={setPaymentModeInput}
          refInput={transactionRefInput}
          setRefInput={setTransactionRefInput}
          notesInput={notesInput}
          setNotesInput={setNotesInput}
          onSubmit={handlePaymentSubmit}
          onClose={() => { setShowPaymentModal(false); setSelectedAgreement(null); }}
          isSubmitting={isSubmittingPayment}
        />
      )}

    </div>
  );
}
