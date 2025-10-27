import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  AlertTriangle,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Car,
  Users,
  User,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { ADMIN_ROUTES } from '../../constants/routes';

const ViewFleetPartner = () => {
  const { fleet_company_id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFleetPartnerDetails();
  }, [fleet_company_id]);

  const fetchFleetPartnerDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch company details
      const companyResponse = await adminAPI.getFleetPartnerById(fleet_company_id);
      console.log('Company details:', companyResponse.data);
      setCompany(companyResponse.data.company);

      // Fetch vehicles
      const vehiclesResponse = await adminAPI.getAllFleetPartnersVehicles(fleet_company_id);
      console.log('Vehicles:', vehiclesResponse.data);
      setVehicles(vehiclesResponse.data.vehicles || []);

      // Fetch drivers
      const driversResponse = await adminAPI.getAllFleetPartnersDrivers(fleet_company_id);
      console.log('Drivers:', driversResponse.data);
      setDrivers(driversResponse.data.drivers || []);

    } catch (error) {
      console.error('Error fetching fleet partner details:', error);
      toast.error('Failed to fetch fleet partner details');
      navigate(ADMIN_ROUTES.FLEET_PARTNER.ALL_FLEET_PARTNER);
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
      await adminAPI.updateFleetPartnerStatus(fleet_company_id, pendingStatus);
      const statusText =
        pendingStatus === 'approved'
          ? 'approved'
          : pendingStatus === 'rejected'
          ? 'rejected'
          : 'marked as in review';
      toast.success(`Fleet partner ${statusText} successfully`);
      setShowConfirmModal(false);
      setPendingStatus(null);
      fetchFleetPartnerDetails();
    } catch (error) {
      console.error('Error updating fleet partner status:', error);
      toast.error('Failed to update fleet partner status');
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
      await adminAPI.deleteFleetPartner(fleet_company_id);
      toast.success('Fleet partner deleted successfully');
      setTimeout(() => {
        navigate(ADMIN_ROUTES.FLEET_PARTNER.ALL_FLEET_PARTNER);
      }, 500);
    } catch (error) {
      console.error('Error deleting fleet partner:', error);
      toast.error('Failed to delete fleet partner');
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

  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Approve Fleet Partner',
          message: 'Are you sure you want to approve this fleet partner? They will be able to operate on the platform.',
          color: 'green',
        };
      case 'rejected':
        return {
          title: 'Reject Fleet Partner',
          message: 'Are you sure you want to reject this fleet partner? They will not be able to operate on the platform.',
          color: 'red',
        };
      case 'in_review':
        return {
          title: 'Mark as In Review',
          message: 'Are you sure you want to mark this fleet partner as in review? Their status will be pending approval.',
          color: 'yellow',
        };
      default:
        return {
          title: 'Update Status',
          message: 'Are you sure you want to update this fleet partner\'s status?',
          color: 'blue',
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Fleet partner not found</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(pendingStatus);

  // Calculate vehicle stats
  const vehicleStats = {
    total: vehicles.length,
    approved: vehicles.filter((v) => v.status === 'approved').length,
    inReview: vehicles.filter((v) => v.status === 'in_review' || !v.status).length,
    rejected: vehicles.filter((v) => v.status === 'rejected').length,
  };

  // Calculate driver stats
  const driverStats = {
    total: drivers.length,
    approved: drivers.filter((d) => d.status === 'approved').length,
    inReview: drivers.filter((d) => d.status === 'in_review' || !d.status).length,
    rejected: drivers.filter((d) => d.status === 'rejected').length,
  };

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
                <p className="text-sm text-gray-600">Fleet Partner</p>
                <p className="font-semibold text-gray-900">{company.company_name}</p>
                <p className="text-sm text-gray-500">ID: #{company.fleet_company_id}</p>
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

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Fleet Partner?
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this fleet partner? This will remove all company data from the system.
              </p>

              <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium mb-1">Company:</p>
                <p className="font-semibold text-gray-900">{company.company_name}</p>
                <p className="text-sm text-gray-600">ID: #{company.fleet_company_id}</p>
                <p className="text-sm text-gray-600">{company.email}</p>
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
                You are about to permanently delete this fleet partner. All associated data will be lost forever.
              </p>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border-2 border-red-300">
                <p className="text-sm text-red-700 font-bold mb-2">⛔ PERMANENT DELETION</p>
                <p className="font-semibold text-gray-900">{company.company_name}</p>
                <p className="text-sm text-gray-600">{company.email}</p>
                <p className="text-sm text-gray-600">ID: #{company.fleet_company_id}</p>
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
            onClick={() => navigate(ADMIN_ROUTES.FLEET_PARTNER.ALL_FLEET_PARTNER)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Fleet Partner Details</h1>
            <p className="text-secondary-600">View and manage fleet partner information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(company.status)}
          <button
            onClick={handleDeleteRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-md hover:shadow-lg"
            title="Delete Fleet Partner"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Logo Card */}
          {company.profile_image && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-8 border border-gray-200 transition-all hover:shadow-lg flex items-center justify-center">
              <img
                src={company.profile_image}
                alt={company.company_name}
                className="h-40 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Basic Information Card */}
          <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{company.company_name}</h2>
                  <p className="text-gray-500 text-sm">Fleet Company ID: #{company.fleet_company_id}</p>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Company Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{company.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{company.phone_no}</span>
                  </div>
                </div>
                {company.website && (
                  <div className="space-y-1 col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Website</label>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={
                          company.website.startsWith('http')
                            ? company.website
                            : `https://${company.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="space-y-1 col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{company.address}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        {company.city_name} - {company.postal_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person Card */}
          {company.contact_person && company.contact_person.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-md p-6 border border-indigo-200 transition-all hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Contact Person
              </h3>

              {company.contact_person.map((person, index) => (
                <div key={person.fleet_company_contact_person_id} className={index > 0 ? 'mt-4 pt-4 border-t border-indigo-200' : ''}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900 font-semibold">{person.fullname}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900">{person.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600">Phone</label>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <p className="text-gray-900">{person.phone_no}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
                <p className="text-gray-900">{formatDate(company.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-gray-900">{formatDate(company.updated_at)}</p>
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
                disabled={company.status === 'approved'}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  company.status === 'approved'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Approve Partner</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest('in_review')}
                disabled={company.status === 'in_review' || !company.status}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  company.status === 'in_review' || !company.status
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700 hover:shadow-lg'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span>Mark In Review</span>
              </button>
              <button
                onClick={() => handleStatusChangeRequest('rejected')}
                disabled={company.status === 'rejected'}
                className={`w-full px-4 py-3 rounded-lg transition-all font-medium flex items-center justify-center space-x-2 ${
                  company.status === 'rejected'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
                }`}
              >
                <XCircle className="w-5 h-5" />
                <span>Reject Partner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH SECTIONS BELOW */}

      {/* Documents Card - Full Width */}
      <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-gray-500" />
          Company Documents
        </h3>

        {company.documents && company.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.documents.map((doc) => {
              const expiryStatus = getExpiryStatus(doc.document_expiry_date);
              const isExpiredOrExpiring =
                expiryStatus.status === 'expired' ||
                expiryStatus.status === 'today' ||
                expiryStatus.status === 'expiring';

              return (
                <div
                  key={doc.fleet_company_document_id}
                  className={`flex flex-col justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
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
            <p className="text-sm text-gray-400 mt-1">Company needs required documents to be uploaded</p>
          </div>
        )}
      </div>

      {/* Vehicles Section */}
      <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
              <Car className="w-5 h-5 mr-2 text-gray-500" />
              Fleet Vehicles
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                <span className="font-bold mr-1">{vehicleStats.total}</span> Total
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="font-bold mr-1">{vehicleStats.approved}</span> Approved
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-bold mr-1">{vehicleStats.inReview}</span> In Review
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <XCircle className="w-4 h-4 mr-1" />
                <span className="font-bold mr-1">{vehicleStats.rejected}</span> Rejected
              </span>
            </div>
          </div>
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

      {/* Drivers Section */}
      <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
              <Users className="w-5 h-5 mr-2 text-gray-500" />
              Fleet Drivers
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                <span className="font-bold mr-1">{driverStats.total}</span> Total
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="font-bold mr-1">{driverStats.approved}</span> Approved
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-bold mr-1">{driverStats.inReview}</span> In Review
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                <XCircle className="w-4 h-4 mr-1" />
                <span className="font-bold mr-1">{driverStats.rejected}</span> Rejected
              </span>
            </div>
          </div>
        </div>

        {drivers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map((driver) => (
              <Link
                key={driver.driver_id}
                to={ADMIN_ROUTES.DRIVERS.VIEW_DRIVER + driver.driver_id}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-primary-300 hover:bg-gray-100 transition-all"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {driver.firstname} {driver.lastname}
                  </p>
                  <p className="text-sm text-gray-600">{driver.email}</p>
                  <div className="flex items-center justify-between mt-1">
                    {getStatusBadge(driver.status)}
                    <span className="text-xs text-gray-500">{driver.year_of_experiance} yrs exp</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No drivers registered yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewFleetPartner;
