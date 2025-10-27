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
  Plus,
  ArrowRight,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { ADMIN_ROUTES } from "../../constants/routes";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentFilter, setDocumentFilter] = useState("all");

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchTerm, statusFilter, documentFilter]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllDrivers();
      console.log("Drivers response:", response.data);
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const filterDrivers = () => {
    let filtered = drivers;

    // Search filter
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

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((driver) => driver.status === statusFilter);
    }

    // Document expiry filter
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
    try {
      await adminAPI.approveDriver(driverId, newStatus);

      const statusText =
        newStatus === "approved"
          ? "approved"
          : newStatus === "rejected"
          ? "rejected"
          : "marked as in review";

      toast.success(`Driver ${statusText} successfully`);
      fetchDrivers();
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast.error("Failed to update driver status");
    }
  };

  // Check document expiry status
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

  // Count drivers by document status
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

  // Status badge component
  const getStatusBadge = (status) => {
    const normalizedStatus = status || "in_review";

    switch (normalizedStatus) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case "in_review":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            In Review
          </span>
        );
    }
  };

  // Status dropdown component with Portal
  const StatusDropdown = ({ currentStatus, driverId, driverName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);
    const normalizedStatus = currentStatus || "in_review";

    const statusOptions = [
      {
        value: "in_review",
        label: "In Review",
        icon: Clock,
        color: "text-yellow-600",
      },
      {
        value: "approved",
        label: "Approved",
        icon: CheckCircle,
        color: "text-green-600",
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
        handleStatusChange(driverId, status);
      }
      setIsOpen(false);
    };

    const handleToggle = () => {
      if (!isOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
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
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
              />
              <div
                className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]"
                style={{
                  top: `${position.top}px`,
                  left: `${position.left}px`,
                }}
              >
                <div className="p-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = option.value === normalizedStatus;

                    return (
                      <button
                        key={option.value}
                        onClick={() => handleStatusSelect(option.value)}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                          isSelected
                            ? "bg-gray-100 font-medium"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${option.color}`} />
                        <span className="text-sm text-gray-700">
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

  // Star Rating Component
  const StarRating = ({
    rating,
    totalRatings,
    showCount = true,
    size = "sm",
  }) => {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;

    const starSize =
      size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";

    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => {
            const isFilled = index < fullStars;
            const isHalf = index === fullStars && hasHalfStar;

            return (
              <div key={index} className="relative">
                {isHalf ? (
                  <div className="relative">
                    <Star
                      className={`${starSize} text-gray-300`}
                      fill="currentColor"
                    />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <Star
                        className={`${starSize} text-yellow-400`}
                        fill="currentColor"
                      />
                    </div>
                  </div>
                ) : (
                  <Star
                    className={`${starSize} ${
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
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-2xl font-bold text-secondary-900">
          Driver Management
        </h1>
        <p className="text-secondary-600">
          Manage driver registrations and approvals
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Total Drivers
          </p>
          <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
          <p className="text-xs text-green-700 uppercase tracking-wide mb-1">
            Approved
          </p>
          <p className="text-2xl font-bold text-green-600">
            {drivers.filter((d) => d.status === "approved").length}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 uppercase tracking-wide mb-1">
            In Review
          </p>
          <p className="text-2xl font-bold text-yellow-600">
            {drivers.filter((d) => !d.status || d.status === "in_review").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
          <p className="text-xs text-red-700 uppercase tracking-wide mb-1">
            Rejected
          </p>
          <p className="text-2xl font-bold text-red-600">
            {drivers.filter((d) => d.status === "rejected").length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 border border-red-300">
          <p className="text-xs text-red-700 uppercase tracking-wide mb-1 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Doc Expired
          </p>
          <p className="text-2xl font-bold text-red-700">{docCounts.expired}</p>
        </div>
        <div className="bg-orange-50 rounded-lg shadow p-4 border border-orange-200">
          <p className="text-xs text-orange-700 uppercase tracking-wide mb-1 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Doc Expiring
          </p>
          <p className="text-2xl font-bold text-orange-600">
            {docCounts.expiring}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
          <p className="text-xs text-blue-700 uppercase tracking-wide mb-1 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Doc Valid
          </p>
          <p className="text-2xl font-bold text-blue-600">{docCounts.valid}</p>
        </div>
      </div>

      {/* Action Bar */}
      {/* <div className="flex items-center justify-between">
        <Link
          to="/admin/add-driver"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
        >
          <Plus className="w-5 h-5" />
          <span>Add Driver</span>
        </Link>
      </div> */}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, city, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all" || documentFilter !== "all") && (
              <div className="mt-5">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDocumentFilter("all");
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Status Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
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

            {/* Document Status Filter */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Documents
              </label>
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

            
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver) => {
                const docStatus = checkDocumentExpiry(driver.documents);
                return (
                  <tr
                    key={driver.driver_id}
                    className={`transition-colors ${
                      docStatus.hasExpired
                        ? "bg-red-50 hover:bg-red-100"
                        : docStatus.hasExpiring
                        ? "bg-yellow-50 hover:bg-yellow-100"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-lg">
                            {driver.firstname?.charAt(0).toUpperCase()}
                            {driver.lastname?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">
                              {driver.firstname} {driver.lastname}
                            </p>
                            {docStatus.hasExpired && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse"
                                title={`${docStatus.expiredCount} document(s) expired`}
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                {docStatus.expiredCount} Expired
                              </span>
                            )}
                            {!docStatus.hasExpired && docStatus.hasExpiring && (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
                                title={`${docStatus.expiringCount} document(s) expiring soon`}
                              >
                                <Clock className="w-3 h-3 mr-1" />
                                {docStatus.expiringCount} Expiring
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              ID: {driver.driver_id}
                            </p>
                            {driver.fleet_company_name && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center space-x-1">
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
                        <div className="flex items-center space-x-2 text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{driver.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{driver.phone_no}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {driver.year_of_experiance}{" "}
                        {driver.year_of_experiance === 1 ? "year" : "years"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusDropdown
                        currentStatus={driver.status}
                        driverId={driver.driver_id}
                        driverName={`${driver.firstname} ${driver.lastname}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(driver.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={ADMIN_ROUTES.DRIVERS.VIEW_DRIVER + driver.driver_id}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                        title="View Details"
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
            <div className="text-center py-12">
              <p className="text-gray-500">
                No drivers found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drivers;
