import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  ArrowRight,
  AlertTriangle,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { ADMIN_ROUTES } from "../../constants/routes";
import CustomDropdown from "../../components/CustomDropdown";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState(null);

  // Modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [loadingStatusChange, setLoadingStatusChange] = useState(false);

  // Dropdown options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "in_review", label: "In Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const documentOptions = [
    { value: "all", label: "All Documents" },
    { value: "expired", label: "Expired" },
    { value: "expiring", label: "Expiring Soon" },
    { value: "valid", label: "Valid" },
  ];

  // Status dropdown options with icons
  const driverStatusOptions = [
    {
      value: "in_review",
      label: "In Review",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
    },
    {
      value: "approved",
      label: "Approved",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
    },
    {
      value: "rejected",
      label: "Reject",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
    },
  ];

  useEffect(() => {
    fetchDrivers();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchTerm, statusFilter, documentFilter]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllDrivers({
        page: currentPage,
        limit: itemsPerPage,
      });
      console.log("Drivers response:", response.data);
      setDrivers(response.data.drivers || []);
      setPaginationInfo(response.data.pagination);
      setTotalDrivers(response.data.pagination?.totalDrivers || 0);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;

    if (searchTerm) {
      filtered = filtered.filter((driver) => {
        const fullName = `${driver.firstname} ${driver.lastname}`.toLowerCase();
        const email = driver.email?.toLowerCase() || "";
        const city = driver.city_name?.toLowerCase() || "";
        const companyName = driver.fleet_company_name?.toLowerCase() || "";

        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          city.includes(searchTerm.toLowerCase()) ||
          companyName.includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((driver) => driver.status === statusFilter);
    }

    if (documentFilter !== "all") {
      filtered = filtered.filter((driver) => {
        const docStatus = checkDocumentExpiry(driver.documents);
        if (documentFilter === "expired") {
          return docStatus.hasExpired;
        } else if (documentFilter === "expiring") {
          return docStatus.hasExpiring && !docStatus.hasExpired;
        } else if (documentFilter === "valid") {
          return !docStatus.hasExpired && !docStatus.hasExpiring;
        }
        return true;
      });
    }

    setFilteredDrivers(filtered);
  };

  const handleStatusChange = async (driverId, newStatus) => {
    if (newStatus === "rejected" || newStatus === "in_review") {
      setPendingStatusChange({ driverId, newStatus });
      setStatusReason("");
      setShowReasonModal(true);
      return;
    }

    try {
      await adminAPI.approveDriver(driverId, newStatus, "");
      toast.success(`Driver approved successfully`);
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast.error("Failed to update driver status");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    if (!statusReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setLoadingStatusChange(true);
    try {
      const { driverId, newStatus } = pendingStatusChange;
      await adminAPI.approveDriver(driverId, newStatus, statusReason);
      const statusText =
        newStatus === "rejected" ? "rejected" : "marked as in review";
      toast.success(`Driver ${statusText} successfully`);
      setShowReasonModal(false);
      setPendingStatusChange(null);
      setStatusReason("");
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast.error("Failed to update driver status");
    } finally {
      setLoadingStatusChange(false);
    }
  };

  const handleCancelStatusChange = () => {
    setShowReasonModal(false);
    setPendingStatusChange(null);
    setStatusReason("");
  };

  const checkDocumentExpiry = (documents) => {
    if (!documents || documents.length === 0)
      return { hasExpired: false, expiredCount: 0, expiringCount: 0 };

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

        if (diffDays < 0) {
          expiredCount++;
        } else if (diffDays <= 30) {
          expiringCount++;
        }
      }
    });

    return {
      hasExpired: expiredCount > 0,
      hasExpiring: expiringCount > 0,
      expiredCount,
      expiringCount,
    };
  };

  const getDocumentStatusCounts = () => {
    let expired = 0;
    let expiring = 0;
    let valid = 0;

    drivers.forEach((driver) => {
      const docStatus = checkDocumentExpiry(driver.documents);
      if (docStatus.hasExpired) {
        expired++;
      } else if (docStatus.hasExpiring) {
        expiring++;
      } else {
        valid++;
      }
    });

    return { expired, expiring, valid };
  };

  const docCounts = getDocumentStatusCounts();

  const getStatusBadge = (status) => {
    const normalizedStatus = status || "in_review";
    const statusConfig = driverStatusOptions.find(
      (opt) => opt.value === normalizedStatus
    );

    if (!statusConfig) return null;

    const Icon = statusConfig.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

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

  const ReasonModal = () => {
    if (!showReasonModal || !pendingStatusChange) return null;

    const modalTitle =
      pendingStatusChange.newStatus === "rejected"
        ? "Rejection Reason"
        : "Review Reason";

    return createPortal(
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={handleCancelStatusChange}
        />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md z-[10001] transform transition-all duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {modalTitle}
            </h3>
            <button
              onClick={handleCancelStatusChange}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please provide a reason <span className="text-red-600">*</span>
            </label>
            <ControlledTextarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter reason..."
              rows={4}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 resize-none text-sm"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button
              onClick={handleCancelStatusChange}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStatusChange}
              disabled={loadingStatusChange || !statusReason.trim()}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium text-white rounded-lg transition-colors ${
                pendingStatusChange.newStatus === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-amber-600 hover:bg-amber-700"
              } ${
                loadingStatusChange || !statusReason.trim()
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loadingStatusChange ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    Confirm{" "}
                    {pendingStatusChange.newStatus === "rejected"
                      ? "Reject"
                      : "In Review"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const StarRating = ({ rating, totalRatings, showCount = true }) => {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => {
            const isFilled = index < fullStars;
            const isHalf = index === fullStars && hasHalfStar;

            return (
              <div key={index} className="relative">
                {isHalf ? (
                  <div className="relative">
                    <Star className="w-4 h-4 text-gray-300" fill="currentColor" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <Star
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                ) : (
                  <Star
                    className={`w-4 h-4 ${
                      isFilled ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                  />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {numericRating.toFixed(1)}
        </span>
        {showCount && totalRatings > 0 && (
          <span className="text-xs text-gray-500">({totalRatings})</span>
        )}
      </div>
    );
  };

  const Pagination = () => {
    if (!paginationInfo) return null;

    const { currentPage, totalPages, hasNextPage, hasPrevPage } =
      paginationInfo;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700 font-medium">entries</span>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * itemsPerPage, totalDrivers)}
            </span>{" "}
            of <span className="font-semibold text-gray-900">{totalDrivers}</span>{" "}
            drivers
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={!hasPrevPage}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-3 py-2 text-gray-500 text-sm"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[36px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={!hasNextPage}
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <ReasonModal />

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Driver Management
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage driver registrations and approvals
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 font-medium mb-1.5">
            Total Drivers
          </p>
          <p className="text-2xl font-semibold text-gray-900">{totalDrivers}</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 font-medium mb-1.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </p>
          <p className="text-2xl font-semibold text-emerald-600">
            {drivers.filter((d) => d.status === "approved").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-700 font-medium mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            In Review
          </p>
          <p className="text-2xl font-semibold text-amber-600">
            {
              drivers.filter((d) => !d.status || d.status === "in_review")
                .length
            }
          </p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-red-700 font-medium mb-1.5 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </p>
          <p className="text-2xl font-semibold text-red-600">
            {drivers.filter((d) => d.status === "rejected").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-red-700 font-medium mb-1.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Doc Expired
          </p>
          <p className="text-2xl font-semibold text-red-600">
            {docCounts.expired}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-orange-700 font-medium mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Doc Expiring
          </p>
          <p className="text-2xl font-semibold text-orange-600">
            {docCounts.expiring}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-blue-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-blue-700 font-medium mb-1.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Doc Valid
          </p>
          <p className="text-2xl font-semibold text-blue-600">
            {docCounts.valid}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Search Drivers
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, city, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <CustomDropdown
              label="Status"
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              icon={Filter}
              placeholder="Select status"
              className="min-w-[160px]"
            />

            <CustomDropdown
              label="Documents"
              options={documentOptions}
              value={documentFilter}
              onChange={setDocumentFilter}
              icon={FileText}
              placeholder="Select document status"
              className="min-w-[180px]"
            />

            {(searchTerm ||
              statusFilter !== "all" ||
              documentFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDocumentFilter("all");
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredDrivers.map((driver) => {
                const docStatus = checkDocumentExpiry(driver.documents);
                const normalizedStatus = driver.status || "in_review";

                return (
                  <tr
                    key={driver.driver_id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {driver.profile_image ? (
                            <img
                              src={driver.profile_image}
                              alt="Profile"
                              className="rounded-full w-10 h-10 object-cover"
                            />
                          ) : (
                            <span className="text-slate-600 font-semibold text-sm">
                              {driver.firstname?.charAt(0).toUpperCase()}
                              {driver.lastname?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 text-sm">
                              {driver.firstname} {driver.lastname}
                            </p>
                            {docStatus.hasExpired && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200"
                                title={`${docStatus.expiredCount} document(s) expired`}
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {docStatus.expiredCount}
                              </span>
                            )}
                            {!docStatus.hasExpired && docStatus.hasExpiring && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
                                title={`${docStatus.expiringCount} document(s) expiring soon`}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {docStatus.expiringCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500">
                              ID: {driver.driver_id}
                            </p>
                            {driver.fleet_company_name && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs text-blue-600 font-medium">
                                    {driver.fleet_company_name}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{driver.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{driver.phone_no}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {driver.city_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ZIP: {driver.zip_code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating
                        rating={driver.average_rating}
                        totalRatings={driver.total_ratings}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {driver.status_description ? (
                        <p className="text-sm text-gray-900 max-w-xs line-clamp-2">
                          {driver.status_description}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-500">
                          {driver.year_of_experiance}{" "}
                          {driver.year_of_experiance === 1 ? "year" : "years"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <CustomDropdown
                        options={driverStatusOptions}
                        value={normalizedStatus}
                        onChange={(newStatus) =>
                          handleStatusChange(driver.driver_id, newStatus)
                        }
                        buttonClassName="flex items-center px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                        renderButton={(selectedOption) => {
                          return getStatusBadge(normalizedStatus);
                        }}
                        renderOption={(option, isSelected) => {
                          const Icon = option.icon;
                          return (
                            <>
                              <div className="flex items-center gap-2">
                                <Icon
                                  className={`w-4 h-4 ${
                                    isSelected ? "text-white" : option.color
                                  }`}
                                />
                                <span className="font-medium">
                                  {option.label}
                                </span>
                              </div>
                            </>
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(driver.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={ADMIN_ROUTES.DRIVERS.VIEW_DRIVER + driver.driver_id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors font-medium"
                      >
                        <span>View</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-lg mb-1">
                No drivers found
              </p>
              <p className="text-gray-500 text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        <Pagination />
      </div>
    </div>
  );
};

export default Drivers;
