import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Car,
  User,
  Phone,
  Mail,
  Navigation,
  Building2,
  MapPinned,
  Route,
  Timer,
  Receipt,
  CreditCard,
  Printer,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader';
import { useReactToPrint } from 'react-to-print';
import TripReceipt from '../../components/receipt/TripReceipt';

const ViewTripDetails = () => {
  const { trip_id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef(null);

  useEffect(() => {
    fetchTripDetails();
  }, [trip_id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTripById(trip_id);
      console.log('Trip details:', response.data);
      
      const tripData = response.data.trip;
      
      if (!tripData.stops) {
        tripData.stops = [];
      }
      
      setTrip(tripData);
    } catch (error) {
      console.error('Error fetching trip details:', error);
      toast.error('Failed to fetch trip details');
      navigate('/admin/trips');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Trip-Receipt-${trip_id}`,
  });

  const getStatusBadge = (status) => {
    const normalizedStatus = status || 'upcoming';

    switch (normalizedStatus) {
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="w-4 h-4 mr-2" />
            Upcoming
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <Navigation className="w-4 h-4 mr-2" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getPaymentBadge = (status) => {
    return status === 'completed' ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4 mr-2" />
        Paid
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        <Clock className="w-4 h-4 mr-2" />
        Pending
      </span>
    );
  };

  const getTripTypeBadge = (type) => {
    const typeMap = {
      single_trip: { label: 'Single Trip', color: 'bg-blue-100 text-blue-800' },
      round_trip: { label: 'Round Trip', color: 'bg-purple-100 text-purple-800' },
      multi_stop: { label: 'Multi-Stop', color: 'bg-orange-100 text-orange-800' },
    };

    const typeInfo = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
        <Navigation className="w-4 h-4 mr-2" />
        {typeInfo.label}
      </span>
    );
  };

  const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return 'N/A';
    const cardStr = String(cardNumber);
    const lastFour = cardStr.slice(-4);
    return `**** **** **** ${lastFour}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return <Loader text='Getting Trip Details...'/>
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hidden Receipt Component for Printing */}
      <div style={{ display: 'none' }}>
        <div ref={receiptRef}>
          <TripReceipt trip={trip} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/trips')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Trip Details</h1>
            <p className="text-secondary-600">View and manage trip information</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(trip.trip_status)}
          {getPaymentBadge(trip.payment_status)}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Single Column Full Width Layout */}
      <div className="space-y-6">
        {/* Trip Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {trip.trip_name || 'Unnamed Trip'}
              </h2>
              <p className="text-gray-500 text-sm">Trip ID: #{trip.trip_id}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getTripTypeBadge(trip.trip_type)}
                {trip.trip_event_type && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {trip.trip_event_type}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
              <Route className="w-4 h-4 mr-2" />
              Route Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-green-700">Pickup Location</label>
                  <p className="text-gray-900 font-semibold">{trip.pickup_location_name}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDateTime(trip.pickup_datetime)}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Stop Locations */}
              {trip.stops && trip.stops.length > 0 && (
                <div className="pl-8 space-y-3">
                  {trip.stops.map((stop, index) => (
                    <div
                      key={stop.trip_stop_id}
                      className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-blue-700">
                          Stop {index + 1}
                        </label>
                        <p className="text-gray-900 font-semibold">{stop.stop_location_name}</p>
                        {stop.stop_date && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(stop.stop_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPinned className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-red-700">Drop-off Location</label>
                  <p className="text-gray-900 font-semibold">{trip.dropoff_location_name}</p>
                  {trip.return_pickup_datetime && (
                    <div className="flex items-center space-x-2 text-xs text-gray-600 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Return: {formatDateTime(trip.return_pickup_datetime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trip Metrics */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center">
              <Timer className="w-4 h-4 mr-2" />
              Trip Metrics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Total Distance</label>
                <p className="text-2xl font-bold text-gray-900">
                  {trip.total_distance} <span className="text-sm font-normal text-gray-600">km</span>
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Travel Time</label>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(trip.total_travel_time)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Created On</label>
                <p className="text-sm text-gray-900">{formatDate(trip.created_at)}</p>
                <p className="text-xs text-gray-500">{formatTime(trip.created_at)}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(trip.updated_at)}</p>
                <p className="text-xs text-gray-500">{formatTime(trip.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        {trip.user_details && trip.user_details.user_id && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-200 transition-all hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900 font-semibold">
                  {trip.user_details.firstname} {trip.user_details.lastname}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Customer ID</label>
                <p className="text-gray-900">#{trip.user_details.user_id}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{trip.user_details.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Phone</label>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-900">{trip.user_details.phone_no}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Link
                to={`/admin/view-user/${trip.user_details.user_id}`}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
              >
                <span>View Customer Profile</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        )}

        {/* Driver & Vehicle Information Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-md p-6 border border-purple-200 transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-purple-600" />
            Driver & Vehicle Information
          </h3>

          {trip.driver_details && trip.driver_details.driver_id && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Driver Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900 font-semibold">
                    {trip.driver_details.firstname} {trip.driver_details.lastname}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Driver ID</label>
                  <p className="text-gray-900">#{trip.driver_details.driver_id}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 capitalize">
                    {trip.driver_details.driver_type?.replace('_', ' ')}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{trip.driver_details.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-900">{trip.driver_details.phone_no}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Rating</label>
                  <p className="text-gray-900">⭐ {trip.driver_details.average_rating || 'N/A'}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={`/admin/view-driver/${trip.driver_details.driver_id}`}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <span>View Driver Profile</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}

          {trip.vehicle_details && trip.vehicle_details.vehicle_id && (
            <div className="pt-6 border-t border-purple-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Vehicle Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Vehicle</label>
                  <p className="text-gray-900 font-semibold">
                    {trip.vehicle_details.maker} {trip.vehicle_details.model}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Registration Number</label>
                  <p className="text-gray-900 font-mono">{trip.vehicle_details.registration_number}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Type</label>
                  <p className="text-gray-900 capitalize">{trip.vehicle_details.vehicle_type}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Seats</label>
                  <p className="text-gray-900">{trip.vehicle_details.number_of_seats} passengers</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Fuel Type</label>
                  <p className="text-gray-900 capitalize">{trip.vehicle_details.fuel_type}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={`/admin/view-vehicle/${trip.vehicle_details.vehicle_id}`}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <span>View Vehicle Details</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}

          {trip.fleet_company_details && trip.fleet_company_details.fleet_company_id && (
            <div className="pt-6 border-t border-purple-200 mt-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Fleet Company
              </h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-gray-900 font-semibold">
                      {trip.fleet_company_details.company_name}
                    </p>
                    <p className="text-sm text-gray-600">{trip.fleet_company_details.phone_no}</p>
                  </div>
                </div>
                <Link
                  to={`/admin/view-fleet-partner/${trip.fleet_company_details.fleet_company_id}`}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center space-x-1"
                >
                  <span>View Fleet Company</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Payment Summary Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-200 transition-all hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-green-600" />
            Payment Summary
          </h3>
          
          {/* Payment Transaction Details */}
          {trip.payment_transaction && trip.payment_transaction.transaction_id && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Transaction Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Transaction ID</label>
                  <p className="text-gray-900 font-mono">#{trip.payment_transaction.gateway_transaction_id}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Payment Gateway</label>
                  <p className="text-gray-900">{trip.payment_transaction.payment_gateway}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Card Number</label>
                  <p className="text-gray-900 font-mono">{maskCardNumber(trip.payment_transaction.card_number)}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Gateway Response</label>
                  <p className="text-gray-900">{trip.payment_transaction.gateway_response}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Processed At</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(trip.payment_transaction.processed_at)}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">Transaction Date</label>
                  <p className="text-gray-900 text-sm">{formatDateTime(trip.payment_transaction.created_at)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Amount Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Payment Status</label>
                {getPaymentBadge(trip.payment_status)}
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Tax Amount</label>
                <p className="text-lg font-semibold text-gray-900">
                  CAD ${parseFloat(trip.tax_amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-2xl font-bold text-green-600">
                  CAD ${parseFloat(trip.total_price || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTripDetails;
