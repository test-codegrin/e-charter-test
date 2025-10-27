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

  // Check if document is expired or expiring soon
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
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Expired {expiryStatus.days} day{expiryStatus.days !== 1 ? "s" : ""}{" "}
            ago
          </span>
        );
      case "today":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expires Today!
          </span>
        );
      case "expiring":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </span>
        );
      case "in_review":
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    statusInfo.color === "green"
                      ? "bg-green-100"
                      : statusInfo.color === "red"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                  }`}
                >
                  <AlertTriangle
                    className={`w-8 h-8 ${
                      statusInfo.color === "green"
                        ? "text-green-600"
                        : statusInfo.color === "red"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {statusInfo.title}
              </h3>

              <p className="text-gray-600 text-center mb-6">
                {statusInfo.message}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Vehicle</p>
                <p className="font-semibold text-gray-900">
                  {vehicle.maker} {vehicle.model}
                </p>
                <p className="text-sm text-gray-500">ID: #{vehicle.vehicle_id}</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelStatusChange}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-all font-medium ${
                    statusInfo.color === "green"
                      ? "bg-green-600 hover:bg-green-700"
                      : statusInfo.color === "red"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-yellow-600 hover:bg-yellow-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
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
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFirstDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all font-medium flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Delete Confirmation Modal */}
      {showFinalDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-red-600 text-center mb-2">
                ⚠️ Final Confirmation
              </h3>

              <p className="text-gray-900 font-semibold text-center mb-4">
                This action CANNOT be undone!
              </p>

              <p className="text-gray-600 text-center mb-6">
                You are about to permanently delete this vehicle. All associated
                data including documents will be lost forever.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-300">
                <p className="text-sm text-red-700 font-bold mb-2">
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
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Vehicle Details
            </h1>
            <p className="text-secondary-600">
              View and manage vehicle information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(vehicle.status)}
          <button
            onClick={handleDeleteRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-md hover:shadow-lg"
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
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-8 border border-gray-200 transition-all hover:shadow-lg">
              <img
                src={vehicle.car_image}
                alt={`${vehicle.maker} ${vehicle.model}`}
                className="w-full h-80 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                  <Car className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vehicle.ownership === "fleet_company"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
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
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Vehicle Specifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">
                    Registration Number
                  </label>
                  <span className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded border border-gray-200 inline-block">
                    {vehicle.registration_number}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">
                    Vehicle Type
                  </label>
                  <span className="text-gray-900 capitalize block">
                    {vehicle.vehicle_type}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">
                    Number of Seats
                  </label>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{vehicle.number_of_seats}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">
                    Fuel Type
                  </label>
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 capitalize">
                      {vehicle.fuel_type}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">
                    Availability
                  </label>
                  <span className="text-gray-900">
                    {vehicle.is_available ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Not Available
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Features Card */}
          {vehicle.features && (
            <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Vehicle Features
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Air Conditioner */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.has_air_conditioner
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Wind
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.has_air_conditioner
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.has_air_conditioner
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    Air Conditioner
                  </p>
                  {vehicle.features.has_air_conditioner && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </div>

                {/* Charging Port */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.has_charging_port
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Zap
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.has_charging_port
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.has_charging_port
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    Charging Port
                  </p>
                  {vehicle.features.has_charging_port && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </div>

                {/* WiFi */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.has_wifi
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Wifi
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.has_wifi
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.has_wifi
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    WiFi
                  </p>
                  {vehicle.features.has_wifi && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </div>

                {/* Entertainment System */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.has_entertainment_system
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Monitor
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.has_entertainment_system
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.has_entertainment_system
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    Entertainment
                  </p>
                  {vehicle.features.has_entertainment_system && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </div>

                {/* GPS */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.has_gps
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Navigation
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.has_gps
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.has_gps
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    GPS
                  </p>
                  {vehicle.features.has_gps && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </div>

                {/* Recliner Seats */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.has_recliner_seats
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Armchair
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.has_recliner_seats
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.has_recliner_seats
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    Recliner Seats
                  </p>
                  {vehicle.features.has_recliner_seats && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
                </div>

                {/* Wheelchair Accessible */}
                <div
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    vehicle.features.is_wheelchair_accessible
                      ? "bg-green-50 border-green-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Accessibility
                    className={`w-8 h-8 mb-2 ${
                      vehicle.features.is_wheelchair_accessible
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium text-center ${
                      vehicle.features.is_wheelchair_accessible
                        ? "text-green-900"
                        : "text-gray-500"
                    }`}
                  >
                    Wheelchair
                  </p>
                  {vehicle.features.is_wheelchair_accessible && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                  )}
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

          {/* Fleet Company Details Card - Only for fleet_company */}
          {vehicle.ownership === "fleet_company" &&
            vehicle.fleet_company_details && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200 transition-all hover:shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Fleet Company Information
                </h3>

                {vehicle.fleet_company_details.profile_image && (
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-white rounded-lg shadow-md p-3 flex items-center justify-center">
                      <img
                        src={vehicle.fleet_company_details.profile_image}
                        alt={vehicle.fleet_company_details.company_name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">
                      Company Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {vehicle.fleet_company_details.company_name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">
                      Company Status
                    </label>
                    {getStatusBadge(vehicle.fleet_company_details.status)}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">
                        {vehicle.fleet_company_details.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-900">
                        {vehicle.fleet_company_details.phone_no}
                      </p>
                    </div>
                  </div>

                  {vehicle.fleet_company_details.website && (
                    <div className="space-y-1 col-span-2">
                      <label className="block text-sm font-medium text-gray-600">
                        Website
                      </label>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a
                          href={`https://${vehicle.fleet_company_details.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {vehicle.fleet_company_details.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 col-span-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Address
                    </label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-900">
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
          <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              Registration Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">
                  Registered On
                </label>
                <p className="text-gray-900">{formatDate(vehicle.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-gray-900">{formatDate(vehicle.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Status Actions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-gray-500" />
              Update Status
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChangeRequest("approved")}
                disabled={vehicle.status === "approved"}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  vehicle.status === "approved"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve Vehicle</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest("in_review")}
                disabled={vehicle.status === "in_review"}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  vehicle.status === "in_review"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Mark In Review</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest("rejected")}
                disabled={vehicle.status === "rejected"}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  vehicle.status === "rejected"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg"
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span>Reject Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH SECTIONS BELOW */}

      {/* Documents Card - Full Width with Expiry Indicators */}
      <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-500" />
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
                    className={`flex flex-col justify-between p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      expiryStatus.status === "expired"
                        ? "bg-red-50 border-red-300"
                        : expiryStatus.status === "today"
                        ? "bg-orange-50 border-orange-300"
                        : expiryStatus.status === "expiring"
                        ? "bg-yellow-50 border-yellow-300"
                        : "bg-gray-50 border-gray-200 hover:border-primary-300"
                    }`}
                  >
                    <div className="flex-1 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 capitalize">
                          {doc.document_type.replace(/_/g, " ")}
                        </p>
                        {isExpiredOrExpiring &&
                          getExpiryBadge(doc.document_expiry_date)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Number:</span>{" "}
                          {doc.document_number}
                        </p>
                        <p
                          className={`text-sm ${
                            expiryStatus.status === "expired"
                              ? "text-red-700 font-semibold"
                              : expiryStatus.status === "today"
                              ? "text-orange-700 font-semibold"
                              : expiryStatus.status === "expiring"
                              ? "text-yellow-700 font-semibold"
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
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-medium"
                      >
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No documents uploaded yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Vehicle needs required documents to be uploaded
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ViewVehicle;
