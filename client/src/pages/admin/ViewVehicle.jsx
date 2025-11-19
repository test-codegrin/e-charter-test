import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileText,
  User,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Users,
  Fuel,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wind,
  Zap,
  Wifi,
  Monitor,
  Navigation,
  Armchair,
  Accessibility,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { ADMIN_ROUTES } from "../../constants/routes";

const ViewVehicle = () => {
  const { vehicle_id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
  }, [vehicle_id]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getVehicleById(vehicle_id);
      console.log("Vehicle details:", response.data);
      setVehicle(response.data.vehicle);
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      toast.error("Failed to fetch vehicle details");
      navigate(ADMIN_ROUTES.VEHICLES.ALL_VEHICLES);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeRequest = (newStatus) => {
    setPendingStatus(newStatus);
    setShowConfirmModal(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      await adminAPI.approveVehicle(vehicle_id, pendingStatus);
      const statusText =
        pendingStatus === "approved"
          ? "approved"
          : pendingStatus === "rejected"
          ? "rejected"
          : "marked as in review";
      toast.success(`Vehicle ${statusText} successfully`);
      setShowConfirmModal(false);
      setPendingStatus(null);
      fetchVehicleDetails();
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      toast.error("Failed to update vehicle status");
      setShowConfirmModal(false);
      setPendingStatus(null);
    }
  };

  const handleCancelStatusChange = () => {
    setShowConfirmModal(false);
    setPendingStatus(null);
  };

  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  const handleFirstDeleteConfirm = () => {
    setShowDeleteModal(false);
    setTimeout(() => {
      setShowFinalDeleteConfirm(true);
    }, 150);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      await adminAPI.deleteVehicle(vehicle_id);
      toast.success("Vehicle deleted successfully");
      setTimeout(() => {
        navigate(ADMIN_ROUTES.VEHICLES.ALL_VEHICLES);
      }, 500);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
      setDeleting(false);
      setShowFinalDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleCancelFinalDelete = () => {
    setShowFinalDeleteConfirm(false);
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: "unknown", days: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: "expired", days: Math.abs(diffDays) };
    } else if (diffDays === 0) {
      return { status: "today", days: 0 };
    } else if (diffDays <= 30) {
      return { status: "expiring", days: diffDays };
    } else {
      return { status: "valid", days: diffDays };
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const expiryStatus = getExpiryStatus(expiryDate);

    switch (expiryStatus.status) {
      case "expired":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Expired {expiryStatus.days} day{expiryStatus.days !== 1 ? "s" : ""}{" "}
            ago
          </span>
        );
      case "today":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expires Today!
          </span>
        );
      case "expiring":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Expires in {expiryStatus.days} day
            {expiryStatus.days !== 1 ? "s" : ""}
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status || "in_review";
    switch (normalizedStatus) {
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4 mr-1.5" />
            Rejected
          </span>
        );
      case "in_review":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-4 h-4 mr-1.5" />
            In Review
          </span>
        );
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          title: "Approve Vehicle",
          message:
            "Are you sure you want to approve this vehicle? It will be available for bookings.",
          color: "green",
        };
      case "rejected":
        return {
          title: "Reject Vehicle",
          message:
            "Are you sure you want to reject this vehicle? It will not be available for bookings.",
          color: "red",
        };
      case "in_review":
        return {
          title: "Mark as In Review",
          message:
            "Are you sure you want to mark this vehicle as in review? Its status will be pending approval.",
          color: "yellow",
        };
      default:
        return {
          title: "Update Status",
          message: "Are you sure you want to update this vehicle's status?",
          color: "blue",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vehicle not found</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(pendingStatus);

  return (
    <div className="space-y-6">
      {/* Status Change Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    statusInfo.color === "green"
                      ? "bg-emerald-50"
                      : statusInfo.color === "red"
                      ? "bg-red-50"
                      : "bg-amber-50"
                  }`}
                >
                  <AlertTriangle
                    className={`w-8 h-8 ${
                      statusInfo.color === "green"
                        ? "text-emerald-600"
                        : statusInfo.color === "red"
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                {statusInfo.title}
              </h3>

              <p className="text-gray-600 text-center mb-6">
                {statusInfo.message}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Vehicle</p>
                <p className="font-semibold text-gray-900">
                  {vehicle.maker} {vehicle.model}
                </p>
                <p className="text-sm text-gray-500">ID: #{vehicle.vehicle_id}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelStatusChange}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${
                    statusInfo.color === "green"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : statusInfo.color === "red"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* First Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Delete Vehicle?
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this vehicle? This will remove all
                vehicle data from the system.
              </p>

              <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-1">
                  Vehicle:
                </p>
                <p className="font-semibold text-gray-900">
                  {vehicle.maker} {vehicle.model}
                </p>
                <p className="text-sm text-gray-600">ID: #{vehicle.vehicle_id}</p>
                <p className="text-sm text-gray-600">{vehicle.registration_number}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFirstDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Delete Confirmation Modal */}
      {showFinalDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-red-600 text-center mb-2">
                ⚠️ Final Confirmation
              </h3>

              <p className="text-gray-900 font-semibold text-center mb-4">
                This action CANNOT be undone!
              </p>

              <p className="text-gray-600 text-center mb-6">
                You are about to permanently delete this vehicle. All associated
                data including documents will be lost forever.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
                <p className="text-sm text-red-700 font-semibold mb-2">
                  ⛔ PERMANENT DELETION
                </p>
                <p className="font-semibold text-gray-900">
                  {vehicle.maker} {vehicle.model}
                </p>
                <p className="text-sm text-gray-600">{vehicle.registration_number}</p>
                <p className="text-sm text-gray-600">ID: #{vehicle.vehicle_id}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelFinalDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Vehicle Details
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
              View and manage vehicle information
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(vehicle.status)}
          <button
            onClick={handleDeleteRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            title="Delete Vehicle"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Vehicle</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Image Card */}
          {vehicle.car_image && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <img
                src={vehicle.car_image}
                alt={`${vehicle.maker} ${vehicle.model}`}
                className="w-full h-80 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center">
                  <Car className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {vehicle.maker} {vehicle.model}
                  </h2>
                  {vehicle.name && (
                    <p className="text-gray-500 text-sm">{vehicle.name}</p>
                  )}
                  <p className="text-gray-500 text-sm">
                    Vehicle ID: #{vehicle.vehicle_id}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        vehicle.ownership === "fleet_company"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {vehicle.ownership === "fleet_company" ? (
                        <>
                          <Building2 className="w-3 h-3 mr-1" />
                          Fleet Company
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          Individual
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Vehicle Specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Registration Number
                  </label>
                  <span className="font-mono text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 inline-block">
                    {vehicle.registration_number}
                  </span>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Vehicle Type
                  </label>
                  <span className="text-sm text-gray-900 capitalize">
                    {vehicle.vehicle_type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Number of Seats
                  </label>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{vehicle.number_of_seats}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Fuel Type
                  </label>
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 capitalize">
                      {vehicle.fuel_type}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Availability
                  </label>
                  {vehicle.is_available ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Information Card */}
          {vehicle.pricing && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-gray-700" />
                Pricing Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Base Rates */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Base Rates</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Base Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{vehicle.pricing.base_rate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Per KM Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{vehicle.pricing.per_km_rate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Waiting (per min)</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{vehicle.pricing.waiting_per_min_rate}
                    </span>
                  </div>
                </div>

                {/* Trip Rates */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Trip Rates</h4>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Parking to Customer</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{vehicle.pricing.parking_to_customer_rate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Customer to Parking</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{vehicle.pricing.customer_to_parking_rate}
                    </span>
                  </div>
                </div>

                {/* Additional Charges */}
                <div className="space-y-3 md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Charges</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Tax</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {vehicle.pricing.tax_per}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Gratuities</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {vehicle.pricing.gratuities_per}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-sm text-gray-600">Cancellation</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {vehicle.pricing.cancellation_per}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Features Card */}
          {vehicle.features && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-gray-700" />
                Vehicle Features
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Air Conditioner */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.has_air_conditioner
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Wind
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.has_air_conditioner
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.has_air_conditioner
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    Air Conditioner
                  </p>
                </div>

                {/* Charging Port */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.has_charging_port
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Zap
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.has_charging_port
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.has_charging_port
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    Charging Port
                  </p>
                </div>

                {/* WiFi */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.has_wifi
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Wifi
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.has_wifi
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.has_wifi
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    WiFi
                  </p>
                </div>

                {/* Entertainment System */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.has_entertainment_system
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Monitor
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.has_entertainment_system
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.has_entertainment_system
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    Entertainment
                  </p>
                </div>

                {/* GPS */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.has_gps
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Navigation
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.has_gps
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.has_gps
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    GPS
                  </p>
                </div>

                {/* Recliner Seats */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.has_recliner_seats
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Armchair
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.has_recliner_seats
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.has_recliner_seats
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    Recliner Seats
                  </p>
                </div>

                {/* Wheelchair Accessible */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                    vehicle.features.is_wheelchair_accessible
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Accessibility
                    className={`w-6 h-6 mb-2 ${
                      vehicle.features.is_wheelchair_accessible
                        ? "text-emerald-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium text-center ${
                      vehicle.features.is_wheelchair_accessible
                        ? "text-emerald-900"
                        : "text-gray-500"
                    }`}
                  >
                    Wheelchair
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">
                    {Object.values(vehicle.features).filter((v) => v === 1).length - 1}
                  </span>{" "}
                  of 7 features available
                </p>
              </div>
            </div>
          )}

          {/* Fleet Company Details Card */}
          {vehicle.ownership === "fleet_company" &&
            vehicle.fleet_company_details && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-gray-700" />
                  Fleet Company Information
                </h3>

                {vehicle.fleet_company_details.profile_image && (
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-center">
                      <img
                        src={vehicle.fleet_company_details.profile_image}
                        alt={vehicle.fleet_company_details.company_name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Company Name
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {vehicle.fleet_company_details.company_name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Company Status
                    </label>
                    {getStatusBadge(vehicle.fleet_company_details.status)}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {vehicle.fleet_company_details.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Phone
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {vehicle.fleet_company_details.phone_no}
                      </p>
                    </div>
                  </div>

                  {vehicle.fleet_company_details.website && (
                    <div className="col-span-2">
                      <label className="block text-sm text-gray-500 mb-1">
                        Website
                      </label>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={`https://${vehicle.fleet_company_details.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {vehicle.fleet_company_details.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label className="block text-sm text-gray-500 mb-1">
                      Address
                    </label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {vehicle.fleet_company_details.address}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {vehicle.fleet_company_details.city} -{" "}
                          {vehicle.fleet_company_details.postal_code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Registration Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-700" />
              Registration Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Registered On
                </label>
                <p className="text-sm text-gray-900">{formatDate(vehicle.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">{formatDate(vehicle.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Status Actions Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-gray-700" />
              Update Status
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChangeRequest("approved")}
                disabled={vehicle.status === "approved"}
                className={`w-full px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                  vehicle.status === "approved"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve Vehicle</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest("in_review")}
                disabled={vehicle.status === "in_review"}
                className={`w-full px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                  vehicle.status === "in_review"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Mark In Review</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest("rejected")}
                disabled={vehicle.status === "rejected"}
                className={`w-full px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2 ${
                  vehicle.status === "rejected"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Card - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-700" />
          Vehicle Documents
        </h3>

        {vehicle.documents && vehicle.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicle.documents
              .filter((doc) => doc.vehicle_document_id !== null)
              .map((doc) => {
                const expiryStatus = getExpiryStatus(doc.document_expiry_date);
                const isExpiredOrExpiring =
                  expiryStatus.status === "expired" ||
                  expiryStatus.status === "today" ||
                  expiryStatus.status === "expiring";

                return (
                  <div
                    key={doc.vehicle_document_id}
                    className={`flex flex-col justify-between p-4 rounded-lg border transition-all ${
                      expiryStatus.status === "expired"
                        ? "bg-red-50 border-red-200"
                        : expiryStatus.status === "today"
                        ? "bg-orange-50 border-orange-200"
                        : expiryStatus.status === "expiring"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex-1 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 capitalize text-sm">
                          {doc.document_type.replace(/_/g, " ")}
                        </p>
                        {isExpiredOrExpiring &&
                          getExpiryBadge(doc.document_expiry_date)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Number:</span>{" "}
                          {doc.document_number}
                        </p>
                        <p
                          className={`text-xs ${
                            expiryStatus.status === "expired"
                              ? "text-red-700 font-medium"
                              : expiryStatus.status === "today"
                              ? "text-orange-700 font-medium"
                              : expiryStatus.status === "expiring"
                              ? "text-yellow-700 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Expires:</span>{" "}
                          {formatDate(doc.document_expiry_date)}
                        </p>
                      </div>
                    </div>
                    {doc.document_url && (
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                      >
                        View Document
                      </a>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">
              No documents uploaded yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Vehicle needs required documents to be uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewVehicle;
