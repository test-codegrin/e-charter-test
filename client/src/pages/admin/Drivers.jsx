import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  Eye,
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
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    filterDrivers();
  }, [drivers, searchTerm, statusFilter]);

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

  // Status badge component
  const getStatusBadge = (status) => {
    // Handle empty status as in_review
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
          left: rect.right + window.scrollX - 192, // 192px = w-48 width
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

  const openDriverModal = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Driver Management
        </h1>
        <p className="text-secondary-600">
          Manage driver registrations and approvals
        </p>
      </div>
      <div className="flex items-center space-x-4">
        {/* Add Driver Button */}
        <Link
          to="/admin/add-driver"
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Driver</span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="text-sm">
            <span className="text-secondary-600">Total: </span>
            <span className="font-semibold text-secondary-900">
              {drivers.length}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-secondary-600">Approved: </span>
            <span className="font-semibold text-green-600">
              {drivers.filter((d) => d.status === "approved").length}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-secondary-600">In Review: </span>
            <span className="font-semibold text-yellow-600">
              {
                drivers.filter((d) => !d.status || d.status === "in_review")
                  .length
              }
            </span>
          </div>
          <div className="text-sm">
            <span className="text-secondary-600">Rejected: </span>
            <span className="font-semibold text-red-600">
              {drivers.filter((d) => d.status === "rejected").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, city, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-secondary-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
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
              {filteredDrivers.map((driver) => (
                <tr
                  key={driver.driver_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-lg">
                          {driver.firstname?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {driver.firstname} {driver.lastname}
                        </p>
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
                    <button
                      onClick={() => openDriverModal(driver)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
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

      {/* Driver Details Modal */}
      {showModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white  max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Driver Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Rating Section */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Star
                      className="w-5 h-5 text-yellow-500 mr-2"
                      fill="currentColor"
                    />
                    Driver Rating
                  </h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <StarRating
                        rating={selectedDriver.average_rating}
                        totalRatings={selectedDriver.total_ratings}
                        size="lg"
                        showCount={false}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Based on {selectedDriver.total_ratings}{" "}
                        {selectedDriver.total_ratings === 1
                          ? "review"
                          : "reviews"}
                      </p>
                    </div>
                    {parseFloat(selectedDriver.average_rating) > 0 && (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">
                          {parseFloat(selectedDriver.average_rating).toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-500">out of 5.0</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">
                        {selectedDriver.firstname}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{selectedDriver.lastname}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{selectedDriver.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedDriver.phone_no}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Gender
                      </label>
                      <p className="text-gray-900 capitalize">
                        {selectedDriver.gender}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Driver Type
                      </label>
                      <p className="text-gray-900 capitalize">
                        {selectedDriver.driver_type}
                      </p>
                    </div>
                    {selectedDriver.fleet_company_name && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Fleet Company
                        </label>
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <p className="text-gray-900 font-medium">
                            {selectedDriver.fleet_company_name}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Experience
                      </label>
                      <p className="text-gray-900">
                        {selectedDriver.year_of_experiance} years
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Status
                      </label>
                      {getStatusBadge(selectedDriver.status)}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Address Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Street Address
                      </label>
                      <p className="text-gray-900">{selectedDriver.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        City
                      </label>
                      <p className="text-gray-900">
                        {selectedDriver.city_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        ZIP Code
                      </label>
                      <p className="text-gray-900">{selectedDriver.zip_code}</p>
                    </div>
                  </div>
                </div>

                {/* Registration Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Registration Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Registered On
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedDriver.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {formatDate(selectedDriver.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Change Actions */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Change Status
                  </h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        handleStatusChange(
                          selectedDriver.driver_id,
                          "approved"
                        );
                        setShowModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(
                          selectedDriver.driver_id,
                          "in_review"
                        );
                        setShowModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span>In Review</span>
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(
                          selectedDriver.driver_id,
                          "rejected"
                        );
                        setShowModal(false);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drivers;