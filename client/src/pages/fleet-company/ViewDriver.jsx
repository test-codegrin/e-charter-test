import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileText,
  User,
  Globe,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Car,
  Navigation,
  DollarSign,
  CalendarOff,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { ADMIN_ROUTES } from '../../constants/routes';

const ViewDriver = () => {
  const { driver_id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchDriverDetails();
  }, [driver_id]);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      
      const response = await adminAPI.getDriverById(driver_id);
      console.log('Driver details:', response.data);
      setDriver(response.data.driver);

      if (response.data.driver.driver_type === 'individual') {
        try {
          const vehiclesResponse = await adminAPI.getVehicleByDriverId(driver_id);
          console.log('Vehicles:', vehiclesResponse.data);
          setVehicles(vehiclesResponse.data.vehicles || []);
        } catch (vehicleError) {
          if (vehicleError.response?.status === 404) {
            console.log('No vehicles found for this driver');
            setVehicles([]);
          } else {
            console.error('Error fetching vehicles:', vehicleError);
            setVehicles([]);
          }
        }
      } else {
        setVehicles([]);
      }

      try {
        const tripsResponse = await adminAPI.getTripByDriverId(driver_id);
        console.log('Trips:', tripsResponse.data);
        
        if (tripsResponse.data && Array.isArray(tripsResponse.data.trips)) {
          setTrips(tripsResponse.data.trips);
        } else {
          setTrips([]);
        }
      } catch (tripError) {
        if (tripError.response?.status === 404) {
          console.log('No trips found for this driver');
          setTrips([]);
        } else {
          console.error('Error fetching trips:', tripError);
          setTrips([]);
        }
      }

    } catch (error) {
      console.error('Error fetching driver details:', error);
      toast.error('Failed to fetch driver details');
      navigate(ADMIN_ROUTES.DRIVERS.ALL_DRIVERS);
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
      await adminAPI.approveDriver(driver_id, pendingStatus);

      const statusText =
        pendingStatus === 'approved'
          ? 'approved'
          : pendingStatus === 'rejected'
          ? 'rejected'
          : 'marked as in review';

      toast.success(`Driver ${statusText} successfully`);
      setShowConfirmModal(false);
      setPendingStatus(null);
      fetchDriverDetails();
    } catch (error) {
      console.error('Error updating driver status:', error);
      toast.error('Failed to update driver status');
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
      await adminAPI.deleteDriver(driver_id);
      toast.success('Driver deleted successfully');
      setTimeout(() => {
        navigate(ADMIN_ROUTES.DRIVERS.ALL_DRIVERS);
      }, 500);
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Failed to delete driver');
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
    if (!expiryDate) return { status: 'unknown', days: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', days: Math.abs(diffDays) };
    } else if (diffDays === 0) {
      return { status: 'today', days: 0 };
    } else if (diffDays <= 30) {
      return { status: 'expiring', days: diffDays };
    } else {
      return { status: 'valid', days: diffDays };
    }
  };

  const getExpiryBadge = (expiryDate) => {
    const expiryStatus = getExpiryStatus(expiryDate);

    switch (expiryStatus.status) {
      case 'expired':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Expired {expiryStatus.days} day{expiryStatus.days !== 1 ? 's' : ''} ago
          </span>
        );
      case 'today':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expires Today!
          </span>
        );
      case 'expiring':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Expires in {expiryStatus.days} day{expiryStatus.days !== 1 ? 's' : ''}
          </span>
        );
      default:
        return null;
    }
  };

  const getCurrentStatusBadge = (currentStatus) => {
    switch (currentStatus) {
      case 'On Leave':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
            <CalendarOff className="w-4 h-4 mr-2" />
            On Leave
          </span>
        );
      case 'In Trip':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-300">
            <Activity className="w-4 h-4 mr-2" />
            In Trip
          </span>
        );
      case 'Available':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Available
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <Clock className="w-4 h-4 mr-2" />
            Unknown
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    const normalizedStatus = status || 'in_review';

    switch (normalizedStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Rejected
          </span>
        );
      case 'in_review':
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            In Review
          </span>
        );
    }
  };

  const getTripStatusBadge = (status) => {
    const normalizedStatus = status || 'upcoming';
    switch (normalizedStatus) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Navigation className="w-3 h-3 mr-1" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Canceled
          </span>
        );
      default:
        return null;
    }
  };

  const getTripTypeBadge = (type) => {
    const typeMap = {
      single_trip: { label: 'Single Trip', color: 'bg-blue-100 text-blue-800' },
      round_trip: { label: 'Round Trip', color: 'bg-purple-100 text-purple-800' },
      multi_stop: { label: 'Multi-Stop', color: 'bg-orange-100 text-orange-800' },
    };
    const typeInfo = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Approve Driver',
          message: 'Are you sure you want to approve this driver? They will be able to accept trips.',
          color: 'green',
        };
      case 'rejected':
        return {
          title: 'Reject Driver',
          message: 'Are you sure you want to reject this driver? They will not be able to access the platform.',
          color: 'red',
        };
      case 'in_review':
        return {
          title: 'Mark as In Review',
          message: 'Are you sure you want to mark this driver as in review? Their status will be pending approval.',
          color: 'yellow',
        };
      default:
        return {
          title: 'Update Status',
          message: "Are you sure you want to update this driver's status?",
          color: 'blue',
        };
    }
  };

  const StarRating = ({ rating, size = 'md' }) => {
    const numericRating = parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating - fullStars >= 0.5;
    const starSize = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => {
          const isFilled = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;
          return (
            <div key={index} className="relative">
              {isHalf ? (
                <div className="relative">
                  <Star className={`${starSize} text-gray-300 fill-current`} />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className={`${starSize} text-yellow-400 fill-current`} />
                  </div>
                </div>
              ) : (
                <Star className={`${starSize} ${isFilled ? 'text-yellow-400' : 'text-gray-300'} fill-current`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (!driver) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Driver not found</p>
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
                    statusInfo.color === 'green'
                      ? 'bg-green-100'
                      : statusInfo.color === 'red'
                      ? 'bg-red-100'
                      : 'bg-yellow-100'
                  }`}
                >
                  <AlertTriangle
                    className={`w-8 h-8 ${
                      statusInfo.color === 'green'
                        ? 'text-green-600'
                        : statusInfo.color === 'red'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {statusInfo.title}
              </h3>

              <p className="text-gray-600 text-center mb-6">{statusInfo.message}</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Driver</p>
                <p className="font-semibold text-gray-900">
                  {driver.firstname} {driver.lastname}
                </p>
                <p className="text-sm text-gray-500">ID: #{driver.driver_id}</p>
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
                    statusInfo.color === 'green'
                      ? 'bg-green-600 hover:bg-green-700'
                      : statusInfo.color === 'red'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
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

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Driver?</h3>

              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this driver? This will remove all their data from the system.
              </p>

              <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-1">Driver:</p>
                <p className="font-semibold text-gray-900">
                  {driver.firstname} {driver.lastname}
                </p>
                <p className="text-sm text-gray-600">ID: #{driver.driver_id}</p>
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
                You are about to permanently delete this driver. All associated data including documents, ratings, and trip history will be lost forever.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-300">
                <p className="text-sm text-red-700 font-bold mb-2">⛔ PERMANENT DELETION</p>
                <p className="font-semibold text-gray-900">
                  {driver.firstname} {driver.lastname}
                </p>
                <p className="text-sm text-gray-600">{driver.email}</p>
                <p className="text-sm text-gray-600">ID: #{driver.driver_id}</p>
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
                      <span>Confirm Delete</span>
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
            <h1 className="text-2xl font-bold text-secondary-900">Driver Details</h1>
            <p className="text-secondary-600">View and manage driver information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {driver.current_status && getCurrentStatusBadge(driver.current_status)}
          {getStatusBadge(driver.status)}
          <button
            onClick={handleDeleteRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-md hover:shadow-lg"
            title="Delete Driver"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Driver</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info and Fleet Company */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card with Address */}
          <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-3xl">
                    {driver.firstname?.charAt(0).toUpperCase()}
                    {driver.lastname?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {driver.firstname} {driver.lastname}
                  </h2>
                  <p className="text-gray-500 text-sm">Driver ID: #{driver.driver_id}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        driver.driver_type === 'fleet_partner'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      <User className="w-3 h-3 mr-1" />
                      {driver.driver_type === 'fleet_partner' ? 'Fleet Partner' : 'Individual'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Personal Information */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Contact & Personal Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Email Address</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{driver.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{driver.phone_no}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Gender</label>
                  <span className="text-gray-900 capitalize block">{driver.gender}</span>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Experience</label>
                  <span className="text-gray-900 block">
                    {driver.year_of_experiance} {driver.year_of_experiance === 1 ? 'year' : 'years'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Address Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Street Address</label>
                  <p className="text-gray-900">{driver.address}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">City</label>
                  <p className="text-gray-900 capitalize">{driver.city_name}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">ZIP Code</label>
                  <p className="text-gray-900">{driver.zip_code}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Company Details Card - Only for fleet_partner */}
          {driver.driver_type === 'fleet_partner' && driver.fleet_company_details && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Fleet Company Information
              </h3>

              {driver.fleet_company_details.profile_image && (
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-white rounded-lg shadow-md p-3 flex items-center justify-center">
                    <img
                      src={driver.fleet_company_details.profile_image}
                      alt={driver.fleet_company_details.company_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Company Name</label>
                  <p className="text-gray-900 font-semibold">
                    {driver.fleet_company_details.company_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Company Status</label>
                  {getStatusBadge(driver.fleet_company_details.status)}
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{driver.fleet_company_details.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{driver.fleet_company_details.phone_no}</p>
                  </div>
                </div>
                {driver.fleet_company_details.website && (
                  <div className="space-y-1 col-span-2">
                    <label className="block text-sm font-medium text-gray-600">Website</label>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <a
                        href={`https://${driver.fleet_company_details.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {driver.fleet_company_details.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="space-y-1 col-span-2">
                  <label className="block text-sm font-medium text-gray-600">Address</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{driver.fleet_company_details.address}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {driver.fleet_company_details.city_name} - {driver.fleet_company_details.postal_code}
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
                <label className="block text-sm font-medium text-gray-500">Registered On</label>
                <p className="text-gray-900">{formatDate(driver.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(driver.updated_at)}</p>
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
                onClick={() => handleStatusChangeRequest('approved')}
                disabled={driver.status === 'approved'}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  driver.status === 'approved'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve Driver</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest('in_review')}
                disabled={driver.status === 'in_review'}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  driver.status === 'in_review'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Mark In Review</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest('rejected')}
                disabled={driver.status === 'rejected'}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  driver.status === 'rejected'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span>Reject Driver</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Card - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-500" />
          Driver Documents
        </h3>

        {driver.documents && driver.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driver.documents
              .filter((doc) => doc.driver_document_id !== null)
              .map((doc) => {
                const expiryStatus = getExpiryStatus(doc.document_expiry_date);
                const isExpiredOrExpiring =
                  expiryStatus.status === 'expired' ||
                  expiryStatus.status === 'today' ||
                  expiryStatus.status === 'expiring';

                return (
                  <div
                    key={doc.driver_document_id}
                    className={`flex flex-col justify-between p-4 rounded-lg border-2 transition-all ${
                      expiryStatus.status === 'expired'
                        ? 'bg-red-50 border-red-300'
                        : expiryStatus.status === 'today'
                        ? 'bg-orange-50 border-orange-300'
                        : expiryStatus.status === 'expiring'
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-gray-50 border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex-1 mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900 capitalize">
                          {doc.document_type.replace(/_/g, ' ')}
                        </p>
                        {isExpiredOrExpiring && getExpiryBadge(doc.document_expiry_date)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Number:</span> {doc.document_number}
                        </p>
                        <p
                          className={`text-sm ${
                            expiryStatus.status === 'expired'
                              ? 'text-red-700 font-semibold'
                              : expiryStatus.status === 'today'
                              ? 'text-orange-700 font-semibold'
                              : expiryStatus.status === 'expiring'
                              ? 'text-yellow-700 font-semibold'
                              : 'text-gray-600'
                          }`}
                        >
                          <span className="font-medium">Expires:</span>{' '}
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
            <p className="text-gray-500 font-medium">No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Driver needs to upload required documents</p>
          </div>
        )}
      </div>

      {/* Vehicles Section - Only for Individual Drivers */}
      {driver.driver_type === 'individual' && (
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Car className="w-5 h-5 mr-2 text-gray-500" />
              Driver Vehicles ({vehicles.length})
            </h3>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((vehicle) => (
                <Link
                  key={vehicle.vehicle_id}
                  to={ADMIN_ROUTES.VEHICLES.VIEW_VEHICLE + vehicle.vehicle_id}
                  className="flex flex-col p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100 transition-all"
                >
                  {vehicle.car_image ? (
                    <img
                      src={vehicle.car_image}
                      alt={`${vehicle.maker} ${vehicle.model}`}
                      className="w-full h-32 object-contain rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {vehicle.maker} {vehicle.model}
                    </p>
                    <p className="text-sm text-gray-600">{vehicle.registration_number}</p>
                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(vehicle.status)}
                      <span className="text-xs text-gray-500 capitalize">{vehicle.vehicle_type}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No vehicles registered yet</p>
            </div>
          )}
        </div>
      )}

      {/* Driver Trips Section */}
      <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Navigation className="w-5 h-5 mr-2 text-gray-500" />
            Driver Trips ({trips.length})
          </h3>
        </div>

        {trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <Link
                key={trip.trip_id}
                to={ADMIN_ROUTES.TRIPS.VIEW_TRIP + trip.trip_id}
                className="flex flex-col p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100 transition-all"
              >
                {/* Trip Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{trip.trip_name || 'Unnamed Trip'}</p>
                    {getTripStatusBadge(trip.trip_status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTripTypeBadge(trip.trip_type)}
                    {trip.trip_event_type && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {trip.trip_event_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-2 mb-3 flex-1">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{trip.pickup_location_name}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{trip.dropoff_location_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-600">{formatDateTime(trip.pickup_datetime)}</p>
                  </div>
                </div>

                {/* Rating Section */}
                {trip.driver_details && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={trip.driver_details.trip_rating} size="sm" />
                        <span className="text-sm font-semibold text-gray-900">
                          {parseFloat(trip.driver_details.trip_rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {trip.payment_transaction?.currency} ${parseFloat(trip.total_price || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Info */}
                {trip.user_details && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="text-xs text-gray-600">
                        {trip.user_details.firstname} {trip.user_details.lastname}
                      </p>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No trips yet</p>
            <p className="text-sm text-gray-400 mt-1">Driver hasn't completed any trips</p>
          </div>
        )}
      </div>

      {/* Leave History Card - Full Width - After Trips */}
      {driver.leave_history && driver.leave_history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarOff className="w-5 h-5 mr-2 text-orange-500" />
            Leave History ({driver.leave_history.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driver.leave_history.map((leave) => {
              const startDate = new Date(leave.leave_start);
              const endDate = new Date(leave.leave_end);
              const now = new Date();
              const isActive = now >= startDate && now <= endDate;
              const isPast = now > endDate;
              const isFuture = now < startDate;

              return (
                <div
                  key={leave.driver_leave_id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'bg-orange-50 border-orange-300'
                      : isPast
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  {/* Leave Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-orange-200 text-orange-800'
                          : isPast
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-blue-200 text-blue-800'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <CalendarOff className="w-3 h-3 mr-1" />
                          Active Leave
                        </>
                      ) : isPast ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Upcoming
                        </>
                      )}
                    </span>
                  </div>

                  {/* Leave Duration */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm flex-1">
                        <p className="font-medium text-gray-900">Start</p>
                        <p className="text-gray-600">{formatDateTime(leave.leave_start)}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm flex-1">
                        <p className="font-medium text-gray-900">End</p>
                        <p className="text-gray-600">{formatDateTime(leave.leave_end)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Leave Reason */}
                  {leave.leave_reason && (
                    <div className="pt-3 border-t border-gray-200 mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Reason</p>
                      <p className="text-sm text-gray-900">{leave.leave_reason}</p>
                    </div>
                  )}

                  {/* Duration Info */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        Duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                      </p>
                      <span
                        className={`text-xs font-semibold ${
                          isActive ? 'text-orange-600' : isPast ? 'text-gray-500' : 'text-blue-600'
                        }`}
                      >
                        {isActive ? 'Active Now' : isPast ? 'Past' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDriver;
