import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search, Filter, Car, User, Building2, CheckCircle, XCircle, Clock, Calendar, Fuel, Users, Plus, ArrowRight, AlertTriangle, FileText, Wind, Zap, Wifi, Monitor, Navigation, Armchair, Accessibility, ChevronDown, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { ADMIN_ROUTES } from "../../constants/routes";
import CustomDropdown from "../../components/CustomDropdown";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [ownershipFilter, setOwnershipFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);
  const featuresDropdownRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState(null);

  // Modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [loadingStatusChange, setLoadingStatusChange] = useState(false);

  const availableFeatures = [
    { key: "has_air_conditioner", label: "Air Conditioner", icon: Wind },
    { key: "has_charging_port", label: "Charging Port", icon: Zap },
    { key: "has_wifi", label: "WiFi", icon: Wifi },
    { key: "has_entertainment_system", label: "Entertainment", icon: Monitor },
    { key: "has_gps", label: "GPS", icon: Navigation },
    { key: "has_recliner_seats", label: "Recliner Seats", icon: Armchair },
    { key: "is_wheelchair_accessible", label: "Wheelchair", icon: Accessibility },
  ];

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter, typeFilter, ownershipFilter, documentFilter, selectedFeatures]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (featuresDropdownRef.current && !featuresDropdownRef.current.contains(event.target)) {
        setShowFeaturesDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllVehicles({
        page: currentPage,
        limit: itemsPerPage,
      });
      console.log("Vehicles response:", response.data);
      setVehicles(response.data.vehicles || []);
      setPaginationInfo(response.data.pagination);
      setTotalVehicles(response.data.pagination?.totalVehicles || 0);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast.error("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;
    if (searchTerm) {
      filtered = filtered.filter((vehicle) =>
        vehicle.maker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.fleet_company_details?.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((vehicle) =>
        vehicle.vehicle_type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    if (ownershipFilter !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.ownership === ownershipFilter);
    }
    if (documentFilter !== "all") {
      filtered = filtered.filter((vehicle) => {
        const docStatus = checkDocumentExpiry(vehicle.documents);
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
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((vehicle) => {
        if (!vehicle.features) return false;
        return selectedFeatures.every((featureKey) => {
          return vehicle.features[featureKey] === 1;
        });
      });
    }
    setFilteredVehicles(filtered);
  };

  const handleFeatureToggle = (featureKey) => {
    setSelectedFeatures((prev) => {
      if (prev.includes(featureKey)) {
        return prev.filter((key) => key !== featureKey);
      } else {
        return [...prev, featureKey];
      }
    });
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

  const handleStatusChange = async (vehicleId, newStatus, statusReason) => {
    if (newStatus === "rejected" || newStatus === "in_review") {
      setPendingStatusChange({ vehicleId, newStatus, statusReason });
      setStatusReason("");
      setShowReasonModal(true);
      return;
    }
    try {
      await adminAPI.approveVehicle(vehicleId, newStatus, "");
      toast.success(`Vehicle approved successfully`);
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to update vehicle status");
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
      const { vehicleId, newStatus } = pendingStatusChange;
      await adminAPI.approveVehicle(vehicleId, newStatus, statusReason);
      const statusText = newStatus === "rejected" ? "rejected" : "marked as in review";
      toast.success(`Vehicle ${statusText} successfully`);
      setShowReasonModal(false);
      setPendingStatusChange(null);
      setStatusReason("");
      fetchVehicles();
    } catch (error) {
      toast.error("Failed to update vehicle status");
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
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return { hasExpired: false, hasExpiring: false, expiredCount: 0, expiringCount: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let expiredCount = 0;
    let expiringCount = 0;
    documents.filter(doc => doc !== null).forEach((doc) => {
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
    vehicles.forEach((vehicle) => {
      const docStatus = checkDocumentExpiry(vehicle.documents);
      if (docStatus.hasExpired) {
        expired++;
      } else if (docStatus.hasExpiring) {
        expiring++;
      } else if (vehicle.documents && Array.isArray(vehicle.documents) && vehicle.documents.length > 0) {
        valid++;
      }
    });
    return { expired, expiring, valid };
  };

  const docCounts = getDocumentStatusCounts();

  const getStatusBadge = (status) => {
    const normalizedStatus = status || "in_review";
    switch (normalizedStatus) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case "in_review":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            In Review
          </span>
        );
    }
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

  const StatusDropdown = ({ currentStatus, vehicleId, vehicleName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const dropdownHeight = 140;
    const normalizedStatus = currentStatus || "in_review";

    const vehicleStatusOptions = [
      {
        value: "in_review",
        label: "In Review",
        icon: Clock,
        color: "text-amber-600",
      },
      {
        value: "approved",
        label: "Approved",
        icon: CheckCircle,
        color: "text-emerald-600",
      },
      {
        value: "rejected",
        label: "Reject",
        icon: XCircle,
        color: "text-red-600",
      },
    ];

    const handleStatusSelect = (status) => {
      if (status !== normalizedStatus) {
        handleStatusChange(vehicleId, status);
      }
      setIsOpen(false);
    };

    const handleToggle = () => {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldPlaceAbove =
          spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

        setPosition({
          top: shouldPlaceAbove
            ? rect.top + window.scrollY - dropdownHeight - 5
            : rect.bottom + window.scrollY + 5,
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
          className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
        >
          {getStatusBadge(normalizedStatus)}
        </button>
        {isOpen &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
              />
              <div
                className="fixed w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999]"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                }}
              >
                <div className="p-2">
                  {vehicleStatusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = option.value === normalizedStatus;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusSelect(option.value)}
                        className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-slate-900 text-white"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected ? "text-white" : option.color
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>,
            document.body
          )}
      </>
    );
  };

  const Pagination = () => {
    if (!paginationInfo) return null;

    const { currentPage, totalPages, hasNextPage, hasPrevPage } =
      paginationInfo;

    const itemsPerPageOptions = [
      { value: 5, label: "5" },
      { value: 10, label: "10" },
      { value: 20, label: "20" },
      { value: 50, label: "50" },
    ];

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
        {/* Left - Showing info */}
        <div className="flex items-center">
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(currentPage * itemsPerPage, totalVehicles)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">{totalVehicles}</span>{" "}
            vehicles
          </span>
        </div>

        {/* Middle - Page numbers */}
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

        {/* Right - Items per page dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-medium">Show</span>
          <CustomDropdown
            options={itemsPerPageOptions}
            value={itemsPerPage}
            onChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
            className="w-20"
            buttonClassName="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-colors text-sm font-medium text-gray-700 flex items-center justify-between"
            minDropdownWidth="button"
          />
          <span className="text-sm text-gray-700 font-medium">entries</span>
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
          Vehicle Management
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage vehicle registrations and approvals
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 font-medium mb-1.5">
            Total Vehicles
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {totalVehicles}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-emerald-700 font-medium mb-1.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </p>
          <p className="text-2xl font-semibold text-emerald-600">
            {vehicles.filter((v) => v.status === "approved").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-amber-700 font-medium mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            In Review
          </p>
          <p className="text-2xl font-semibold text-amber-600">
            {vehicles.filter((v) => !v.status || v.status === "in_review").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 hover:shadow-md transition-shadow">
          <p className="text-xs text-red-700 font-medium mb-1.5 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </p>
          <p className="text-2xl font-semibold text-red-600">
            {vehicles.filter((v) => v.status === "rejected").length}
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
              Search Vehicles
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by maker, model, registration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="van">Van</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="bus">Bus</option>
                </select>
                <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Ownership
              </label>
              <div className="relative">
                <select
                  value={ownershipFilter}
                  onChange={(e) => setOwnershipFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                >
                  <option value="all">All Ownership</option>
                  <option value="individual">Individual</option>
                  <option value="fleet_company">Fleet Company</option>
                </select>
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative" ref={featuresDropdownRef}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Features
              </label>
              <button
                onClick={() => setShowFeaturesDropdown(!showFeaturesDropdown)}
                className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer w-40 text-left relative"
              >
                <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <span
                  className={
                    selectedFeatures.length === 0
                      ? "text-gray-900"
                      : "text-gray-900"
                  }
                >
                  {selectedFeatures.length === 0
                    ? "All Features"
                    : `${selectedFeatures.length} Selected`}
                </span>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </button>
              {showFeaturesDropdown && (
                <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  <div className="p-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 mb-2">
                      Select Features (AND filter)
                    </div>
                    {availableFeatures.map((feature) => {
                      const Icon = feature.icon;
                      const isSelected = selectedFeatures.includes(feature.key);
                      return (
                        <label
                          key={feature.key}
                          className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleFeatureToggle(feature.key)}
                            className="w-4 h-4 text-slate-900 border-gray-300 rounded focus:ring-slate-900"
                          />
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700 flex-1">
                            {feature.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Documents
              </label>
              <div className="relative">
                <select
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 cursor-pointer"
                >
                  <option value="all">All Documents</option>
                  <option value="expired">Expired</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="valid">Valid</option>
                </select>
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {(searchTerm ||
              statusFilter !== "all" ||
              typeFilter !== "all" ||
              ownershipFilter !== "all" ||
              documentFilter !== "all" ||
              selectedFeatures.length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setOwnershipFilter("all");
                  setDocumentFilter("all");
                  setSelectedFeatures([]);
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Registration
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
              {filteredVehicles.map((vehicle) => {
                const docStatus = checkDocumentExpiry(vehicle.documents);
                return (
                  <tr
                    key={vehicle.vehicle_id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {vehicle.car_image ? (
                          <img
                            src={vehicle.car_image}
                            alt={`${vehicle.maker} ${vehicle.model}`}
                            className="w-20 h-16 object-contain rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Car className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 text-sm">
                              {vehicle.maker} {vehicle.model}
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
                          {vehicle.name && (
                            <p className="text-sm text-gray-500">
                              {vehicle.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">
                            ID: {vehicle.vehicle_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vehicle.ownership === "fleet_company" ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {vehicle.fleet_company_details?.company_name ||
                                "Fleet Company"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Fleet Partner
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              Individual
                            </p>
                            <p className="text-xs text-gray-500">
                              Owner Driver
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-gray-900 capitalize text-sm">
                          {vehicle.vehicle_type}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{vehicle.number_of_seats} Seats</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="w-3 h-3" />
                            <span className="capitalize">
                              {vehicle.fuel_type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {vehicle.registration_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusDropdown
                        currentStatus={vehicle.status}
                        vehicleId={vehicle.vehicle_id}
                        vehicleName={`${vehicle.maker} ${vehicle.model}`}
                      />
                      {vehicle.status_description && (
                        <p className="text-sm text-gray-600 mt-2 max-w-xs line-clamp-2">
                          {vehicle.status_description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(vehicle.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        to={
                          ADMIN_ROUTES.VEHICLES.VIEW_VEHICLE +
                          vehicle.vehicle_id
                        }
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

          {filteredVehicles.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium text-lg mb-1">
                No vehicles found
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

export default Vehicles;
