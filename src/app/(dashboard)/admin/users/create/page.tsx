"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from "@/utils/api";
import MultiSelect from "@/components/common/MultiSelect";

function CreateUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editUserId = searchParams.get('edit') || searchParams.get('id');
  const isEditMode = Boolean(editUserId);

  // Steps state (4 Steps Total: Personal Details, Workspace Setup, Billing & Agreement, Review)
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'COWORKING_TENANT', permissions: [] as string[],
    workspaceType: 'COMMERCIAL_OFFICE', coWorkingPassType: 'HotDesk',
    assignedProperties: [] as string[], assignedFloors: [] as string[], assignedUnits: [] as string[],
    unitSelectedSeatsMap: {} as Record<string, number[]>,
    phoneNumber: '', emergencyNumber: '', address: '',
    companyName: '', tenantType: 'Individual', gstPan: '',
    floorAssignmentStartDate: '', floorAssignmentEndDate: '',
    monthlyManagementAmount: 0, totalAgreementAmount: 0, paymentType: 'Monthly Installment', paymentDueDay: 5,
    agreementStatus: 'Active', remarks: '', staffCategory: 'None'
  });

  const [properties, setProperties] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitReady, setIsSubmitReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // File states
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);

  // Validation Warnings & Dialog Box State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [dialog, setDialog] = useState<{ title: string; message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // OTP Verification Dialog State
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Current logged in user context
  const [currentUser, setCurrentUser] = useState<{ _id?: string; name?: string; role?: string; workspaceType?: string;[key: string]: any } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentUser(parsed);
          const r = String(parsed.role || '').toUpperCase().replace(/[-\s]+/g, '_');
          if (r === 'FLOOR_ADMIN') {
            setFormData(prev => ({ ...prev, role: 'OFFICE_OWNER' }));
          } else if (r === 'OFFICE_OWNER') {
            setFormData(prev => ({ ...prev, role: 'STAFF_ADMIN' }));
          } else if (r === 'COWORKING_ADMIN' || parsed.workspaceType === 'COWORKING') {
            setFormData(prev => ({ ...prev, role: 'COWORKING_TENANT' }));
          } else if (r === 'SUPER_ADMIN' || r === 'SUPERADMIN' || r === 'ADMIN') {
            setFormData(prev => ({ ...prev, role: 'FLOOR_ADMIN' }));
          } else {
            setFormData(prev => ({ ...prev, role: 'COWORKING_TENANT' }));
          }
        } catch (e) {
          console.error("Failed to parse local user context", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (editUserId) {
      const fetchUserForEdit = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/users/${editUserId}`);
          const u = res?.user || res?.data || res;
          if (u) {
            const rawRole = String(u.role || 'COWORKING_TENANT');
            const normalizedRole = rawRole === 'Co-Working Member' || rawRole === 'Coworking Tenant' || rawRole === 'Tenant' ? 'COWORKING_TENANT'
              : rawRole === 'Co-Working Admin' || rawRole === 'Coworking Admin' ? 'COWORKING_ADMIN'
                : rawRole === 'Floor Admin' || rawRole === 'Floor Manager' ? 'FLOOR_ADMIN'
                  : rawRole === 'Office Owner' || rawRole === 'Owner' ? 'OFFICE_OWNER'
                    : rawRole === 'Staff Admin' ? 'STAFF_ADMIN'
                      : rawRole.toUpperCase().replace(/[-\s]+/g, '_');

            setFormData({
              name: u.name || '',
              email: u.email || '',
              password: '',
              role: normalizedRole,
              permissions: u.permissions || [],
              workspaceType: u.workspaceType || 'COMMERCIAL_OFFICE',
              coWorkingPassType: u.coWorkingPassType || 'HotDesk',
              assignedProperties: (u.assignedProperties || []).map((p: any) => typeof p === 'object' ? p._id : p),
              assignedFloors: (u.assignedFloors || []).map((f: any) => typeof f === 'object' ? f._id : f),
              assignedUnits: (u.assignedUnits || []).map((un: any) => typeof un === 'object' ? un._id : un),
              unitSelectedSeatsMap: u.unitSelectedSeatsMap || {},
              phoneNumber: u.phoneNumber || '',
              emergencyNumber: u.emergencyNumber || '',
              address: u.address || '',
              companyName: u.companyName || '',
              tenantType: u.tenantType || 'Individual',
              gstPan: u.gstPan || '',
              floorAssignmentStartDate: u.floorAssignmentStartDate ? u.floorAssignmentStartDate.split('T')[0] : '',
              floorAssignmentEndDate: u.floorAssignmentEndDate ? u.floorAssignmentEndDate.split('T')[0] : '',
              monthlyManagementAmount: u.monthlyManagementAmount || 0,
              totalAgreementAmount: u.totalAgreementAmount || 0,
              paymentType: u.paymentType || 'Monthly Installment',
              paymentDueDay: u.paymentDueDay || 5,
              agreementStatus: u.agreementStatus || 'Active',
              remarks: u.remarks || '',
              staffCategory: u.staffCategory || 'None'
            });
          }
        } catch (err: any) {
          console.error("Failed to fetch user for editing", err);
          setDialog({
            title: "Error Loading User",
            message: err.message || "Failed to load user details for editing.",
            type: "error"
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserForEdit();
    }
  }, [editUserId]);

  const handleStartDateChange = (val: string) => {
    setFormData(prev => {
      const updated = { ...prev, floorAssignmentStartDate: val };
      if (val) {
        const parts = val.split('-');
        if (parts.length === 3) {
          const dayNum = parseInt(parts[2], 10);
          if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
            updated.paymentDueDay = dayNum;
          }
        }

        const startDate = new Date(val);
        if (!isNaN(startDate.getTime())) {
          const yearsToAdd = prev.role === 'OFFICE_OWNER' ? 3 : 1;
          const endDate = new Date(startDate);
          endDate.setFullYear(startDate.getFullYear() + yearsToAdd);
          endDate.setDate(endDate.getDate() - 1);

          const yyyy = endDate.getFullYear();
          const mm = String(endDate.getMonth() + 1).padStart(2, '0');
          const dd = String(endDate.getDate()).padStart(2, '0');
          updated.floorAssignmentEndDate = `${yyyy}-${mm}-${dd}`;

          const term = Math.max((endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1, 1);
          updated.totalAgreementAmount = prev.monthlyManagementAmount * term;
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchProperties();
    fetchFloors();
    fetchUnits();
  }, []);

  // Prevent accidental double-click submission when transitioning to Step 4 (Review)
  useEffect(() => {
    if (currentStep === 4) {
      setIsSubmitReady(false);
      const timer = setTimeout(() => setIsSubmitReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    if (formData.floorAssignmentStartDate) {
      const startDate = new Date(formData.floorAssignmentStartDate);
      if (!isNaN(startDate.getTime())) {
        const yearsToAdd = formData.role === 'OFFICE_OWNER' ? 3 : 1;
        const endDate = new Date(startDate);
        endDate.setFullYear(startDate.getFullYear() + yearsToAdd);
        endDate.setDate(endDate.getDate() - 1);

        const yyyy = endDate.getFullYear();
        const mm = String(endDate.getMonth() + 1).padStart(2, '0');
        const dd = String(endDate.getDate()).padStart(2, '0');

        setFormData(prev => ({
          ...prev,
          floorAssignmentEndDate: `${yyyy}-${mm}-${dd}`
        }));
      }
    }
  }, [formData.role]);

  const fetchProperties = async () => {
    try {
      const res = await api.get('/properties');
      if (res.success && Array.isArray(res.data)) {
        const mappedProps = res.data.map((p: any) => ({
          ...p,
          name: p.propertyName
        }));
        setProperties(mappedProps);
        if (mappedProps.length === 1) {
          setFormData(prev => ({
            ...prev,
            assignedProperties: [mappedProps[0]._id]
          }));
        }
      }
    } catch (err) { console.error(err); }
  };

  const fetchFloors = async (propertyIds?: string[]) => {
    try {
      const endpoint = propertyIds && propertyIds.length > 0 ? `/floors?property=${propertyIds.join(',')}&limit=200` : '/floors?limit=200';
      const res = await api.get(endpoint);
      if (res.success && Array.isArray(res.data)) {
        setFloors(res.data.map((f: any) => ({
          ...f,
          name: `${f.property?.propertyName || ''} - ${f.floorName || `Floor ${f.floorNumber}`} (${f.totalSft || 0} SFT)`
        })));
      }
    } catch (err) { console.error(err); }
  };

  const fetchUnits = async (propertyIds?: string[], floorIds?: string[]) => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '200');
      if (propertyIds && propertyIds.length > 0) {
        params.append('property', propertyIds.join(','));
      }
      if (floorIds && floorIds.length > 0) {
        params.append('floor', floorIds.join(','));
      }
      const res = await api.get(`/units?${params.toString()}`);
      if (res.success && Array.isArray(res.data)) {
        setUnits(res.data.map((u: any) => ({
          ...u,
          name: `Unit ${u.unitNumber}${u.unitName ? ` (${u.unitName})` : ''} - ${u.property?.propertyName || 'Property'} ${u.floor?.floorNumber ? `- Floor ${u.floor.floorNumber}` : ''} (${u.seatCount > 0 ? `${u.seatCount} Seats` : `${u.sqft || 0} SFT`})`
        })));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (formData.assignedProperties.length > 0) {
      fetchFloors(formData.assignedProperties);
      fetchUnits(formData.assignedProperties, formData.assignedFloors);
    }
  }, [formData.assignedProperties]);

  useEffect(() => {
    if (formData.assignedFloors.length > 0) {
      fetchUnits(formData.assignedProperties, formData.assignedFloors);
    }
  }, [formData.assignedFloors]);

  const toggleSeatSelection = (unitId: string, seatNum: number) => {
    setFormData(prev => {
      const currentSelected: number[] = prev.unitSelectedSeatsMap?.[unitId] || [];
      const exists = currentSelected.includes(seatNum);
      const updated = exists
        ? currentSelected.filter(s => s !== seatNum)
        : [...currentSelected, seatNum].sort((a, b) => a - b);

      return {
        ...prev,
        unitSelectedSeatsMap: {
          ...(prev.unitSelectedSeatsMap || {}),
          [unitId]: updated
        }
      };
    });
  };

  const selectAllUnitSeats = (unitId: string, maxSeats: number, occupiedCount: number) => {
    const availableSeatNumbers = Array.from({ length: maxSeats }, (_, i) => i + 1).filter(s => s > occupiedCount);
    setFormData(prev => ({
      ...prev,
      unitSelectedSeatsMap: {
        ...(prev.unitSelectedSeatsMap || {}),
        [unitId]: availableSeatNumbers
      }
    }));
  };

  const clearAllUnitSeats = (unitId: string) => {
    setFormData(prev => ({
      ...prev,
      unitSelectedSeatsMap: {
        ...(prev.unitSelectedSeatsMap || {}),
        [unitId]: []
      }
    }));
  };

  const handleUnitSelectionChange = (ids: string[]) => {
    setFormData(prev => {
      const newMap = { ...(prev.unitSelectedSeatsMap || {}) };
      ids.forEach(id => {
        if (newMap[id] === undefined) {
          const u = units.find(unit => unit._id === id);
          const maxSeats = u?.seatCount || 10;
          const occupiedCount = u?.occupiedSeatCount || 0;
          newMap[id] = Array.from({ length: maxSeats }, (_, i) => i + 1).filter(s => s > occupiedCount);
        }
      });
      return {
        ...prev,
        assignedUnits: ids,
        unitSelectedSeatsMap: newMap
      };
    });
  };

  const validateStep = (stepNumber: number) => {
    const errors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.name.trim()) errors.name = "Full name is required.";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address.";
      }

      if (!formData.password || formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters.";
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        errors.phoneNumber = "Phone number must be exactly 10 digits.";
      }

      if (formData.emergencyNumber && !phoneRegex.test(formData.emergencyNumber)) {
        errors.emergencyNumber = "Alternate phone number must be exactly 10 digits.";
      }

      if (!formData.address.trim()) errors.address = "Address is required.";
    }

    if (stepNumber === 2) {

      if (formData.role !== 'SUPER_ADMIN') {
        const isPropRequired = properties.length > 1 && currentUser?.role !== 'FLOOR_ADMIN';
        if (isPropRequired && formData.assignedProperties.length === 0) {
          errors.properties = "Please select at least one property.";
        }
        const isUnitsRequired = ['OFFICE_OWNER', 'COWORKING_TENANT', 'Tenant', 'COWORKING_ADMIN', 'COWORKING_MEMBER'].includes(formData.role);
        if (isUnitsRequired && formData.assignedUnits.length === 0) {
          errors.units = "Please select at least one office/unit.";
        }
      }
    }

    if (stepNumber === 3) {
      if (formData.role !== 'STAFF_ADMIN' && formData.role !== 'SUPER_ADMIN') {
        if (!formData.floorAssignmentStartDate) {
          errors.floorAssignmentStartDate = "Start date is required.";
        }
        if (!formData.floorAssignmentEndDate) {
          errors.floorAssignmentEndDate = "End date is required.";
        } else if (formData.floorAssignmentStartDate) {
          const start = new Date(formData.floorAssignmentStartDate);
          const end = new Date(formData.floorAssignmentEndDate);
          if (end <= start) {
            errors.floorAssignmentEndDate = "End date must be greater than start date.";
          }
        }
        if (formData.monthlyManagementAmount <= 0) {
          errors.monthlyManagementAmount = "Total amount must be greater than 0.";
        }
      }

      if (formData.gstPan) {
        const gstPanRegex = /^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})|([A-Z]{5}[0-9]{4}[A-Z]{1})$/;
        if (!gstPanRegex.test(formData.gstPan.toUpperCase())) {
          errors.gstPan = "Invalid GSTIN or PAN format.";
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      setDialog({
        title: "Validation Incomplete",
        message: "Please fill out all required fields correctly before moving to the next step.",
        type: "warning"
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/admin/users');
    }
  };

  // Calculations
  const isCoWorkingUser = ['COWORKING_ADMIN', 'COWORKING ADMIN', 'Coworking Admin', 'COWORKING_TENANT'].includes(currentUser?.role || '') || currentUser?.workspaceType === 'COWORKING' || formData.role === 'COWORKING_TENANT';
  const isUnitSelectionRole = ['OFFICE_OWNER', 'COWORKING_TENANT', 'Tenant', 'COWORKING_ADMIN', 'COWORKING_MEMBER'].includes(formData.role);

  const filteredFloors = formData.assignedProperties.length > 0
    ? floors.filter(f => {
      if (!f.property) return true;
      const propId = typeof f.property === 'object' ? f.property._id : f.property;
      return formData.assignedProperties.some((id: string) => String(id) === String(propId));
    })
    : floors;

  const filteredUnits = formData.assignedFloors.length > 0
    ? units.filter(u => {
      if (!u.floor) return true;
      const floorId = typeof u.floor === 'object' ? u.floor._id : u.floor;
      return formData.assignedFloors.some((id: string) => String(id) === String(floorId));
    })
    : (formData.assignedProperties.length > 0
      ? units.filter(u => {
        if (!u.property) return true;
        const propId = typeof u.property === 'object' ? u.property._id : u.property;
        return formData.assignedProperties.some((id: string) => String(id) === String(propId));
      })
      : units);

  useEffect(() => {
    if (formData.assignedProperties.length > 0 && formData.assignedUnits.length === 0 && filteredUnits.length === 1) {
      handleUnitSelectionChange([filteredUnits[0]._id]);
    }
  }, [formData.assignedProperties, filteredUnits.length]);

  const totalManagedSft = formData.role === 'OFFICE_OWNER'
    ? formData.assignedUnits.reduce((sum, unitId) => {
      const unit = units.find(u => u._id === unitId);
      return sum + (unit?.sqft || 0);
    }, 0)
    : formData.assignedFloors.reduce((sum, floorId) => {
      const floor = floors.find(f => f._id === floorId);
      return sum + (floor?.totalSft || 0);
    }, 0);

  const totalAssignedSeatCount = formData.assignedUnits.reduce((sum, unitId) => {
    const list = formData.unitSelectedSeatsMap?.[unitId] || [];
    return sum + list.length;
  }, 0);

  const getTermMonths = () => {
    if (!formData.floorAssignmentStartDate || !formData.floorAssignmentEndDate) return 12;
    const start = new Date(formData.floorAssignmentStartDate);
    const end = new Date(formData.floorAssignmentEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 12;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const exactDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(Math.round(exactDays / 30.4167), 1);
  };

  const getTermDays = () => {
    if (!formData.floorAssignmentStartDate || !formData.floorAssignmentEndDate) return 365;
    const start = new Date(formData.floorAssignmentStartDate);
    const end = new Date(formData.floorAssignmentEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 365;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const termMonths = getTermMonths();
  const termDays = getTermDays();
  const monthlyRate = formData.monthlyManagementAmount || 0;
  const totalAgreementAmt = formData.totalAgreementAmount || (monthlyRate * termMonths);

  const getInstallmentAmt = () => {
    if (formData.paymentType === 'Quarterly') return monthlyRate * 3;
    if (formData.paymentType === 'Daily Wise') return Math.round((totalAgreementAmt / termDays) * 100) / 100;
    return monthlyRate;
  };

  const getCalculatedNextDueDate = () => {
    if (!formData.floorAssignmentStartDate) return "N/A";
    const start = new Date(formData.floorAssignmentStartDate);
    if (isNaN(start.getTime())) return "N/A";
    let nextDue = new Date(start);
    if (formData.paymentType === 'Quarterly') {
      nextDue.setMonth(nextDue.getMonth() + 3);
    } else {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    return nextDue.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setDialog({
        title: "Validation Incomplete",
        message: "Please check all steps for validation errors before submitting.",
        type: "warning"
      });
      return;
    }

    setIsLoading(true);

    if (isEditMode && editUserId) {
      try {
        const payload = {
          ...formData,
          assignedSeatCount: totalAssignedSeatCount,
          idProofUrl: idProof ? idProof.name : '',
          profilePhotoUrl: profilePhoto ? profilePhoto.name : '',
          updatedBy: currentUser?._id
        };
        const res = await api.put(`/users/${editUserId}`, payload);
        if (res.success || res.user || res.data) {
          setDialog({
            title: "User Updated Successfully",
            message: `Profile and details for ${formData.name} have been updated.`,
            type: "success"
          });
          setTimeout(() => {
            router.push('/admin/users');
          }, 1500);
        }
      } catch (err: any) {
        console.error("Failed to update user", err);
        setDialog({
          title: "Update Failed",
          message: err.message || "Failed to update user profile.",
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      await api.post('/users/send-verification-otp', {
        email: formData.email,
        name: formData.name
      });
      setOtpSuccess(false);
      setOtpCode("");
      setOtpError("");
      setShowOtpDialog(true);
    } catch (err: any) {
      console.error(err);
      setDialog({
        title: "Verification Failed",
        message: err.message || "Failed to send verification email. Please check for duplicate official emails.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'var(--font-geist-sans), Inter, sans-serif' }}>

      {/* Top Bar Header */}
      <div className="bg-white border-bottom px-4 py-3 sticky-top" style={{ zIndex: 100 }}>
        <div className="d-flex align-items-center justify-content-between mx-auto" style={{ maxWidth: '1400px' }}>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => router.push('/admin/users')}
              className="btn btn-light border rounded-circle d-flex align-items-center justify-content-center p-0"
              style={{ width: '34px', height: '34px' }}
              title="Back to User Management"
            >
              <i className="hgi-stroke hgi-arrow-left-01 text-dark" style={{ fontSize: '1rem' }}></i>
            </button>
            <div>
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.15rem' }}>
                {isEditMode ? "Edit User Profile" : "Create New User"}
              </h5>
              <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                {isEditMode ? "Update user profile, workspace assignments, and agreement terms." : "Setup credentials, workspace assignments, and agreement terms."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 mx-auto" style={{ maxWidth: '1400px', paddingBottom: '140px' }}>
        <form onSubmit={handleSubmit}>
          <div className="row g-4 align-items-start">

            {/* Left Sidebar: Vertical Stepper (4 STEPS) */}
            <div className="col-lg-3 d-none d-lg-block sticky-top" style={{ top: '100px' }}>
              <div className="card border-0 bg-white mb-3" style={{ borderRadius: '10px' }}>
                <div className="card-body p-4 d-flex flex-column gap-0">

                  {/* Step 1 */}
                  <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => currentStep > 1 && setCurrentStep(1)}>
                    <div className={`d-flex align-items-center justify-content-center fw-bold ${currentStep === 1 ? 'text-white' : 'text-muted'}`} style={{ width: '40px', height: '40px', minWidth: '40px', fontSize: '0.9rem', backgroundColor: currentStep === 1 ? 'var(--brand-orange)' : '#f8f9fa', borderRadius: '10px' }}>01</div>
                    <div>
                      <div className={`fw-bold ${currentStep === 1 ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>Personal Details</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Basic information</div>
                    </div>
                  </div>

                  <div className="border-start" style={{ height: '24px', margin: '4px 0 4px 20px', borderColor: 'var(--border-color)' }}></div>

                  {/* Step 2 */}
                  <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => currentStep > 2 && setCurrentStep(2)}>
                    <div className={`d-flex align-items-center justify-content-center fw-bold ${currentStep === 2 ? 'text-white' : 'text-muted'}`} style={{ width: '40px', height: '40px', minWidth: '40px', fontSize: '0.9rem', backgroundColor: currentStep === 2 ? 'var(--brand-orange)' : '#f8f9fa', borderRadius: '10px' }}>02</div>
                    <div>
                      <div className={`fw-bold ${currentStep === 2 ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>Workspace Setup</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Property, floor & seats</div>
                    </div>
                  </div>

                  <div className="border-start" style={{ height: '24px', margin: '4px 0 4px 20px', borderColor: 'var(--border-color)' }}></div>

                  {/* Step 3 */}
                  <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => currentStep > 3 && setCurrentStep(3)}>
                    <div className={`d-flex align-items-center justify-content-center fw-bold ${currentStep === 3 ? 'text-white' : 'text-muted'}`} style={{ width: '40px', height: '40px', minWidth: '40px', fontSize: '0.9rem', backgroundColor: currentStep === 3 ? 'var(--brand-orange)' : '#f8f9fa', borderRadius: '10px' }}>03</div>
                    <div>
                      <div className={`fw-bold ${currentStep === 3 ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>Billing & Agreement</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Payment & terms</div>
                    </div>
                  </div>

                  <div className="border-start" style={{ height: '24px', margin: '4px 0 4px 20px', borderColor: 'var(--border-color)' }}></div>

                  {/* Step 4 */}
                  <div className="d-flex align-items-center gap-3 cursor-pointer" onClick={() => currentStep > 4 && setCurrentStep(4)}>
                    <div className={`d-flex align-items-center justify-content-center fw-bold ${currentStep === 4 ? 'text-white' : 'text-muted'}`} style={{ width: '40px', height: '40px', minWidth: '40px', fontSize: '0.9rem', backgroundColor: currentStep === 4 ? 'var(--brand-orange)' : '#f8f9fa', borderRadius: '10px' }}>04</div>
                    <div>
                      <div className={`fw-bold ${currentStep === 4 ? 'text-dark' : 'text-muted'}`} style={{ fontSize: '0.9rem' }}>Review</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Confirm & create</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Main Form Content */}
            <div className="col-lg-9 col-12">

              {/* Top Progress bar indicator */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted fw-bold">Step {currentStep} of 4</span>
                  <span className="badge rounded-pill py-1.5 px-3 fw-bold text-white" style={{ fontSize: '0.75rem', backgroundColor: 'var(--brand-orange)' }}>
                    {currentStep === 1 && 'Personal Details'}
                    {currentStep === 2 && 'Workspace Setup'}
                    {currentStep === 3 && 'Billing & Agreement'}
                    {currentStep === 4 && 'Review & Confirm'}
                  </span>
                </div>
                <div className="progress mt-2" style={{ height: '6px', borderRadius: '3px' }}>
                  <div className="progress-bar" role="progressbar" style={{ width: `${(currentStep / 4) * 100}%`, borderRadius: '3px', backgroundColor: 'var(--brand-orange)' }}></div>
                </div>
              </div>

              {/* STEP 1: PERSONAL DETAILS */}
              {currentStep === 1 && (
                <div className="card border-0 bg-white mb-4" style={{ borderRadius: '10px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', backgroundColor: 'var(--brand-orange-bg)', color: 'var(--brand-orange)' }}>
                        <i className="hgi-stroke hgi-user" style={{ fontSize: '1.25rem' }}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Personal Information</h5>
                        <p className="text-muted small mb-0">Provide basic credentials and contact information.</p>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Full Name *</label>
                        <div className={`d-flex align-items-center form-control bg-white px-3 py-2 ${validationErrors.name ? 'is-invalid' : ''}`} style={{ border: validationErrors.name ? '1px solid var(--bs-danger)' : '1px solid var(--border-color)', borderRadius: '8px', gap: '10px' }}>
                          <i className="hgi-stroke hgi-user text-muted" style={{ fontSize: '1.1rem' }}></i>
                          <input type="text" className="border-0 p-0 w-100 shadow-none text-dark" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent' }} placeholder="e.g. Tungana Naveen" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        {validationErrors.name && <div className="invalid-feedback small d-block mt-1">{validationErrors.name}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Official Email ID *</label>
                        <div className={`d-flex align-items-center form-control bg-white px-3 py-2 ${validationErrors.email ? 'is-invalid' : ''}`} style={{ border: validationErrors.email ? '1px solid var(--bs-danger)' : '1px solid var(--border-color)', borderRadius: '8px', gap: '10px' }}>
                          <i className="hgi-stroke hgi-mail-01 text-muted" style={{ fontSize: '1.1rem' }}></i>
                          <input type="email" className="border-0 p-0 w-100 shadow-none text-dark" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent' }} placeholder="office@gmail.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })} />
                        </div>
                        {validationErrors.email && <div className="invalid-feedback small d-block mt-1">{validationErrors.email}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Primary Role *</label>
                        <div className="d-flex align-items-center form-control bg-white px-3 py-2" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', gap: '10px' }}>
                          <i className="hgi-stroke hgi-user-shield-01 text-muted" style={{ fontSize: '1.1rem' }}></i>
                          <select className="border-0 p-0 w-100 shadow-none text-dark fw-medium" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent', cursor: 'pointer' }} required value={formData.role}
                            onChange={(e) => {
                              const r = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                role: r,
                                staffCategory: r === 'STAFF_ADMIN' ? 'Security' : 'None',
                                permissions: r === 'STAFF_ADMIN' && prev.permissions.length === 0
                                  ? ['manage_helpdesk', 'manage_visitors', 'manage_materials']
                                  : prev.permissions,
                                assignedProperties: [], assignedFloors: [], assignedUnits: []
                              }));
                            }}
                          >
                            {(() => {
                              const norm = (currentUser?.role || '').toUpperCase().replace(/[-\s]+/g, '_');
                              if (norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN' || norm === 'ADMIN') {
                                return (
                                  <>
                                    {formData.role && !['FLOOR_ADMIN', 'STAFF_ADMIN'].includes(formData.role) && (
                                      <option value={formData.role}>{formData.role.replace(/_/g, ' ')}</option>
                                    )}
                                    <option value="FLOOR_ADMIN">Floor Admin</option>
                                    <option value="STAFF_ADMIN">Staff Admin</option>
                                  </>
                                );
                              }
                              if (norm === 'COWORKING_ADMIN' || norm === 'COWORKING') {
                                return (
                                  <>
                                    {formData.role && !['COWORKING_TENANT', 'STAFF_ADMIN'].includes(formData.role) && (
                                      <option value={formData.role}>{formData.role.replace(/_/g, ' ')}</option>
                                    )}
                                    <option value="COWORKING_TENANT">Co-Working Member</option>
                                    <option value="STAFF_ADMIN">Staff Admin</option>
                                  </>
                                );
                              }
                              if (norm === 'FLOOR_ADMIN') {
                                return (
                                  <>
                                    {formData.role && !['OFFICE_OWNER', 'STAFF_ADMIN'].includes(formData.role) && (
                                      <option value={formData.role}>{formData.role.replace(/_/g, ' ')}</option>
                                    )}
                                    <option value="OFFICE_OWNER">Office Owner</option>
                                    <option value="STAFF_ADMIN">Staff Admin</option>
                                  </>
                                );
                              }
                              if (norm === 'OFFICE_OWNER') {
                                return (
                                  <>
                                    {formData.role && formData.role !== 'STAFF_ADMIN' && (
                                      <option value={formData.role}>{formData.role.replace(/_/g, ' ')}</option>
                                    )}
                                    <option value="STAFF_ADMIN">Staff Admin</option>
                                  </>
                                );
                              }
                              return (
                                <>
                                  <option value="COWORKING_TENANT">Co-Working Member</option>
                                  <option value="COWORKING_ADMIN">Co-Working Space Admin</option>
                                  <option value="FLOOR_ADMIN">Floor Admin</option>
                                  <option value="OFFICE_OWNER">Office Owner</option>
                                  <option value="STAFF_ADMIN">Staff Admin</option>
                                </>
                              );
                            })()}
                          </select>
                        </div>
                      </div>

                      {formData.role === 'STAFF_ADMIN' && (
                        <>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold text-dark mb-1">Staff Category *</label>
                            <div className="d-flex align-items-center form-control bg-white px-3 py-2" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', gap: '10px' }}>
                              <i className="hgi-stroke hgi-user text-muted" style={{ fontSize: '1.1rem' }}></i>
                              <select className="border-0 p-0 w-100 shadow-none text-dark fw-medium" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent', cursor: 'pointer' }} required value={formData.staffCategory}
                                onChange={(e) => setFormData({ ...formData, staffCategory: e.target.value })}
                              >
                                <option value="Security">Security / Guard</option>
                                <option value="Watchman">Watchman / Caretaker</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Plumber">Plumber</option>
                                <option value="Helpdesk">Helpdesk Executive</option>
                                <option value="Gardener">Gardener</option>
                                <option value="Housekeeping">Housekeeping / Cleaner</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Other">Other Staff</option>
                              </select>
                            </div>
                          </div>

                          <div className="col-12 mt-2 mb-2">
                            <div className="p-3 rounded-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                              <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <i className="hgi-stroke hgi-security-check text-primary" style={{ fontSize: '1.2rem' }}></i>
                                  <span className="fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>
                                    Staff Module Access Controls
                                  </span>
                                </div>
                                <span className="badge bg-primary-subtle text-primary fw-semibold" style={{ fontSize: '0.72rem' }}>
                                  Select Enabled Sidebar Modules
                                </span>
                              </div>
                              <p className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>
                                Toggle ON the modules this Staff member is allowed to see and manage upon successful login.
                              </p>

                              <div className="row g-2">
                                {[
                                  { key: 'manage_helpdesk', label: 'Helpdesk & Complaints', icon: 'hgi-headset' },
                                  { key: 'manage_visitors', label: 'Visitor Management', icon: 'hgi-identity-card' },
                                  { key: 'manage_materials', label: 'Gate Pass & Materials', icon: 'hgi-package' },
                                  { key: 'manage_assets', label: 'Asset & AMC Management', icon: 'hgi-tools' },
                                  { key: 'manage_vendors', label: 'Vendor Management', icon: 'hgi-truck' },
                                  { key: 'manage_leases', label: 'Lease Details', icon: 'hgi-agreement-01' },
                                  { key: 'manage_floors', label: 'Floor Management', icon: 'hgi-layers-01' },
                                  { key: 'manage_bookings', label: 'Booking Management', icon: 'hgi-calendar-03' },
                                  { key: 'manage_payments', label: 'Payment Management', icon: 'hgi-credit-card' },
                                ].map(mod => {
                                  const isChecked = formData.permissions.includes(mod.key);
                                  return (
                                    <div key={mod.key} className="col-md-6 col-lg-4">
                                      <div
                                        className={`d-flex align-items-center justify-content-between p-2 rounded-2 border bg-white cursor-pointer transition-all ${isChecked ? 'border-primary shadow-sm' : ''}`}
                                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => {
                                          const exists = formData.permissions.includes(mod.key);
                                          const updated = exists
                                            ? formData.permissions.filter(p => p !== mod.key)
                                            : [...formData.permissions, mod.key];
                                          setFormData({ ...formData, permissions: updated });
                                        }}
                                      >
                                        <div className="d-flex align-items-center gap-2">
                                          <i className={`hgi-stroke ${mod.icon} ${isChecked ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '1rem' }}></i>
                                          <span className={`small ${isChecked ? 'fw-bold text-dark' : 'text-secondary'}`} style={{ fontSize: '0.82rem' }}>
                                            {mod.label}
                                          </span>
                                        </div>
                                        <div className="form-check form-switch m-0 min-height-0">
                                          <input
                                            className="form-check-input cursor-pointer"
                                            type="checkbox"
                                            role="switch"
                                            checked={isChecked}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              const checked = e.target.checked;
                                              const updated = checked
                                                ? [...formData.permissions.filter(p => p !== mod.key), mod.key]
                                                : formData.permissions.filter(p => p !== mod.key);
                                              setFormData({ ...formData, permissions: updated });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Temporary Password *</label>
                        <div className={`d-flex align-items-center form-control bg-white px-3 py-2 ${validationErrors.password ? 'is-invalid' : ''}`} style={{ border: validationErrors.password ? '1px solid var(--bs-danger)' : '1px solid var(--border-color)', borderRadius: '8px', gap: '10px' }}>
                          <i className="hgi-stroke hgi-lock text-muted" style={{ fontSize: '1.1rem' }}></i>
                          <input type={showPassword ? "text" : "password"} className="border-0 p-0 w-100 shadow-none text-dark" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent' }} placeholder="123456" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                          <i className={`hgi-stroke ${showPassword ? 'hgi-eye' : 'hgi-eye'} text-muted cursor-pointer`} onClick={() => setShowPassword(!showPassword)} style={{ fontSize: '1.1rem' }}></i>
                        </div>
                        {validationErrors.password && <div className="invalid-feedback small d-block mt-1">{validationErrors.password}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Mobile Number *</label>
                        <div className={`d-flex align-items-center form-control bg-white px-3 py-2 ${validationErrors.phoneNumber ? 'is-invalid' : ''}`} style={{ border: validationErrors.phoneNumber ? '1px solid var(--bs-danger)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
                          <span className="d-flex align-items-center gap-1 me-2 pe-2 border-end text-muted" style={{ fontSize: '0.9rem' }}>
                            <span>🇮🇳</span>
                            <span className="small fw-semibold text-dark">+91</span>
                            <i className="hgi-stroke hgi-arrow-down-01" style={{ fontSize: '0.7rem' }}></i>
                          </span>
                          <input type="tel" className="border-0 p-0 w-100 shadow-none text-dark" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent' }} placeholder="08106651649" required value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                        </div>
                        {validationErrors.phoneNumber && <div className="invalid-feedback small d-block mt-1">{validationErrors.phoneNumber}</div>}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Alternate Contact Number</label>
                        <div className={`d-flex align-items-center form-control bg-white px-3 py-2 ${validationErrors.emergencyNumber ? 'is-invalid' : ''}`} style={{ border: validationErrors.emergencyNumber ? '1px solid var(--bs-danger)' : '1px solid var(--border-color)', borderRadius: '8px' }}>
                          <span className="d-flex align-items-center gap-1 me-2 pe-2 border-end text-muted" style={{ fontSize: '0.9rem' }}>
                            <span>🇮🇳</span>
                            <span className="small fw-semibold text-dark">+91</span>
                            <i className="hgi-stroke hgi-arrow-down-01" style={{ fontSize: '0.7rem' }}></i>
                          </span>
                          <input type="tel" className="border-0 p-0 w-100 shadow-none text-dark" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent' }} placeholder="08106651649" value={formData.emergencyNumber} onChange={(e) => setFormData({ ...formData, emergencyNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                        </div>
                        {validationErrors.emergencyNumber && <div className="invalid-feedback small d-block mt-1">{validationErrors.emergencyNumber}</div>}
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1">Address *</label>
                        <div className={`d-flex align-items-center form-control bg-white px-3 py-2 ${validationErrors.address ? 'is-invalid' : ''}`} style={{ border: validationErrors.address ? '1px solid var(--bs-danger)' : '1px solid var(--border-color)', borderRadius: '8px', gap: '10px' }}>
                          <i className="hgi-stroke hgi-location-01 text-muted" style={{ fontSize: '1.1rem' }}></i>
                          <input type="text" className="border-0 p-0 w-100 shadow-none text-dark" style={{ outline: 'none', fontSize: '0.9rem', backgroundColor: 'transparent' }} placeholder="ohm sri shiva sai mens hostel" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        {validationErrors.address && <div className="invalid-feedback small d-block mt-1">{validationErrors.address}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: WORKSPACE SETUP */}
              {currentStep === 2 && (
                <div className="card border-0 bg-white mb-4" style={{ borderRadius: '10px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', backgroundColor: 'var(--brand-orange-bg)', color: 'var(--brand-orange)' }}>
                        <i className="hgi-stroke hgi-building-03" style={{ fontSize: '1.25rem' }}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Workspace Setup</h5>
                        <p className="text-muted small mb-0">Select property, floor, and office details for user deployment.</p>
                      </div>
                    </div>

                    {(() => {
                      const normCurrentUserRole = String(currentUser?.role || '').toUpperCase().replace(/[-\s]+/g, '_');
                      const isSuperAdminLoggedIn = normCurrentUserRole.includes('SUPER_ADMIN') || normCurrentUserRole.includes('ULTRA');
                      const isCoWorkingAdminLoggedIn = normCurrentUserRole.includes('COWORKING_ADMIN') || normCurrentUserRole.includes('COWORKING');

                      return (
                        <div className="row g-3">
                          {/* Property Selection: Display for SUPER_ADMIN, COWORKING_ADMIN, or whenever properties exist */}
                          {(isSuperAdminLoggedIn || isCoWorkingAdminLoggedIn || properties.length > 0) && (
                            <div className="col-12">
                              <label className="form-label small fw-bold text-dark mb-1">Select Property *</label>
                              <MultiSelect
                                options={properties}
                                selectedIds={formData.assignedProperties}
                                onChange={(ids: any) => setFormData({ ...formData, assignedProperties: ids, assignedFloors: [], assignedUnits: [] })}
                                placeholder="Select Property"
                              />
                              {validationErrors.properties && <div className="text-danger small mt-1">{validationErrors.properties}</div>}
                            </div>
                          )}

                          {/* Floors Selection: Display for SUPER_ADMIN logged in user */}
                          {(isSuperAdminLoggedIn || (!isCoWorkingAdminLoggedIn && filteredFloors.length > 0)) && (
                            <div className="col-12">
                              <label className="form-label small fw-bold text-dark mb-1">Select Floors (Optional)</label>
                              <MultiSelect
                                options={filteredFloors.length > 0 ? filteredFloors : floors}
                                selectedIds={formData.assignedFloors}
                                onChange={(ids: any) => setFormData({ ...formData, assignedFloors: ids, assignedUnits: [] })}
                                placeholder="Select Floor"
                              />
                              {validationErrors.floors && <div className="text-danger small mt-1">{validationErrors.floors}</div>}
                            </div>
                          )}

                          {/* Units & Workspaces (Offices / Desks): Display for COWORKING_ADMIN logged in user */}
                          {(isCoWorkingAdminLoggedIn || (!isSuperAdminLoggedIn && (formData.assignedProperties.length > 0 || filteredUnits.length > 0))) && (
                            <div className="col-12">
                              <label className="form-label small fw-bold text-dark mb-1">Units &amp; Workspaces (Offices / Desks) *</label>
                              <MultiSelect
                                options={filteredUnits.length > 0 ? filteredUnits : units}
                                selectedIds={formData.assignedUnits}
                                onChange={handleUnitSelectionChange}
                                placeholder="Select Offices / Desks"
                              />
                              {validationErrors.units && <div className="text-danger small mt-1">{validationErrors.units}</div>}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* PRO BOOKMYSHOW-STYLE SEAT MAP SELECTION UI */}
                    {formData.assignedUnits.length > 0 && (
                      <div className="col-12 mt-3">
                        <div className="p-4 border rounded-4 bg-white" style={{ borderColor: 'var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                          <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
                            <div className="d-flex align-items-center gap-2.5">
                              <div className="rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '38px', height: '38px', backgroundColor: 'var(--brand-orange)' }}>
                                <i className="bi bi-person-workspace fs-5"></i>
                              </div>
                              <div>
                                <h6 className="fw-bold text-dark m-0" style={{ fontSize: '1.05rem', letterSpacing: '-0.01em' }}>Interactive Seat Map & Workspace Allocation</h6>
                                <span className="text-muted extra-small">Click individual seats to select/deselect or use quick row controls.</span>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge rounded-pill fw-bold" style={{ backgroundColor: 'var(--brand-orange-bg)', color: 'var(--brand-orange)', border: '1px solid var(--brand-orange-border)', fontSize: '0.8rem', padding: '6px 14px' }}>
                                {formData.assignedUnits.length} Office Unit{formData.assignedUnits.length > 1 ? 's' : ''} Selected
                              </span>
                            </div>
                          </div>

                          <div className="d-flex flex-column gap-4">
                            {formData.assignedUnits.map((unitId) => {
                              const unit = units.find(u => u._id === unitId);
                              if (!unit) return null;
                              const maxSeats = unit.seatCount || 10;
                              const occupiedSeats = unit.occupiedSeatCount || 0;
                              const selectedSeatsList = formData.unitSelectedSeatsMap?.[unitId] || [];
                              const currentSeatsCount = selectedSeatsList.length;

                              return (
                                <div key={unitId} className="card border bg-white p-4 shadow-sm" style={{ borderRadius: '16px', borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>

                                  {/* Unit Header */}
                                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                                    <div className="d-flex align-items-center gap-3">
                                      <div className="d-flex align-items-center justify-content-center rounded-3 text-white fw-bold shadow-sm" style={{ width: '44px', height: '44px', minWidth: '44px', backgroundColor: '#0f172a', fontSize: '1.15rem' }}>
                                        <i className="bi bi-building"></i>
                                      </div>
                                      <div>
                                        <div className="fw-bold text-dark" style={{ fontSize: '0.98rem', letterSpacing: '-0.01em' }}>
                                          Unit {unit.unitNumber} {unit.unitName ? `– ${unit.unitName}` : ''}
                                        </div>
                                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                          {unit.property?.propertyName || 'Property'} · Floor {unit.floor?.floorNumber || unit.floorNumber || '3'}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                      <div className="bg-light border text-center" style={{ padding: '6px 16px', borderRadius: '50px', backgroundColor: '#f8fafc' }}>
                                        <span className="text-muted d-block fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>AREA</span>
                                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>{unit.sqft ? `${unit.sqft.toLocaleString('en-IN')} SFT` : '1,000 SFT'}</span>
                                      </div>

                                      <div className="bg-light border text-center" style={{ padding: '6px 16px', borderRadius: '50px', backgroundColor: '#f8fafc' }}>
                                        <span className="text-muted d-block fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>TOTAL SEATS</span>
                                        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>{maxSeats} Seats</span>
                                      </div>

                                      {/* Quick Action Buttons: Select All / Clear */}
                                      <div className="d-flex align-items-center gap-2">
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-light border fw-semibold text-dark shadow-2xs"
                                          style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '8px', transition: 'all 0.15s ease' }}
                                          onClick={() => selectAllUnitSeats(unitId, maxSeats, occupiedSeats)}
                                        >
                                          Select All
                                        </button>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-light border fw-semibold text-muted shadow-2xs"
                                          style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '8px', transition: 'all 0.15s ease' }}
                                          onClick={() => clearAllUnitSeats(unitId)}
                                        >
                                          Clear
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* SEAT MAP PODIUM / BAY HEADER */}
                                  <div className="my-4 text-center">
                                    <div className="d-inline-flex align-items-center justify-content-center rounded-pill border text-muted small fw-bold mb-2" style={{ backgroundColor: '#f8fafc', padding: '6px 20px', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                                      <i className="bi bi-display me-2 text-primary"></i> MAIN EXECUTIVE DESK BAY & PODIUM
                                    </div>
                                    <div className="mx-auto rounded-pill" style={{ width: '60%', height: '4px', background: 'linear-gradient(90deg, transparent 0%, var(--brand-orange) 50%, transparent 100%)', opacity: 0.85 }}></div>
                                  </div>

                                  {/* INTERACTIVE SEAT GRID */}
                                  <div className="p-4 bg-white border rounded-3 text-center mb-3" style={{ borderColor: '#e2e8f0', backgroundColor: '#fafafa' }}>
                                    <div className="row g-2 justify-content-center">
                                      {Array.from({ length: maxSeats }, (_, idx) => {
                                        const seatNum = idx + 1;
                                        const isOccupiedByOther = idx < occupiedSeats;
                                        const isSelectedForUser = !isOccupiedByOther && selectedSeatsList.includes(seatNum);

                                        return (
                                          <div key={idx} className="col-auto">
                                            <button
                                              type="button"
                                              disabled={isOccupiedByOther}
                                              onClick={() => {
                                                if (!isOccupiedByOther) {
                                                  toggleSeatSelection(unitId, seatNum);
                                                }
                                              }}
                                              className="btn p-2 d-flex flex-column align-items-center justify-content-center position-relative"
                                              style={{
                                                width: "56px",
                                                height: "56px",
                                                borderRadius: "12px",
                                                backgroundColor: isOccupiedByOther ? "#f1f5f9" : isSelectedForUser ? "#f0fdf4" : "#ffffff",
                                                border: isOccupiedByOther ? "1px solid #cbd5e1" : isSelectedForUser ? "2px solid #16a34a" : "1px solid #e2e8f0",
                                                color: isOccupiedByOther ? "#94a3b8" : isSelectedForUser ? "#16a34a" : "var(--dark-heading)",
                                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                                cursor: isOccupiedByOther ? "not-allowed" : "pointer",
                                                boxShadow: isSelectedForUser ? "0 4px 12px rgba(22, 163, 74, 0.18)" : "0 1px 2px rgba(0,0,0,0.03)"
                                              }}
                                              title={isOccupiedByOther ? `Seat ${seatNum} (Occupied)` : `Click to ${isSelectedForUser ? 'Deselect' : 'Select'} Seat ${seatNum}`}
                                            >
                                              <i className={`bi ${isOccupiedByOther ? 'bi-lock-fill' : 'bi-person-workspace'}`} style={{ fontSize: "1.1rem" }}></i>
                                              <span className="fw-bold mt-1" style={{ fontSize: "0.72rem", lineHeight: "1" }}>
                                                {seatNum}
                                              </span>
                                              {isSelectedForUser && (
                                                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle" style={{ width: '10px', height: '10px' }}></span>
                                              )}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* SEAT LEGEND */}
                                    <div className="d-flex align-items-center justify-content-center gap-4 mt-4 pt-3 border-top flex-wrap" style={{ fontSize: '0.8rem', borderColor: '#e2e8f0' }}>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="rounded-2 d-inline-block border" style={{ width: '14px', height: '14px', backgroundColor: '#f0fdf4', borderColor: '#16a34a' }}></span>
                                        <span className="fw-bold text-dark">Selected ({currentSeatsCount})</span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="rounded-2 d-inline-block border" style={{ width: '14px', height: '14px', backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}></span>
                                        <span className="fw-medium text-muted">Available ({Math.max(maxSeats - occupiedSeats - currentSeatsCount, 0)})</span>
                                      </div>
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="rounded-2 d-inline-block border" style={{ width: '14px', height: '14px', backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' }}></span>
                                        <span className="fw-medium text-muted">Occupied ({occupiedSeats})</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Selected Seats Numbers List Display */}
                                  {selectedSeatsList.length > 0 && (
                                    <div className="small text-muted fw-semibold px-1">
                                      Selected Seat Numbers: <span className="text-dark fw-bold">{selectedSeatsList.map(s => `Seat ${s}`).join(', ')}</span>
                                    </div>
                                  )}

                                </div>
                              );
                            })}

                            {/* Total Summary */}
                            <div className="bg-white border rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2 mt-1 shadow-sm" style={{ padding: '14px 20px', borderRadius: '12px', borderColor: '#e2e8f0' }}>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-calculator text-primary fs-5"></i>
                                <span className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>Total Workspace Allocation:</span>
                              </div>
                              <div className="d-flex align-items-center gap-3 flex-wrap">
                                <span className="badge bg-light text-dark border rounded-pill fw-semibold" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                                  {totalManagedSft.toLocaleString('en-IN')} Total SFT
                                </span>
                                <span className="badge rounded-pill fw-bold" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontSize: '0.82rem', padding: '8px 16px' }}>
                                  <i className="bi bi-check-circle-fill me-2"></i> {totalAssignedSeatCount} Total Seats Assigned
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: BILLING & AGREEMENT */}
              {currentStep === 3 && (
                <div className="card border-0 bg-white mb-4" style={{ borderRadius: '10px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px', backgroundColor: 'var(--brand-orange-bg)', color: 'var(--brand-orange)' }}>
                        <i className="hgi-stroke hgi-invoice-01" style={{ fontSize: '1.25rem' }}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0 text-dark">Billing & Agreement</h5>
                        <p className="text-muted small mb-0">Fill in lease agreement terms, billing cycle, and financials.</p>
                      </div>
                    </div>

                    {formData.role === 'SUPER_ADMIN' || formData.role === 'STAFF_ADMIN' ? (
                      <div className="text-center p-5 border rounded-3 bg-light">
                        <div className="mb-3">
                          <i className="hgi-stroke hgi-information-circle text-primary" style={{ fontSize: '3rem' }}></i>
                        </div>
                        <h5 className="fw-bold text-dark">Step Not Required</h5>
                        <p className="text-muted small max-w-md mx-auto mb-0">Billing & agreement setup is not required for the {formData.role} role. Click "Next" to continue.</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Company / Organization Name</label>
                          <input type="text" className="form-control py-2 shadow-none" placeholder="example Solutions" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Tenant Type</label>
                          <select className="form-select py-2 shadow-none" value={formData.tenantType} onChange={(e) => setFormData({ ...formData, tenantType: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                            <option value="Individual">Individual</option>
                            <option value="Company">Company</option>
                            <option value="Corporate">Corporate</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">GST / PAN Number</label>
                          <input type="text" className={`form-control py-2 shadow-none ${validationErrors.gstPan ? 'is-invalid' : ''}`} placeholder="e.g. 22AAAAA0000A1Z5" value={formData.gstPan} onChange={(e) => setFormData({ ...formData, gstPan: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                          {validationErrors.gstPan && <div className="invalid-feedback small">{validationErrors.gstPan}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Agreement Status *</label>
                          <select className="form-select py-2 shadow-none" value={formData.agreementStatus} onChange={(e) => setFormData({ ...formData, agreementStatus: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Expired">Expired</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">ID Proof Upload</label>
                          <div className="border rounded-3 p-2 bg-light text-center cursor-pointer" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color)' }}>
                            <input type="file" className="d-none" id="id-proof" onChange={(e) => setIdProof(e.target.files ? e.target.files[0] : null)} />
                            <label htmlFor="id-proof" className="w-100 m-0" style={{ cursor: 'pointer' }}>
                              <i className="hgi-stroke hgi-invoice-01 text-primary me-2"></i>
                              <span className="small fw-semibold">{idProof ? idProof.name : 'Choose ID Proof File'}</span>
                            </label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Profile Photo Upload</label>
                          <div className="border rounded-3 p-2 bg-light text-center cursor-pointer" style={{ borderStyle: 'dashed', borderColor: 'var(--border-color)' }}>
                            <input type="file" className="d-none" id="profile-photo" onChange={(e) => setProfilePhoto(e.target.files ? e.target.files[0] : null)} />
                            <label htmlFor="profile-photo" className="w-100 m-0" style={{ cursor: 'pointer' }}>
                              <i className="hgi-stroke hgi-user text-primary me-2"></i>
                              <span className="small fw-semibold">{profilePhoto ? profilePhoto.name : 'Choose Image File'}</span>
                            </label>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Agreement Start Date *</label>
                          <input type="date" className={`form-control py-2 shadow-none ${validationErrors.floorAssignmentStartDate ? 'is-invalid' : ''}`} required value={formData.floorAssignmentStartDate} onChange={(e) => handleStartDateChange(e.target.value)} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                          {validationErrors.floorAssignmentStartDate && <div className="invalid-feedback small">{validationErrors.floorAssignmentStartDate}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Agreement End Date *</label>
                          <input type="date" className={`form-control py-2 shadow-none ${validationErrors.floorAssignmentEndDate ? 'is-invalid' : ''}`} required value={formData.floorAssignmentEndDate} onChange={(e) => setFormData({ ...formData, floorAssignmentEndDate: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                          {validationErrors.floorAssignmentEndDate && <div className="invalid-feedback small">{validationErrors.floorAssignmentEndDate}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Monthly Rent Amount (₹) *</label>
                          <input type="number" className={`form-control py-2 shadow-none ${validationErrors.monthlyManagementAmount ? 'is-invalid' : ''}`} required min="0" value={formData.monthlyManagementAmount || ''} onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              monthlyManagementAmount: val,
                              totalAgreementAmount: val * termMonths
                            }));
                          }} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                          {validationErrors.monthlyManagementAmount && <div className="invalid-feedback small">{validationErrors.monthlyManagementAmount}</div>}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Total Agreement Amount (₹)</label>
                          <input type="number" className="form-control py-2 shadow-none" min="0" value={formData.totalAgreementAmount || ''} onChange={(e) => setFormData({ ...formData, totalAgreementAmount: Number(e.target.value) })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Payment Frequency *</label>
                          <select className="form-select py-2 shadow-none" value={formData.paymentType} onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                            <option value="Monthly Installment">Monthly Installment</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="Daily Wise">Daily Wise</option>
                            <option value="One Time">One Time</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-dark mb-1">Payment Due Day of Month *</label>
                          <input type="number" className="form-control py-2 shadow-none" required min="1" max="31" value={formData.paymentDueDay} onChange={(e) => setFormData({ ...formData, paymentDueDay: Number(e.target.value) })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }} />
                        </div>

                        {/* Payment Calculation Details Panel */}
                        <div className="col-12 mt-2">
                          <div className="p-3 bg-light rounded-3 border">
                            <span className="small text-muted d-block mb-1">Calculated Agreement Details (Live Preview)</span>
                            <div className="d-flex flex-wrap gap-4 text-dark small">
                              <div>
                                Duration: <strong>{termDays} Days / {termMonths} Months</strong>
                              </div>
                              <div>
                                Installment Amount: <strong>₹{getInstallmentAmt().toLocaleString()}</strong>
                              </div>
                              <div>
                                Next Due Date: <strong>{getCalculatedNextDueDate()}</strong>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-bold text-dark mb-1">Remarks / Special Notes</label>
                          <textarea rows={2} className="form-control py-2 shadow-none" placeholder="Any internal assignment remarks..." value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} style={{ borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}></textarea>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <div className="card border-0 bg-white mb-4" style={{ borderRadius: '10px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-dark" style={{ width: '38px', height: '38px', backgroundColor: 'var(--brand-orange-bg)', color: 'var(--brand-orange)' }}>
                        <i className="hgi-stroke hgi-checkmark-circle-01" style={{ fontSize: '1.1rem' }}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0 text-dark">Review User Profile</h6>
                        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>Check all information carefully before creating the user account.</p>
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-4">

                      {/* Section 1: Personal Details */}
                      <div>
                        <h6 className="fw-bold text-dark mb-3 border-bottom pb-2" style={{ fontSize: '0.9rem' }}>
                          <i className="hgi-stroke hgi-user text-muted me-2"></i>Personal Information Summary
                        </h6>
                        <div className="row g-2">
                          <div className="col-sm-6">
                            <span className="text-muted small d-block">Full Name</span>
                            <strong className="text-dark small">{formData.name || 'Not specified'}</strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted small d-block">Official Email</span>
                            <strong className="text-dark small">{formData.email || 'Not specified'}</strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted small d-block">System Role</span>
                            <strong className="text-dark small">{formData.role || 'Not specified'}</strong>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted small d-block">Contact Phone</span>
                            <strong className="text-dark small">+91 {formData.phoneNumber || 'Not specified'}</strong>
                          </div>
                          <div className="col-12">
                            <span className="text-muted small d-block">Address</span>
                            <strong className="text-dark small">{formData.address || 'Not specified'}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Spatial Assignment */}
                      {formData.role !== 'SUPER_ADMIN' && (
                        <div>
                          <h6 className="fw-bold text-dark mb-3 border-bottom pb-2" style={{ fontSize: '0.9rem' }}>
                            <i className="hgi-stroke hgi-building-03 text-muted me-2"></i>Spatial & Seats Assignment Summary
                          </h6>
                          <div className="row g-2">
                            <div className="col-12">
                              <span className="text-muted small d-block">Assigned Properties</span>
                              <strong className="text-dark small">
                                {formData.assignedProperties.length > 0
                                  ? properties.filter(p => formData.assignedProperties.includes(p._id)).map(p => p.name).join(', ')
                                  : 'None selected'}
                              </strong>
                            </div>
                            <div className="col-12">
                              <span className="text-muted small d-block">Assigned Floors</span>
                              <strong className="text-dark small">
                                {formData.assignedFloors.length > 0
                                  ? floors.filter(f => formData.assignedFloors.includes(f._id)).map(f => f.floorName || `Floor ${f.floorNumber}`).join(', ')
                                  : 'None selected'}
                              </strong>
                            </div>
                            {formData.role === 'OFFICE_OWNER' && (
                              <>
                                <div className="col-sm-6">
                                  <span className="text-muted small d-block">Assigned Offices (Units)</span>
                                  <strong className="text-dark small">
                                    {formData.assignedUnits.length > 0
                                      ? units.filter(u => formData.assignedUnits.includes(u._id)).map(u => `Unit ${u.unitNumber}`).join(', ')
                                      : 'None selected'}
                                  </strong>
                                </div>
                                <div className="col-sm-6">
                                  <span className="text-muted small d-block">Total Assigned Seats</span>
                                  <strong className="text-success small">{totalAssignedSeatCount} Seats ({totalManagedSft.toLocaleString('en-IN')} SFT)</strong>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Invoicing Terms */}
                      {formData.role !== 'SUPER_ADMIN' && formData.role !== 'STAFF_ADMIN' && (
                        <div>
                          <h6 className="fw-bold text-dark mb-3 border-bottom pb-2" style={{ fontSize: '0.9rem' }}>
                            <i className="hgi-stroke hgi-invoice-01 text-muted me-2"></i>Agreement & Financials Summary
                          </h6>
                          <div className="row g-2">
                            <div className="col-sm-6">
                              <span className="text-muted small d-block">Company Name</span>
                              <strong className="text-dark small">{formData.companyName || 'Not specified'}</strong>
                            </div>
                            <div className="col-sm-6">
                              <span className="text-muted small d-block">GSTIN / PAN</span>
                              <strong className="text-dark small">{formData.gstPan || 'Not specified'}</strong>
                            </div>
                            <div className="col-sm-6">
                              <span className="text-muted small d-block">Lease Term</span>
                              <strong className="text-dark small">
                                {formData.floorAssignmentStartDate || 'N/A'} to {formData.floorAssignmentEndDate || 'N/A'} ({termDays} days / {termMonths} mos)
                              </strong>
                            </div>
                            <div className="col-sm-6">
                              <span className="text-muted small d-block">Agreement Status</span>
                              <strong className="text-dark small">{formData.agreementStatus}</strong>
                            </div>
                            <div className="col-sm-4">
                              <span className="text-muted small d-block">Total Agreement Amount</span>
                              <strong className="text-dark small">₹{totalAgreementAmt.toLocaleString()}</strong>
                            </div>
                            <div className="col-sm-4">
                              <span className="text-muted small d-block">Payment Frequency</span>
                              <strong className="text-dark small">{formData.paymentType}</strong>
                            </div>
                            <div className="col-sm-4">
                              <span className="text-muted small d-block">Payment Due Day</span>
                              <strong className="text-dark small">{formData.paymentDueDay}th of month</strong>
                            </div>
                            <div className="col-sm-4">
                              <span className="text-muted small d-block">Installment Amount</span>
                              <strong className="text-dark small">₹{getInstallmentAmt().toLocaleString()}</strong>
                            </div>
                            <div className="col-sm-4">
                              <span className="text-muted small d-block">Next Payment Due Date</span>
                              <strong className="text-dark small">{getCalculatedNextDueDate()}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                </div>
              )}

              {/* Spacer to ensure scroll doesn't get cut off by fixed footer */}
              <div style={{ height: '100px', width: '100%' }}></div>

              {/* Actions Footer */}
              <div className="position-fixed bottom-0 start-0 w-100 bg-white border-top px-4 py-3 shadow-sm" style={{ zIndex: 1020 }}>
                <div className="d-flex justify-content-end gap-3 mx-auto" style={{ maxWidth: '1400px' }}>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="btn btn-white border rounded-3 px-3 py-1 fw-bold text-dark bg-white shadow-sm"
                    style={{ fontSize: '0.85rem' }}
                  >
                    {currentStep === 1 ? 'Cancel' : 'Back'}
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="btn btn-primary rounded-3 px-3 py-1 fw-bold text-white d-flex align-items-center gap-1 shadow-sm"
                      style={{ backgroundColor: 'var(--dark-section)', borderColor: 'var(--dark-section)', fontSize: '0.85rem' }}
                    >
                      <span>Next</span>
                      <i className="hgi-stroke hgi-arrow-right-01" style={{ fontSize: '0.95rem' }}></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 px-3 py-1 fw-bold text-white shadow-sm"
                      disabled={isLoading || !isSubmitReady}
                      style={{ backgroundColor: 'var(--dark-section)', borderColor: 'var(--dark-section)', fontSize: '0.85rem' }}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : null}
                      {isEditMode ? "Update User Account" : "Create User Account"}
                    </button>
                  )}
                </div>
              </div>

            </div>

          </div>
        </form>

      </div >

      {/* CUSTOM PREMIUM DIALOG BOX OVERLAY */}
      {
        dialog && (
          <div className="dialog-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            backdropFilter: 'blur(8px)'
          }}>
            <div className="dialog-card card border-0 shadow-lg p-4 text-center mx-3 rounded-4" style={{
              maxWidth: '420px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div className="mb-3">
                {dialog.type === 'success' && <i className="hgi-stroke hgi-checkmark-circle-01 text-success" style={{ fontSize: '3.5rem' }}></i>}
                {dialog.type === 'warning' && <i className="hgi-stroke hgi-information-circle text-warning" style={{ fontSize: '3.5rem' }}></i>}
                {dialog.type === 'error' && <i className="hgi-stroke hgi-cancel-01 text-danger" style={{ fontSize: '3.5rem' }}></i>}
              </div>

              <h4 className="fw-bold text-dark mb-2">{dialog.title}</h4>
              <p className="text-secondary small mb-4 px-2" style={{ lineHeight: '1.5' }}>{dialog.message}</p>

              <button
                type="button"
                className="btn w-100 py-2 rounded-pill fw-bold text-white shadow-sm"
                onClick={() => setDialog(null)}
                style={{
                  backgroundColor: dialog.type === 'success' ? '#10b981' :
                    dialog.type === 'warning' ? '#f59e0b' : '#ef4444',
                  borderColor: dialog.type === 'success' ? '#10b981' :
                    dialog.type === 'warning' ? '#f59e0b' : '#ef4444'
                }}
              >
                Okay, Continue
              </button>
            </div>
          </div>
        )
      }

      {/* VERIFY OTP DIALOG OVERLAY */}
      {
        showOtpDialog && (
          <div className="dialog-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 9999,
            backdropFilter: 'blur(8px)'
          }}>
            <div className="dialog-card card border-0 shadow-lg p-4 text-center mx-3 rounded-4" style={{
              maxWidth: '420px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid rgba(255, 255, 255, 0.8)'
            }}>
              <div className="d-flex justify-content-center mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '72px', height: '72px', backgroundColor: otpSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.04)' }}>
                  {otpSuccess ? (
                    <i className="hgi-stroke hgi-checkmark-circle-01" style={{ fontSize: '2.2rem', color: '#10b981' }}></i>
                  ) : (
                    <i className="hgi-stroke hgi-mail-01 text-dark" style={{ fontSize: '2.2rem' }}></i>
                  )}
                </div>
              </div>

              <h4 className="fw-bold text-dark mb-2">
                {otpSuccess ? "Email Verified & User Created!" : "Verify OTP"}
              </h4>
              <p className="text-secondary small mb-4 px-2" style={{ lineHeight: '1.5' }}>
                {otpSuccess
                  ? `${formData.name}'s email was successfully verified and the user account has been provisioned.`
                  : `A 6-digit OTP verification code has been dispatched to ${formData.email}. Please verify below to complete registration:`}
              </p>

              {!otpSuccess ? (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setOtpError("");
                  setIsLoading(true);
                  try {
                    const payload = {
                      ...formData,
                      assignedSeatCount: totalAssignedSeatCount,
                      idProofUrl: idProof ? idProof.name : '',
                      profilePhotoUrl: profilePhoto ? profilePhoto.name : '',
                      otp: otpCode.trim(),
                      createdBy: currentUser?._id,
                      assignedBy: currentUser?.name || 'System Administrator'
                    };
                    const res = await api.post('/users', payload);
                    if (res.success) {
                      setOtpSuccess(true);
                      setTimeout(() => {
                        setShowOtpDialog(false);
                        router.push('/admin/users');
                      }, 2000);
                    }
                  } catch (err: any) {
                    setOtpError(err.message || "Invalid OTP. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}>
                  <div className="mb-3">
                    <div className="d-flex justify-content-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          className="form-control text-center fw-bold bg-light shadow-none text-dark"
                          value={otpCode[index] || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            let newOtp = otpCode.split('');
                            newOtp[index] = val;
                            setOtpCode(newOtp.join(''));
                            if (val && index < 5) {
                              document.getElementById(`otp-${index + 1}`)?.focus();
                            }
                          }}
                          style={{ width: '45px', height: '50px', fontSize: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                      ))}
                    </div>
                    {otpError && <div className="text-danger small mt-2">{otpError}</div>}
                  </div>

                  <div className="d-flex justify-content-between gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-light border py-2 w-50 rounded-pill fw-semibold text-dark"
                      onClick={() => setShowOtpDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-dark py-2 w-50 rounded-pill fw-semibold text-white shadow-sm"
                      disabled={isLoading || otpCode.length < 6}
                      style={{ backgroundColor: 'var(--dark-section)' }}
                    >
                      {isLoading ? <span className="spinner-border spinner-border-sm me-1"></span> : null} Verify & Create
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        )
      }

    </div >
  );
}

export default function CreateUserPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-muted">Loading user details...</div>}>
      <CreateUserContent />
    </Suspense>
  );
}
