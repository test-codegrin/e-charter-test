import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Globe,
  ArrowRight,
  AlertTriangle,
  FileText,
  Car,
  Users,
  X,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { ADMIN_ROUTES } from '../../constants/routes';

const ControlledTextarea = ({ value, onChange, ...props }) => {
  const ref = useRef(null);

  const handleChange = (e) => {
    onChange(e);
  };

  useEffect(() => {
    if (ref.current) {
      const len = value?.length || 0;
      ref.current.selectionStart = len;
      ref.current.selectionEnd = len;
    }
  }, [value]);

  return (
    <textarea ref={ref} value={value} onChange={handleChange} {...props} />
  );
};

const FleetPartners = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [documentFilter, setDocumentFilter] = useState('all');
  // Reason modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // {companyId, newStatus}
  const [statusReason, setStatusReason] = useState('');
  const [loadingStatusChange, setLoadingStatusChange] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getAllFleetPartners();
        if (isMounted) {
          setCompanies(response.data.companies || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error('Failed to fetch fleet partners');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter, documentFilter]);

  const filterCompanies = () => {
    let filtered = companies;
    if (searchTerm) {
      filtered = filtered.filter((company) => {
        const companyName = company.company_name?.toLowerCase() || '';
        const email = company.email?.toLowerCase() || '';
        const city = company.city_name?.toLowerCase() || '';
        return (
          companyName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          city.includes(searchTerm.toLowerCase())
        );
      });
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((company) => company.status === statusFilter);
    }
    if (documentFilter !== 'all') {
      filtered = filtered.filter((company) => {
        const docStatus = checkDocumentExpiry(company.documents);
        if (documentFilter === 'expired') {
          return docStatus.hasExpired;
        } else if (documentFilter === 'expiring') {
          return docStatus.hasExpiring && !docStatus.hasExpired;
        } else if (documentFilter === 'valid') {
          return !docStatus.hasExpired && !docStatus.hasExpiring;
        }
        return true;
      });
    }
    setFilteredCompanies(filtered);
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllFleetPartners();
      setCompanies(response.data.companies || []);
    } catch {
      toast.error('Failed to fetch fleet partners');
    } finally {
      setLoading(false);
    }
  };

  // ---- STATUS CHANGE LOGIC ----
  const handleStatusChange = async (companyId, newStatus, statusReason) => {
    if (newStatus === 'rejected' || newStatus === 'in_review') {
      setPendingStatusChange({ companyId, newStatus, statusReason });
      setStatusReason('');
      setShowReasonModal(true);
      return;
    }
    try {
      await adminAPI.updateFleetPartnerStatus(companyId, newStatus, '');
      toast.success(`Fleet partner approved successfully`);
      fetchCompanies();
    } catch {
      toast.error('Failed to update fleet partner status');
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    if (!statusReason.trim()) return;
    setLoadingStatusChange(true);
    try {
      const { companyId, newStatus } = pendingStatusChange;
      await adminAPI.updateFleetPartnerStatus(companyId, newStatus, statusReason);
      const statusText = newStatus === 'rejected' ? 'rejected' : 'marked as in review';
      toast.success(`Fleet partner ${statusText} successfully`);
      setShowReasonModal(false);
      setPendingStatusChange(null);
      setStatusReason('');
      fetchCompanies();
    } catch {
      toast.error('Failed to update fleet partner status');
    } finally {
      setLoadingStatusChange(false);
    }
  };

  const handleCancelStatusChange = () => {
    setShowReasonModal(false);
    setPendingStatusChange(null);
    setStatusReason('');
  };

  // Check document expiry status
  const checkDocumentExpiry = (documents) => {
    if (!documents || documents.length === 0)
      return { hasExpired: false, hasExpiring: false, expiredCount: 0, expiringCount: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expiredCount = 0;
    let expiringCount = 0;
    documents.forEach((doc) => {
      if (doc.document_expiry_date) {
        const expiry = new Date(doc.document_expiry_date);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) { expiredCount++; }
        else if (diffDays <= 30) { expiringCount++; }
      }
    });
    return {
      hasExpired: expiredCount > 0,
      hasExpiring: expiringCount > 0,
      expiredCount,
      expiringCount,
    };
  };

  // Count companies by document status
  const getDocumentStatusCounts = () => {
    let expired = 0;
    let expiring = 0;
    let valid = 0;
    companies.forEach((company) => {
      const docStatus = checkDocumentExpiry(company.documents);
      if (docStatus.hasExpired) {
        expired++;
      } else if (docStatus.hasExpiring) {
        expiring++;
      } else if (company.documents && company.documents.length > 0) {
        valid++;
      }
    });
    return { expired, expiring, valid };
  };

  const docCounts = getDocumentStatusCounts();

  // Status badge component
  const getStatusBadge = (status) => {
    const normalizedStatus = status || 'in_review';
    switch (normalizedStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </span>
        );
      case 'in_review':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> In Review
          </span>
        );
    }
  };

  // --- Modal Reason Component ---
  const ReasonModal = () => {
    if (!showReasonModal || !pendingStatusChange) return null;
    const modalTitle =
      pendingStatusChange.newStatus === 'rejected'
        ? 'Rejection Reason'
        : 'Review Reason';
    return createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={handleCancelStatusChange}
        />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-[10001]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
            <button
              onClick={handleCancelStatusChange}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Body */}
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please provide a reason: <span className="text-red-500">*</span>
            </label>
            <ControlledTextarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              autoFocus
            />
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
            <button
              onClick={handleConfirmStatusChange}
              disabled={loadingStatusChange || statusReason.trim() === ""}
              className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium text-white rounded-lg transition-colors ${pendingStatusChange.newStatus === "rejected"
                ? statusReason.trim() === "" ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                : statusReason.trim() === "" ? "bg-gray-400 hover:bg-gray-500 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"} ${loadingStatusChange ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loadingStatusChange ? (
                <span>Processing...</span>
              ) : (
                <>
                  Confirm{' '}
                  {pendingStatusChange.newStatus === 'rejected'
                    ? 'Reject'
                    : 'In Review'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // Status dropdown component with Portal
  const StatusDropdown = ({ currentStatus, companyId, companyName, statusDescription }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [placement, setPlacement] = useState('bottom');
    const buttonRef = useRef(null);
    const dropdownHeight = 140;
    const normalizedStatus = currentStatus || 'in_review';
    const statusOptions = [
      { value: 'in_review', label: 'In Review', icon: Clock, color: 'text-yellow-600' },
      { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-green-600' },
      { value: 'rejected', label: 'Reject', icon: XCircle, color: 'text-red-600' },
    ];
    const handleStatusSelect = (status) => {
      if (status !== normalizedStatus) {
        handleStatusChange(companyId, status);
      }
      setIsOpen(false);
    };
    const handleToggle = () => {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldPlaceAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
        setPlacement(shouldPlaceAbove ? 'top' : 'bottom');
        setPosition({
          top: shouldPlaceAbove
            ? rect.top + window.scrollY - dropdownHeight - 8
            : rect.bottom + window.scrollY + 8,
          left: rect.right + window.scrollX - 192,
        });
      }
      setIsOpen(!isOpen);
    };
    return (
      <>
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
        >
          {getStatusBadge(normalizedStatus)}
        </button>
        {isOpen &&
          createPortal(
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
              <div
                className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                style={{ top: `${position.top}px`, left: `${position.left}px` }}
              >
                <div className="p-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = option.value === normalizedStatus;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusSelect(option.value)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isSelected ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body
          )}
        {/* Show statusDescription under the badge */}
        <p className={`text-sm ml-2 mt-2 ${currentStatus === "approved" ? "text-green-600" : currentStatus === "rejected" ? "text-red-600 bg-red-100 px-2 py-1 rounded" : "text-yellow-600 bg-yellow-100 px-2 py-1 rounded"}`}>
          {statusDescription}
        </p>
      </>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <ReasonModal />
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-secondary-900">Fleet Partner Management</h1>
        <p className="text-secondary-600">Manage fleet company registrations and approvals</p>
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Companies</p>
          <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-xs text-green-700 uppercase tracking-wide mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">{companies.filter((c) => c.status === 'approved').length}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 uppercase tracking-wide mb-1">In Review</p>
          <p className="text-2xl font-bold text-yellow-600">{companies.filter((c) => !c.status || c.status === 'in_review').length}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-xs text-red-700 uppercase tracking-wide mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{companies.filter((c) => c.status === 'rejected').length}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-300">
          <p className="text-xs text-red-700 uppercase tracking-wide mb-1 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />Doc Expired</p>
          <p className="text-2xl font-bold text-red-700">{docCounts.expired}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-200">
          <p className="text-xs text-orange-700 uppercase tracking-wide mb-1 flex items-center"><Clock className="w-3 h-3 mr-1" />Doc Expiring</p>
          <p className="text-2xl font-bold text-orange-600">{docCounts.expiring}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-xs text-blue-700 uppercase tracking-wide mb-1 flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Doc Valid</p>
          <p className="text-2xl font-bold text-blue-600">{docCounts.valid}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || documentFilter !== 'all') && (
              <div className="mt-5">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDocumentFilter('all');
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
            {/* Status Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
            {/* Document Status Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">Documents</label>
              <div className="relative">
                <select
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
                >
                  <option value="all">All Documents</option>
                  <option value="expired">Expired</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="valid">Valid</option>
                </select>
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fleet Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => {
                const docStatus = checkDocumentExpiry(company.documents);
                return (
                  <tr key={company.fleet_company_id} className={`transition-colors ${docStatus.hasExpired ? 'bg-red-50 hover:bg-red-100' : docStatus.hasExpiring ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {company.profile_image ? (
                          <img src={company.profile_image} alt={company.company_name} className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{company.company_name}</p>
                            {docStatus.hasExpired && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse" title={`${docStatus.expiredCount} document(s) expired`}><AlertTriangle className="w-3 h-3 mr-1" />{docStatus.expiredCount} Expired</span>
                            )}
                            {!docStatus.hasExpired && docStatus.hasExpiring && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800" title={`${docStatus.expiringCount} document(s) expiring soon`}><Clock className="w-3 h-3 mr-1" />{docStatus.expiringCount} Expiring</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">ID: {company.fleet_company_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-900"><Mail className="w-4 h-4 text-gray-400" /><span>{company.email}</span></div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500"><Phone className="w-4 h-4 text-gray-400" /><span>{company.phone_no}</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-2"><MapPin className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="text-sm font-medium text-gray-900 capitalize">{company.city_name}</p><p className="text-xs text-gray-500">ZIP: {company.postal_code}</p></div></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2"><Car className="w-4 h-4 text-blue-500" /><span className="text-sm font-medium text-gray-900">{company.total_vehicles || 0} Vehicles</span></div>
                        <div className="flex items-center space-x-2"><Users className="w-4 h-4 text-purple-500" /><span className="text-sm font-medium text-gray-900">{company.total_drivers || 0} Drivers</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {company.website ? (
                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"><Globe className="w-4 h-4" /><span className="truncate max-w-[120px]">{company.website}</span></a>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-line break-words max-w-xs">
                      <StatusDropdown
                        currentStatus={company.status}
                        companyId={company.fleet_company_id}
                        companyName={company.company_name}
                        statusDescription={company.status_description}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-500"><Calendar className="w-4 h-4" /><span>{formatDate(company.created_at)}</span></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={ADMIN_ROUTES.FLEET_PARTNER.VIEW_FLEET_PARTNER + company.fleet_company_id} className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors font-medium" title="View Details"><span>View</span><ArrowRight className="w-4 h-4" /></Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No fleet partners found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default FleetPartners;
